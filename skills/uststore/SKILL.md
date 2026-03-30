---
name: uststore
description: >
  Generates a standalone interactive HTML demo for the HKUST Souvenir Store
  Virtual Try-On Kiosk. Pre-analyzed project — jumps straight to Step 2
  (propose flow). Produces a split-screen demo: left panel = iPad kiosk
  (product grid → QR code → processing → result), right panel = phone
  (photo upload → uploading → thank-you). No source code scanning needed.

  Use this skill when the user wants to demo the HKUST souvenir store,
  the virtual try-on kiosk, the uststore project, or any phrase like
  "make a demo for the HKUST store", "show the try-on kiosk", etc.
argument-hint: "[optional: custom instructions]"
allowed-tools:
  - "Read"
  - "Write"
  - "Edit"
  - "Glob"
  - "Grep"
  - "Bash"
  - "Agent"
---

# Prototyper: HKUST Souvenir Store (uststore)

Pre-analyzed build target. Skip Step 1 (already done below).
Start from **Step 2: Propose Flow**.

---

## Pre-Analysis: uststore Project

```
Product:   HKUST Souvenir Shop — Virtual Try-On Kiosk
Framework: Next.js 15 (App Router) + Tailwind v4 + Firebase
Repo path: C:/Projects/uststore  (or any path the user specifies)
```

### Screens (7 total)

| # | Screen | Route | Description |
|---|--------|-------|-------------|
| 1 | Product Grid | `/kiosk` | 5 products in 2-3 col grid, UST navy header, "試穿" CTA |
| 2 | QR Code | `/kiosk/session/[id]` | Large QR code + "用手機掃描" instruction, waiting for upload |
| 3 | Processing | `/kiosk/session/[id]` | Spinning animation, "AI 正在生成試穿效果…" text |
| 4 | Result | `/kiosk/session/[id]` | Side-by-side: original photo + AI try-on result |
| 5 | Phone Upload | `/m/[sessionId]` | Camera/file upload UI, HKUST logo, upload guidelines |
| 6 | Uploading | `/m/[sessionId]` | Progress bar 0→100%, "正在上傳…" |
| 7 | Thank You | `/m/[sessionId]/done` | "上傳成功！請回到 iPad 查看結果" |

### User Flow

```
iPad: Product Grid → [tap product] → QR Code page (waiting)
                                            ↕ realtime sync (Firestore)
Phone:                               Upload page → [select photo] → Uploading → Thank You
                                            ↕
iPad:                                Processing animation (3–5s) → Result screen → [loop]
```

### Visual Style

```
Primary:       #003366  (ust-navy)       — header, buttons, text
Primary light: #004080  (ust-navy-light) — hover states
Accent:        #C4972F  (ust-gold)       — highlights, badges, active states
Accent light:  #D4A84A  (ust-gold-light) — gold hover
Background:    #FDF6E3  (ust-cream)      — page backgrounds
White:         #FFFFFF                   — cards, phone screen

Font:      System UI (SF Pro / Segoe UI / sans-serif)
Radius:    rounded-xl (12px) for cards; rounded-full for buttons
Shadows:   lg (cards), sm (buttons)
```

### Products (5 items)

| ID | Name (ZH) | Image file | Price |
|----|-----------|------------|-------|
| hoodie-navy | HKUST Hoodie (深藍) | hoodie-navy.png | HK$380 |
| hoodie-gold | HKUST Hoodie (金色) | hoodie-gold.png | HK$380 |
| campus-crewneck-cream | 校園套頭衛衣 (米白) | campus-crewneck-cream.png | HK$320 |
| typography-crewneck-navy | 文字套頭衛衣 (深藍) | typography-crewneck-navy.png | HK$320 |
| windbreaker-red | 防風外套 (紅色) | windbreaker-red.png | HK$480 |

Assets path: `public/products/` relative to the project root.
Copy to `prototyper/assets/products/` during generation.

### Icons

Library: **Lucide** (used in source)
Icons needed: `ShoppingBag`, `QrCode`, `Camera`, `Upload`, `CheckCircle`,
`ArrowLeft`, `Loader2` (spinner), `Smartphone`, `ImageIcon`

### Animations

- Spinner: Lucide `Loader2`-style rotating ring (navy + gold)
- QR pulse: soft ping animation on QR code border
- Upload progress: linear bar `#C4972F` on `#003366` track
- Result reveal: fade-in + slight scale-up (200ms)
- Product card hover: translateY(-4px) + shadow-lg

### Session State Machine (demo simulation)

```
waiting_upload ──[3s auto]──► uploaded ──[instant]──► processing ──[4s]──► completed
```

In the demo, simulate this with `setTimeout` chains in the auto-play engine.

---

## Step 2: Propose Demo Flow

Present this pre-built flow to the user via `AskUserQuestion`.
Ask for approval or adjustments before proceeding to generation.

