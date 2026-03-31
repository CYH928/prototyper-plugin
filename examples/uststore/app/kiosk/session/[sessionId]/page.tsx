"use client";

import { use, useEffect, useState } from "react";
import { useSession } from "@/hooks/useSession";
import { QRCodeDisplay } from "@/components/QRCodeDisplay";
import { ProcessingAnimation } from "@/components/ProcessingAnimation";
import { TryOnResult } from "@/components/TryOnResult";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Clock, RefreshCw } from "lucide-react";

const PROCESSING_TIMEOUT_MS = 150_000; // 2.5 minutes

export default function SessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const { session, loading } = useSession(sessionId);
  const [processingElapsed, setProcessingElapsed] = useState(0);
  const [processingTimedOut, setProcessingTimedOut] = useState(false);

  // Track processing time
  useEffect(() => {
    if (session?.status !== "uploaded" && session?.status !== "processing") {
      setProcessingElapsed(0);
      setProcessingTimedOut(false);
      return;
    }

    const interval = setInterval(() => {
      setProcessingElapsed((prev) => {
        const next = prev + 1;
        if (next * 1000 >= PROCESSING_TIMEOUT_MS) {
          setProcessingTimedOut(true);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [session?.status]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-ust-navy border-t-transparent" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-gray-300" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-xl font-semibold text-gray-700">找不到此 session</p>
        </div>
        <Link
          href="/kiosk"
          className="inline-flex items-center gap-2 bg-ust-navy text-white px-6 py-3 rounded-xl font-medium hover:bg-ust-navy-light transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回產品頁
        </Link>
      </div>
    );
  }

  // Completed status: render TryOnResult directly without padding wrapper
  if (session.status === "completed" && session.resultImageUrl) {
    return (
      <TryOnResult
        resultImageUrl={session.resultImageUrl}
        sessionId={sessionId}
        currentProductId={session.productId}
        results={session.results}
      />
    );
  }

  return (
    <div className="flex items-center justify-center h-full p-6 sm:p-8 overflow-hidden">
      {session.status === "waiting_upload" && (
        <QRCodeDisplay sessionId={sessionId} productId={session.productId} />
      )}

      {(session.status === "uploaded" || session.status === "processing") &&
        !processingTimedOut && (
          <div className="flex flex-col items-center gap-6 max-w-3xl w-full">
            <ProcessingAnimation />

            {/* Elapsed timer pill */}
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur rounded-full px-4 py-1.5 shadow-sm border border-gray-100">
              <div className="w-1.5 h-1.5 bg-ust-gold rounded-full animate-pulse" />
              <span className="text-xs text-gray-500 font-medium tabular-nums">
                已等候 {Math.floor(processingElapsed / 60)}:{String(processingElapsed % 60).padStart(2, "0")}
              </span>
            </div>

            {/* YouTube video while waiting */}
            <div className="w-full max-w-2xl">
              <p className="text-sm text-gray-400 text-center mb-3">
                等候期間，了解更多科大資訊
              </p>
              <div className="relative w-full rounded-2xl overflow-hidden shadow-lg aspect-video">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/hwGNV2XkaVI?autoplay=1&mute=1&loop=1&playlist=hwGNV2XkaVI"
                  title="HKUST Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        )}

      {(session.status === "uploaded" || session.status === "processing") &&
        processingTimedOut && (
          <div className="flex flex-col items-center gap-6 max-w-md w-full text-center">
            <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center">
              <Clock className="w-10 h-10 text-amber-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-800">
                處理超時
              </h3>
            </div>
            <div className="bg-amber-50/50 border border-amber-200/60 rounded-2xl p-5 text-left w-full">
              <p className="text-sm text-amber-700 leading-relaxed">
                虛擬試穿處理時間過長（{Math.floor(processingElapsed / 60)}:{String(processingElapsed % 60).padStart(2, "0")}），可能因為 Vertex AI 資源暫時不足。
              </p>
            </div>
            <Link
              href="/kiosk"
              className="inline-flex items-center gap-2 bg-ust-navy text-white px-8 py-3 rounded-xl font-medium hover:bg-ust-navy-light transition-colors shadow-md"
            >
              <RefreshCw className="w-4 h-4" />
              重試
            </Link>
          </div>
        )}

      {session.status === "error" && (
        <div className="flex flex-col items-center gap-6 max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-gray-800">
              處理失敗
            </h3>
            <p className="text-gray-400">處理失敗</p>
          </div>
          <div className="bg-red-50/50 border border-red-200/60 rounded-2xl p-5 text-left w-full space-y-2">
            <p className="text-xs font-semibold text-red-400 uppercase tracking-wide">
              錯誤詳情
            </p>
            <p className="text-sm text-red-700 font-mono break-all whitespace-pre-wrap leading-relaxed">
              {session.errorMessage || "未知錯誤"}
            </p>
            {processingElapsed > 0 && (
              <p className="text-xs text-red-400 pt-1">
                於 {Math.floor(processingElapsed / 60)}:{String(processingElapsed % 60).padStart(2, "0")} 後失敗
              </p>
            )}
          </div>
          <Link
            href="/kiosk"
            className="inline-flex items-center gap-2 bg-ust-navy text-white px-8 py-3 rounded-xl font-medium hover:bg-ust-navy-light transition-colors shadow-md"
          >
            <RefreshCw className="w-4 h-4" />
            重試
          </Link>
        </div>
      )}
    </div>
  );
}
