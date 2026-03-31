# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HKUST Souvenir Shop Virtual Try-On Kiosk POC — a Next.js app that lets shoppers select clothing on an iPad kiosk, scan a QR code on their phone to upload a photo, and see an AI-generated try-on result on the iPad via Google's Virtual Try-On 001 Vertex AI model.

## Commands

```bash
# Dev server (binds to 0.0.0.0 so phone on same WiFi can access it)
node node_modules/next/dist/bin/next dev --turbopack --hostname 0.0.0.0

# Build
npm run build

# Lint
npm run lint

# Seed Firestore with product data (requires Firebase configured)
npm run seed

# Deploy Firebase rules only
firebase deploy --only firestore:rules,storage --project mcps-owntest

# Debug Vertex AI connectivity (useful when troubleshooting billing/auth)
node scripts/test-vto.mjs
```

> **Note:** `npm` / `npx` binaries may fail on Windows. Use `node node_modules/next/dist/bin/next` directly if needed.

## Architecture

### Two separate user experiences
- **`/kiosk/*`** — iPad kiosk UI: product grid → QR code → processing animation → try-on result
- **`/m/[sessionId]/*`** — Phone UI: photo upload page → thank-you page
- **`/api/tryon`** — Server-side Route Handler: calls Vertex AI Virtual Try-On 001 API

### Session state machine
```
waiting_upload → uploaded → processing → completed
                                       ↘ error
```
- `waiting_upload`: session created, QR shown on iPad
- `uploaded`: phone uploaded photo to Storage
- `processing`: `/api/tryon` is running
- `completed`: result image ready
- `error`: Vertex AI or Storage failure; `errorMessage` field set on session doc

### Real-time sync flow
1. iPad creates a Firestore `sessions/{id}` doc with `status: "waiting_upload"` and shows QR code
2. Phone uploads photo to Firebase Storage → updates session `status: "uploaded"`
3. iPad's `useSession` hook (`onSnapshot`) detects the status change and auto-calls `POST /api/tryon`
4. Route Handler downloads person + garment images, calls Vertex AI, uploads result, sets `status: "completed"`
5. iPad's `onSnapshot` fires again → displays result image

### Firebase / GCP
- **Project:** `mcps-owntest` (Blaze plan — billing enabled)
- **Firestore** — named database `"uststore"` (not the default); sessions + products collections; security rules in `firestore.rules`
- **Storage** — product images + session person/result photos; rules in `storage.rules`
- **App Hosting** — deployment target; config in `apphosting.yaml`
- **Vertex AI Virtual Try-On 001** — billing active; still requires Provisioned Throughput from Google

### Offline/dev fallback
When Firebase is not configured (`NEXT_PUBLIC_FIREBASE_API_KEY` is empty), `isFirebaseConfigured` (from `lib/firebase.ts`) is `false`. In this mode:
- Products load from `lib/products-data.ts` (local static data)
- Sessions are stored in `sessionStorage` instead of Firestore
- Setting `USE_MOCK_VTO=true` makes `/api/tryon` return the person image as-is without calling Vertex AI

### Key files
| File | Purpose |
|------|---------|
| `hooks/useSession.ts` | Firestore `onSnapshot` listener; auto-triggers `/api/tryon` when status → `"uploaded"` |
| `hooks/useImageUpload.ts` | Resizes image to `MAX_IMAGE_DIMENSION` (2048px), uploads to `sessions/{id}/person.jpg`, tracks progress |
| `hooks/useProducts.ts` | Reads `products` Firestore collection; returns `{ products, loading }` |
| `app/api/tryon/route.ts` | Virtual Try-On Route Handler (server-side); supports mock mode |
| `lib/firebase.ts` | Client SDK init + `isFirebaseConfigured` export |
| `lib/firebase-admin.ts` | Admin SDK for server-side Storage/Firestore access |
| `lib/types.ts` | `Product`, `Session`, `SessionStatus` interfaces |
| `lib/constants.ts` | `MAX_IMAGE_DIMENSION=2048`, `MAX_IMAGE_SIZE_BYTES=10MB`, idle/session timeouts |
| `lib/products-data.ts` | Local product data fallback (used when Firestore unavailable) |
| `public/products/` | Local garment images (PNG, flat-lay white background) |
| `components/ProductGrid.tsx` | Creates session doc on product tap; always writes to sessionStorage as fallback |
| `components/PhotoUploader.tsx` | Supports file select, camera capture, drag-and-drop, and Ctrl+V paste |

### UST brand colors (Tailwind v4 `@theme`)
- `ust-navy` #003366, `ust-navy-light` #004080, `ust-gold` #C4972F, `ust-gold-light` #D4A84A, `ust-cream` #FDF6E3
- `.kiosk-mode` CSS class disables text selection and touch callout on the iPad

### Environment variables
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
GCP_PROJECT_ID                    # Server-side: Vertex AI project
GCP_REGION                        # Server-side: default us-central1
USE_MOCK_VTO                      # Optional: "true" to skip real VTO API call
GOOGLE_APPLICATION_CREDENTIALS    # Path to service account JSON (seed script + local Admin SDK)
```
