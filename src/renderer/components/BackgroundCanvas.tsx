import React, { useRef, useEffect } from 'react'

interface Particle {
  x: number
  y: number
  size: number
  baseSize: number
  vx: number
  vy: number
  opacity: number
  hue: number
  phase: number
  type: 'mote' | 'drifter' | 'streak'
  streakTimer: number
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

    const particles: Particle[] = Array.from({ length: 130 }, () => {
      const type = Math.random() < 0.15 ? 'drifter' : Math.random() < 0.05 ? 'streak' : 'mote'
      const speedMul = type === 'drifter' ? 0.3 : type === 'streak' ? 4 : 1
      const angle = Math.random() * Math.PI * 2
      const speed = (0.003 + Math.random() * 0.025) * speedMul
      const size = type === 'mote' ? 0.8 + Math.random() * 2.5 : type === 'drifter' ? 1.5 + Math.random() * 2 : 0.5 + Math.random() * 1
      return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size,
        baseSize: size,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed + (type === 'mote' ? -0.002 : 0),
        opacity: type === 'mote' ? 0.06 + Math.random() * 0.2 : type === 'drifter' ? 0.1 + Math.random() * 0.15 : 0.15 + Math.random() * 0.2,
        hue: type === 'drifter' ? 210 + Math.random() * 40 : 190 + Math.random() * 70,
        phase: Math.random() * Math.PI * 2,
        type,
        streakTimer: 0
      }
    })

    let frame = 0
    let t = 0
    let visible = true
    const handleVis = () => { visible = !document.hidden }
    document.addEventListener('visibilitychange', handleVis)

    const draw = () => {
      if (!visible) { frame = requestAnimationFrame(draw); return }
      t += 0.005

      const w = canvas.width
      const h = canvas.height
      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      ctx.clearRect(0, 0, w, h)

      const cx = w * (0.4 + mx * 0.2)
      const cy = h * (0.3 + my * 0.1)
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.5)
      grad.addColorStop(0, 'rgba(212, 163, 115, 0.05)')
      grad.addColorStop(0.3, 'rgba(180, 190, 220, 0.025)')
      grad.addColorStop(1, 'rgba(8, 8, 12, 0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)

      const botGrad = ctx.createLinearGradient(0, h * 0.75, 0, h)
      botGrad.addColorStop(0, 'rgba(8, 8, 12, 0)')
      botGrad.addColorStop(1, 'rgba(8, 8, 12, 0.18)')
      ctx.fillStyle = botGrad
      ctx.fillRect(0, h * 0.75, w, h * 0.25)

      const drift = 0.012
      const dx = (mx - 0.5) * drift
      const dy = (my - 0.5) * drift

      const t05 = t * 0.5
      const t06 = t * 0.6
      const t02 = t * 0.2
      const t07 = t * 0.7
      const t01 = t * 0.1

      ctx.filter = 'blur(0.6px)'
      let curFilter = 'blur(0.6px)'

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        const wobbleX = Math.sin(t05 + p.phase) * 0.03
        const wobbleY = Math.cos(t06 + p.phase * 1.3) * 0.03
        const thermal = Math.sin(t02 + p.phase * 0.7) * 0.004

        p.x += p.vx + wobbleX + dx * (p.type === 'drifter' ? 0.3 : p.type === 'streak' ? 1.5 : 0.6)
        p.y += p.vy + wobbleY + dy * 0.3 - thermal

        if (p.x < -30) p.x = w + 30
        if (p.x > w + 30) p.x = -30
        if (p.y < -30) p.y = h + 30
        if (p.y > h + 30) p.y = -30

        if (p.type === 'streak') {
          p.streakTimer++
          if (p.streakTimer > 120 + Math.random() * 200) {
            const a = Math.random() * Math.PI * 2
            const s = 0.04 + Math.random() * 0.06
            p.vx = Math.cos(a) * s
            p.vy = Math.sin(a) * s
            p.streakTimer = 0
          }
        }

        const pulse = 0.6 + Math.sin(t07 + p.phase) * 0.4
        const hueShift = Math.sin(t01 + p.phase * 0.5) * 10
        const r = p.size * pulse
        const alpha = p.opacity * pulse
        const hue = p.hue + hueShift

        const targetFilter = p.type === 'streak' ? 'blur(0.3px)' : 'blur(0.6px)'
        if (targetFilter !== curFilter) {
          ctx.filter = targetFilter
          curFilter = targetFilter
        }

        if (p.type === 'streak') {
          ctx.shadowColor = `hsla(${hue}, 40%, 80%, ${alpha * 0.3})`
          ctx.shadowBlur = 6
        } else if (ctx.shadowBlur !== 0) {
          ctx.shadowBlur = 0
        }

        const g = ctx.createRadialGradient(p.x - r * 0.2, p.y - r * 0.2, 0, p.x, p.y, r)
        g.addColorStop(0, `hsla(${hue}, 35%, 85%, ${alpha})`)
        g.addColorStop(0.5, `hsla(${hue}, 30%, 70%, ${alpha * 0.6})`)
        g.addColorStop(1, `hsla(${hue}, 25%, 60%, 0)`)
        ctx.beginPath()
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
        ctx.fillStyle = g
        ctx.fill()
      }

      ctx.shadowBlur = 0
      ctx.filter = 'blur(0.3px)'
      ctx.lineWidth = 0.4
      for (let i = 0; i < particles.length; i += 2) {
        const a = particles[i]
        const ax = a.x, ay = a.y
        for (let j = i + 2; j < particles.length; j += 2) {
          const b = particles[j]
          const ddx = ax - b.x
          const ddy = ay - b.y
          const dist2 = ddx * ddx + ddy * ddy
          if (dist2 < 12000) {
            const alpha = (1 - Math.sqrt(dist2) / 110) * 0.035
            ctx.strokeStyle = `rgba(212, 163, 115, ${alpha})`
            ctx.beginPath()
            ctx.moveTo(ax, ay)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }

      ctx.filter = 'none'

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
