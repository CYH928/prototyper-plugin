"use client";

import { useModel } from "@/contexts/ModelContext";
import { ChevronDown } from "lucide-react";
import type { TryOnModel } from "@/lib/types";

const MODELS: { id: TryOnModel; name: string }[] = [
  { id: "virtual-try-on-001", name: "Virtual Try-On 001" },
  { id: "gemini-2.5-flash-image", name: "Nano Banana 2" },
];

export function ModelSelector() {
  const { model, setModel } = useModel();

  return (
    <div className="relative">
      <select
        value={model}
        onChange={(e) => setModel(e.target.value as TryOnModel)}
        className="appearance-none bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-1.5 text-sm font-medium text-ust-navy cursor-pointer hover:border-ust-navy/40 focus:outline-none focus:ring-2 focus:ring-ust-navy/20 transition-all"
      >
        {MODELS.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  );
}
