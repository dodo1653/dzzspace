# dzzspace v1

> A premium multi-terminal desktop workspace — grid-based PowerShell terminals with ultra-aesthetic UI. Built for builders who demand both function and beauty.

---

## Vision

dzzspace is a **terminal workspace** — not an IDE, not a terminal emulator, but a **room** where multiple PowerShell sessions live side by side in a resizable grid. Every pixel is intentional. Every animation serves purpose. The app should feel so good to open that users look for reasons to launch it.

Inspired by: BridgeSpace (multi-pane terminal grid), Warp (command blocks), macOS (typography & spacing), Codex (premium dark minimalism), and Minecraft (blocky, textured, chunky feel).

---

## Design Philosophy

### Core Principles

| # | Principle | Meaning |
|---|-----------|---------|
| 1 | **Intentional Every Pixel** | Nothing is default. Every color, border, shadow, and space is hand-tuned. |
| 2 | **Silent UI** | Chrome disappears when not needed. The terminal output is the star. |
| 3 | **Depth Through Layers** | Three visual layers: background → panel → content. Never flat. Never cluttered. |
| 4 | **Blocky + Premium** | Squared corners (max 2px), chunky borders (1-2px), but with refined typography and spacing. |
| 5 | **Textured, Not Flat** | Backgrounds have subtle grid wireframes, scanlines, or noise. Nothing is a solid color. |
| 6 | **Functional Animation** | Every animation serves a purpose: layout transitions, pane open/close, focus changes. No decoration-only motion. |
| 7 | **Keyboard-First** | Every action has a shortcut. The mouse is optional. |

### Anti-AI-Slop Rules (HARD RULES)

```
🚫 NO emojis anywhere — SVG icons only
🚫 NO gradient blobs or generic "vibe" backgrounds
🚫 NO lazy glassmorphism — only on headers, with readable text
🚫 NO shadows on panes — use thin borders for depth
🚫 NO particle overload — max 12 particles, subtle motion
🚫 NO stock illustrations or generic icons
🚫 NO rounded corners on terminal areas (0px) — blocky feel
🚫 NO default fonts — custom stack only
🚫 NO oversaturated colors — muted, premium palette
🚫 NO lazy CSS — every selector intentional
✅ ONLY thin-stroke custom SVGs (1.5px)
✅ ONLY purposeful animation (springs, not linear)
✅ ONLY functional glass (headers, modals)
```

---

## Visual Design Spec

### Color System

```
Background (deep):    #0a0a0f    — Canvas base
Background (panel):   #12121a    — Panel/header fills
Border (subtle):      #1e1e2a    — Pane borders, dividers
Border (hover):       #2a2a3a    — Border on hover
Text (primary):       #e8e8ed    — Main terminal text
Text (secondary):     #6b6b7b    — Labels, metadata, footer
Text (dim):           #3a3a48    — Placeholder, idle state
Accent (amber):       #f59e0b    — Active pane glow, focus ring
Status (green):       #22c55e    — Running/healthy
Status (red):         #ef4444    — Error/crashed
Status (yellow):      #eab308    — Warning/busy
Glass (header):       rgba(18,18,26,0.85) — Pane header
Glass (modal):        rgba(10,10,15,0.92) — Landing modal
```

### Typography

| Role | Font | Size | Weight | Letter Spacing | Line Height |
|------|------|------|--------|---------------|-------------|
| Terminal output | `JetBrains Mono` | 13px | 400 | 0 | 1.5 |
| Shell name (header) | `JetBrains Mono` | 11px | 500 | 0.02em | 1 |
| UI labels | `Inter` / `SF Pro` | 11px | 500 | 0.04em | 1 |
| Landing title | `Inter` | 48px | 300 | -0.02em | 1.1 |
| Landing subtitle | `Inter` | 14px | 400 | 0.08em | 1.4 |

