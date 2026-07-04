import React, { useRef, useEffect } from 'react'

const SIDEBAR_COUNT = 12

const SidebarCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      const parent = canvas.parentElement
      if (parent) {
        canvas.width = parent.clientWidth
        canvas.height = parent.clientHeight
      }
    }
    resize()
    window.addEventListener('resize', resize)

    const particles = Array.from({ length: SIDEBAR_COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: 0.5 + Math.random() * 1.5,
      alpha: 0.03 + Math.random() * 0.06,
      vx: -0.002 - Math.random() * 0.008,
      vy: 0.001 + Math.random() * 0.004,
      phase: Math.random() * Math.PI * 2
    }))

    let frame = 0
    let t = 0

    const draw = () => {
      t += 0.006
      const w = canvas.width
      const h = canvas.height
      if (w === 0 || h === 0) { frame = requestAnimationFrame(draw); return }

      ctx.clearRect(0, 0, w, h)

      for (let i = 0; i < SIDEBAR_COUNT; i++) {
        const p = particles[i]
        const drift = Math.sin(t * 0.3 + p.phase) * 0.003

        p.x += p.vx + drift
        p.y += p.vy + Math.sin(t * 0.2 + p.phase * 0.7) * 0.002

        if (p.x < -0.05) p.x = 1.05
        if (p.x > 1.05) p.x = -0.05
        if (p.y < -0.05) p.y = 1.05
        if (p.y > 1.05) p.y = -0.05

        const pulse = 0.7 + Math.sin(t * 0.4 + p.phase) * 0.3

        ctx.beginPath()
        ctx.arc(p.x * w, p.y * h, p.size * pulse, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(212, 163, 115, ${p.alpha * pulse})`
        ctx.fill()
      }

      frame = requestAnimationFrame(draw)
    }

    frame = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0
      }}
    />
  )
}

export default SidebarCanvas
