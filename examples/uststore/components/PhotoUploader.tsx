"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useImageUpload } from "@/hooks/useImageUpload";
import { UploadGuidelines } from "@/components/UploadGuidelines";
import { MAX_IMAGE_DIMENSION } from "@/lib/constants";
import type { Product } from "@/lib/types";
import { Camera, ImagePlus, Lightbulb, Shirt, Upload } from "lucide-react";

interface PhotoUploaderProps {
  sessionId: string;
  productId: string;
}

export function PhotoUploader({ sessionId, productId }: PhotoUploaderProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const { progress, uploading, error, done, upload } =
    useImageUpload(sessionId);

  useEffect(() => {
    async function fetchProduct() {
      const snapshot = await getDoc(doc(db, "products", productId));
      if (snapshot.exists()) {
        setProduct({ id: snapshot.id, ...snapshot.data() } as Product);
      }
    }
    fetchProduct();
  }, [productId]);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  useEffect(() => {
    if (done) {
      router.push(`/m/${sessionId}/done`);
    }
  }, [done, router, sessionId]);

  // Ctrl+V paste support
  useEffect(() => {
    function handlePaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) handleFile(file);
          break;
        }
      }
    }
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handleFile]);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  async function handleUpload() {
    const file = selectedFile;
    if (!file) return;

    try {
      const { readAndCompressImage } = await import("browser-image-resizer");
      const resizedBlob = await readAndCompressImage(file, {
        quality: 0.85,
        maxWidth: MAX_IMAGE_DIMENSION,
        maxHeight: MAX_IMAGE_DIMENSION,
        mimeType: "image/jpeg",
      });
      const resizedFile = new File([resizedBlob], "person.jpg", {
        type: "image/jpeg",
      });
      await upload(resizedFile);
    } catch {
      await upload(file);
    }
  }

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      {/* Product info */}
      {product && (
        <div className="bg-ust-gray rounded-xl p-4 flex items-center gap-3">
          <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center overflow-hidden">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-contain p-1"
              />
            ) : (
              <Shirt className="w-8 h-8 text-gray-300" />
            )}
          </div>
          <div>
            <p className="font-bold text-gray-800">
              {product.nameZh || product.name}
            </p>
            <p className="text-sm text-gray-500">HK${product.price}</p>
          </div>
        </div>
      )}

      {/* Guidelines toggle */}
      <button
        onClick={() => setShowGuidelines(!showGuidelines)}
        className="text-ust-navy text-sm font-medium flex items-center gap-1.5 hover:underline"
      >
        <Lightbulb className="w-4 h-4" />
        {showGuidelines ? "隱藏提示" : "拍照提示"}
      </button>

      {showGuidelines && <UploadGuidelines />}

      {/* Upload area */}
      {!preview ? (
        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
            id="photo-input"
          />

          {/* Drag & Drop zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              isDragging
                ? "border-ust-gold bg-ust-gold/10"
                : "border-gray-300 bg-gray-50"
            }`}
          >
            <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-500 font-medium">
              拖放或 Ctrl+V 貼上照片
            </p>
          </div>

          <div className="flex items-center gap-3 text-gray-400 text-sm">
            <div className="flex-1 h-px bg-gray-200" />
            或
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <button
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.capture = "environment";
                fileInputRef.current.click();
              }
            }}
            className="w-full bg-ust-navy text-white py-4 rounded-xl text-lg font-medium active:bg-ust-navy-light transition-colors flex items-center justify-center gap-2"
          >
            <Camera className="w-6 h-6" />
            拍照
          </button>

          <button
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.removeAttribute("capture");
                fileInputRef.current.click();
              }
            }}
            className="w-full bg-white border-2 border-ust-navy text-ust-navy py-4 rounded-xl text-lg font-medium active:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <ImagePlus className="w-6 h-6" />
            從相簿選擇
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Preview */}
          <div className="relative rounded-xl overflow-hidden bg-gray-100">
            <img
              src={preview}
              alt="Preview"
              className="w-full max-h-[50vh] object-contain"
            />
          </div>

          {/* Upload progress or confirm */}
          {uploading ? (
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-ust-gold h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-center text-sm text-gray-500">
                上傳中... {Math.round(progress)}%
              </p>
            </div>
          ) : error ? (
            <div className="space-y-3">
              <p className="text-red-500 text-center">{error}</p>
              <button
                onClick={handleUpload}
                className="w-full bg-ust-navy text-white py-3 rounded-xl font-medium"
              >
                重試
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setPreview(null);
                  setSelectedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-medium"
              >
                重拍
              </button>
              <button
                onClick={handleUpload}
                className="flex-1 bg-ust-gold text-white py-3 rounded-xl font-medium active:bg-ust-gold-light transition-colors"
              >
                上傳
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
