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
  fontWeight: number
  fontWeightBold: number
  tier: string
}

export interface GlyphSet {
  boxW: number
  boxH: number
  boxTop: number
  wideChars: number
  narrowChars: number
  cellRatio: number
}

export interface CursorState {
  x: number
  y: number
  visible: boolean
  blinking: boolean
}

interface Tier {
  min: number
  max: number
  fontSize: number
  lineHeight: number
  name: string
}

const TIERS: Tier[] = [
  { min: 0, max: 350, fontSize: 10, lineHeight: 1.12, name: 'compact' },
  { min: 350, max: 500, fontSize: 11, lineHeight: 1.12, name: 'snug' },
  { min: 500, max: 700, fontSize: 12, lineHeight: 1.12, name: 'classic' },
  { min: 700, max: 900, fontSize: 14, lineHeight: 1.12, name: 'spacious' },
  { min: 900, max: Infinity, fontSize: 16, lineHeight: 1.12, name: 'generous' },
]

export class PremiumRenderer {
  private measureCanvas: HTMLCanvasElement
  private measureCtx: CanvasRenderingContext2D | null = null
  private cursorCanvas: HTMLCanvasElement | null = null
  private cursorCtx: CanvasRenderingContext2D | null = null
  private cursorFrame: number | null = null
  private cursorState: CursorState = { x: 0, y: 0, visible: false, blinking: true }
  private cursorColor = '#d4a373'
  private artCanvas: HTMLCanvasElement | null = null
  private artCtx: CanvasRenderingContext2D | null = null
  private bgColor = '#0c0c12'
  private fontFamily: string
  private loadedFontSize = 12
  private fontLoadAttempted = false

  constructor() {
    this.fontFamily = "'JetBrains Mono', Consolas, 'Courier New', monospace"
    this.measureCanvas = document.createElement('canvas')
    this.measureCanvas.width = 512
    this.measureCanvas.height = 128
    this.measureCtx = this.measureCanvas.getContext('2d')
    this.prewarmFont()
  }

  private prewarmFont(): void {
    if (this.fontLoadAttempted || !this.measureCtx) return
    this.fontLoadAttempted = true
    const ctx = this.measureCtx
    ctx.font = `12px ${this.fontFamily}`
    ctx.measureText('WMmwix')
    ctx.font = `16px ${this.fontFamily}`
    ctx.measureText('WMmwix')
    this.loadedFontSize = 12
  }

  setCursorColor(color: string): void {
    this.cursorColor = color
  }

  setFontFamily(family: string): void {
    if (family !== this.fontFamily) {
      this.fontFamily = family
      this.prewarmFont()
    }
  }

  measure(fontSize: number): FontMetrics {
    const ctx = this.measureCtx
    if (!ctx) {
      return { charWidth: 9, charHeight: 18, baseline: 14, fontSize }
    }
    ctx.font = `${fontSize}px ${this.fontFamily}`
    ctx.textBaseline = 'alphabetic'

    const wMetrics = ctx.measureText('W')
    const mMetrics = ctx.measureText('M')
    const boxMetrics = ctx.measureText('█')
    const agMetrics = ctx.measureText('Ag')

    const ascent = agMetrics.actualBoundingBoxAscent
      || wMetrics.fontBoundingBoxAscent
      || fontSize * 0.8

    const descent = agMetrics.actualBoundingBoxDescent
      || wMetrics.fontBoundingBoxDescent
      || fontSize * 0.15

    const charWidth = Math.max(wMetrics.width, mMetrics.width, boxMetrics.width)
    const charHeight = ascent + descent
    const baseline = ascent

    return { charWidth, charHeight, baseline, fontSize }
  }

  calculateGlyphMetrics(fontSize: number): GlyphSet {
    const metrics = this.measure(fontSize)
    return {
      boxW: metrics.charWidth,
      boxH: metrics.charHeight,
      boxTop: metrics.baseline - metrics.charHeight,
      wideChars: metrics.charWidth,
      narrowChars: metrics.charWidth,
      cellRatio: metrics.charWidth / metrics.charHeight
    }
  }

