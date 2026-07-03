import React, { useRef, useEffect, useCallback } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { WebLinksAddon } from 'xterm-addon-web-links'

interface TerminalInstanceProps {
  paneId: string
  terminalId: string | null
  onTerminalReady: (id: string) => void
  onTerminalData: (data: string) => void
  onExit: (exitCode: number) => void
  onCwdChange: (cwd: string) => void
}

const TerminalInstance: React.FC<TerminalInstanceProps> = ({
  paneId,
  terminalId,
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
      fontFamily: "'JetBrains Mono', 'Cascadia Code', 'Fira Code', monospace",
      fontSize: 13,
      lineHeight: 1.5,
      letterSpacing: 0,
      cursorBlink: true,
      cursorStyle: 'bar',
      cursorWidth: 2,
      allowTransparency: true,
      theme: {
        background: 'transparent',
        foreground: '#e8e8ed',
        cursor: '#f59e0b',
        cursorAccent: '#0a0a0f',
        selectionBackground: 'rgba(245,158,11,0.2)',
        black: '#1e1e2a',
        red: '#ef4444',
        green: '#22c55e',
        yellow: '#eab308',
        blue: '#3b82f6',
        magenta: '#a855f7',
        cyan: '#22d3ee',
        white: '#e8e8ed',
        brightBlack: '#3a3a48',
        brightRed: '#ef4444',
        brightGreen: '#22c55e',
        brightYellow: '#eab308',
        brightBlue: '#3b82f6',
        brightMagenta: '#a855f7',
        brightCyan: '#22d3ee',
        brightWhite: '#e8e8ed'
      }
    })

    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    term.loadAddon(new WebLinksAddon())

    termRef.current = term
    fitAddonRef.current = fitAddon

    term.open(containerRef.current)

    // Small delay to ensure DOM is ready for fit
    setTimeout(() => {
      fitAddon.fit()
    }, 50)

    // Create the PTY
    const id = await window.dzz.pty.create({})

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

    // Set up data listener
    const cleanup = window.dzz.pty.onData(id, (data) => {
      term.write(data)
    })

    // Set up exit listener
    const exitCleanup = window.dzz.pty.onExit(id, (exitCode) => {
      onExit(exitCode)
    })

    // Handle user input
    term.onData((data) => {
      window.dzz.pty.write(id, data)
    })

    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
      try {
        fitAddon.fit()
        const dims = fitAddon.proposeDimensions()
        if (dims) {
          window.dzz.pty.resize(id, dims.cols, dims.rows)
        }
      } catch {
        // ignore
      }
    })

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    // Store cleanup in term ref
    ;(term as any).__cleanup = () => {
      cleanup()
      exitCleanup()
      resizeObserver.disconnect()
      term.dispose()
    }
  }, [paneId, onTerminalReady, onExit, onCwdChange])

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

  // Handle resize on window resize
  useEffect(() => {
    const handleResize = () => {
      if (fitAddonRef.current) {
        try {
          fitAddonRef.current.fit()
        } catch {
          // ignore
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
