"use client";

import { useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronRight,
  Loader2,
  RefreshCw,
  ShoppingBag,
  Shirt,
} from "lucide-react";


interface TryOnResultProps {
  resultImageUrl: string;
  sessionId: string;
  currentProductId?: string;
  results?: Record<string, string>;
}

export function TryOnResult({
  resultImageUrl,
  sessionId,
  currentProductId,
  results,
}: TryOnResultProps) {
  const router = useRouter();
  const { products } = useProducts();
  const [switching, setSwitching] = useState(false);
  const [viewingProductId, setViewingProductId] = useState(currentProductId);
  const [viewingImageUrl, setViewingImageUrl] = useState(resultImageUrl);

  const activeProductId = viewingProductId || currentProductId;
  const currentProduct = products.find((p) => p.id === activeProductId);
  async function handleSelectProduct(product: Product) {
    if (product.id === activeProductId || switching) return;

    // Check if result is already pre-generated
    const cachedUrl = results?.[product.id];
    if (cachedUrl) {
      // Instant switch — no API call needed
      setViewingProductId(product.id);
      setViewingImageUrl(cachedUrl);
      return;
    }

    // Fallback: generate on demand
    setSwitching(true);
    try {
      const res = await fetch("/api/tryon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, productId: product.id }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error("Try-on API error:", res.status, body);
      }
      // onSnapshot will update the session with new resultImageUrl
    } catch (err) {
      console.error("Failed to switch product:", err);
    } finally {
      setSwitching(false);
    }
  }

  // Keep viewingImageUrl in sync with props when session updates (e.g., from on-demand generation)
  const displayUrl = viewingImageUrl || resultImageUrl;

  return (
    <div className="flex flex-row w-full h-[calc(100vh-64px)] overflow-hidden">
      {/* Main result area */}
      <div className="flex-1 flex items-center justify-center min-w-0 px-6 py-4 bg-gradient-to-b from-white to-gray-50/50 overflow-hidden">
        <div className="flex items-center gap-8 max-h-full">
          {/* Result image */}
          <div className="relative rounded-3xl overflow-hidden bg-white shadow-[0_8px_40px_rgba(0,51,102,0.1)] flex items-center" style={{ maxHeight: 'calc(100vh - 96px)' }}>
            {switching && (
              <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-10 h-10 text-ust-navy animate-spin" />
                <p className="text-sm font-medium text-ust-navy">
                  切換中...
                </p>
              </div>
            )}
            <img
              src={displayUrl}
              alt="Virtual Try-On Result"
              style={{ maxHeight: 'calc(100vh - 96px)' }}
              className="w-auto object-contain"
            />
          </div>

        </div>
      </div>

      {/* Sidebar */}
      <div
        className="w-80 shrink-0 bg-gradient-to-b from-white to-gray-50/30 border-l border-gray-200/60 flex flex-col overflow-hidden"
        style={{ maxHeight: "calc(100vh - 64px)" }}
      >
        {/* Current product header */}
        {currentProduct && (
          <div className="px-5 pt-5 pb-4 border-b border-gray-100">
            <p className="text-lg font-bold text-ust-navy leading-tight">
              {currentProduct.nameZh || currentProduct.name}
            </p>
            <p className="text-ust-gold font-bold text-xl mt-1">
              HK${currentProduct.price}
            </p>
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={() => {
                  if (currentProduct) {
                    sessionStorage.setItem("checkout_productName", currentProduct.nameZh || currentProduct.name);
                    sessionStorage.setItem("checkout_productPrice", String(currentProduct.price));
                  }
                  router.push(`/kiosk/session/${sessionId}/checkout`);
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-ust-gold text-white px-4 py-2.5 rounded-xl font-medium hover:bg-ust-gold-light transition-colors shadow-sm text-sm"
              >
                <ShoppingBag className="w-4 h-4" />
                立即購買
              </button>
              <Link
                href="/kiosk"
                className="inline-flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-ust-navy transition-colors px-3 py-2.5 rounded-xl hover:bg-gray-100"
              >
                <RefreshCw className="w-3 h-3" />
                重新開始
              </Link>
            </div>
          </div>
        )}

        {/* Product list header */}
        <div className="px-5 pt-4 pb-2">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            試穿其他款式
          </h4>
        </div>

        {/* Product list */}
        <div className="flex flex-col gap-1 overflow-y-auto px-3 pb-4 flex-1">
          {products.map((product) => {
            const isCurrent = product.id === activeProductId;
            const isReady = !!results?.[product.id];
            const isGenerating = !isReady && !isCurrent;

            return (
              <button
                key={product.id}
                onClick={() => handleSelectProduct(product)}
                disabled={isCurrent || switching}
                className={`group flex items-center gap-3 px-3 py-2 rounded-xl transition-all w-full ${
                  isCurrent
                    ? "bg-ust-navy text-white shadow-md"
                    : switching
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:bg-white hover:shadow-md active:scale-[0.98] cursor-pointer"
                }`}
              >
                <div
                  className={`w-12 h-12 shrink-0 rounded-lg relative overflow-hidden ${
                    isCurrent ? "bg-white/20" : "bg-gray-100"
                  }`}
                >
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-contain p-1"
                      sizes="48px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Shirt className="w-5 h-5" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 text-left">
                  <p
                    className={`font-medium text-sm leading-tight truncate ${
                      isCurrent ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {product.nameZh || product.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className={`font-bold text-sm ${
                        isCurrent ? "text-white/80" : "text-ust-gold"
                      }`}
                    >
                      HK${product.price}
                    </span>
                    {isReady && !isCurrent && (
                      <span className="text-[10px] text-green-500 flex items-center gap-0.5 font-medium">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                    {isGenerating && (
                      <Loader2 className="w-3 h-3 animate-spin text-gray-300" />
                    )}
                  </div>
                </div>

                {isCurrent ? (
                  <div className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                ) : (
                  !switching && (
                    <ChevronRight className="w-4 h-4 text-gray-300 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
