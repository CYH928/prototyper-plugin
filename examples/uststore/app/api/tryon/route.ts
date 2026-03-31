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
              inlineData: {
                mimeType: "image/jpeg",
                data: personBase64,
              },
            },
            {
              inlineData: {
                mimeType: "image/png",
                data: garmentBase64,
              },
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

  // Extract image from Gemini response parts
  const parts = result.candidates?.[0]?.content?.parts;
  if (!parts) {
    throw new Error("Gemini returned no content parts");
  }

  for (const part of parts) {
    if (part.inlineData?.mimeType?.startsWith("image/")) {
      return part.inlineData.data;
    }
  }

  throw new Error("Gemini response did not contain an image");
}

export async function POST(req: NextRequest) {
  let sessionId: string | undefined;

  try {
    const body = await req.json();
    sessionId = body.sessionId;
    const overrideProductId = body.productId as string | undefined;

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      );
    }

    // 1. Read session
    const sessionRef = adminDb.doc(`sessions/${sessionId}`);
    const sessionSnap = await sessionRef.get();
    if (!sessionSnap.exists) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    const session = sessionSnap.data()!;
    const productId = overrideProductId || session.productId;
    const model: TryOnModel = session.model || "virtual-try-on-001";

    // 2. Update status to processing
    await sessionRef.update({
      status: "processing",
      productId,
      resultImageUrl: null,
    });

    // 3. Get product info
    const productSnap = await adminDb.doc(`products/${productId}`).get();
    if (!productSnap.exists) {
      throw new Error("Product not found");
    }
    const product = productSnap.data()!;

    // 4. Download person image from Storage
    const personFile = adminStorage
      .bucket()
      .file(`sessions/${sessionId}/person.jpg`);
    const [personBuffer] = await personFile.download();
    const personBase64 = personBuffer.toString("base64");

    // 5. Download garment image from Storage
    const garmentPath = product.garmentImageUrl.includes("storage.googleapis.com")
      ? product.garmentImageUrl.split("/o/")[1]?.split("?")[0]
      : product.garmentImageUrl;
    const garmentFile = adminStorage
      .bucket()
      .file(decodeURIComponent(garmentPath));
    const [garmentBuffer] = await garmentFile.download();
    const garmentBase64 = garmentBuffer.toString("base64");

    // 6. Call AI model
    let resultBase64: string;
    const useMock = !process.env.GCP_PROJECT_ID || process.env.USE_MOCK_VTO === "true";

    if (useMock) {
      resultBase64 = personBase64;
    } else {
      const token = await getAccessToken();

      console.log(`Using model: ${model} for session ${sessionId}`);

      if (model === "gemini-2.5-flash-image") {
        resultBase64 = await callGeminiFlashImage(
          personBase64,
          garmentBase64,
          product.name || product.nameZh || "garment",
          token,
        );
      } else {
        resultBase64 = await callVirtualTryOn001(
          personBase64,
          garmentBase64,
          token,
        );
      }
    }

    // 7. Upload result to Storage
    const resultBuffer = Buffer.from(resultBase64, "base64");
    const resultFilename = `sessions/${sessionId}/result-${productId}-${model}.png`;
    const resultFile = adminStorage
      .bucket()
      .file(resultFilename);
    await resultFile.save(resultBuffer, {
      contentType: "image/png",
      metadata: { cacheControl: "no-cache, max-age=0" },
    });
    await resultFile.makePublic();

    const resultUrl = `https://storage.googleapis.com/${adminStorage.bucket().name}/${resultFilename}?t=${Date.now()}`;

    // 8. Update session with result + cache in results map
    await sessionRef.update({
      status: "completed",
      resultImageUrl: resultUrl,
      [`results.${productId}`]: resultUrl,
    });

    return NextResponse.json({ success: true, resultImageUrl: resultUrl });
  } catch (error) {
    console.error("Virtual Try-On error:", error);

    try {
      if (sessionId) {
        const errorMessage = error instanceof Error
          ? error.message
          : "Unknown error";
        await adminDb.doc(`sessions/${sessionId}`).update({
          status: "error",
          errorMessage,
        });
      }
    } catch {
      // Ignore cleanup errors
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Virtual try-on failed",
      },
      { status: 500 }
    );
  }
}