  calculateOptimalSize(containerHeight: number, dpr: number): SizeProfile {
    const rawHeight = containerHeight
    const effectiveHeight = rawHeight * dpr
    let selected = TIERS[2]
    for (const tier of TIERS) {
      if (effectiveHeight >= tier.min * dpr && effectiveHeight < tier.max * dpr) {
        selected = tier
        break
      }
    }

    const baseFontSize = selected.fontSize

    let fontSize = baseFontSize
    if (rawHeight > baseFontSize * selected.lineHeight * 28) {
      const extra = Math.floor((rawHeight - baseFontSize * selected.lineHeight * 28) / (baseFontSize * selected.lineHeight))
      fontSize = Math.min(baseFontSize + Math.min(extra, 2), TIERS[TIERS.length - 1].fontSize)
    }
    if (rawHeight < baseFontSize * selected.lineHeight * 18) {
      fontSize = Math.max(baseFontSize - 1, TIERS[0].fontSize)
    }

    fontSize = Math.round(fontSize)
    fontSize = Math.max(TIERS[0].fontSize, Math.min(TIERS[TIERS.length - 1].fontSize, fontSize))

    const lineHeight = this.computeLineHeight(rawHeight, fontSize, selected)

    return {
      fontSize,
      lineHeight,
      letterSpacing: 0,
      fontWeight: 400,
      fontWeightBold: 600,
      tier: selected.name
    }
  }

  private computeLineHeight(containerHeight: number, fontSize: number, _tier: Tier): number {
    const targetRows = Math.round(containerHeight / (fontSize * 1.12))
    if (targetRows >= 30) return 1.12
    if (targetRows >= 24) return 1.12
    if (targetRows >= 18) return 1.14
    if (targetRows >= 12) return 1.16
    return 1.18
  }

  setBgColor(color: string): void {
    this.bgColor = color
  }

  createArtOverlay(container: HTMLElement): HTMLCanvasElement {
    if (this.artCanvas) {
      this.destroyArtCanvas()
    }
    const canvas = document.createElement('canvas')
    canvas.style.position = 'absolute'
    canvas.style.top = '0'
    canvas.style.left = '0'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.pointerEvents = 'none'
    canvas.style.zIndex = '10'
    container.appendChild(canvas)
    this.artCanvas = canvas
    this.artCtx = canvas.getContext('2d')
    return canvas
  }

  renderAsciiArt(
    lines: string[],
    scale: number,
    startRow: number,
    cellW: number,
    cellH: number,
    fontSize: number
  ): void {
    const ctx = this.artCtx
    const canvas = this.artCanvas
    if (!ctx || !canvas) return

    const parent = canvas.parentElement
    if (!parent) return

    const dpr = window.devicePixelRatio || 1
    const w = canvas.offsetWidth
    const h = canvas.offsetHeight

    if (w <= 0 || h <= 0) return

    const bw = Math.round(w * dpr)
    const bh = Math.round(h * dpr)

    if (canvas.width !== bw || canvas.height !== bh) {
      canvas.width = bw
      canvas.height = bh
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const metrics = this.measure(fontSize)
    const cellHtight = metrics.charHeight * 1.12
    const artH = Math.ceil(lines.length * cellHtight * scale)
    const topPad = 14
    const artY = startRow * cellHtight + topPad

    ctx.fillStyle = this.bgColor
    ctx.fillRect(0, startRow * cellHtight, w, artH + topPad + 6)

    const scaledSize = Math.max(6, Math.round(fontSize * scale))
    ctx.font = `${scaledSize}px ${this.fontFamily}`
    ctx.textBaseline = 'top'

    for (let i = 0; i < lines.length; i++) {
      const row = Math.floor(i * scale)
      if (row !== i || row > lines.length - 1) continue
      const line = lines[i]
      const ly = artY + row * cellHtight * scale

      ctx.fillStyle = '#e0e0e8'
      ctx.globalAlpha = 0.85
      ctx.fillText(line, 0, ly)
      ctx.globalAlpha = 1
    }
  }

  clearAsciiArt(): void {
    const ctx = this.artCtx
    const canvas = this.artCanvas
    if (!ctx || !canvas) return
    const dpr = window.devicePixelRatio || 1
    const w = canvas.offsetWidth
    const h = canvas.offsetHeight
    if (w <= 0 || h <= 0) return
    const bw = Math.round(w * dpr)
    const bh = Math.round(h * dpr)
    if (canvas.width !== bw || canvas.height !== bh) {
      canvas.width = bw
      canvas.height = bh
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)
  }

  createCursorOverlay(container: HTMLElement): HTMLCanvasElement {
    if (this.cursorCanvas) {
      this.destroyCursorCanvas()
    }
    const canvas = document.createElement('canvas')
    canvas.style.position = 'absolute'
    canvas.style.top = '0'
    canvas.style.left = '0'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.pointerEvents = 'none'
    canvas.style.zIndex = '15'
    container.appendChild(canvas)
    this.cursorCanvas = canvas
    this.cursorCtx = canvas.getContext('2d')
    return canvas
  }

  updateCursor(x: number, y: number, color: string): void {
    this.cursorState.x = x
    this.cursorState.y = y
    this.cursorColor = color
    if (!this.cursorState.visible) {
      this.cursorState.visible = true
      this.startCursorLoop()
    }
  }

  private startCursorLoop(): void {
    if (this.cursorFrame !== null) return

    const draw = () => {
      if (!this.cursorCanvas || !this.cursorCtx) {
        this.cursorFrame = null
        return
      }
      const parent = this.cursorCanvas.parentElement
      if (!parent) {
        this.cursorFrame = null
        return
      }

      const dpr = window.devicePixelRatio || 1
      const w = this.cursorCanvas.offsetWidth
      const h = this.cursorCanvas.offsetHeight

      if (w <= 0 || h <= 0) {
        this.cursorFrame = requestAnimationFrame(draw)
        return
      }

      const bw = Math.round(w * dpr)
      const bh = Math.round(h * dpr)

      if (this.cursorCanvas.width !== bw || this.cursorCanvas.height !== bh) {
        this.cursorCanvas.width = bw
        this.cursorCanvas.height = bh
      }

      const ctx = this.cursorCtx
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)

      const xtermEl = parent.querySelector('.xterm-screen') as HTMLElement
      if (!xtermEl) {
        this.cursorFrame = requestAnimationFrame(draw)
        return
      }

      const fontSize = parseInt(xtermEl.style.fontSize) || this.loadedFontSize || 12

      const cellW = Math.round(xtermEl.offsetWidth / 80)
      const cellH = Math.round(fontSize * 1.12)

      const cx = this.cursorState.x * cellW
      const cy = this.cursorState.y * cellH

      const blinkOn = this.cursorState.blinking
        ? (Math.floor(performance.now() / 530) % 2 === 0)
        : true

      if (blinkOn) {
        ctx.fillStyle = this.cursorColor
        ctx.globalAlpha = 0.88
        ctx.fillRect(cx, cy, cellW, cellH)
      }

      this.cursorFrame = requestAnimationFrame(draw)
    }
    this.cursorFrame = requestAnimationFrame(draw)
  }

