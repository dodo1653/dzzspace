# dzzspace — Complete Progress & Architecture Guide

## Overview

dzzspace is a premium multi-terminal desktop workspace app built with Electron + React + TypeScript + Vite (electron-vite). It features grid-based PowerShell terminals, workspace management, ultra-aesthetic native-feeling UI (like Ghostty/Warp/Cursor), sound effects, animated backgrounds, and premium terminal rendering.

---

## 1. Project Architecture

### 1.1 Tech Stack
- **Framework**: Electron 31 + React 18 + TypeScript 5.5
- **Build**: electron-vite 2.3 (Vite 5.4 under the hood)
- **Terminal**: xterm 5.3.0 + xterm-addon-fit 0.8 + xterm-addon-web-links 0.9
- **PTY**: @lydell/node-pty 1.0
- **State**: Zustand 4.5
- **Animation**: Framer Motion 11
- **UI**: Custom CSS (no component library), TailwindCSS 3.4 (unused but installed)

### 1.2 Project Structure
```
dzzspace/
├── src/
│   ├── main/           # Electron main process
│   │   └── pty.ts      # PTY session management, IPC handlers
│   ├── preload/        # Preload bridge (contextBridge)
│   │   ├── index.ts    # Exposes dzz API to renderer
│   │   └── index.d.ts  # Window.dzz type declarations
│   └── renderer/       # React app
│       ├── main/       # Renderer entry
│       ├── components/ # React components
│       ├── store/      # Zustand stores
│       ├── hooks/      # Custom hooks
│       ├── types/      # TypeScript types
│       ├── utils/      # Utilities
│       └── styles/     # CSS files
├── website/            # Landing page (GitHub Pages)
├── .github/workflows/  # CI/CD
└── package.json
```

### 1.3 Data Flow
```
Main Process (pty.ts)
  │
  ├── pty:create → spawn PowerShell with node-pty
  ├── pty:write  → term.write(data)
  ├── pty:resize → term.resize(cols, rows)
  ├── pty:destroy → term.kill()
  ├── pty:exists → check if session exists
  ├── pty:cwd   → returns stored initial CWD
  │
  └── pty:data:{id} → IPC → Renderer → term.write()
```

---

## 2. Key Design Decisions & Conventions

### 2.1 Terminal Rendering
- **NEVER use WebGL addon** — causes terminal corruption and blank screens on layout switches. Canvas renderer only.
- **NEVER add CSS padding on .xterm** — breaks typing position alignment.
- **Letter spacing MUST be 0** — any non-zero value breaks monospace cell alignment.
- **Font weight 400** (not 300) — ASCII art and box-drawing chars need substance at small sizes.
- **lineHeight 1.12** — sweet spot for dense Ghostty-like feel with JetBrains Mono.
- **xterm.css NOT imported** — all xterm styling applied programmatically via PremiumRenderer.
- **PTY output NEVER modified** — no ASCII art detection, no scaling, no repositioning.

### 2.2 PTY Lifecycle
- PTY processes persist across workspace switches — not destroyed on component unmount.
- Only destroyed on explicit pane close (user clicks X or pane removed from store).
- On workspace switch-back: existing PTY is detected via `pty:exists`, TerminalInstance reconnects (creates new xterm but same PTY).
- All workspace panes are **always-mounted** (TerminalGrid renders all workspaces, toggles `display: grid/none`). xterm instances are never disposed on workspace switch.

### 2.3 Layout Changes
- CSS grid presets: 1, 2v, 4, 6, 9.
- Grid container uses `position: absolute` per workspace, only active workspace visible.
- **No CSS transitions on grid-template-columns/rows** — caused canvas corruption.
- Layout changes are instant, no animation.

### 2.4 Theme & Styling
- **Colors**: Background `#0c0c12`, foreground `#e0e0e8`, accent `#d4a373` (warm gold).
- **Accent variables**: `--accent: #d4a373`, `--accent-dim: rgba(212,163,115,0.25)`, `--accent-glow: rgba(212,163,115,0.06)`.
- **Fonts**: JetBrains Mono (terminal), Inter/Inter Tight (UI).
- **No glassmorphism** — panels use solid backgrounds with hairline borders for native feel.
- **No emojis** anywhere — custom SVG icons only.

