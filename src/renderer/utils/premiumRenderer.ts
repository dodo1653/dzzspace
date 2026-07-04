export interface FontMetrics {
  charWidth: number
  charHeight: number
  baseline: number
  fontSize: number
}

export interface SizeProfile {
  fontSize: number
  lineHeight: number
  letterSpacing: number
}

export class PremiumRenderer {
  private measureCanvas: HTMLCanvasElement
  private measureCtx: CanvasRenderingContext2D | null = null
  private cursorCanvas: HTMLCanvasElement | null = null
  private cursorCtx: CanvasRenderingContext2D | null = null
  private cursorFrame: number | null = null
  private cursorVisible = false
  private cursorX = 0
  private cursorY = 0
  private cursorBlink = false
  private cursorColor = '#d4a373'
  private fontFamily: string

  constructor(fontFamily = "'JetBrains Mono', 'Segoe UI Emoji', 'Symbols', 'Consolas', 'monospace'") {
    this.fontFamily = fontFamily
    this.measureCanvas = document.createElement('canvas')
    this.measureCanvas.width = 200
    this.measureCanvas.height = 100
    this.measureCtx = this.measureCanvas.getContext('2d')
  }

  measure(fontSize: number): FontMetrics {
    const ctx = this.measureCtx
    if (!ctx) {
      return { charWidth: 9, charHeight: 18, baseline: 14, fontSize }
    }

    ctx.font = `${fontSize}px ${this.fontFamily}`

    const wideText = ctx.measureText('W')
    const narrowText = ctx.measureText('i')
    const capText = ctx.measureText('M')

    const ascent = wideText.fontBoundingBoxAscent || wideText.actualBoundingBoxAscent || fontSize * 0.8
    const descent = wideText.fontBoundingBoxDescent || wideText.actualBoundingBoxDescent || fontSize * 0.2

    const charWidth = Math.max(wideText.width, capText.width)
    const charHeight = Math.ceil(ascent + descent)
    const baseline = Math.ceil(ascent)

    return { charWidth, charHeight, baseline, fontSize }
  }

  calculateOptimalSize(containerHeight: number, dpr: number): SizeProfile {
    const targetRows = 24
    const baseLineHeight = 1.45

    const rawFontSize = containerHeight / (targetRows * baseLineHeight)
    let fontSize = Math.round(rawFontSize * dpr) / dpr
    fontSize = Math.max(9, Math.min(20, fontSize))
    fontSize = Math.round(fontSize * 2) / 2

    const lineHeight = containerHeight / (fontSize * targetRows)
    const lineHeightClamped = Math.max(1.35, Math.min(1.6, Math.round(lineHeight * 100) / 100))

    const letterSpacing = fontSize >= 14 ? 0.3 : fontSize >= 11 ? 0.2 : 0

    return { fontSize, lineHeight: lineHeightClamped, letterSpacing }
  }

  createCursorOverlay(container: HTMLElement): HTMLCanvasElement {
    const canvas = document.createElement('canvas')
    canvas.style.position = 'absolute'
    canvas.style.top = '0'
    canvas.style.left = '0'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.pointerEvents = 'none'
    canvas.style.zIndex = '10'
    container.appendChild(canvas)
    this.cursorCanvas = canvas
    this.cursorCtx = canvas.getContext('2d')
    return canvas
  }

  updateCursor(x: number, y: number, color: string): void {
    this.cursorX = x
    this.cursorY = y
    this.cursorColor = color
    if (!this.cursorVisible) {
      this.cursorVisible = true
      this.startCursorLoop()
    }
  }

