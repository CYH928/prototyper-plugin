# @cyh928/prototyper — Claude Code Plugin

Convert any product's source code or Stitch UI designs into a **standalone interactive HTML demo** with auto-play, simulated cursor, and animations.

Includes a **built-in demo** for the **HKUST Souvenir Store Virtual Try-On Kiosk** — split-screen iPad + Phone, no analysis step needed.

---

## Table of Contents

1. [What It Does](#what-it-does)
2. [Install via npm](#install-via-npm)
3. [Install via Git](#install-via-git)
4. [Quick Start](#quick-start)
5. [Try It Yourself: Hands-On Tutorial](#try-it-yourself-hands-on-tutorial)
6. [Tutorial: Any Project](#tutorial-any-project-your-own-code)
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

## Try It Yourself: Hands-On Tutorial

This tutorial uses the **bundled example project** (`examples/uststore/`) so you can try Prototyper immediately after install — no extra repos needed.

### What you'll build

A split-screen interactive demo of the HKUST Souvenir Store Virtual Try-On Kiosk:
- **Left panel**: iPad kiosk (product grid → QR code → AI processing → result)
- **Right panel**: Phone (photo upload → progress bar → thank you)
- **Auto-play**: A simulated cursor clicks through the entire flow on loop

### Step 1 — Open the example project

If you installed via **npm**:
```bash
cd $(npm root -g)/@cyh928/prototyper/examples/uststore
claude
```

If you installed via **git clone**:
```bash
cd prototyper-plugin/examples/uststore
claude
```

### Step 2 — Ask Claude to make a demo (pick one)

You can use **slash commands** or **natural language** — both work:

**Option A: Slash command (fastest)**
```
/prototyper:uststore
```

**Option B: Natural language**
```
Make me an interactive demo of this project
```

**Option C: Natural language with details**
```
I want to create a clickable HTML demo of this virtual try-on kiosk
for an investor presentation. Show the iPad and phone side by side.
```

> **Tip:** You don't need to know the slash commands. Just describe what you want
> in plain English — Claude will figure out which Prototyper steps to run.

### Step 3 — Review the proposed flow

Claude will analyze the source code and present a numbered timeline like this:

```
Proposed demo flow — HKUST Virtual Try-On Kiosk:

 1. Loading skeleton — both panels shimmer
 2. iPad: Product grid appears — 5 items
 3. Cursor clicks "HKUST Hoodie" — product selected
 4. iPad: QR code page — "scan to upload" instruction
 5. Phone: Upload page appears
 6. Phone cursor taps "select photo"
 7. Phone: Upload progress 0% → 100%
 8. Phone: Thank-you screen
 9. iPad: AI processing animation
10. iPad: Result — original photo + try-on side by side
11. Fade back to product grid → loop
```

Claude will then ask if this looks right. **Here's how to respond:**

| What you want to do | What to say |
|---------------------|-------------|
| Accept as-is | `looks good` or `proceed` |
| Remove a step | `skip the upload progress bar, go straight to thank-you` |
| Add a step | `add a 2-second pause on the result screen before looping` |
| Change the starting product | `start with the windbreaker instead of the hoodie` |
| Change the audience | `this is for investors, make it look polished` |
| Change the layout | `use a single panel instead of split-screen` |
| Speed up the demo | `make the whole loop finish in 20 seconds` |

### Step 4 — Watch Claude generate

After you approve, Claude builds the demo automatically. You'll see it creating files:

```
prototyper/
├── index.html              ← open this in your browser
├── css/styles.css
├── js/
│   ├── data.js             ← product data
│   ├── icons.js            ← SVG icons
│   ├── screens.js          ← screen renderers
│   ├── autoplay.js         ← auto-play script
│   └── app.js              ← state machine
└── assets/products/        ← product images
```

This takes **2–5 minutes**. You don't need to do anything — just wait.

### Step 5 — Preview and fix

Claude will verify the output and start a local server:

```
Demo running at http://localhost:3333
```

Open the URL in your browser. If something looks wrong, **just describe it:**

```
the product images are broken
```
```
the spinner doesn't show up on the processing screen
```
```
the phone panel is too tall, it's overlapping the control bar
```

Claude will fix the issue and re-serve. Repeat until it looks right.

### Step 6 — Deploy (optional)

When you're happy with the demo:

```
deploy this to GitHub Pages
```

Or use the slash command:
```
/prototyper:deploy
```

Claude will push and give you the public URL:
```
https://<your-username>.github.io/uststore/prototyper/index.html
```

---

## Tutorial: Any Project (Your Own Code)

Use these same steps on **your own codebase** — React, Next.js, Vue, Flask, anything.

### Step 1 — Open your project

```bash
cd /path/to/your/project
claude
```

### Step 2 — Ask Claude to make a demo

**Option A: One command does everything**
```
/prototyper:prototyper .
```

**Option B: Natural language**
```
Make an interactive HTML demo of this app
```

**Option C: Step by step (more control)**

| Step | Slash command | Or say... |
|------|--------------|-----------|
| Analyze | `/prototyper:analyze .` | `analyze this project for a demo` |
| Propose | `/prototyper:propose` | `propose a demo flow` |
| Generate | `/prototyper:generate` | `generate the demo` |
| Verify | `/prototyper:verify` | `check if the demo works` |
| Deploy | `/prototyper:deploy` | `deploy to GitHub Pages` |

### Example prompts for customization

```
analyze this project but focus only on the dashboard and settings pages
```
```
make the demo split-screen — desktop on the left, mobile on the right
```
```
this is for a sales pitch, make the transitions snappy and add a loading animation
```
```
skip the login flow, start directly on the main page
```
```
use the real product images from public/images/
```

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