### 2.5 Premium Terminal Rendering System
File: `src/renderer/utils/premiumRenderer.ts`
- Glyph-aware canvas metrics via `ctx.measureText('Ag')` using `actualBoundingBoxAscent/Descent`.
- Adaptive typography: 5 tiers (compact 10px → generous 16px), dynamic size with 250ms debounce.
- DPI/zoom aware via `window.devicePixelRatio`.
- `isolateMeasurementElements()` — fixes WWWWWW glyph measurement leak with JS inline styles.
- Font weight 400/600, letter spacing ALWAYS 0.

### 2.6 CLI Profile System
File: `src/renderer/utils/cliProfiles.ts`
- 5 profiles: claude, kilo, gemini, codex, devin.
- Detected via regex on PTY data stream.
- Changes cursor color, selection background, and pane badge color.
- **Theme is set once at xterm construction** — never changed dynamically (was causing grey screen corruption).

### 2.7 Sound System
File: `src/renderer/utils/sound.ts`
- Web Audio API synthesizer (no audio files).
- Two primitives: `noise()` (filtered white noise) and `ring()` (sine oscillator).
- Two volume tiers: app sounds (lower) and landing sounds (~2x higher).
- Landing sounds: `playLandingClick`, `playLandingHover`, `playLandingSwitch`, `playLandingCreate`, `playLandingDelete`.
- App sounds: `playClick`, `playHover`, `playSwitch`, `playCreate`, `playDelete`, `playLayoutChange`, `playWindowClose`.
- AudioContext created lazily on first use, auto-resumes if suspended.
- No sound effects on minimize/maximize buttons.

### 2.8 Background Animation
File: `src/renderer/components/BackgroundCanvas.tsx`
- 65 particles with hsla() fill (no per-particle gradients).
- Cached ambient glow gradient (created on resize, not per-frame).
- Full 60fps, no blur filter, no connection lines.
- Cool-neutral color range (hue 190–250, saturation 35%, lightness 76%).
- Mouse-responsive drift and organic sine-wave motion.
- Only renders on landing screen (`view === 'landing'`).

### 2.9 Sidebar Animation
File: `src/renderer/components/SidebarCanvas.tsx`
- 12 tiny particles drifting slowly (warm gold, very low alpha).
- Subtle — not distracting, just ambient.
- Positioned behind sidebar content.

---

## 3. Component Tree

```
App
├── BackgroundCanvas (landing only)
├── ErrorBoundary
├── TitleBar (always)
└── View Router
    ├── view=landing → LandingScreen
    │   ├── Hero title + subtitle
    │   ├── Workspace list (sorted by lastOpened)
    │   └── Create form (name + directory picker)
    └── view=workspace → Sidebar + TerminalGrid
        ├── Sidebar
        │   ├── SidebarCanvas
        │   ├── Back button → playLandingClick
        │   ├── Workspace list (thick items, gold active state)
        │   └── Create workspace form
        └── TerminalGrid
            ├── Workspace grid containers (all mounted, display: grid/none)
            │   └── TerminalPane (per pane)
            │       ├── PaneHeader (badge, name, close/add buttons)
            │       ├── TerminalInstance (xterm + PTY)
            │       └── PaneFooter (CWD + status/exit code)
            └── LayoutSwitcher (floating pill bottom-right)
```

---

## 4. State Management

### 4.1 Workspace Store (`src/renderer/store/workspaceStore.ts`)
```
view: 'landing' | 'workspace'
workspaces: Workspace[]
activeWorkspaceId: string | null
activePaneId: string | null
```
- **createWorkspace(name, cwd?)**: Creates workspace with 4 panes, shuffles NICKNAMES and COLORS.
- **deleteWorkspace(id)**: Destroys all PTYs, removes workspace. Navigates to landing if empty.
- **selectWorkspace(id)**: Switches active workspace. Panes are always-mounted so no xterm recreation.
- **setLayout(layout)**: Changes grid preset. Keeps existing panes, adds/removes as needed.
- **closePane(paneId)**: Removes pane from array. PTY destruction handled in TerminalPane.
- **goBackToLanding()**: Returns to landing screen.

### 4.2 Terminal Store (`src/renderer/store/terminalStore.ts`)
Tracks registered terminals by pane ID.

---

## 5. Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+Shift+N | New terminal pane |
| Ctrl+Shift+W | Close workspace |
| Ctrl+B | Toggle sidebar |
| Ctrl+K | Open keyboard shortcuts |
| Ctrl+D | Close active pane |
| Alt+1-9 | Switch to pane N |

---

## 6. Styling Conventions

