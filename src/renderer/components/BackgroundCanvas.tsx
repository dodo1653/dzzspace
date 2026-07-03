import React, { useRef, useEffect } from 'react'

interface Particle {
  x: number
  y: number
  size: number
  vx: number
  vy: number
  opacity: number
  hue: number
  phase: number
}

const BackgroundCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight }
    }
    window.addEventListener('mousemove', handleMouse)

    const particles: Particle[] = Array.from({ length: 100 }, () => {
      const angle = Math.random() * Math.PI * 2
      const speed = 0.005 + Math.random() * 0.015
      return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: 1 + Math.random() * 2.2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        opacity: 0.08 + Math.random() * 0.18,
        hue: 200 + Math.random() * 60,
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
      t += 0.004

      const w = canvas.width
      const h = canvas.height
      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      ctx.clearRect(0, 0, w, h)

      // Warm radial glow follows mouse
      const cx = w * (0.4 + mx * 0.2)
      const cy = h * (0.3 + my * 0.1)
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.5)
      grad.addColorStop(0, 'rgba(212, 163, 115, 0.04)')
      grad.addColorStop(0.3, 'rgba(180, 190, 220, 0.02)')
      grad.addColorStop(1, 'rgba(8, 8, 12, 0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)

      // Bottom fade
      const botGrad = ctx.createLinearGradient(0, h * 0.75, 0, h)
      botGrad.addColorStop(0, 'rgba(8, 8, 12, 0)')
      botGrad.addColorStop(1, 'rgba(8, 8, 12, 0.15)')
      ctx.fillStyle = botGrad
      ctx.fillRect(0, h * 0.75, w, h * 0.25)

      // Update and draw particles
      for (const p of particles) {
        const drift = 0.008
        const dx = (mx - 0.5) * drift
        const dy = (my - 0.5) * drift
        const wobbleX = Math.sin(t * 0.3 + p.phase) * 0.02
        const wobbleY = Math.cos(t * 0.4 + p.phase * 1.3) * 0.02

        p.x += p.vx + wobbleX + dx
        p.y += p.vy + wobbleY + dy

        if (p.x < -20) p.x = w + 20
        if (p.x > w + 20) p.x = -20
        if (p.y < -20) p.y = h + 20
        if (p.y > h + 20) p.y = -20

        const pulse = 0.7 + Math.sin(t * 0.5 + p.phase) * 0.3
        const hueShift = Math.sin(t * 0.08 + p.phase * 0.5) * 8
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue + hueShift}, 30%, 75%, ${p.opacity * pulse})`
        ctx.fill()
      }

      // Sparse connecting lines — only every 3rd frame to reduce visual noise
      if (Math.floor(t / 0.004) % 3 === 0) {
        ctx.lineWidth = 0.5
        for (let i = 0; i < particles.length; i += 3) {
          const a = particles[i]
          for (let j = i + 3; j < particles.length; j += 3) {
            const b = particles[j]
            const dx = a.x - b.x
            const dy = a.y - b.y
            const dist = dx * dx + dy * dy
            if (dist < 15000) {
              const alpha = (1 - Math.sqrt(dist) / 125) * 0.04
              ctx.strokeStyle = `rgba(212, 163, 115, ${alpha})`
              ctx.beginPath()
              ctx.moveTo(a.x, a.y)
              ctx.lineTo(b.x, b.y)
              ctx.stroke()
            }
          }
        }
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
