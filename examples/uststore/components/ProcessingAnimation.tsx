import { Shirt } from "lucide-react";

export function ProcessingAnimation() {
  return (
    <div className="text-center space-y-6">
      {/* Animated circles */}
      <div className="relative w-28 h-28 mx-auto">
        <div className="absolute inset-0 border-4 border-ust-navy/20 rounded-full" />
        <div className="absolute inset-0 border-4 border-transparent border-t-ust-navy rounded-full animate-spin" />
        <div className="absolute inset-3 border-4 border-transparent border-t-ust-gold rounded-full animate-spin [animation-direction:reverse] [animation-duration:1.5s]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Shirt className="w-10 h-10 text-ust-navy" />
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="text-xl font-bold text-ust-navy">
          正在為您生成虛擬試穿效果...
        </h3>
      </div>

      <p className="text-sm text-gray-400">
        通常需要約 30 秒
      </p>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2">
        <div className="w-2 h-2 bg-ust-navy rounded-full animate-bounce [animation-delay:0ms]" />
        <div className="w-2 h-2 bg-ust-navy rounded-full animate-bounce [animation-delay:150ms]" />
        <div className="w-2 h-2 bg-ust-navy rounded-full animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}
