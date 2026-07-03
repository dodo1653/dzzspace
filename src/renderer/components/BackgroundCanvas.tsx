import React, { useRef, useEffect } from 'react'

interface Particle {
  x: number
  y: number
  size: number
  speedY: number
  speedX: number
  opacity: number
  hue: number
  baseX: number
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

    const particles: Particle[] = Array.from({ length: 160 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: 0.4 + Math.random() * 1.8,
      speedY: -0.015 - Math.random() * 0.05,
      speedX: (Math.random() - 0.5) * 0.025,
      opacity: 0.03 + Math.random() * 0.15,
      hue: 200 + Math.random() * 60,
      baseX: 0
    }))

    particles.forEach((p) => { p.baseX = p.x })

    let frame = 0
    let t = 0
    let visible = true
    const handleVis = () => { visible = !document.hidden }
    document.addEventListener('visibilitychange', handleVis)

    const draw = () => {
      if (!visible) { frame = requestAnimationFrame(draw); return }
      t += 0.003

      const w = canvas.width
      const h = canvas.height
      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      ctx.clearRect(0, 0, w, h)

      // Warm radial glow from center-top
      const cx = w * (0.4 + mx * 0.2)
      const cy = h * (0.3 + my * 0.1)
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.45)
      grad.addColorStop(0, 'rgba(212, 163, 115, 0.025)')
      grad.addColorStop(0.5, 'rgba(160, 180, 220, 0.015)')
      grad.addColorStop(1, 'rgba(10, 10, 15, 0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)

      // Bottom fade
      const botGrad = ctx.createLinearGradient(0, h * 0.7, 0, h)
      botGrad.addColorStop(0, 'rgba(8, 8, 12, 0)')
      botGrad.addColorStop(1, 'rgba(8, 8, 12, 0.2)')
      ctx.fillStyle = botGrad
      ctx.fillRect(0, h * 0.7, w, h * 0.3)

      // Update and draw particles
      for (const p of particles) {
        const dx = mx - 0.5
        const dy = my - 0.5
        p.x += p.speedX + dx * 0.015 + Math.sin(t + p.hue * 0.01) * 0.03
        p.y += p.speedY + dy * 0.01

        if (p.y < -8) { p.y = h + 8; p.x = Math.random() * w; p.baseX = p.x }
        if (p.x < -8) p.x = w + 8
        if (p.x > w + 8) p.x = -8

        const pulse = 0.6 + Math.sin(t * 0.6 + p.hue * 0.02) * 0.4
        const hueShift = Math.sin(t * 0.1 + p.hue * 0.005) * 10
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue + hueShift}, 35%, 75%, ${p.opacity * pulse})`
        ctx.fill()
      }

      // Connecting lines between nearby particles
      ctx.lineWidth = 0.4
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i]
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = dx * dx + dy * dy
          if (dist < 18000) {
            const alpha = (1 - Math.sqrt(dist) / 135) * 0.035
            ctx.strokeStyle = `rgba(212, 163, 115, ${alpha * 0.5})`
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
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
