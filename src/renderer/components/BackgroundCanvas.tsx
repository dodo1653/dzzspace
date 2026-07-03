import React, { useRef, useEffect } from 'react'

interface Particle {
  x: number
  y: number
  size: number
  speed: number
  opacity: number
  drift: number
}

const BackgroundCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const frameRef = useRef<number>(0)
  const timeRef = useRef<number>(0)

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

    const particleCount = 50
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: 0.8 + Math.random() * 2.2,
      speed: 0.05 + Math.random() * 0.15,
      opacity: 0.08 + Math.random() * 0.2,
      drift: (Math.random() - 0.5) * 0.15
    }))

    let visible = true
    const handleVisibility = () => { visible = !document.hidden }
    document.addEventListener('visibilitychange', handleVisibility)

    const draw = () => {
      if (!visible) {
        frameRef.current = requestAnimationFrame(draw)
        return
      }

      const w = canvas.width
      const h = canvas.height
      timeRef.current += 0.003

      ctx.clearRect(0, 0, w, h)

      const centerX = w / 2
      const centerY = h / 2
      const spacing = 48
      const wave = Math.sin(timeRef.current * 0.5) * 2

      ctx.strokeStyle = 'rgba(30, 30, 42, 0.6)'
      ctx.lineWidth = 0.5

      for (let x = centerX % spacing; x < w; x += spacing) {
        ctx.beginPath()
        for (let y = 0; y <= h; y += 4) {
          const dx = Math.sin(y * 0.008 + timeRef.current * 0.3) * wave
          if (y === 0) ctx.moveTo(x + dx, y)
          else ctx.lineTo(x + dx, y)
        }
        ctx.stroke()
      }

      for (let y = centerY % spacing; y < h; y += spacing) {
        ctx.beginPath()
        for (let x = 0; x <= w; x += 4) {
          const dy = Math.sin(x * 0.008 + timeRef.current * 0.3) * wave
          if (x === 0) ctx.moveTo(x, y + dy)
          else ctx.lineTo(x, y + dy)
        }
        ctx.stroke()
      }

      const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(w, h) * 0.5)
      grad.addColorStop(0, 'rgba(245, 158, 11, 0.025)')
      grad.addColorStop(0.5, 'rgba(245, 158, 11, 0.008)')
      grad.addColorStop(1, 'rgba(10, 10, 15, 0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)

      const particles = particlesRef.current
      for (const p of particles) {
        p.y -= p.speed
        p.x += Math.sin(timeRef.current + p.drift * 10) * p.drift * 0.5

        if (p.y < -10) {
          p.y = h + 10
          p.x = Math.random() * w
        }
        if (p.x < -10) p.x = w + 10
        if (p.x > w + 10) p.x = -10

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(180, 180, 200, ${p.opacity})`
        ctx.fill()
      }

      ctx.fillStyle = 'rgba(245, 158, 11, 0.02)'
      for (let x = centerX % spacing; x < w; x += spacing * 2) {
        for (let y = centerY % spacing; y < h; y += spacing * 2) {
          const pulse = 0.5 + Math.sin(x * 0.01 + y * 0.01 + timeRef.current * 2) * 0.5
          ctx.beginPath()
          ctx.arc(x, y, 0.8 + pulse * 0.6, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      frameRef.current = requestAnimationFrame(draw)
    }

    frameRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(frameRef.current)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', handleVisibility)
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
