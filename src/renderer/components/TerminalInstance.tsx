import React, { useRef, useEffect, useCallback } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { WebLinksAddon } from 'xterm-addon-web-links'

interface TerminalInstanceProps {
  paneId: string
  terminalId: string | null
  workspaceCwd: string
  onTerminalReady: (id: string) => void
  onTerminalData: (data: string) => void
  onExit: (exitCode: number) => void
  onCwdChange: (cwd: string) => void
}

const TerminalInstance: React.FC<TerminalInstanceProps> = ({
  paneId,
  terminalId,
  workspaceCwd,
  onTerminalReady,
  onTerminalData,
  onExit,
  onCwdChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const termRef = useRef<Terminal | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const initializedRef = useRef(false)

  const initializeTerminal = useCallback(async () => {
    if (initializedRef.current || !containerRef.current) return
    initializedRef.current = true

    const term = new Terminal({
      fontFamily: "'JetBrains Mono', 'Cascadia Code', 'Consolas', 'monospace'",
      fontSize: 14,
      lineHeight: 1.35,
      letterSpacing: 0.15,
      cursorBlink: true,
      cursorStyle: 'bar',
      cursorWidth: 2,
      allowTransparency: false,
      theme: {
        background: '#0c0c12',
        foreground: '#e0e0e8',
        cursor: '#d4a373',
        cursorAccent: '#0c0c12',
        selectionBackground: 'rgba(212,163,115,0.2)',
        selectionInactiveBackground: 'rgba(212,163,115,0.07)',
        black: '#18181e',
        red: '#e3567c',
        green: '#4cc2a0',
        yellow: '#d4a373',
        blue: '#6d8ae8',
        magenta: '#b483d4',
        cyan: '#58b9c6',
        white: '#dadae2',
        brightBlack: '#2a2a38',
        brightRed: '#f06a8e',
        brightGreen: '#5cd4b0',
        brightYellow: '#e0b080',
        brightBlue: '#7d9af0',
        brightMagenta: '#c494dc',
        brightCyan: '#6cc8d4',
        brightWhite: '#ececf4'
      }
    })

    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    term.loadAddon(new WebLinksAddon())

    termRef.current = term
    fitAddonRef.current = fitAddon

    term.open(containerRef.current)

    setTimeout(() => {
      fitAddon.fit()
    }, 50)

    const id = await window.dzz.pty.create({
      cwd: workspaceCwd || undefined
    })

    if (!id) {
      initializedRef.current = false
      return
    }

    onTerminalReady(id)

    let cwd = ''
    window.dzz.pty.getCwd().then((path) => {
      cwd = path
      onCwdChange(path)
    })

    const cleanup = window.dzz.pty.onData(id, (data) => {
      term.write(data)
    })

    const exitCleanup = window.dzz.pty.onExit(id, (exitCode) => {
      onExit(exitCode)
    })

    term.onData((data) => {
      window.dzz.pty.write(id, data)
    })

    const resizeObserver = new ResizeObserver(() => {
      try {
        fitAddon.fit()
        const dims = fitAddon.proposeDimensions()
        if (dims) {
          window.dzz.pty.resize(id, dims.cols, dims.rows)
        }
      } catch {
      }
    })

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    ;(term as any).__cleanup = () => {
      cleanup()
      exitCleanup()
      resizeObserver.disconnect()
      term.dispose()
    }
  }, [paneId, onTerminalReady, onExit, onCwdChange, workspaceCwd])

  useEffect(() => {
    if (!terminalId) {
      initializeTerminal()
    }

    return () => {
      if (termRef.current && (termRef.current as any).__cleanup) {
        (termRef.current as any).__cleanup()
      }
      termRef.current = null
      initializedRef.current = false
    }
  }, [terminalId, initializeTerminal])

  useEffect(() => {
    const handleResize = () => {
      if (fitAddonRef.current) {
        try {
          fitAddonRef.current.fit()
        } catch {
        }
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div
      ref={containerRef}
      className="terminal"
      style={{
        width: '100%',
        height: '100%',
        minHeight: 0
      }}
    />
  )
}

export default TerminalInstance