  stopCursorLoop(): void {
    if (this.cursorFrame !== null) {
      cancelAnimationFrame(this.cursorFrame)
      this.cursorFrame = null
    }
    this.cursorState.visible = false
  }

  private destroyCursorCanvas(): void {
    this.stopCursorLoop()
    if (this.cursorCanvas && this.cursorCanvas.parentNode) {
      this.cursorCanvas.parentNode.removeChild(this.cursorCanvas)
    }
    this.cursorCanvas = null
    this.cursorCtx = null
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
      helpers.style.zIndex = '-5'
      helpers.style.opacity = '0'
      helpers.style.pointerEvents = 'none'
      helpers.style.width = '100%'
      helpers.style.overflow = 'hidden'
    }
    const measureEl = container.querySelector('.xterm-char-measure-element') as HTMLElement
    if (measureEl) {
      measureEl.style.position = 'absolute'
      measureEl.style.visibility = 'hidden'
      measureEl.style.left = '-99999px'
      measureEl.style.display = 'inline-block'
      measureEl.style.pointerEvents = 'none'
    }
  }

  applyCanvasQuality(container: HTMLElement): void {
    const list = container.querySelectorAll('.xterm canvas') as NodeListOf<HTMLCanvasElement>
    for (const canvas of list) {
      canvas.style.imageRendering = 'auto'
      const parent = canvas.parentElement
      if (parent) {
        parent.style.fontFeatureSettings = "'calt' 1, 'liga' 1"
        parent.style.fontVariantLigatures = 'contextual'
      }
    }
  }

  private destroyArtCanvas(): void {
    if (this.artCanvas && this.artCanvas.parentNode) {
      this.artCanvas.parentNode.removeChild(this.artCanvas)
    }
    this.artCanvas = null
    this.artCtx = null
  }

  destroy(): void {
    this.stopCursorLoop()
    this.destroyCursorCanvas()
    this.destroyArtCanvas()
    if (this.measureCanvas.parentNode) {
      this.measureCanvas.parentNode.removeChild(this.measureCanvas)
    }
  }
}
