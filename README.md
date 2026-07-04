# dzzspace

A premium multi-terminal desktop workspace. Grid-based PowerShell terminals with ultra-aesthetic native-feeling UI, workspace management, and pixel-perfect rendering.

Built with Electron, React, TypeScript, and xterm.js.

## Features

- **Grid-based terminals** — CSS grid layouts with presets from 1 to 9 panes
- **Workspace manager** — Group terminals by project, switch with one click
- **Premium terminal rendering** — Glyph-aware canvas metrics, adaptive typography with JetBrains Mono
- **Per-pane profiles** — CLI-aware detection with unique colors and nicknames
- **Keyboard shortcuts** — Ctrl+Shift+N, Alt+1-9, Ctrl+B, Ctrl+D, and more
- **Sound effects** — Premium UI sounds via Web Audio API
- **Custom PowerShell prompt** — Minimal `❯` prompt
- **PTY persistence** — Running processes survive workspace switches
- **Beautiful landing screen** — Animated particle background, workspace creation

## Prerequisites

- Node.js 18+
- npm 9+

## Install

```bash
git clone https://github.com/dodo1653/dzzspace.git
cd dzzspace
npm install
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Package

```bash
npm run make
```

## Tech Stack

- **Frontend**: React 18, TypeScript, Zustand, xterm.js 5.3
- **Backend**: Electron, node-pty
- **Build**: electron-vite, Vite 5
- **Terminal**: xterm with canvas renderer (fit addon, web links addon)

## License

MIT
