import React, { useRef, useEffect } from 'react'

interface Particle {
  x: number
  y: number
  size: number
  vx: number
  vy: number
  alpha: number
  hue: number
  phase: number
}

const COUNT = 65

const BackgroundCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let glowGrad: CanvasGradient | null = null

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      const w = window.innerWidth
      const h = window.innerHeight
      glowGrad = ctx.createRadialGradient(w * 0.5, h * 0.35, 0, w * 0.5, h * 0.35, Math.max(w, h) * 0.5)
      glowGrad.addColorStop(0, 'rgba(190, 200, 220, 0.025)')
      glowGrad.addColorStop(0.5, 'rgba(160, 175, 200, 0.01)')
      glowGrad.addColorStop(1, 'rgba(8, 8, 12, 0)')
    }
    resize()
    window.addEventListener('resize', resize)

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight }
    }
    window.addEventListener('mousemove', handleMouse)

    const particles: Particle[] = Array.from({ length: COUNT }, () => {
      const angle = Math.random() * Math.PI * 2
      const speed = 0.006 + Math.random() * 0.03
      return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: 0.6 + Math.random() * 2.8,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 0.06 + Math.random() * 0.2,
        hue: 190 + Math.random() * 60,
        phase: Math.random() * Math.PI * 2
      }
    })

    let frame = 0
    let t = 0
    let visible = true
    const handleVis = () => { visible = !document.hidden }
    document.addEventListener('visibilitychange', handleVis)

    const draw = () => {
      if (!visible) { frame = requestAnimationFrame(draw); return }
      t += 0.008

      const w = canvas.width
      const h = canvas.height
      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      ctx.clearRect(0, 0, w, h)

      if (glowGrad) {
        ctx.fillStyle = glowGrad
        ctx.fillRect(0, 0, w, h)
      }

      const botGrad = ctx.createLinearGradient(0, h * 0.7, 0, h)
      botGrad.addColorStop(0, 'rgba(8, 8, 12, 0)')
      botGrad.addColorStop(1, 'rgba(8, 8, 12, 0.22)')
      ctx.fillStyle = botGrad
      ctx.fillRect(0, h * 0.7, w, h * 0.3)

      const drift = 0.016
      const dx = (mx - 0.5) * drift
      const dy = (my - 0.5) * drift

      const t05 = t * 0.5
      const t07 = t * 0.7
      const t01 = t * 0.1

      for (let i = 0; i < COUNT; i++) {
        const p = particles[i]

        p.x += p.vx + Math.sin(t05 + p.phase) * 0.05 + dx * 0.6
        p.y += p.vy + Math.cos(t05 + p.phase * 1.3) * 0.05 + dy * 0.4 - Math.sin(t * 0.2 + p.phase * 0.7) * 0.005

        if (p.x < -30) p.x = w + 30
        if (p.x > w + 30) p.x = -30
        if (p.y < -30) p.y = h + 30
        if (p.y > h + 30) p.y = -30

        const pulse = 0.6 + Math.sin(t07 + p.phase) * 0.4
        const r = p.size * pulse
        const a = p.alpha * (0.6 + pulse * 0.4)
        const hshift = p.hue + Math.sin(t01 + p.phase * 0.5) * 12

        ctx.beginPath()
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${hshift}, 35%, 76%, ${a})`
        ctx.fill()
      }

      frame = requestAnimationFrame(draw)
    }

    frame = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouse)
      document.removeEventListener('visibilitychange', handleVis)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none'
      }}
    />
  )
}

export default BackgroundCanvas
