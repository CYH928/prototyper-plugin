"use client";

import { createContext, useContext, useState } from "react";
import type { TryOnModel } from "@/lib/types";

const ModelContext = createContext<{
  model: TryOnModel;
  setModel: (m: TryOnModel) => void;
}>({
  model: "virtual-try-on-001",
  setModel: () => {},
});

export function ModelProvider({ children }: { children: React.ReactNode }) {
  const [model, setModel] = useState<TryOnModel>("virtual-try-on-001");
  return (
    <ModelContext.Provider value={{ model, setModel }}>
      {children}
    </ModelContext.Provider>
  );
}

export function useModel() {
  return useContext(ModelContext);
}
