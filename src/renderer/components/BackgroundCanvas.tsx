import React, { useRef, useEffect } from 'react'

interface Particle {
  x: number
  y: number
  size: number
  speedY: number
  speedX: number
  opacity: number
  hue: number
}

const BackgroundCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

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

    const particles: Particle[] = Array.from({ length: 80 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: 0.3 + Math.random() * 1.2,
      speedY: -0.02 - Math.random() * 0.06,
      speedX: (Math.random() - 0.5) * 0.02,
      opacity: 0.04 + Math.random() * 0.12,
      hue: 220 + Math.random() * 40
    }))

    let frame = 0
    let t = 0
    let visible = true
    const handleVis = () => { visible = !document.hidden }
    document.addEventListener('visibilitychange', handleVis)

    const draw = () => {
      if (!visible) { frame = requestAnimationFrame(draw); return }
      t += 0.002

      const w = canvas.width
      const h = canvas.height

      ctx.clearRect(0, 0, w, h)

      // Very subtle radial gradient center light
      const cx = w * 0.5
      const cy = h * 0.4
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.4)
      grad.addColorStop(0, 'rgba(200, 210, 240, 0.02)')
      grad.addColorStop(1, 'rgba(10, 10, 15, 0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)

      // Bottom fade
      const botGrad = ctx.createLinearGradient(0, h * 0.8, 0, h)
      botGrad.addColorStop(0, 'rgba(10, 10, 15, 0)')
      botGrad.addColorStop(1, 'rgba(10, 10, 15, 0.15)')
      ctx.fillStyle = botGrad
      ctx.fillRect(0, h * 0.8, w, h * 0.2)

      // Particles
      for (const p of particles) {
        p.y += p.speedY
        p.x += p.speedX + Math.sin(t + p.hue * 0.01) * 0.04

        if (p.y < -5) { p.y = h + 5; p.x = Math.random() * w }
        if (p.x < -5) p.x = w + 5
        if (p.x > w + 5) p.x = -5

        const pulse = 0.7 + Math.sin(t * 0.5 + p.hue) * 0.3
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue}, 30%, 75%, ${p.opacity * pulse})`
        ctx.fill()
      }

      // Occasional faint connecting lines between close particles
      ctx.lineWidth = 0.3
      for (let i = 0; i < particles.length; i += 2) {
        const a = particles[i]
        for (let j = i + 3; j < particles.length; j += 3) {
          const b = particles[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = dx * dx + dy * dy
          if (dist < 12000) {
            const alpha = (1 - Math.sqrt(dist) / 110) * 0.04
            ctx.strokeStyle = `rgba(180, 190, 220, ${alpha})`
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
