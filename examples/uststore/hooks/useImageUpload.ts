"use client";

import { useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db, storage } from "@/lib/firebase";

interface UploadState {
  progress: number;
  uploading: boolean;
  error: string | null;
  done: boolean;
}

export function useImageUpload(sessionId: string) {
  const [state, setState] = useState<UploadState>({
    progress: 0,
    uploading: false,
    error: null,
    done: false,
  });

  async function upload(file: File) {
    setState({ progress: 0, uploading: true, error: null, done: false });

    try {
      const storageRef = ref(storage, `sessions/${sessionId}/person.jpg`);
      const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: file.type,
      });

      await new Promise<void>((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setState((s) => ({ ...s, progress }));
          },
          (error) => reject(error),
          () => resolve()
        );
      });

      // Get download URL
      const downloadUrl = await getDownloadURL(storageRef);

      // Update Firestore session
      const sessionRef = doc(db, "sessions", sessionId);
      await updateDoc(sessionRef, {
        status: "uploaded",
        personImageUrl: downloadUrl,
      });

      setState({ progress: 100, uploading: false, error: null, done: true });
    } catch (error) {
      console.error("Upload error:", error);
      setState({
        progress: 0,
        uploading: false,
        error: error instanceof Error ? error.message : "Upload failed",
        done: false,
      });
    }
  }

  return { ...state, upload };
}
