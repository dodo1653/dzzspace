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

let sharedFontSize: number | null = null
let sharedLineHeight: number | null = null

export class PremiumRenderer {
  private measureCanvas: HTMLCanvasElement
  private measureCtx: CanvasRenderingContext2D | null = null
  private fontFamily: string
  private fontLoadAttempted = false

  constructor() {
    this.fontFamily = "'JetBrains Mono', Consolas, 'Courier New', monospace"
    this.measureCanvas = document.createElement('canvas')
    this.measureCanvas.width = 512
    this.measureCanvas.height = 128
    this.measureCtx = this.measureCanvas.getContext('2d')
    this.prewarmFont()
  }

  static resetSharedSize(): void {
    sharedFontSize = null
    sharedLineHeight = null
  }

  private prewarmFont(): void {
    if (this.fontLoadAttempted || !this.measureCtx) return
    this.fontLoadAttempted = true
    const ctx = this.measureCtx
    ctx.font = `12px ${this.fontFamily}`
    ctx.measureText('WMmwixAg')
    ctx.font = `16px ${this.fontFamily}`
    ctx.measureText('WMmwixAg')
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

  calculateOptimalSize(containerHeight: number, dpr: number): SizeProfile {
    if (containerHeight <= 0) {
      return {
        fontSize: sharedFontSize !== null ? sharedFontSize : 12,
        lineHeight: sharedLineHeight !== null ? sharedLineHeight : 1.12,
        letterSpacing: 0,
        fontWeight: 400,
        fontWeightBold: 600,
        tier: 'inactive'
      }
    }

    if (sharedFontSize !== null && sharedLineHeight !== null) {
      return {
        fontSize: sharedFontSize,
        lineHeight: sharedLineHeight,
        letterSpacing: 0,
        fontWeight: 400,
        fontWeightBold: 600,
        tier: 'shared'
      }
    }

    const effectiveHeight = containerHeight * dpr
    let selected = TIERS[2]
    for (const tier of TIERS) {
      if (effectiveHeight >= tier.min * dpr && effectiveHeight < tier.max * dpr) {
        selected = tier
        break
      }
    }

    const baseFontSize = selected.fontSize
    let fontSize = baseFontSize
    if (containerHeight > baseFontSize * 1.12 * 28) {
      const extra = Math.floor((containerHeight - baseFontSize * 1.12 * 28) / (baseFontSize * 1.12))
      fontSize = Math.min(baseFontSize + Math.min(extra, 2), TIERS[TIERS.length - 1].fontSize)
    }
    if (containerHeight < baseFontSize * 1.12 * 18) {
      fontSize = Math.max(baseFontSize - 1, TIERS[0].fontSize)
    }
    fontSize = Math.round(fontSize)
    fontSize = Math.max(TIERS[0].fontSize, Math.min(TIERS[TIERS.length - 1].fontSize, fontSize))

    const lineHeight = this.computeLineHeight(containerHeight, fontSize)

    sharedFontSize = fontSize
    sharedLineHeight = lineHeight

    return {
      fontSize,
      lineHeight,
      letterSpacing: 0,
      fontWeight: 400,
      fontWeightBold: 600,
      tier: selected.name
    }
  }

  private computeLineHeight(_containerHeight: number, _fontSize: number): number {
    return 1.12
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

  destroy(): void {
    if (this.measureCanvas.parentNode) {
      this.measureCanvas.parentNode.removeChild(this.measureCanvas)
    }
  }
}