**Text spacing should feel BIG and UNIQUE.** Terminal text should breathe — generous line-height (1.5), comfortable padding inside panes. UI text is compact but well-letterspaced. The contrast between spacious terminal output and tight chrome is intentional.

### Spacing System

```
--space-1:   4px
--space-2:   8px
--space-3:   12px
--space-4:   16px
--space-5:   24px
--space-6:   32px
--space-8:   48px
--space-10:  64px
```

Panels: 16px padding inside panes. Grid gaps: 2px between panes. Header: 28px. Footer: 20px.

### Layout Dimensions

```
Title bar:        32px
Pane header:      28px
Pane footer:      20px
Grid divider:     2px (invisible until hover → 1px visible)
Sidebar (closed): 0px (collapsible)
Sidebar (open):   200px
Terminal padding: 12px 16px
```

---

## Architecture

### Tech Stack

```
Desktop shell:    Electron 33+
Bundler:          Vite 6 (via electron-vite)
Frontend:         React 18 + TypeScript 5
Terminal:         xterm.js 5 + xterm-addon-fit + xterm-addon-web-links
PTY:              node-pty (spawns powershell.exe per pane)
State:            Zustand (panes, layout, terminals)
Styling:          Tailwind CSS 3 + custom CSS modules
Animations:       CSS keyframes + framer-motion for mount/unmount
Canvas:           HTML5 Canvas (requestAnimationFrame) for background
```

### Process Architecture

```
┌─────────────────────────────────────────────────┐
│                Electron Main                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │  Window   │  │ PTY Pool │  │    IPC       │  │
│  │  Manager  │  │ (powershell │  │  Handlers    │  │
│  │           │  │  per pane) │  │              │  │
│  └──────────┘  └──────────┘  └──────────────┘  │
└────────────────────┬────────────────────────────┘
                     │ contextBridge (preload)
┌────────────────────▼────────────────────────────┐
│              Electron Renderer                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │  Landing │  │ Terminal │  │   Zustand    │  │
│  │  Screen  │──▶  Grid    │  │   Store      │  │
│  │          │  │          │  │              │  │
│  └──────────┘  └──────────┘  └──────────────┘  │
└─────────────────────────────────────────────────┘
```

### Data Flow

```
User types → xterm.js → IPC (stdin) → node-pty → PowerShell
PS output → node-pty → IPC (data) → xterm.js → renderer
Pane resize → Zustand → IPC (resize) → node-pty → PS
```

---

## Component Tree

```
<App>
  <BackgroundCanvas />           ← Full-window animated grid + particles
  <TitleBar />                   ← Custom 32px frameless bar
  <LandingScreen />             ← Workspace create/select modal
  │  └─ <WorkspaceCard />       ← Individual workspace entry
  │  └─ <CreateWorkspaceForm /> ← New workspace input
  │
  <MainLayout>                   ← Shown after workspace selected
    <Sidebar />                  ← Collapsible workspace rail
    <TerminalGrid>               ← CSS grid engine
    │  └─ <TerminalPane>        ← Each grid cell
    │      ├─ <PaneHeader>      ← 28px bar
    │      │   ├─ <ShellNameTag>← Editable inline name
    │      │   └─ <PaneControls>← SVG icon cluster
    │      ├─ <TerminalInstance>← xterm.js mount
    │      └─ <PaneFooter>      ← 20px status line
    └─ <LayoutSwitcher />       ← Floating preset buttons
    └─ <NewPaneButton />        ← Add pane (+)
  </MainLayout>
</App>
```

---

## UI Component Spec (Detailed)

### Landing Screen

The first thing users see. Must feel premium immediately.