  private startCursorLoop(): void {
    const draw = () => {
      if (!this.cursorCanvas || !this.cursorCtx) return
      const parent = this.cursorCanvas.parentElement
      if (!parent) return

      const dpr = window.devicePixelRatio || 1
      const w = this.cursorCanvas.offsetWidth
      const h = this.cursorCanvas.offsetHeight
      if (w === 0 || h === 0) {
        this.cursorFrame = requestAnimationFrame(draw)
        return
      }

      this.cursorCanvas.width = Math.round(w * dpr)
      this.cursorCanvas.height = Math.round(h * dpr)
      this.cursorCtx.scale(dpr, dpr)
      this.cursorCtx.clearRect(0, 0, w, h)

      const xtermEl = parent.querySelector('.xterm') as HTMLElement
      if (!xtermEl) {
        this.cursorFrame = requestAnimationFrame(draw)
        return
      }
      const screenEl = xtermEl.querySelector('.xterm-screen') as HTMLElement
      if (!screenEl) {
        this.cursorFrame = requestAnimationFrame(draw)
        return
      }
      const rowsEl = screenEl.querySelector('.xterm-rows') as HTMLElement
      if (!rowsEl) {
        this.cursorFrame = requestAnimationFrame(draw)
        return
      }

      const rowsStyle = window.getComputedStyle(rowsEl)
      const fontSize = parseFloat(rowsStyle.fontSize) || 12
      const metrics = this.measure(fontSize)

      const cx = this.cursorX * metrics.charWidth
      const cy = this.cursorY * (fontSize * 1.45)

      const blinkOn = this.cursorBlink ? (Math.floor(performance.now() / 530) % 2 === 0) : true
      if (!blinkOn) {
        this.cursorFrame = requestAnimationFrame(draw)
        return
      }

      this.cursorCtx.save()
      this.cursorCtx.shadowColor = this.cursorColor
      this.cursorCtx.shadowBlur = 6
      this.cursorCtx.globalAlpha = 0.9
      this.cursorCtx.fillStyle = this.cursorColor
      this.cursorCtx.fillRect(cx, cy, metrics.charWidth, metrics.charHeight)

      this.cursorCtx.shadowBlur = 0
      this.cursorCtx.globalAlpha = 0.15
      this.cursorCtx.fillStyle = '#ffffff'
      this.cursorCtx.fillRect(cx + 1, cy + 1, metrics.charWidth - 2, 2)
      this.cursorCtx.restore()

      this.cursorFrame = requestAnimationFrame(draw)
    }
    this.cursorFrame = requestAnimationFrame(draw)
  }

  stopCursorLoop(): void {
    if (this.cursorFrame !== null) {
      cancelAnimationFrame(this.cursorFrame)
      this.cursorFrame = null
    }
    this.cursorVisible = false
  }

  clearCursor(): void {
    if (this.cursorCtx && this.cursorCanvas) {
      const w = this.cursorCanvas.offsetWidth
      const h = this.cursorCanvas.offsetHeight
      if (w > 0 && h > 0) {
        this.cursorCtx.clearRect(0, 0, w, h)
      }
    }
  }

  isolateMeasurementElements(container: HTMLElement): void {
    const helpers = container.querySelector('.xterm-helpers') as HTMLElement
    if (helpers) {
      helpers.style.position = 'absolute'
      helpers.style.top = '0'
      helpers.style.left = '0'
      helpers.style.zIndex = '-1'
      helpers.style.opacity = '0'
      helpers.style.pointerEvents = 'none'
      helpers.style.width = '100%'
    }
    const measureEl = container.querySelector('.xterm-char-measure-element') as HTMLElement
    if (measureEl) {
      measureEl.style.position = 'absolute'
      measureEl.style.visibility = 'hidden'
      measureEl.style.left = '-9999em'
      measureEl.style.display = 'inline-block'
    }
  }

  applyCanvasQuality(container: HTMLElement): void {
    const canvasEls = container.querySelectorAll('.xterm canvas') as NodeListOf<HTMLCanvasElement>
    for (const canvas of canvasEls) {
      canvas.style.imageRendering = 'auto'
    }
  }

  setFontFamily(family: string): void {
    this.fontFamily = family
  }

  destroy(): void {
    this.stopCursorLoop()
    if (this.cursorCanvas && this.cursorCanvas.parentNode) {
      this.cursorCanvas.parentNode.removeChild(this.cursorCanvas)
    }
    if (this.measureCanvas.parentNode) {
      this.measureCanvas.parentNode.removeChild(this.measureCanvas)
    }
  }
}
