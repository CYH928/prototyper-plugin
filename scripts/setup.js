#!/usr/bin/env node
'use strict';

/**
 * Post-install setup script for @cyh928/prototyper
 *
 * Installs all skills from this package into ~/.claude/skills/
 *   - Unix/Mac: creates symlinks (so `npm update` propagates changes automatically)
 *   - Windows:  copies files (symlinks require admin privileges on Windows)
 */

const fs   = require('fs');
const path = require('path');
const os   = require('os');

// ── Paths ─────────────────────────────────────────────────────────────────────
const PACKAGE_DIR    = path.resolve(__dirname, '..');
const SKILLS_SRC     = path.join(PACKAGE_DIR, 'skills');
const CLAUDE_DIR     = path.join(os.homedir(), '.claude');
const CLAUDE_SKILLS  = path.join(CLAUDE_DIR, 'skills');
const IS_WINDOWS     = process.platform === 'win32';

// ── Helpers ───────────────────────────────────────────────────────────────────
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function removeExisting(target) {
  if (!fs.existsSync(target) && !fs.lstatSync(target).isSymbolicLink?.()) return;
  const stat = fs.lstatSync(target);
  if (stat.isSymbolicLink() || stat.isFile()) {
    fs.unlinkSync(target);
  } else if (stat.isDirectory()) {
    fs.rmSync(target, { recursive: true, force: true });
  }
}

function safeRemove(target) {
  try {
    if (fs.existsSync(target) || isSymlink(target)) {
      removeExisting(target);
    }
  } catch (_) {
    // ignore
  }
}

function isSymlink(p) {
  try { return fs.lstatSync(p).isSymbolicLink(); } catch (_) { return false; }
}

function copyDirRecursive(src, dest) {
  ensureDir(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcEntry  = path.join(src, entry.name);
    const destEntry = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcEntry, destEntry);
    } else {
      fs.copyFileSync(srcEntry, destEntry);
    }
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
function main() {
  // 1. Verify skills directory exists in the package
  if (!fs.existsSync(SKILLS_SRC)) {
    console.error('[prototyper] ERROR: skills/ directory not found at', SKILLS_SRC);
    process.exit(1);
  }

  const skillDirs = fs.readdirSync(SKILLS_SRC, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  if (skillDirs.length === 0) {
    console.error('[prototyper] ERROR: no skill subdirectories found in skills/');
    process.exit(1);
  }

  // 2. Ensure ~/.claude/skills/ exists
  ensureDir(CLAUDE_DIR);
  ensureDir(CLAUDE_SKILLS);

  // 3. Install each skill
  const installed = [];
  const skipped   = [];

  for (const skillName of skillDirs) {
    const src    = path.join(SKILLS_SRC, skillName);
    const target = path.join(CLAUDE_SKILLS, skillName);

    try {
      safeRemove(target);

      if (IS_WINDOWS) {
        // Windows: copy files (avoids symlink permission requirement)
        copyDirRecursive(src, target);
      } else {
        // Unix/Mac: relative symlink so the install stays portable
        const rel = path.relative(path.dirname(target), src);
        fs.symlinkSync(rel, target, 'dir');
      }

      installed.push(skillName);
    } catch (err) {
      console.warn(`[prototyper] WARNING: could not install skill "${skillName}": ${err.message}`);
      skipped.push(skillName);
    }
  }

  // 4. Summary
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║          @cyh928/prototyper — Skills Installed           ║');
  console.log('╠══════════════════════════════════════════════════════════╣');
  for (const name of installed) {
    console.log(`║  ✓  /${name.padEnd(54)}║`);
  }
  if (skipped.length > 0) {
    console.log('║                                                          ║');
    for (const name of skipped) {
      console.log(`║  ✗  /${name.padEnd(54)}║  (skipped)`);
    }
  }
  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log('║  Installed to: ~/.claude/skills/                         ║');
  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log('║  Quick start:                                            ║');
  console.log('║    /prototyper:prototyper .      ← full workflow         ║');
  console.log('║    /prototyper:uststore          ← HKUST Store demo      ║');
  console.log('╠══════════════════════════════════════════════════════════╣');

  // Show example project path
  const examplesDir = path.join(PACKAGE_DIR, 'examples', 'uststore');
  if (fs.existsSync(examplesDir)) {
    console.log('║  Try the demo:                                           ║');
    console.log(`║    cd ${examplesDir}`);
    console.log('║    claude                                                 ║');
    console.log('║    /prototyper:uststore                                   ║');
  }

  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');

  if (IS_WINDOWS) {
    console.log('[prototyper] Windows mode: files copied to ~/.claude/skills/');
    console.log('[prototyper] Run `prototyper-setup` again after `npm update` to refresh.');
  } else {
    console.log('[prototyper] Unix mode: symlinks created — `npm update` auto-propagates changes.');
  }
  console.log('');
}

main();
