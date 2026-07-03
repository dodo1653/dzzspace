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

    const particleCount = 10
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * (canvas?.width || window.innerWidth),
      y: Math.random() * (canvas?.height || window.innerHeight),
      size: 1 + Math.random() * 1.5,
      speed: 0.1 + Math.random() * 0.2,
      opacity: 0.15 + Math.random() * 0.25,
      drift: (Math.random() - 0.5) * 0.2
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
      timeRef.current += 0.005

      ctx.clearRect(0, 0, w, h)

      // Perspective grid lines
      ctx.strokeStyle = '#1e1e2a'
      ctx.lineWidth = 0.5
      const centerX = w / 2
      const centerY = h / 2
      const spacing = 40

      // Vertical grid lines
      for (let x = centerX % spacing; x < w; x += spacing) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
        ctx.stroke()
      }

      // Horizontal grid lines
      for (let y = centerY % spacing; y < h; y += spacing) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
        ctx.stroke()
      }

      // Subtle radial gradient overlay for depth
      const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(w, h) * 0.6)
      grad.addColorStop(0, 'rgba(245, 158, 11, 0.015)')
      grad.addColorStop(1, 'rgba(10, 10, 15, 0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)

      // Particles
      const particles = particlesRef.current
      for (const p of particles) {
        p.y -= p.speed
        p.x += Math.sin(timeRef.current + p.drift * 10) * p.drift

        if (p.y < -10) {
          p.y = h + 10
          p.x = Math.random() * w
        }
        if (p.x < -10) p.x = w + 10
        if (p.x > w + 10) p.x = -10

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(107, 107, 123, ${p.opacity})`
        ctx.fill()
      }

      // Subtle grid intersection highlights
      ctx.fillStyle = 'rgba(245, 158, 11, 0.03)'
      for (let x = centerX % spacing; x < w; x += spacing * 3) {
        for (let y = centerY % spacing; y < h; y += spacing * 3) {
          ctx.beginPath()
          ctx.arc(x, y, 1, 0, Math.PI * 2)
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
