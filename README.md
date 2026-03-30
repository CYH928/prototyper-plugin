# @cyh928/prototyper — Claude Code Plugin

Convert any product's source code or Stitch UI designs into a **standalone interactive HTML demo** with auto-play, simulated cursor, and animations.

Includes a **built-in demo** for the **HKUST Souvenir Store Virtual Try-On Kiosk** — split-screen iPad + Phone, no analysis step needed.

---

## Table of Contents

1. [What It Does](#what-it-does)
2. [Install via npm](#install-via-npm)
3. [Install via Git](#install-via-git)
4. [Quick Start](#quick-start)
5. [Step-by-Step Guide: HKUST Store Demo](#step-by-step-guide-hkust-store-demo)
6. [Step-by-Step Guide: Any Project](#step-by-step-guide-any-project)
7. [Commands Reference](#commands-reference)
8. [Output Structure](#output-structure)
9. [Features](#features)
10. [Supported Frameworks](#supported-frameworks)

---

## What It Does

```
source code / Stitch UI
        ↓
   /prototyper:analyze    →  maps all screens, styles, assets
   /prototyper:propose    →  proposes demo flow, user tunes it
   /prototyper:generate   →  builds prototyper/ (HTML/CSS/JS)
   /prototyper:verify     →  syntax check + local preview
   /prototyper:deploy     →  git push → GitHub Pages URL
```

**Special built-in:**
```
   /prototyper:uststore   →  HKUST Store demo (pre-analyzed, skip to propose)
```

Run all steps at once: `/prototyper:prototyper`

---

## Install via npm

> **Option B — npm** (recommended): one command, auto-installs skills into `~/.claude/skills/`.

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- [Claude Code](https://claude.ai/code) CLI installed

### Install

```bash
npm install -g @cyh928/prototyper
```

The `postinstall` script runs automatically and copies all skills into `~/.claude/skills/`. You will see:

```
╔══════════════════════════════════════════════════════════╗
║          @cyh928/prototyper — Skills Installed           ║
╠══════════════════════════════════════════════════════════╣
║  ✓  /prototyper                                          ║
║  ✓  /analyze                                             ║
║  ✓  /propose                                             ║
║  ✓  /generate                                            ║
║  ✓  /verify                                              ║
║  ✓  /deploy                                              ║
║  ✓  /uststore                                            ║
╠══════════════════════════════════════════════════════════╣
║  Installed to: ~/.claude/skills/                         ║
╠══════════════════════════════════════════════════════════╣
║  Quick start:                                            ║
║    /prototyper:prototyper .      ← full workflow         ║
║    /prototyper:uststore          ← HKUST Store demo      ║
╚══════════════════════════════════════════════════════════╝
```

### Update

```bash
npm update -g @cyh928/prototyper
```

> **Windows note:** On Windows, files are copied (not symlinked) to `~/.claude/skills/`. After updating, run `prototyper-setup` once to refresh:
> ```bash
> prototyper-setup
> ```

### Uninstall

```bash
npm uninstall -g @cyh928/prototyper
```

Then remove the installed skills manually:

```bash
# Unix/Mac
rm -rf ~/.claude/skills/prototyper ~/.claude/skills/analyze ~/.claude/skills/propose
rm -rf ~/.claude/skills/generate ~/.claude/skills/verify ~/.claude/skills/deploy
rm -rf ~/.claude/skills/uststore

# Windows (PowerShell)
Remove-Item -Recurse -Force "$env:USERPROFILE\.claude\skills\prototyper"
# repeat for each skill name
```

---

## Install via Git

```bash
git clone https://github.com/CYH928/prototyper-plugin
cd prototyper-plugin
node scripts/setup.js
```

Or point Claude Code at the plugin directory directly:

```bash
claude --plugin-dir ./prototyper-plugin
```

---

## Quick Start

Open Claude Code in your project directory and run:

```
/prototyper:prototyper .
```

Claude will analyze your project, propose a demo flow for your approval, generate the `prototyper/` directory, verify it works, and deploy to GitHub Pages.

---

## Step-by-Step Guide: HKUST Store Demo

This is the **built-in pre-analyzed demo** for the HKUST Souvenir Store Virtual Try-On Kiosk (`C:/Projects/uststore`). No source scanning needed — jump straight to flow design.

### Prerequisites

- The uststore project cloned at `C:/Projects/uststore` (or adjust the path)
- Product images present at `public/products/*.png`
- Claude Code open in the uststore project directory

### Step 1 — Open the uststore project in Claude Code

```bash
cd C:/Projects/uststore
claude
```

### Step 2 — Run the uststore skill

```
/prototyper:uststore
```

Claude will present the **pre-built demo flow** for your approval:

```
Proposed demo flow — HKUST Virtual Try-On Kiosk:

Layout: Split-screen (iPad left | Phone right)

1. ⏳ Loading skeleton (1.5s) — both panels shimmer
2. 🛍  iPad: Product grid — 5 items (HKUST Hoodie highlighted)
3. 👆 Cursor clicks "HKUST Hoodie 深藍" → product selected
4. 📱 iPad: QR code page — pulsing border, scan instruction
5. 📸 Phone: Upload page appears
6. 👆 Phone cursor taps "選擇相片"
7. ⬆️  Phone: Upload progress 0%→100% (2s)
8. ✅ Phone: Thank-you screen
9. ⏳ iPad: AI processing animation (4s)
10. 🎉 iPad: Result — photo + try-on side by side
11. 🔄 Fade back to product grid → loop

Estimated duration: ~35s at 1x speed
```

### Step 3 — Tune the flow (optional)

Claude will ask 2–3 questions. Example responses:

| You want | Say |
|----------|-----|
| Skip the upload animation | "Skip step 7, go straight to thank-you" |
| Show more products | "Show all 5 products before clicking" |
| Investor audience | "Make it look polished for investors" |
| Different product first | "Start with the windbreaker instead" |

Type **"looks good"** or **"proceed"** to accept the default flow.

### Step 4 — Generation (automatic)

Claude generates `prototyper/` in the current directory:

```
prototyper/
├── index.html              ← open this in your browser
├── css/styles.css
├── js/
│   ├── data.js             ← 5 HKUST products
│   ├── icons.js            ← Lucide SVGs (ShoppingBag, QrCode, Camera…)
│   ├── screens.js          ← 7 screen renderers (iPad + Phone)
│   ├── autoplay.js         ← 11-step auto-play script
│   └── app.js              ← dual-panel state machine
└── assets/products/        ← hoodie-navy.png, hoodie-gold.png, etc.
```

This takes **2–5 minutes** depending on complexity.

### Step 5 — Verify locally

```
/prototyper:verify
```

Claude runs a syntax check and starts a local server:

```
Demo running at http://localhost:3333
```

Open the URL in your browser. The demo auto-plays on load:
- Left panel: iPad kiosk flow
- Right panel: Phone upload flow
- Control bar at top: Pause / Speed / Skip / Reset

**If anything looks wrong**, describe it to Claude: "The product images are broken" or "The spinner doesn't appear" — Claude will fix and re-verify.

### Step 6 — Deploy to GitHub Pages

```
/prototyper:deploy
```

Claude pushes `prototyper/` to your repo and outputs the public URL:

```
Demo deployed!

🖥  Local:   http://localhost:3333
🌐 Public:  https://<user>.github.io/uststore/prototyper/index.html
```

Share the public URL — anyone can view the interactive demo.

> **Note:** GitHub Pages may take 1–2 minutes to go live on first deploy.
> Enable GitHub Pages in repo Settings → Pages → Source: main branch / (root).

---

## Step-by-Step Guide: Any Project

Use these steps for any codebase (React, Next.js, Vue, Flask, etc.).

### Step 1 — Open your project

```bash
cd /path/to/your/project
claude
```

### Step 2 — Analyze the source

```
/prototyper:analyze .
```

Claude maps all screens, routes, styles, icons, and assets. Review the output.

### Step 3 — Propose the demo flow

```
/prototyper:propose
```

Claude presents a numbered timeline. You can:
- Approve it: "looks good"
- Adjust it: "skip the login screen", "add a 3s loading animation at step 2"
- Change layout: "make it split-screen"
- Change audience: "this is for investors, make it impressive"

### Step 4 — Generate

```
/prototyper:generate
```

Claude builds `prototyper/` — vanilla HTML/CSS/JS, no build step required.

### Step 5 — Verify

```
/prototyper:verify
```

Syntax check + local preview at `http://localhost:3333`. Report any issues.

### Step 6 — Deploy

```
/prototyper:deploy
```

Pushes to git and outputs your GitHub Pages URL.

### All-in-one

```
/prototyper:prototyper .
```

Runs all 5 steps in sequence with human checkpoints at Step 2 (flow approval) and Step 4 (verify).

---

## Commands Reference

| Command | What it does |
|---------|-------------|
| `/prototyper:prototyper` | Full workflow — analyze → propose → generate → verify → deploy |
| `/prototyper:uststore` | HKUST Store demo (pre-analyzed, starts at propose) |
| `/prototyper:analyze` | Step 1 — map screens, styles, icons, assets from source code |
| `/prototyper:propose` | Step 2 — present numbered demo timeline for user approval |
| `/prototyper:generate` | Step 3 — build `prototyper/` (vanilla HTML/CSS/JS) |
| `/prototyper:verify` | Step 4 — syntax check all JS + serve locally at port 3333 |
| `/prototyper:deploy` | Step 5 — `git push` + output GitHub Pages URL |

### With arguments

```
/prototyper:prototyper ./my-app
/prototyper:analyze ./src
/prototyper:propose skip login, focus on dashboard
/prototyper:uststore investor demo — highlight the AI step
```

---

## Output Structure

```
prototyper/
├── index.html          ← open directly in browser (no server needed)
├── css/
│   └── styles.css      ← brand colors, layout, animations, controls
├── js/
│   ├── data.js         ← mock data (IIFE global)
│   ├── icons.js        ← inline SVG icons (IIFE global)
│   ├── screens.js      ← screen renderers — pure HTML string functions
│   ├── autoplay.js     ← auto-play engine + step script
│   └── app.js          ← state machine + event bindings
└── assets/             ← copied product/result images
```

---

## Features

- **Auto-play** on open — 36px simulated cursor, click ripples, floating annotations
- **Manual interaction** — pause auto-play and click through yourself
- **Speed control** — 0.5x / 1x / 2x
- **Split-screen** — dual-device layout for kiosk + mobile apps
- **Visual fidelity** — brand colors, icons, animations matched to source
- **`file://` compatible** — open `index.html` directly, no server required
- **Chinese UI** — uststore demo fully localized in Traditional Chinese
- **Pre-analyzed** — uststore skill skips the analysis step entirely

---

## Supported Frameworks

- React / Next.js / Vue / Angular
- Flask / Django / Rails
- Flutter / React Native
- Stitch UI (screenshots or exported HTML)
- Static HTML
- Any codebase with readable source files

---

## License

MIT — [github.com/CYH928/prototyper-plugin](https://github.com/CYH928/prototyper-plugin)
