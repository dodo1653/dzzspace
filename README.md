# dzzspace

A premium multi-terminal desktop workspace for developers who live in the terminal. Grid-based PowerShell terminals with workspace management, pixel-perfect rendering, and an ultra-aesthetic native UI.

![Landing screen](website/showcase2.png)

## Download

**Windows 10 / 11** — Download the latest installer from the [Releases page](https://github.com/dodo1653/dzzspace/releases).

```
dzzspace.Setup.1.1.0.exe  (79 MB)
```

macOS and Linux builds coming soon.

## Features

- **Grid-based terminals** — CSS grid layouts with presets from 1 to 9 panes. Always-mounted architecture prevents canvas corruption on layout switch.
- **Workspace manager** — Group terminals by project. Switch between workspaces with one click — each keeps its own grid layout, panes, and running terminal sessions.
- **Premium terminal rendering** — Glyph-aware offscreen canvas metrics with 5 adaptive font size tiers. JetBrains Mono with zero letter-spacing, 1.12 line-height, canvas renderer.
- **Shimmer brand identity** — Press Start 2P typography with animated gold gradient shimmer on landing screen and title bar.
- **Per-pane profiles** — CLI-aware profile detection with unique colors and nicknames (PowerShell, Git Bash, WSL, CMD, Python).
- **Keyboard shortcuts** — Ctrl+Shift+N new terminal, Alt+1-9 focus panes, Ctrl+B toggle sidebar, Ctrl+K clear, Ctrl+D close pane.
- **Sound effects** — Premium UI clicks and feedback via Web Audio API.
- **Custom PowerShell prompt** — Minimal prompt with CWD tracking, no brackets.
- **PTY persistence** — Running processes survive workspace switches and landing navigation. Never destroyed on switch.
- **Custom frameless title bar** — 44px with macOS traffic lights and Windows native controls, pixel-grid dot overlay, gold border-bottom.
- **Layout presets** — 1, 2V, 4, 6, or 9 pane layouts via floating pill switcher.
- **Sidebar** — 280px workspace list with gold gradient active state and per-item delete.
- **Auto-update** — Built-in via electron-updater with GitHub releases.
- **Animated landing screen** — Canvas-based particle background, directory picker, shimmer hero title.

## Build from Source

### Prerequisites

- Node.js 18+
- npm 9+

### Setup

```bash
git clone https://github.com/dodo1653/dzzspace.git
cd dzzspace
npm install
```

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run dist
```

Output: `dist_electron/dzzspace Setup 1.1.0.exe`

## Tech Stack

- **Frontend**: React 18, TypeScript, Zustand, xterm.js 5.3.0
- **Backend**: Electron 31, @lydell/node-pty
- **Build**: electron-vite, Vite 5, electron-builder 26
- **Terminal**: xterm canvas renderer (FitAddon, WebLinksAddon)
- **Installer**: NSIS (one-click, choose directory, desktop/start menu shortcuts)
- **CI**: GitHub Actions (builds on release publish)

## UI Effects

See [UI-EFFECTS.md](UI-EFFECTS.md) for complete documentation of the shimmer animation system, aesthetic techniques, CSS architecture, and design philosophy.

## Known Limitations

- Windows-only (macOS/Linux builds planned)
- No code signing — SmartScreen may warn on download (click "Keep anyway")
- No WebGL renderer — xterm canvas renderer is preferred for stability

## License

MIT
