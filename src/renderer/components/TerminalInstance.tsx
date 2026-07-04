import React, { useRef, useEffect, useCallback } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { WebLinksAddon } from 'xterm-addon-web-links'
import { PremiumRenderer } from '../utils/premiumRenderer'
import { detectCliProfile, PROFILES } from '../utils/cliProfiles'

interface TerminalInstanceProps {
  paneId: string
  terminalId: string | null
  workspaceCwd: string
  onTerminalReady: (id: string) => void
  onTerminalData: (data: string) => void
  onExit: (exitCode: number) => void
  onCwdChange: (cwd: string) => void
  onProfileChange?: (profile: string) => void
}

const FONT_FAMILY = "'JetBrains Mono', Consolas, 'Courier New', monospace"

const TerminalInstance: React.FC<TerminalInstanceProps> = ({
  paneId,
  terminalId,
  workspaceCwd,
  onTerminalReady,
  onTerminalData,
  onExit,
  onCwdChange,
  onProfileChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const termRef = useRef<Terminal | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const initializedRef = useRef(false)
  const mountedRef = useRef(true)
  const rendererRef = useRef<PremiumRenderer | null>(null)
  const profileRef = useRef<string>('default')
  const ptyIdRef = useRef<string | null>(null)

  const applyProfile = useCallback((name: string, _renderer: PremiumRenderer, term: Terminal) => {
    const p = PROFILES[name] || PROFILES.default
    term.options.theme = {
      ...term.options.theme,
      cursor: p.accent,
      selectionBackground: p.selectionBg,
      selectionInactiveBackground: p.selectionInactiveBg
    }
  }, [])

  const initializeTerminal = useCallback(async () => {
    if (initializedRef.current || !containerRef.current) return
    initializedRef.current = true

    try {
    const initialHeight = containerRef.current.clientHeight
    const dpr = window.devicePixelRatio || 1

    const renderer = new PremiumRenderer()
    renderer.setFontFamily(FONT_FAMILY)
    rendererRef.current = renderer

    const profile = renderer.calculateOptimalSize(initialHeight, dpr)

    const term = new Terminal({
      fontFamily: FONT_FAMILY,
      fontSize: profile.fontSize,
      lineHeight: profile.lineHeight,
      letterSpacing: profile.letterSpacing,
      fontWeight: '400',
      fontWeightBold: '600',
      cursorBlink: true,
      cursorStyle: 'block',
      cursorWidth: 1,
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

    renderer.isolateMeasurementElements(containerRef.current)
    renderer.applyCanvasQuality(containerRef.current)

    let id: string | null = terminalId
    let existing = false

    if (id) {
      existing = await window.dzz.pty.exists(id)
    }

    if (!id || !existing) {
      id = await window.dzz.pty.create({
        cwd: workspaceCwd || undefined
      })
      if (!id) {
        initializedRef.current = false
        return
      }
      onTerminalReady(id)
    }

    ptyIdRef.current = id

    let cwd = ''
    window.dzz.pty.getCwd().then((path) => {
      if (!mountedRef.current) return
      cwd = path
      onCwdChange(path)
    })

    const cleanup = window.dzz.pty.onData(id, (data) => {
      term.write(data)

      if (rendererRef.current) {
        const detected = detectCliProfile(data, profileRef.current)
        if (detected !== profileRef.current) {
          profileRef.current = detected
          applyProfile(detected, rendererRef.current, term)
          if (onProfileChange) onProfileChange(detected)
        }
      }
    })

    const exitCleanup = window.dzz.pty.onExit(id, (exitCode) => {
      onExit(exitCode)
    })

    term.onData((data) => {
      window.dzz.pty.write(id, data)
    })

    let resizeTimer: ReturnType<typeof setTimeout> | null = null
    let optimizeTimer: ReturnType<typeof setTimeout> | null = null

    const doFit = (retries = 0) => {
      if (!mountedRef.current || retries > 12) return
      requestAnimationFrame(() => {
        try {
          fitAddon.fit()
          const dims = fitAddon.proposeDimensions()
          if (dims && dims.cols > 0 && dims.rows > 0) {
            window.dzz.pty.resize(id, dims.cols, dims.rows)
            if (term.rows > 0) term.refresh(0, term.rows - 1)
          } else {
            doFit(retries + 1)
          }
        } catch {
          doFit(retries + 1)
        }
      })
    }
    doFit()

    const debouncedFit = () => {
      try {
        fitAddon.fit()
        const dims = fitAddon.proposeDimensions()
        if (dims && dims.cols > 0 && dims.rows > 0) {
          window.dzz.pty.resize(id, dims.cols, dims.rows)
          if (term.rows > 0) term.refresh(0, term.rows - 1)
        }
      } catch {
      }
    }

    const resizeObserver = new ResizeObserver(() => {
      if (resizeTimer !== null) clearTimeout(resizeTimer)
      resizeTimer = setTimeout(debouncedFit, 80)
    })

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    ;(term as any).__cleanup = () => {
      cleanup()
      exitCleanup()
      if (resizeTimer !== null) clearTimeout(resizeTimer)
      if (optimizeTimer !== null) clearTimeout(optimizeTimer)
      resizeObserver.disconnect()
      term.dispose()
      if (rendererRef.current) {
        rendererRef.current.destroy()
        rendererRef.current = null
      }
      ptyIdRef.current = null
    }
    } catch (e) {
      initializedRef.current = false
    }
  }, [paneId, terminalId, onTerminalReady, onExit, onCwdChange, onProfileChange, workspaceCwd, applyProfile])

  useEffect(() => {
    mountedRef.current = true
    if (!initializedRef.current) {
      initializeTerminal()
    }

    return () => {
      mountedRef.current = false
      if (termRef.current && (termRef.current as any).__cleanup) {
        (termRef.current as any).__cleanup()
      }
      termRef.current = null
      initializedRef.current = false
    }
  }, [initializeTerminal])

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