- Full-window animated background (grid wireframe receding into depth + slow particles)
- Center modal: frosted glass (backdrop-blur 16px), rounded 8px, thin border `#1e1e2a`
- Title: "dzzspace" in large thin Inter (48px, weight 300, -0.02em tracking)
- Subtitle: "Select or create a workspace" in small spaced caps (11px, 0.08em tracking)
- Workspace list: horizontal rows with name, last opened, delete button
- "New Workspace" button: thin outline style (1px border, hover fills)
- Input for new name: dark input `#0a0a0f`, border `#1e1e2a`, focus accent amber
- Transition to main: pane slides up slowly (400ms ease-out), background stays
- No welcome messages, no onboarding steps. Just get in.

### Background Canvas

- Dark base `#0a0a0f`
- 3D-perspective grid wireframe drawn on Canvas (WebGL or 2D)
- Grid lines: `#1e1e2a` at 30px spacing, receding toward a vanishing point
- ~8-12 small particles (dots ~2px) drifting slowly upward, `#3a3a48`
- Uses requestAnimationFrame, stops when tab is hidden (performance)
- Subtle scanline overlay via CSS pseudo-element (opacity 0.02)

### Title Bar

- Frameless Electron window, custom 32px bar
- macOS style: red/yellow/green traffic light dots (SVG circles) — left aligned
- Windows native: minimize/maximize/close — right aligned
- Center: current workspace name, small 11px, `#6b6b7b`
- Draggable region: full bar except button areas
- Background: `rgba(10,10,15,0.85)` with backdrop-blur 12px

### Pane Header

- 28px tall, glass background `rgba(18,18,26,0.85)`
- Left: status dot (3px circle) + ShellNameTag (click-to-edit input)
- Center: empty (reserved for future tab/breadcrumb)
- Right: SVG icon cluster — focus (⤢), split (⊞), close (✕) — 14x14 each
- Icon hover: `#e8e8ed` fill, 150ms transition
- Border bottom: `#1e1e2a` 1px

### Shell Name Tag

- Click to enter edit mode
- Display: `JetBrains Mono` 11px weight 500, `#e8e8ed`
- Edit: same font, dark input, border `#f59e0b` on focus
- Max 24 chars, Enter to confirm, Escape to cancel
- Default names: "dev", "build", "server", "db", "tools", "logs", "test", "deploy", "monitor"

### Terminal Instance

- xterm.js mounted to a div, fills remaining pane space
- fitAddon handles resize
- webLinksAddon for clickable URLs
- Terminal theme matches app:
  - background: transparent (inherits pane bg `#12121a`)
  - foreground: `#e8e8ed`
  - cursor: `#f59e0b`
  - selection: `rgba(245,158,11,0.2)`
  - black: `#1e1e2a`
  - red: `#ef4444`
  - green: `#22c55e`
  - yellow: `#eab308`
  - blue: `#3b82f6`
  - magenta: `#a855f7`
  - cyan: `#22d3ee`
  - white: `#e8e8ed`

### Pane Footer

- 20px, transparent background (just sits below terminal)
- Left: current working directory (truncated), `11px`, `#6b6b7b`
- Right: exit code / status, `11px`, green if 0, red if non-zero
- Empty when pane first spawns

### Terminal Grid

- CSS grid: `grid-template-columns` and `grid-template-rows` set via Zustand
- Presets:
  - 1: `1fr` / `1fr`
  - 2V: `1fr 1fr` / `1fr`
  - 2H: `1fr` / `1fr 1fr`
  - 4: `1fr 1fr` / `1fr 1fr`
  - 6: `1fr 1fr 1fr` / `1fr 1fr`
  - 9: `1fr 1fr 1fr` / `1fr 1fr 1fr`
- Gap: 2px between panes (not divider — just gap)
- Divider on hover: 1px `#2a2a3a` with cursor: col-resize/row-resize
- New panes animate in (fade + scale 0.95→1, 200ms ease-out)
- Removing panes: remaining panes reflow (transition on grid-template, 300ms)

### Layout Switcher

