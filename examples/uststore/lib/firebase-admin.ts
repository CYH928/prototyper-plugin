import { initializeApp, getApps, cert, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

function getAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // In Firebase App Hosting / Cloud Run, Application Default Credentials are automatic
  // For local development, use GOOGLE_APPLICATION_CREDENTIALS env var
  return initializeApp({
    credential: applicationDefault(),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

const adminApp = getAdminApp();

export const adminDb = getFirestore(adminApp, "uststore");
export const adminStorage = getStorage(adminApp);
export default adminApp;
