import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminStorage } from "@/lib/firebase-admin";
import type { TryOnModel } from "@/lib/types";

async function getAccessToken() {
  const { GoogleAuth } = await import("google-auth-library");
  const auth = new GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  return tokenResponse.token!;
}

async function callVirtualTryOn001(
  personBase64: string,
  garmentBase64: string,
  token: string,
): Promise<string> {
  const region = process.env.GCP_REGION || "us-central1";
  const projectId = process.env.GCP_PROJECT_ID;
  const apiUrl = `https://${region}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${region}/publishers/google/models/virtual-try-on-001:predict`;

  const response = await fetch(apiUrl, {
    method: "POST",
    signal: AbortSignal.timeout(120_000),
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      instances: [
        {
          personImage: { image: { bytesBase64Encoded: personBase64 } },
          productImages: [{ image: { bytesBase64Encoded: garmentBase64 } }],
        },
      ],
      parameters: { baseSteps: 20 },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`VTO-001 API error: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  return result.predictions[0].bytesBase64Encoded;
}

async function callGeminiFlashImage(
  personBase64: string,
  garmentBase64: string,
  productName: string,
  token: string,
): Promise<string> {
  const region = process.env.GCP_REGION || "us-central1";
  const projectId = process.env.GCP_PROJECT_ID;
  const apiUrl = `https://${region}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${region}/publishers/google/models/gemini-2.5-flash-image:generateContent`;

  const response = await fetch(apiUrl, {
    method: "POST",
    signal: AbortSignal.timeout(120_000),
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are a virtual try-on assistant. Generate a realistic photo of the person in the first image wearing the "${productName}" garment shown in the second image. Keep the person's face, body shape, pose, and background exactly the same. Only replace the upper body clothing with the garment. The result should look like a natural photograph, not an illustration.`,
            },
            {
              inlineData: { mimeType: "image/jpeg", data: personBase64 },
            },
            {
              inlineData: { mimeType: "image/png", data: garmentBase64 },
            },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
        temperature: 0.4,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini Flash Image API error: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  const parts = result.candidates?.[0]?.content?.parts;
  if (!parts) throw new Error("Gemini returned no content parts");

  for (const part of parts) {
    if (part.inlineData?.mimeType?.startsWith("image/")) {
      return part.inlineData.data;
    }
  }
  throw new Error("Gemini response did not contain an image");
}

async function generateForProduct(
  sessionId: string,
  productId: string,
  productName: string,
  garmentImageUrl: string,
  personBase64: string,
  model: TryOnModel,
  token: string,
  useMock: boolean,
): Promise<string> {
  // Download garment image
  const garmentPath = garmentImageUrl.includes("storage.googleapis.com")
    ? garmentImageUrl.split("/o/")[1]?.split("?")[0]
    : garmentImageUrl;
  const garmentFile = adminStorage.bucket().file(decodeURIComponent(garmentPath!));
  const [garmentBuffer] = await garmentFile.download();
  const garmentBase64 = garmentBuffer.toString("base64");

  // Call AI model
  let resultBase64: string;
  if (useMock) {
    resultBase64 = personBase64;
  } else if (model === "gemini-2.5-flash-image") {
    resultBase64 = await callGeminiFlashImage(personBase64, garmentBase64, productName, token);
  } else {
    resultBase64 = await callVirtualTryOn001(personBase64, garmentBase64, token);
  }

  // Upload result
  const resultBuffer = Buffer.from(resultBase64, "base64");
  const resultFilename = `sessions/${sessionId}/result-${productId}-${model}.png`;
  const resultFile = adminStorage.bucket().file(resultFilename);
  await resultFile.save(resultBuffer, {
    contentType: "image/png",
    metadata: { cacheControl: "no-cache, max-age=0" },
  });
  await resultFile.makePublic();

  return `https://storage.googleapis.com/${adminStorage.bucket().name}/${resultFilename}?t=${Date.now()}`;
}

/**
 * Generate try-on results for ALL products at once.
 * The selected product is generated first so the user sees a result ASAP.
 * Remaining products are generated sequentially after that.
 */
export async function POST(req: NextRequest) {
  let sessionId: string | undefined;

  try {
    const body = await req.json();
    sessionId = body.sessionId;

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    const sessionRef = adminDb.doc(`sessions/${sessionId}`);
    const sessionSnap = await sessionRef.get();
    if (!sessionSnap.exists) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const session = sessionSnap.data()!;
    const selectedProductId = session.productId;
    const model: TryOnModel = session.model || "virtual-try-on-001";

    // Set status to processing
    await sessionRef.update({
      status: "processing",
      resultImageUrl: null,
    });

    // Get all products
    const productsSnap = await adminDb.collection("products").get();
    const allProducts = productsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data() as { name: string; nameZh: string; garmentImageUrl: string },
    }));

    // Download person image once
    const personFile = adminStorage.bucket().file(`sessions/${sessionId}/person.jpg`);
    const [personBuffer] = await personFile.download();
    const personBase64 = personBuffer.toString("base64");

    const useMock = !process.env.GCP_PROJECT_ID || process.env.USE_MOCK_VTO === "true";
    const token = useMock ? "" : await getAccessToken();

    console.log(`[batch] Generating ${allProducts.length} products in parallel for session ${sessionId} using ${model}`);

    // Generate ALL products in parallel
    const promises = allProducts.map(async (product) => {
      try {
        const resultUrl = await generateForProduct(
          sessionId!,
          product.id,
          product.name || product.nameZh || "garment",
          product.garmentImageUrl,
          personBase64,
          model,
          token,
          useMock,
        );

        // Update results map immediately when each one finishes
        const updateData: Record<string, unknown> = {
          [`results.${product.id}`]: resultUrl,
        };

        // If this is the selected product, also set status to completed
        if (product.id === selectedProductId) {
          updateData.status = "completed";
          updateData.resultImageUrl = resultUrl;
        }

        await sessionRef.update(updateData);
        console.log(`[batch] ✅ ${product.id} done`);
        return { id: product.id, success: true };
      } catch (err) {
        console.error(`[batch] ❌ ${product.id} failed:`, err);
        return { id: product.id, success: false, error: err };
      }
    });

    const results = await Promise.all(promises);

    // If the selected product failed, set error
    const selectedResult = results.find((r) => r.id === selectedProductId);
    if (selectedResult && !selectedResult.success) {
      const errMsg = selectedResult.error instanceof Error
        ? selectedResult.error.message
        : "Generation failed";
      await sessionRef.update({ status: "error", errorMessage: errMsg });
      return NextResponse.json({ error: errMsg }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Batch try-on error:", error);

    if (sessionId) {
      try {
        await adminDb.doc(`sessions/${sessionId}`).update({
          status: "error",
          errorMessage: error instanceof Error ? error.message : "Unknown error",
        });
      } catch {
        // Ignore cleanup errors
      }
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Batch generation failed" },
      { status: 500 },
    );
  }
}
