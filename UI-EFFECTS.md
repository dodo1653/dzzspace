# dzzspace — UI Effects & Animation Architecture

A comprehensive guide to the premium UI effects, animation techniques, and aesthetic system used in dzzspace. Designed to be replicated, remixed, or improved upon in any project.

---

## Table of Contents

1. [Landing Screen Shimmer Title](#1-landing-screen-shimmer-title)
2. [Title Bar & Brand System](#2-title-bar--brand-system)
3. [Terminal Grid Architecture](#3-terminal-grid-architecture)
4. [Premium Terminal Rendering](#4-premium-terminal-rendering)
5. [Animated Background Canvas](#5-animated-background-canvas)
6. [Web Audio API Sound System](#6-web-audio-api-sound-system)
7. [SVG Icon System](#7-svg-icon-system)
8. [Accent Color & Theme System](#8-accent-color--theme-system)
9. [Sidebar Animation System](#9-sidebar-animation-system)
10. [Layout Switcher](#10-layout-switcher)
11. [Keyboard Shortcut System](#11-keyboard-shortcut-system)
12. [CLI Profile System](#12-cli-profile-system)
13. [PTY Persistence & Lifecycle](#13-pty-persistence--lifecycle)
14. [Browser-Based Paste Handling](#14-browser-based-paste-handling)
15. [App-Level Ambient Glow](#15-app-level-ambient-glow)
16. [Key CSS Techniques](#16-key-css-techniques)
17. [Performance Considerations](#17-performance-considerations)

---

## 1. Landing Screen Shimmer Title

The hero heading "dzzspace" uses a gold gradient with an infinite shimmer animation. This creates a premium, dynamic title that feels alive without being distracting.

### CSS Technique

```css
.hero h1 span {
  background: linear-gradient(
    135deg,
    #f0e6d0 0%,      /* light cream - highlight */
    #d4a373 45%,     /* warm gold - base */
    #c8955a 70%,     /* deeper gold */
    #b88a5a 100%     /* bronze shadow */
  );
  background-size: 200% auto;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 4s ease-in-out infinite;
}

@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}
```

### Key Details

- **`background-clip: text`** — clips the gradient to the text glyphs only
- **`-webkit-text-fill-color: transparent`** — makes the text transparent so the gradient shows through
- **`background-size: 200% auto`** — doubles the gradient width so the animation has room to slide
- **`background-position` animation** — slides the gradient across the text, creating the shimmer sweep
- **4s ease-in-out** — slow enough to be elegant, fast enough to catch the eye
- **Gradient stops** — the 4-color blend creates depth: light highlight → warm base → deeper shadow

### Font Choice

```css
font-family: 'Press Start 2P', monospace;
font-size: 56px;
letter-spacing: 4px;
line-height: 1.1;
```

- `Press Start 2P` is a pixel/retro font that contrasts beautifully with the smooth gradient — the rigid pixels against the flowing gold creates visual tension
- Generous letter-spacing (4px) gives the blocky font room to breathe
- Large size (56px) makes the shimmer highly visible

### Replicating in Other Projects

```css
/* The universal shimmer pattern */
.shimmer-text {
  background: linear-gradient(
    135deg,
    #your-light 0%,
    #your-base 45%,
    #your-deep 70%,
    #your-shadow 100%
  );
  background-size: 200% auto;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 4s ease-in-out infinite;
}

@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}
```

| Property | Purpose | Tuning Range |
|---|---|---|
| `background-size` | Width of gradient canvas | `200%` (standard) to `300%` (slower sweep) |
| Animation duration | Speed of sweep | `3s` (energetic) to `6s (calm) |
| `ease-in-out` | Smooth deceleration at edges | Try `ease` for constant speed |
| Gradient stops | Depth and richness | 3–5 stops; lighter → base → darker |

---

## 2. Title Bar & Brand System

The title bar is a custom frameless 44px header with macOS traffic lights, Windows native controls, and a pixel-grid overlay.

### Structure

```
┌─────────────────────────────────────────────────┐
│ [● ● ●] │ dzzspace │ [☰] │  │ [_] [□] [✕] │
│  traffic lights  brand    sidebar    win ctrls  │
├─────────────────────────────────────────────────┤
│              ↓ 1px gold border-bottom           │
```

### CSS

```css
.title-bar {
  height: 44px;                    /* fixed height */
  background: #08080c;             /* matches body bg */
  border-bottom: 1px solid rgba(212,163,115,0.06);
  box-shadow: 0 1px 0 rgba(255,255,255,0.02);
  -webkit-app-region: drag;        /* enables window dragging */
  z-index: 100;
}
```

### Pixel-Grid Overlay

```css
.title-bar::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle, rgba(255,255,255,0.015) 1px, transparent 1px);
  background-size: 3px 3px;        /* 3px grid spacing */
  pointer-events: none;
  z-index: -1;
}
```

### Brand Text

```css
.title-bar-app-name {
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  background: linear-gradient(135deg, #f0e6d0, #d4a373 45%, #c8955a 70%, #b88a5a);
  background-size: 200% auto;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 4s ease-in-out infinite;
  letter-spacing: 1.5px;
  text-transform: lowercase;
}
```

Same shimmer technique as the landing screen, scaled down to 10px for the title bar.

---

## 3. Terminal Grid Architecture

### Layout System

The grid uses CSS Grid with named template areas for each layout preset:

```typescript
const LAYOUTS = {
  '1':  { grid: { cols: 1, rows: 1 } },
  '2V': { grid: { cols: 2, rows: 1 } },
  '4':  { grid: { cols: 2, rows: 2 } },
  '6':  { grid: { cols: 3, rows: 2 } },
  '9':  { grid: { cols: 3, rows: 3 } },
};
```

```css
.terminal-grid {
  display: grid;
  gap: 0;
  width: 100%;
  height: 100%;
  grid-template-columns: repeat(var(--grid-cols), 1fr);
  grid-template-rows: repeat(var(--grid-rows), 1fr);
}
```

### Always-Mounted Pattern

**Critical pattern**: All panes are always rendered in the DOM, regardless of layout or active workspace. This prevents the grey screen corruption that occurs when xterm instances are destroyed and recreated.

```tsx
// All 9 panes always rendered
{Array.from({ length: 9 }).map((_, i) => (
  <div key={i} style={{ display: layoutIndex < i ? 'none' : 'flex' }}>
    <TerminalPane index={i} />
  </div>
))}
```

### Workspace Toggle (Landing → App)

```tsx
// TerminalGrid is always mounted
// Toggle between landing screen and workspace
<div style={{ display: showLanding ? 'none' : 'flex' }}>
  <TerminalGrid />
</div>
```

### Font Size Consistency

All terminals in a workspace share the same font size. A shared cache (`sharedFontSize`) is updated by the active terminal's `PremiumRenderer`. Inactive or 0-height containers skip updates:

```typescript
function calculateOptimalSize(containerHeight: number, dpr: number): number {
  if (containerHeight <= 0) {
    return sharedFontSize || FALLBACK_SIZE;  // skip if zero
  }
  // ... calculate based on container height, DPR, zoom ...
}
```

---

## 4. Premium Terminal Rendering

### Glyph-Aware Canvas Rendering

The `PremiumRenderer` uses an offscreen canvas to measure actual glyph metrics, then selects the optimal font size from 5 adaptive tiers:

```typescript
const TIERS = [10, 11, 12, 13, 14, 15, 16, 18, 20, 22, 24];
```

### Measurement Process

1. Create a 200×50 offscreen canvas
2. Render the string `WWWW` (widest characters) at each tier size
3. Measure actual rendered width via `measureText()`
4. Select the largest tier that fits within the container width
5. Cache the result in `sharedFontSize`

### xterm.js Configuration

```typescript
const terminal = new Terminal({
  fontFamily: '"JetBrains Mono", monospace',
  fontSize: calculatedSize,
  fontWeight: 400,
  letterSpacing: 0,            // CRITICAL: never change this
  lineHeight: 1.12,           // sweet spot for dense terminal feel
  rendererType: 'canvas',     // DOM renderer is too slow
  cursorBlink: true,
  cursorStyle: 'bar',
});
```

### Critical Rules

- **`letterSpacing: 0`** — non-zero breaks monospace character alignment; glyphs will not line up in columns
- **`fontWeight: 400`** — 300 is too thin for box-drawing and ASCII art characters at small sizes
- **`lineHeight: 1.12`** — balances density with readability; Ghostty-like feel
- **Never modify PTY output** — all rendering is client-side typography/metrics/DPI

### FitAddon Guard

All `fit()` calls must be guarded against 0-dimension containers:

```typescript
if (cols <= 0 || rows <= 0) return;
fitAddon.fit();
```

---

## 5. Animated Background Canvas

The landing screen uses a canvas-based particle/starfield animation.

### Implementation

```tsx
const canvasRef = useRef<HTMLCanvasElement>(null);

useEffect(() => {
  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');
  // ... create particles, animate loop ...
  const animate = () => {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.update();
      p.draw(ctx);
    });
    requestAnimationFrame(animate);
  };
  animate();
}, []);
```

### Loading State

The canvas only renders on the landing screen (not on the workspace). A `showLanding` boolean in the zustand store controls this:

```tsx
{showLanding && <AnimatedBackground />}
```

---

## 6. Web Audio API Sound System

### Architecture

```typescript
// src/renderer/utils/sound.ts
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

export function playClick() {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.frequency.value = 800;
  oscillator.type = 'sine';
  gainNode.gain.value = 0.1;    // app sounds at ~2.5-3x original volume
  oscillator.start();
  oscillator.stop(0.05);        // 50ms click
}
```

### Sound Mapping

| Sound | Trigger | Frequency | Duration |
|---|---|---|---|
| `playClick` | Sidebar toggle, button clicks | 800 Hz | 50ms |
| `playWindowClose` | Close window | 400→200 Hz sweep | 150ms |
| `playLandingEnter` | Enter app from landing | ~2x above app volume | 100ms |

### Volume Balancing

- App sounds: ~2.5–3x the original raw oscillator volume
- Landing sounds: ~2x above app sounds
- All sounds are short (50–150ms) to feel like premium UI clicks, not musical tones

---

## 7. SVG Icon System

### Design Rules

- Zero emojis — all icons are custom SVG
- Thin stroke width (1–1.5px)
- Square stroke-linecap
- 20×20 or 16×16 viewBox
- Single color (currentColor or #d4a373)

### Example: IconSidebar

```tsx
export const IconSidebar = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
    <rect x="2" y="2" width="16" height="16" rx="0" />
    <path d="M9 2v16" />
  </svg>
);
```

### Icon Set

| Icon | Usage |
|---|---|
| `IconSidebar` | Sidebar toggle |
| `IconRefresh` | Terminal refresh (circular arrow) |
| `IconClose` | Close pane |
| `IconAdd` | Add terminal |
| `IconLayout` | Layout switcher |
| `IconWorkspace` | Workspace management |

---

## 8. Accent Color & Theme System

### Color Palette

```css
:root {
  --gold:        #d4a373;    /* primary accent */
  --gold-light:  #f0e6d0;    /* shimmer highlight */
  --gold-deep:   #b88a5a;    /* shimmer shadow */
  --bg:          #08080c;    /* main background */
  --bg-panel:    #0a0a0f;    /* terminal/panel background */
  --text:        #e8e8ef;    /* primary text */
  --muted:       #888;       /* secondary text */
  --dim:         #555;       /* tertiary / de-emphasized */
  --border:      rgba(255,255,255,0.02); /* subtle borders */
}
```

### Application

- Gold is used sparingly — borders, active states, shimmer, and hover effects
- Most UI is dark-on-dark (`#08080c` background with `#0a0a0f` panels)
- Gold only appears where it needs to draw attention
- This creates a "premium" feel through restraint rather than saturation

---

## 9. Sidebar Animation System

### Structure

```css
.sidebar {
  width: 280px;
  height: 100%;
  background: #08080c;
  border-right: 1px solid rgba(255,255,255,0.02);
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
```

### Toggle

```tsx
<div className="sidebar" style={{
  transform: sidebarVisible ? 'translateX(0)' : 'translateX(-100%)',
  position: 'fixed',
  left: 0,
  top: 44px,      /* below title bar */
  bottom: 0,
  zIndex: 50,
}}>
```

### Active State

```css
.sidebar-item.active {
  background: linear-gradient(
    90deg,
    rgba(212,163,115,0.08) 0%,
    transparent 100%
  );
  border-left: 2px solid #d4a373;
}
```

### Key Decision

No background animation on the sidebar — the user explicitly rejected this. The sidebar is a utility panel, not a decorative element.

---

## 10. Layout Switcher

A floating pill button in the bottom-right corner that cycles through layout presets.

```css
.layout-switcher {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 50;
  display: flex;
  gap: 4px;
  padding: 6px;
  background: rgba(8,8,12,0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.03);
  border-radius: 6px;
}
```

Each layout button shows a mini-grid preview:

```tsx
<button onClick={() => setLayout('4')}>
  <svg viewBox="0 0 24 24">
    <rect x="2" y="2" width="9" height="9" />
    <rect x="13" y="2" width="9" height="9" />
    <rect x="2" y="13" width="9" height="9" />
    <rect x="13" y="13" width="9" height="9" />
  </svg>
</button>
```

---

## 11. Keyboard Shortcut System

### Implementation (Zustand + useEffect)

```tsx
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'N') {
      addTerminal();
    }
    if (e.altKey && e.key >= '1' && e.key <= '9') {
      focusPane(parseInt(e.key) - 1);
    }
    if (e.ctrlKey && e.key === 'b') {
      toggleSidebar();
    }
    if (e.ctrlKey && e.key === 'k') {
      clearTerminal();
    }
    if (e.ctrlKey && e.key === 'd') {
      closePane();
    }
  };
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}, []);
```

### Shortcut Table

| Shortcut | Action |
|---|---|
| `Ctrl+Shift+N` | New terminal |
| `Ctrl+Shift+W` | Close workspace |
| `Alt+1` through `Alt+9` | Focus pane 1–9 |
| `Ctrl+B` | Toggle sidebar |
| `Ctrl+K` | Clear terminal |
| `Ctrl+D` | Close pane |

---

## 12. CLI Profile System

```typescript
// src/renderer/utils/cliProfiles.ts
export const PROFILES = [
  { name: 'PowerShell', label: 'PS', color: '#4cc2a0' },
  { name: 'Git Bash',   label: 'GB', color: '#e3567c' },
  { name: 'WSL',        label: 'WS', color: '#d4a373' },
  { name: 'CMD',        label: 'CM', color: '#888' },
  { name: 'Python',     label: 'PY', color: '#60a5fa' },
];
```

Each profile is shown as a badge indicator on the pane header. Profile detection is done via CWD/path heuristics.

---

## 13. PTY Persistence & Lifecycle

### Lifecycle Rules

1. **Creation**: PTY created in `TerminalInstance` when no existing `terminalId` matches
2. **Reconnection**: On remount, if `terminal.exists`, reconnect without creating a new PTY
3. **Destruction**: Only on `handleClose`, `handleDelete`, or refresh button — never on workspace switch or landing navigation
4. **Refresh**: Destroys PTY + forces React key remount

### CWD Tracking

```typescript
// Map<terminalId, string>
const sessionCwds = new Map();

// PowerShell prompt (no brackets)
function prompt {
  "$((Get-Location).Path.Replace($HOME,'~').Replace('\\','/')) ❯ "
}
```

### Workspace Switch

```typescript
// TerminalGrid always-mounted; just toggle display
setShowLanding(false);  // or true
// No PTY destruction occurs
```

---

## 14. Browser-Based Paste Handling

Paste (Ctrl+V / Cmd+V) must work in all terminal apps including kilo, claude, vim, etc.

```typescript
// In TerminalInstance
terminal.attachCustomKeyEventHandler((e) => {
  if (e.type === 'keydown' && (e.ctrlKey || e.metaKey) && e.key === 'v') {
    return false;  // let the browser handle it
  }
  return true;
});
```

Returning `false` for paste events allows the browser's native paste handling to trigger `navigator.clipboard.readText()` and write the text via `terminal.write()`.

---

## 15. App-Level Ambient Glow

Instead of per-pane glows (which cause visual noise), a single app-level gold glow overlay provides atmosphere:

```tsx
<div className="app-workspace-glow" />
```

```css
.app-workspace-glow {
  position: fixed;
  inset: 0;
  background: radial-gradient(
    ellipse at 50% 0%,
    rgba(212,163,115,0.015) 0%,
    transparent 60%
  );
  pointer-events: none;
  z-index: 10;
}
```

Combined with a fixed gold border:

```css
.app-level-border {
  position: fixed;
  inset: 3px;
  border: 1px solid rgba(212,163,115,0.04);
  pointer-events: none;
  z-index: 9998;
}
```

---

## 16. Key CSS Techniques

### Technique 1: scanlines overlay

```css
.scanlines {
  position: fixed;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0,0,0,0.03) 2px,
    rgba(0,0,0,0.03) 4px
  );
  pointer-events: none;
  z-index: 9999;
}
```

Creates a subtle CRT monitor effect. Nearly imperceptible at normal viewing distance but adds texture.

### Technique 2: grid background mask

```css
.hero-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.006) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.006) 1px, transparent 1px);
  background-size: 64px 64px;
  mask-image: radial-gradient(ellipse at 50% 40%, black 25%, transparent 70%);
  pointer-events: none;
}
```

### Technique 3: breathe/pulse glow

```css
@keyframes breathe {
  0%, 100% {
    box-shadow:
      0 24px 64px rgba(0,0,0,0.5),
      0 0 0 1px rgba(212,163,115,0.04),
      0 0 40px rgba(212,163,115,0.04),
      0 0 0 0 rgba(212,163,115,0);
  }
  50% {
    box-shadow:
      0 28px 72px rgba(0,0,0,0.55),
      0 0 0 1px rgba(212,163,115,0.08),
      0 0 60px rgba(212,163,115,0.06),
      0 0 120px 20px rgba(212,163,115,0.04);
  }
}
```

### Technique 4: frosted glass overlay (backdrop-filter)

```css
.glass-panel {
  background: rgba(8,8,14,0.5);
  backdrop-filter: blur(20px) saturate(1.3);
  -webkit-backdrop-filter: blur(20px) saturate(1.3);
  border: 1px solid rgba(255,255,255,0.02);
}
```

### Technique 5: corner accent on hover

```css
.card::after {
  content: '';
  position: absolute;
  top: -1px;
  right: -1px;
  width: 0;
  height: 0;
  border-top: 2px solid rgba(212,163,115,0);
  border-right: 2px solid rgba(212,163,115,0);
  transition: width 0.5s, height 0.5s, border-color 0.5s;
}
.card:hover::after {
  width: 20px;
  height: 20px;
  border-top-color: rgba(212,163,115,0.15);
  border-right-color: rgba(212,163,115,0.15);
}
```

### Technique 6: cinematic film gradient on images

```css
.image-frame::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(212,163,115,0.04) 0%,    /* warm gold top */
    transparent 30%,               /* clear center */
    rgba(0,0,0,0.15) 85%,         /* vignette start */
    rgba(0,0,0,0.3) 100%          /* vignette end */
  );
  pointer-events: none;
  z-index: 2;
}
```

### Technique 7: image hover zoom

```css
.showcase-frame img {
  transition: transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.showcase-frame:hover img {
  transform: scale(1.012);
}
```

The `cubic-bezier(0.16, 1, 0.3, 1)` creates an "overshoot" feel — fast start, slow finish.

---

## 17. Performance Considerations

### What Was Removed

- **framer-motion** — removed entirely; CSS transitions are faster and produce smaller bundles
- **xterm-addon-webgl** — removed; canvas renderer is stable, WebGL crashes on layout switch
- **DOM renderer** — never used; xterm canvas renderer only

### Bundle Size

| Asset | Size |
|---|---|
| Renderer JS | 713 KB (Vite-bundled, includes React + xterm + zustand) |
| Renderer CSS | 15 KB |
| Asar | 3.1 MB |
| Installer (NSIS) | 75 MB |

### Build Optimization

```json
{
  "files": [
    "out/**",
    "package.json",
    "node_modules/**",
    "!node_modules/**/*.map",
    "!node_modules/**/*.md",
    "!node_modules/**/CHANGELOG*",
    "!node_modules/**/test/**",
    "!node_modules/**/docs/**",
    "!node_modules/**/.github/**"
  ]
}
```

- Renderer dependencies (react, xterm, zustand) in `devDependencies` — Vite bundles them at build time
- Main process dependencies (@lydell/node-pty, electron-updater) in `dependencies` — included in asar
- `asarUnpack` configured for node-pty native bindings

### Grey Screen Prevention

The most critical performance/rendering fix: always-mount all terminal panes and guard all `fit()` calls:

```typescript
// Guard against 0-dimension containers
if (element.offsetWidth <= 0 || element.offsetHeight <= 0) return;
fitAddon.fit();
```

---

## Summary: The dzzspace Aesthetic Philosophy

1. **Dark foundation** — `#08080c` background, never pure black, never pure white
2. **Gold as accent only** — `#d4a373` used sparingly for active states, shimmer, borders
3. **No emojis** — custom SVG icons maintain a consistent, premium visual language
4. **No AI slop** — intentional design choices, no lazy glassmorphism, no gradient blobs
5. **Typography hierarchy** — Press Start 2P for brand/headings, JetBrains Mono for terminals, Inter for UI
6. **Animation restraint** — shimmer, breathe, and float are slow (4–6s cycles) and subtle
7. **Hardware acceleration** — all animations use `transform` and `opacity` only
8. **Consistent spacing** — 44px title bar, 280px sidebar, 24px padding units
9. **Zero letter-spacing on terminal** — monospace alignment is sacred
10. **Performance > effects** — CSS transitions > JS animations, canvas > DOM, no WebGL