### 6.1 CSS File Structure
- `src/renderer/styles/panel.css` — Pane, grid, terminal, and footer styles.
- `src/renderer/styles/animations.css` — All animations (entrance, exit, fade, slide).
- `src/renderer/styles/index.css` — Global styles, CSS variables, font imports.
- Styles use CSS variables defined in index.css.

### 6.2 CSS Variables
```css
--bg: #0c0c12
--panel: rgba(14, 14, 20, 0.85)
--text: #e0e0e8
--muted: #888
--dim: #555
--accent: #d4a373
--accent-dim: rgba(212, 163, 115, 0.25)
--accent-glow: rgba(212, 163, 115, 0.06)
--error: #e3567c
--success: #4cc2a0
--font-sans: 'Inter', system-ui, -apple-system, sans-serif
--font-mono: 'JetBrains Mono', Consolas, 'Courier New', monospace
--title-bar-height: 36px (win) / 40px (mac)
--pane-gap: 3px
```

### 6.3 Inline Styles vs CSS
- Component-specific styles use inline styles (no CSS module system).
- Global/reusable styles use CSS classes in the CSS files.
- Animations use CSS keyframes from animations.css.

---

## 7. The xterm.js Canvas Renderer & Grey Screen

### 7.1 Root Cause
The grey screen corruption happens when the xterm canvas renderer receives PTY data while the canvas is mid-resize. Writing glyphs to a partially-sized canvas corrupts the renderer's texture atlas.

### 7.2 Solution (Implemented)
1. **All workspace panes are always-mounted** — TerminalGrid renders all workspaces simultaneously, only the active workspace is visible (`display: grid` vs `display: none`). xterm instances are NEVER disposed on workspace switch.
2. **No CSS transitions on grid** — grid-template-columns/rows transitions were removed (caused intermediate resize states).
3. **Theme set once at construction** — `applyProfile` is called once on initial data, never on reconnection.

### 7.3 What NOT to Do
- Do NOT add `forceRepaint()` with double-RAF + `clearTextureAtlas()` + `refresh()` — causes flashing.
- Do NOT modify `term.options.theme` dynamically after construction — triggers full re-render.
- Do NOT buffer data then flush all at once — can make corruption worse.
- Do NOT use xterm WebGL addon — crashes on layout switch.

---

## 8. The PowerShell Prompt

File: `src/main/pty.ts`
```powershell
function prompt {"[$((Get-Location).Path.Replace($HOME,'~').Replace('\','/'))] ❯ "}
```
Shows: `[~/projects/frontend] ❯ ` or `[C:/Users/dodsa] ❯ `.

---

## 9. CWD Tracking

- CWD is stored per PTY session in `sessionCwds` Map in the main process.
- Set at PTY creation time, returned on `pty:cwd {id}` IPC call.
- `getCwd()` in preload now accepts terminal ID.
- Footer displays the initial CWD; PS prompt shows live directory.

---

## 10. Key Files Reference

| File | Purpose |
|------|---------|
| `src/main/index.ts` | Electron main entry, window creation |
| `src/main/pty.ts` | PTY session management, IPC handlers |
| `src/preload/index.ts` | Context bridge API |
| `src/renderer/main/index.ts` | React entry, window blur/focus |
| `src/renderer/App.tsx` | Root component, view routing |
| `src/renderer/components/TitleBar.tsx` | Frameless title bar (macOS/Windows) |
| `src/renderer/components/LandingScreen.tsx` | Welcome screen |
| `src/renderer/components/BackgroundCanvas.tsx` | Landing particle animation |
| `src/renderer/components/Sidebar.tsx` | Workspace sidebar |
| `src/renderer/components/SidebarCanvas.tsx` | Sidebar particle animation |
| `src/renderer/components/TerminalGrid.tsx` | Workspace grid with always-mounted panes |
| `src/renderer/components/TerminalPane.tsx` | Pane wrapper (header + body + footer) |
| `src/renderer/components/TerminalInstance.tsx` | xterm.js + PTY bridge |
| `src/renderer/components/PaneHeader.tsx` | Terminal header (badge, name, controls) |
| `src/renderer/components/PaneFooter.tsx` | Terminal footer (CWD, status) |
| `src/renderer/components/LayoutSwitcher.tsx` | Layout preset selector |
| `src/renderer/components/icons.tsx` | All SVG icons |
| `src/renderer/store/workspaceStore.ts` | Workspace state |
| `src/renderer/utils/premiumRenderer.ts` | Font metrics, adaptive typography |
| `src/renderer/utils/cliProfiles.ts` | CLI profile detection |
| `src/renderer/utils/sound.ts` | Web Audio API sound system |
| `src/renderer/styles/panel.css` | Pane/grid/footer CSS |
| `src/renderer/styles/animations.css` | All CSS animations |
| `website/index.html` | Landing page (GitHub Pages) |
| `website/logo.svg` | App logo |

