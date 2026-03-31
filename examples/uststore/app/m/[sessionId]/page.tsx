"use client";

import { use } from "react";
import { useSession } from "@/hooks/useSession";
import { PhotoUploader } from "@/components/PhotoUploader";
import { CheckCircle, Clock, Monitor } from "lucide-react";

export default function UploadPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const { session, loading } = useSession(sessionId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-ust-navy border-t-transparent" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center gap-4">
        <Clock className="w-12 h-12 text-gray-400" />
        <h2 className="text-xl font-bold text-gray-800">Session 已過期</h2>
        <p className="text-gray-500">
          請在店內大螢幕重新掃描 QR Code。
        </p>
      </div>
    );
  }

  if (session.status !== "waiting_upload") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center gap-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-800">
            照片已上傳成功！
          </h2>
        </div>

        <div className="bg-ust-navy/5 border-2 border-ust-navy/20 rounded-2xl p-6 max-w-sm w-full space-y-3">
          <Monitor className="w-10 h-10 text-ust-navy mx-auto" />
          <p className="text-lg font-semibold text-ust-navy">
            請回到店內大螢幕
          </p>
          <p className="text-base text-gray-600">
            查看試穿效果
          </p>
          <div className="flex items-center gap-2 justify-center text-sm text-ust-gold font-medium">
            <div className="w-2 h-2 bg-ust-gold rounded-full animate-pulse" />
            AI 正在生成試穿效果...
          </div>
        </div>

        <p className="text-sm text-gray-400">
          你可以關閉此頁面
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <PhotoUploader sessionId={sessionId} productId={session.productId} />
    </div>
  );
}
