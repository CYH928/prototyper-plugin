"use client";

import { QRCodeSVG } from "qrcode.react";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Product } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ScanLine, Upload, Sparkles, Smartphone } from "lucide-react";

interface QRCodeDisplayProps {
  sessionId: string;
  productId: string;
}

export function QRCodeDisplay({ sessionId, productId }: QRCodeDisplayProps) {
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      const snapshot = await getDoc(doc(db, "products", productId));
      if (snapshot.exists()) {
        setProduct({ id: snapshot.id, ...snapshot.data() } as Product);
      }
    }
    fetchProduct();
  }, [productId]);

  const uploadUrl =
    typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ""}/m/${sessionId}`
      : `/m/${sessionId}`;

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto">
      {/* Back button */}
      <div className="w-full mb-6">
        <Link
          href="/kiosk"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-ust-navy transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </Link>
      </div>

      {/* Main content */}
      <div className="flex flex-col lg:flex-row items-center lg:items-stretch gap-10 w-full">
        {/* Left: Product card */}
        {product && (
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden max-w-xs w-full">
              {product.imageUrl && (
                <div className="w-full aspect-square relative bg-gray-50">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-contain p-6"
                    sizes="320px"
                  />
                </div>
              )}
              <div className="p-5 space-y-1 text-center">
                <h2 className="text-xl font-bold text-ust-navy">
                  {product.nameZh || product.name}
                </h2>
                <p className="text-lg font-bold text-ust-gold pt-1">
                  HK${product.price}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Right: QR Code */}
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 text-center space-y-6 max-w-sm w-full">
            <a
              href={uploadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block hover:scale-[1.02] transition-transform cursor-pointer"
              title="Click to open upload page (for testing)"
            >
              <div className="bg-gradient-to-br from-ust-navy/[0.03] to-ust-gold/[0.05] p-5 rounded-2xl inline-block">
                <QRCodeSVG
                  value={uploadUrl}
                  size={220}
                  level="M"
                  fgColor="#003366"
                />
              </div>
            </a>

            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <ScanLine className="w-5 h-5 text-ust-navy" />
                <p className="text-lg font-bold text-ust-navy">
                  用手機掃描 QR Code
                </p>
              </div>
              <p className="text-gray-400">上傳你的照片進行虛擬試穿</p>
            </div>

            <div className="flex items-center gap-2 justify-center text-sm text-gray-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              等待照片中...
            </div>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="mt-10 flex items-center justify-center gap-4 sm:gap-8 w-full">
        {[
          { icon: Smartphone, label: "掃描 QR Code", active: true },
          { icon: Upload, label: "上傳照片", active: false },
          { icon: Sparkles, label: "查看效果", active: false },
        ].map((step, i) => (
          <div key={i} className="flex items-center gap-4 sm:gap-8">
            <div className="flex flex-col items-center gap-2">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  step.active
                    ? "bg-ust-navy text-white shadow-md"
                    : "bg-gray-100 text-gray-300"
                }`}
              >
                <step.icon className="w-5 h-5" />
              </div>
              <p className={`text-xs font-semibold ${step.active ? "text-ust-navy" : "text-gray-300"}`}>
                {step.label}
              </p>
            </div>
            {i < 2 && (
              <div className="w-8 sm:w-16 h-px bg-gray-200 -mt-6" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
