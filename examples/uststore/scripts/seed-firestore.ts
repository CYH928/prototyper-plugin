import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { readFileSync } from "fs";
import { resolve } from "path";

// Manually load .env.local
const envRaw = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8");
const env: Record<string, string> = {};
for (const line of envRaw.split("\n")) {
  if (!line.trim() || line.startsWith("#")) continue;
  const [key, ...rest] = line.split("=");
  env[key.trim()] = rest.join("=").trim();
}

const STORAGE_BUCKET = env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!;
const CREDENTIALS_PATH = env.GOOGLE_APPLICATION_CREDENTIALS!;

if (!CREDENTIALS_PATH) {
  console.error(
    "❌ GOOGLE_APPLICATION_CREDENTIALS is not set in .env.local\n" +
    "   1. Go to Firebase Console > Project Settings > Service Accounts\n" +
    "   2. Click 'Generate new private key' and save the JSON file\n" +
    "   3. Add GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json to .env.local"
  );
  process.exit(1);
}

if (getApps().length === 0) {
  initializeApp({
    credential: cert(CREDENTIALS_PATH),
    storageBucket: STORAGE_BUCKET,
  });
}

const db = getFirestore("uststore");
const storage = getStorage().bucket();

const PRODUCTS = [
  {
    id: "campus-crewneck-cream",
    name: "Campus Skyline Crewneck",
    nameZh: "校園圖案羅紋衛衣",
    price: 380,
    localImage: "public/products/campus-crewneck-cream.png",
  },
  {
    id: "typography-crewneck-navy",
    name: "Typography Crewneck - Navy",
    nameZh: "科大羅紋衛衣",
    price: 380,
    localImage: "public/products/typography-crewneck-navy.png",
  },
  {
    id: "hoodie-gold",
    name: "HKUST Hoodie - Gold",
    nameZh: "科大連帽衛衣 (金色)",
    price: 450,
    localImage: "public/products/hoodie-gold.png",
  },
  {
    id: "hoodie-navy",
    name: "HKUST Hoodie - Navy",
    nameZh: "科大連帽衛衣 (深藍色)",
    price: 450,
    localImage: "public/products/hoodie-navy.png",
  },
  {
    id: "windbreaker-red",
    name: "UST Windbreaker - Red",
    nameZh: "科大校友設計皮膚風衣",
    price: 520,
    localImage: "public/products/windbreaker-red.png",
  },
];

async function seed() {
  console.log("🌱 Seeding Firestore + Storage...\n");

  for (const product of PRODUCTS) {
    const storagePath = `products/${product.id}.png`;

    // Upload image to Storage
    console.log(`📤 Uploading ${product.localImage}...`);
    const imageBuffer = readFileSync(resolve(process.cwd(), product.localImage));
    const file = storage.file(storagePath);
    await file.save(imageBuffer, { contentType: "image/png" });
    await file.makePublic();
    const imageUrl = `https://storage.googleapis.com/${STORAGE_BUCKET}/${storagePath}`;

    // Write Firestore document
    await db.collection("products").doc(product.id).set({
      name: product.name,
      nameZh: product.nameZh,
      price: product.price,
      imageUrl,
      garmentImageUrl: storagePath,
    });

    console.log(`✅ ${product.id}`);
  }

  console.log("\n🎉 Seed complete!");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
