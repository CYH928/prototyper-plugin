"use client";

import Image from "next/image";
import type { Product } from "@/lib/types";
import { Shirt } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export function ProductCard({ product, onSelect }: ProductCardProps) {
  return (
    <button
      onClick={() => onSelect(product)}
      className="bg-white rounded-2xl shadow-sm overflow-hidden text-left transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
    >
      <div className="aspect-square relative bg-gray-50">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-contain p-4"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <Shirt className="w-16 h-16" />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-800 text-lg leading-tight">
          {product.nameZh || product.name}
        </h3>
        <div className="flex items-center justify-between mt-3">
          <span className="text-ust-navy font-bold text-lg">
            HK${product.price}
          </span>
          <span className="bg-ust-gold text-white text-sm px-3 py-1 rounded-full font-medium">
            試穿
          </span>
        </div>
      </div>
    </button>
  );
}
