import { readFileSync } from "fs";
import { resolve } from "path";
import { GoogleAuth } from "google-auth-library";

// Load .env.local
const envRaw = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8");
const env = {};
for (const line of envRaw.split("\n")) {
  if (!line.trim() || line.startsWith("#")) continue;
  const [key, ...rest] = line.split("=");
  env[key.trim()] = rest.join("=").trim();
}

process.env.GOOGLE_APPLICATION_CREDENTIALS = env.GOOGLE_APPLICATION_CREDENTIALS;

const PROJECT_ID = env.GCP_PROJECT_ID;
const REGION = env.GCP_REGION || "us-central1";

console.log(`Testing Virtual Try-On 001...`);
console.log(`Project: ${PROJECT_ID}, Region: ${REGION}\n`);

// Use actual person image
const personBuffer = readFileSync(resolve(process.cwd(), "public/products/people.png"));
const personBase64 = personBuffer.toString("base64");
console.log(`Person image size: ${(personBuffer.length / 1024).toFixed(0)} KB`);

// Use actual product image for garment
const garmentBuffer = readFileSync(resolve(process.cwd(), "public/products/hoodie-navy.png"));
const garmentBase64 = garmentBuffer.toString("base64");

const auth = new GoogleAuth({
  scopes: ["https://www.googleapis.com/auth/cloud-platform"],
});

try {
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  const token = tokenResponse.token;
  console.log("✅ Auth OK - got access token\n");

  const apiUrl = `https://${REGION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${REGION}/publishers/google/models/virtual-try-on-001:predict`;
  console.log(`Calling: ${apiUrl}\n`);

  const start = Date.now();
  const response = await fetch(apiUrl, {
    method: "POST",
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
      parameters: { baseSteps: 10 },
    }),
  });

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`Response status: ${response.status} (${elapsed}s)`);

  const text = await response.text();
  if (response.ok) {
    const json = JSON.parse(text);
    if (json.predictions?.[0]?.bytesBase64Encoded) {
      console.log("✅ Virtual Try-On API is WORKING!");
    } else {
      console.log("⚠️  Response OK but unexpected format:", JSON.stringify(json).slice(0, 200));
    }
  } else {
    console.log("❌ API Error:", text.slice(0, 500));
  }
} catch (err) {
  console.error("❌ Failed:", err.message);
}
