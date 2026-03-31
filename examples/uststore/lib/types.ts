import { Timestamp } from "firebase/firestore";

export interface Product {
  id: string;
  name: string;
  nameZh: string;
  price: number;
  imageUrl: string;
  garmentImageUrl: string;
  buyUrl?: string;
}

export type SessionStatus =
  | "waiting_upload"
  | "uploaded"
  | "processing"
  | "completed"
  | "error";

export type TryOnModel = "virtual-try-on-001" | "gemini-2.5-flash-image";

export interface Session {
  id: string;
  productId: string;
  model: TryOnModel;
  status: SessionStatus;
  personImageUrl: string | null;
  resultImageUrl: string | null;
  results?: Record<string, string>;
  errorMessage?: string | null;
  createdAt: Timestamp;
}
