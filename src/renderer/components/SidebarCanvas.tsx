import React, { useRef, useEffect } from 'react'

const STAR_COUNT = 100

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

    const stars = Array.from({ length: STAR_COUNT }, () => {
      const size = Math.pow(Math.random(), 2) * 2.5 + 0.3
      const isColored = Math.random() < 0.15
      const tint = isColored
        ? Math.random() < 0.5
          ? { r: 200, g: 210, b: 255 }
          : { r: 255, g: 230, b: 200 }
        : { r: 220, g: 225, b: 240 }
      return {
        x: Math.random(),
        y: Math.random(),
        size,
        baseAlpha: 0.2 + Math.random() * 0.6,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.3 + Math.random() * 1.2,
        driftX: (Math.random() - 0.5) * 0.0003,
        driftY: (Math.random() - 0.5) * 0.00015,
        tint,
        hasGlow: size > 1.8 && Math.random() < 0.4
      }
    })

    let frame = 0
    let t = 0

    const draw = () => {
      t += 0.003
      const w = canvas.width
      const h = canvas.height
      if (w === 0 || h === 0) { frame = requestAnimationFrame(draw); return }

      ctx.clearRect(0, 0, w, h)

      const nebula = ctx.createRadialGradient(w * 0.5, h * 0.6, 0, w * 0.5, h * 0.6, w * 0.6)
      nebula.addColorStop(0, 'rgba(180, 185, 220, 0.012)')
      nebula.addColorStop(0.4, 'rgba(160, 170, 210, 0.006)')
      nebula.addColorStop(1, 'transparent')
      ctx.fillStyle = nebula
      ctx.fillRect(0, 0, w, h)

      for (const star of stars) {
        star.x += star.driftX
        star.y += star.driftY

        if (star.x < -0.05) star.x = 1.05
        if (star.x > 1.05) star.x = -0.05
        if (star.y < -0.05) star.y = 1.05
        if (star.y > 1.05) star.y = -0.05

        const twinkle = 0.5 + Math.sin(t * star.twinkleSpeed + star.twinklePhase) * 0.5
        const alpha = star.baseAlpha * twinkle

        const px = star.x * w
        const py = star.y * h
        const { r, g, b } = star.tint

        if (star.hasGlow && alpha > 0.2) {
          ctx.beginPath()
          ctx.arc(px, py, star.size * 3, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${r},${g},${b},${alpha * 0.06})`
          ctx.fill()

          ctx.beginPath()
          ctx.arc(px, py, star.size * 1.8, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${r},${g},${b},${alpha * 0.15})`
          ctx.fill()
        }

        ctx.beginPath()
        ctx.arc(px, py, star.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`
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
