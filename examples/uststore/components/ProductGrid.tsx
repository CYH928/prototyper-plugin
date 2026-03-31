"use client";

import { useRouter } from "next/navigation";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ProductCard } from "@/components/ProductCard";
import { ShoppingBag } from "lucide-react";
import { useModel } from "@/contexts/ModelContext";
import type { Product } from "@/lib/types";

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  const router = useRouter();
  const { model } = useModel();

  function handleSelect(product: Product) {
    const sessionId = crypto.randomUUID();

    router.push(`/kiosk/session/${sessionId}`);

    setDoc(doc(db, "sessions", sessionId), {
      productId: product.id,
      model,
      status: "waiting_upload",
      personImageUrl: null,
      resultImageUrl: null,
      createdAt: Timestamp.now(),
    }).catch((err) => console.error("Failed to create session:", err));
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-gray-400 gap-3">
        <ShoppingBag className="w-16 h-16" />
        <p className="text-lg">暫無可用產品</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onSelect={handleSelect}
        />
      ))}
    </div>
  );
}
