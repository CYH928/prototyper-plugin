import { PersonStanding, Focus, Sun, Frame } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function UploadGuidelines() {
  const tips: { icon: LucideIcon; text: string }[] = [
    { icon: PersonStanding, text: "展示全身，從頭到腳" },
    { icon: Focus, text: "正面面對鏡頭" },
    { icon: Sun, text: "光線充足" },
    { icon: Frame, text: "純色背景" },
  ];

  return (
    <div className="bg-blue-50 rounded-xl p-4 space-y-2">
      <p className="font-medium text-ust-navy text-sm">
        最佳效果：
      </p>
      <div className="grid grid-cols-2 gap-2">
        {tips.map((tip) => (
          <div key={tip.text} className="flex items-center gap-2 text-sm">
            <tip.icon className="w-5 h-5 text-ust-navy shrink-0" />
            <span className="text-gray-700">{tip.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