```
Proposed demo flow — HKUST Virtual Try-On Kiosk:

Layout: Split-screen (iPad left | Phone right)

1. ⏳ Loading skeleton (1.5s) — both panels shimmer
2. 🛍  iPad: Product grid appears — 5 items (HKUST Hoodie highlighted)
3. 👆 Cursor clicks "HKUST Hoodie 深藍" → product selected (gold border flash)
4. 📱 iPad: QR code page — "用手機掃描以上傳照片" + pulsing QR border
5. 📸 Phone: Upload page appears — camera + file upload buttons visible
6. 👆 Phone cursor taps "選擇相片" → file selected (avatar placeholder appears)
7. ⬆️  Phone: Upload progress bar 0% → 100% (2s) — "正在上傳…"
8. ✅ Phone: Thank-you screen — "上傳成功！請回到 iPad 查看結果"
9. ⏳ iPad: Processing animation — spinning ring + "AI 正在生成試穿效果…" (4s)
10. 🎉 iPad: Result screen — person photo + try-on result side by side
11. 🔄 Pause 3s → fade back to product grid → loop

Estimated duration: ~35s at 1x speed
Layout: Split-screen (iPad 640px | Phone 320px)
```

Ask the user:
1. "Does this flow look right? Any steps to add, remove, or reorder?"
2. "Should I use the real product images from `public/products/`? (hoodie-navy.png, etc.)"
3. "Any audience notes? (e.g. investor demo, internal demo, kiosk showcase)"

---

## Step 3: Generate the Prototyper

### Output structure

```
prototyper/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── data.js       — 5 products + mock session
│   ├── icons.js      — Lucide-style SVGs (ShoppingBag, QrCode, Camera, etc.)
│   ├── screens.js    — renderProductGrid(), renderQR(), renderProcessing(),
│   │                   renderResult(), renderPhoneUpload(), renderUploading(),
│   │                   renderThankYou()
│   ├── autoplay.js   — 11-step auto-play with simulated session state
│   └── app.js        — dual-panel state machine (ipadScreen / phoneScreen)
└── assets/
    └── products/     — hoodie-navy.png, hoodie-gold.png, etc.
```

### Split-screen layout spec

```
┌─────────────────────────────────────────────────────────────────┐
│  Control bar: ⏸ Pause │ Step 3/11 │ 1x ▾ │ ⏭ Skip │ ↻ Reset  │
├──────────────────────────────┬──────────────────────────────────┤
│   iPad frame (640×900px)     │    Phone frame (320×693px)       │
│   rounded-3xl, white bg      │    rounded-3xl, notch, home bar  │
│   shadow-2xl                 │    shadow-xl                     │
│                              │                                  │
│   [ipad-screen]              │    [phone-screen]                │
│                              │                                  │
└──────────────────────────────┴──────────────────────────────────┘
```

### Key implementation notes

1. **Dual state machine** — `app.js` must track `ipadScreen` and `phoneScreen`
   separately. `setScreen(panel, screen, data)` where `panel` is `'ipad'|'phone'`.

2. **QR code** — Use a visual placeholder (UST navy square with gold border +
   grid pattern of small squares) since no real QR lib is available. Add label
   "掃描 QR 碼" below it.

3. **Person image** — Use an SVG silhouette placeholder (person outline) for
   the "before" photo. The "after" result can use the garment image overlaid on
   the silhouette with 80% opacity.

4. **Progress bar** — CSS transition `width: 0% → 100%` over 2s, gold fill on
   navy track.

5. **Processing spinner** — Dual-ring CSS animation: outer ring navy, inner
   ring gold, counter-rotating. 1.2s loop.

6. **Product card selection** — On click, flash a `#C4972F` (gold) border
   (200ms), then transition to QR screen.

7. **Auto-play script** — Follow the 11-step flow from Step 2 exactly.
   Use `moveCursorTo(selector, cb)` and `clickRipple(x, y)` from `autoplay.js`.

### Build sequence

1. Copy product images: `cp public/products/*.png prototyper/assets/products/`
2. Build `data.js` with 5 products + mock session object
3. Build `icons.js` with all 9 required SVG functions
4. Build `styles.css` with UST brand vars + split-screen layout + all animations
5. Build `screens.js` with 7 screen renderer functions
6. Build `index.html` with dual-panel structure + script load order
7. Build `app.js` with dual-panel state machine
8. Build `autoplay.js` with 11-step script + cursor engine

Read `references/patterns.md` for full code templates.
Read `resources/visual-checklist.md` for QA checklist before delivery.

---

## Step 4: Verify

```bash
# Syntax check all JS files
for f in prototyper/js/*.js; do
  node -e "new Function(require('fs').readFileSync('$f','utf8'))" && echo "OK: $f" || echo "ERROR: $f"
done

# Serve locally
npx -y serve prototyper -p 3333 -s &
```

Tell user: "Demo at http://localhost:3333 — check the full auto-play loop runs
through all 11 steps on both panels without errors."

---

## Step 5: Deploy

```bash
git add prototyper/
git commit -m "feat: add HKUST Virtual Try-On Kiosk interactive demo (Prototyper)"
git push
```

Then output the GitHub Pages URL:
```bash
GH_USER=$(gh api user -q '.login')
REPO=$(basename $(git rev-parse --show-toplevel))
echo "https://${GH_USER}.github.io/${REPO}/prototyper/index.html"
```

---

## Common Pitfalls (uststore-specific)

| Issue | Cause | Fix |
|-------|-------|-----|
| Phone panel too tall | Fixed height not set | Set `.phone-frame` to `693px` with `overflow: hidden` |
| Dual cursor collision | Only one cursor element | Add `#cursor-ipad` + `#cursor-phone` separately |
| QR screen never advances | Auto-play step missing timeout | Add `setTimeout(done, 3000)` for step 4 |
| Product images 404 | Wrong relative path | Paths must be `assets/products/hoodie-navy.png` |
| Chinese text garbled | Missing charset | Add `<meta charset="UTF-8">` in index.html |
