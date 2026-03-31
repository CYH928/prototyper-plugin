"use client";

import { CheckCircle, Monitor } from "lucide-react";

export default function ThankYouPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center gap-8">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle className="w-12 h-12 text-green-600" />
      </div>

      <div className="space-y-3">
        <h2 className="text-3xl font-bold text-gray-800">
          照片已上傳成功！
        </h2>
      </div>

      <div className="bg-ust-navy/5 border-2 border-ust-navy/20 rounded-2xl p-8 max-w-sm space-y-4">
        <Monitor className="w-12 h-12 text-ust-navy mx-auto" />
        <p className="text-lg font-semibold text-ust-navy">
          請回到店內大螢幕
        </p>
        <p className="text-lg text-gray-600">
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
