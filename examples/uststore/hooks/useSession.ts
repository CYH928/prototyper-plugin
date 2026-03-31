"use client";

import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Session } from "@/lib/types";

// Track which sessions have already triggered generation
const triggeredSessions = new Set<string>();

export function useSession(sessionId: string | null) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    const docRef = doc(db, "sessions", sessionId);
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = { id: snapshot.id, ...snapshot.data() } as Session;
          setSession(data);

          // When photo is uploaded, generate ALL products at once
          if (data.status === "uploaded" && !triggeredSessions.has(sessionId)) {
            triggeredSessions.add(sessionId);
            fetch("/api/tryon-batch", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ sessionId }),
            }).then(async (res) => {
              if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                console.error("Try-on batch error:", res.status, body);
              }
            }).catch((err) => {
              console.error("Failed to trigger try-on:", err);
              import("firebase/firestore").then(({ doc, updateDoc }) => {
                updateDoc(doc(db, "sessions", sessionId), {
                  status: "error",
                  errorMessage: `Network error: ${err.message}`,
                });
              });
            });
          }
        } else {
          setSession(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Firestore session error:", err);
        setSession(null);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [sessionId]);

  return { session, loading };
}