---

## 11. Build & Deploy

### 11.1 Development
```bash
npm run dev          # Start electron-vite dev server
npm run build        # TypeScript check + production build
npm run typecheck    # TypeScript check only
```

### 11.2 Packaging (requires electron-forge config)
```bash
npm run make         # Build + package with electron-forge
```
Currently NOT configured with makers. To add Windows .exe support:
```json
// In package.json, add forge config:
"config": {
  "forge": {
    "packagerConfig": {},
    "makers": [
      { "name": "@electron-forge/maker-squirrel" },
      { "name": "@electron-forge/maker-zip" },
      { "name": "@electron-forge/maker-deb" }
    ]
  }
}
```

### 11.3 Website Deployment
- website/ directory is auto-deployed to GitHub Pages via `.github/workflows/deploy.yml`.
- To enable: GitHub repo → Settings → Pages → Source: GitHub Actions.
- Site URL: `https://dodo1653.github.io/dzzspace/`

---

## 12. Git History

```
8dada5b Add GitHub Pages deployment workflow
4cade83 Add website, logo, README; fix back button sound, bump landing volumes
adae2fe Fix back button sound, bump landing volumes above app
256b252 dzzspace v0.9
0949588 Fix grey screen: always-mounted panes, remove CSS grid transition
ee5ad6e dzzspace v0.9
235ccc8 Fix PTY persistence, sidebar delete, repaint fixes, perf optimization
451766f Strip over-engineering: remove cursor/ASCII art overlays
bbe1f1f Density overhaul: lineHeight 1.12, tighter metrics
dc0316b CLI profiles: static cursor glow + 5 profiles
16d1ead ASCII art presentation overlay
ca827d9 Premium rendering: adaptive typography, canvas metrics
37edde9 Custom premium terminal renderer, WWWWWW leak fix
1ca8142 Custom PowerShell prompt (❯)
7c2b3a8 Fix letter spacing back to 0
55516f2 Premium terminal typography
aa4b3b5 Fix typing position (remove xterm padding)
727060c Fix blank screen: remove WebGL, add ErrorBoundary
bf4d1a6 Fix layout crash: guard resize, destroy PTY
555f1e6 Random nicknames, per-pane colors, badges
ec0f475 Natural particle system
77fee21 Bigger hero text, 200 particles
79a9dd1 Premium warm-gold palette, interactive canvas
e1ef67e Premium terminal redesign, ANSI palette
44915fb Fix sidebar toggle animation
a8bf52f Premium UI overhaul: hero, sidebar, sounds, persistence
386593d Initial scaffold
```

---

## 13. Common Issues & Fixes

### Grey screen in terminals
**Cause**: xterm canvas renderer corrupted by data arriving during canvas resize.
**Fix**: All panes always-mounted. No grid CSS transitions. Theme set once at construction. No dynamic theme changes.

### PTY not found on reconnect
**Cause**: PTY was killed but terminalId still stored in state.
**Fix**: `pty:exists` check before reconnecting. If not found, create new PTY.

### Terminal blank white screen
**Cause**: WebGL addon enabled. xterm@5.3.0 WebGL renderer crashes on layout change.
**Fix**: Never use WebGL addon. Canvas renderer only.

### Typing offset (pressing keys shows wrong character)
**Cause**: CSS padding on .xterm element.
**Fix**: Never add padding to xterm container. Let xterm handle its own sizing.

### Layout switch causes terminal corruption
**Cause**: CSS transition on grid-template-columns/rows.
**Fix**: Remove grid transitions. Layout changes must be instant.

### Sound not playing
**Cause**: AudioContext suspended (browser autoplay policy).
**Fix**: `ctx.resume()` called on every sound. No special handling needed — just call play functions.

---

## 14. Future Considerations

- **Electron Forge makers**: Add squirrel/zip/deb makers for distributable builds.
- **App icon**: Need PNG/ICO files for packaging. Use the SVG logo from website/logo.svg as source.
- **Settings persistence**: Store workspace layout, sidebar state, volume preferences.
- **CLI CWD tracking**: Could parse PS prompt output for real-time CWD updates.
- **Auto-update**: Add electron-updater for automatic updates.
- **Tests**: No test framework configured. Would need Jest + React Testing Library.
