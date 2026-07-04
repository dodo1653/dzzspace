import React, { useRef, useEffect } from 'react'

const PARTICLE_COUNT = 45

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

    const particles = Array.from({ length: PARTICLE_COUNT }, () => {
      const w = canvas.width || 280
      const h = canvas.height || 600
      return {
        x: Math.random() * 1.2 - 0.1,
        y: 0.7 + Math.random() * 0.35,
        size: 1.5 + Math.random() * 3.5,
        alpha: 0.08 + Math.random() * 0.18,
        vy: -(0.15 + Math.random() * 0.3),
        sway: 0.2 + Math.random() * 0.5,
        swaySpeed: 0.3 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2,
        fadeStart: 0.2 + Math.random() * 0.3,
        baseX: Math.random() * 1.2 - 0.1
      }
    })

    let frame = 0
    let t = 0

    const draw = () => {
      t += 0.006
      const w = canvas.width
      const h = canvas.height
      if (w === 0 || h === 0) { frame = requestAnimationFrame(draw); return }

      ctx.clearRect(0, 0, w, h)

      const gradient = ctx.createLinearGradient(0, 0, 0, h)
      gradient.addColorStop(0, 'transparent')
      gradient.addColorStop(0.05, 'rgba(212,163,115,0.01)')
      gradient.addColorStop(0.6, 'rgba(212,163,115,0.025)')
      gradient.addColorStop(1, 'rgba(212,163,115,0.04)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, w, h)

      for (const p of particles) {
        const sway = Math.sin(t * p.swaySpeed + p.phase) * p.sway
        p.x = p.baseX + sway * 0.04
        p.y += p.vy * 0.004

        const life = 1 - p.y / (p.fadeStart + 0.3)
        let alpha = p.alpha
        if (life < 0.3) {
          alpha *= life / 0.3
        } else if (life > 0.7) {
          alpha *= (1 - life) / 0.3
        }
        if (alpha < 0) alpha = 0

        const warmShift = Math.sin(t * 0.2 + p.phase) * 0.1
        const r = Math.min(255, Math.round(212 + warmShift * 40))
        const g = Math.round(163 - warmShift * 30)
        const b = Math.round(115 - warmShift * 50)

        ctx.beginPath()
        ctx.arc(p.x * w, p.y * h, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`
        ctx.fill()

        if (alpha > 0.06) {
          ctx.beginPath()
          ctx.arc(p.x * w, p.y * h, p.size * 2.5, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${r},${g},${b},${alpha * 0.15})`
          ctx.fill()
        }

        if (p.y < -0.05 || alpha <= 0.005) {
          p.y = 0.85 + Math.random() * 0.2
          p.x = Math.random() * 1.2 - 0.1
          p.baseX = p.x
          p.phase = Math.random() * Math.PI * 2
          p.alpha = 0.08 + Math.random() * 0.18
          p.size = 1.5 + Math.random() * 3.5
          p.fadeStart = 0.2 + Math.random() * 0.3
        }
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