- Floating pill at bottom-right of grid area
- Shows small preview dots for each preset (1, 2V, 2H, 4, 6, 9)
- Active preset highlighted with amber dot
- Hover: expand background, show labels
- Fixed position above footer

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+N` | New pane |
| `Ctrl+Shift+W` | Close active pane |
| `Ctrl+D` | Split active pane |
| `Alt+1` through `Alt+9` | Focus pane 1-9 |
| `Ctrl+B` | Toggle sidebar |
| `Ctrl+,` | Open settings (future) |
| `Ctrl+Tab` | Cycle pane focus |
| `Ctrl+\`` | Toggle layout switcher |
| `Enter` (on name) | Confirm rename |
| `Escape` (on name) | Cancel rename |

---

## Workspace System

- Each workspace is a named collection of pane configurations
- Stored in JSON at `%APPDATA%/dzzspace/workspaces.json`
- Each workspace records: name, pane count, pane names, grid preset
- On launch: landing screen shows workspace list with last-opened timestamp
- Default workspace "default" created on first launch

---

## Animation & Effects Philosophy

| Effect | Where | Implementation | Duration |
|--------|-------|----------------|----------|
| Pane entrance | New pane created | Fade in + scale 0.97→1 | 200ms ease-out |
| Pane exit | Pane closed | Scale 0.97 + fade out | 150ms ease-in |
| Grid reflow | Layout change | CSS transition on grid-template | 300ms ease-out |
| Content mount | Terminal spawning | Opacity 0→1 | 400ms ease-out |
| Icon hover | Pane controls | Fill color transition | 150ms ease |
| Background particles | Canvas | requestAnimationFrame drift | continuous |
| Landing → Main | Workspace selected | Slide up + fade | 400ms ease-out |
| Name edit focus | ShellNameTag | Border color transition | 150ms ease |
| Status dot change | PaneHeader | Background color transition | 300ms ease |

**All motion respects `prefers-reduced-motion`.** Under that setting, all durations become 0ms.

---

## Build & Development

### Prerequisites

- Node.js 20+
- npm 10+
- Windows 10+ (PowerShell backend)
- Visual Studio Build Tools (for node-pty native addon)

### Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev (Electron + Vite hot reload)
npm run build        # TypeScript check + production build
npm run make         # Package into distributable (electron-forge)
npm run lint         # ESLint check
npm run typecheck    # tsc --noEmit
```

### Project Scripts (package.json)

```json
{
  "dev": "electron-vite dev",
  "build": "tsc -b && electron-vite build",
  "make": "electron-vite build && electron-forge make",
  "preview": "electron-vite preview",
  "lint": "eslint src/",
  "typecheck": "tsc --noEmit"
}
```

---

## Anti-AI-Slop Audit Checklist

Before every commit, verify:

- [ ] No emoji characters in any source file
- [ ] No gradient backgrounds (only solid + texture)
- [ ] No box-shadows on panes (only borders)
- [ ] No font-weight 700 on UI labels (stick to 400/500)
- [ ] All icons are custom SVGs (14x14 viewBox, 1.5px stroke)
- [ ] Terminal font is JetBrains Mono (not monospace default)
- [ ] Terminal background is transparent (shows pane bg)
- [ ] No particle count exceeds 12
- [ ] Animations respect prefers-reduced-motion
- [ ] No rounded corners on terminal areas (max 2px on modals)
- [ ] Color palette matches spec (no invented colors)
- [ ] Glass effects have contrast-checked text underneath
- [ ] All text sizes follow the spacing/typography spec
- [ ] No stock "welcome" or onboarding language
- [ ] Keyboard shortcuts work for all primary actions

---

## Future (v2+)

- Multi-workspace tabs (like BridgeSpace)
- Theme system (25+ themes)
- Command blocks (Warp-style output grouping)
- Draggable pane reordering
- Session persistence (restore panes on relaunch)
- Terminal search (Ctrl+F)
- Settings panel
- Resizable sidebar panels (file tree, etc.)

---

*Built with Electron, React, TypeScript, and the belief that developer tools should be beautiful.*
