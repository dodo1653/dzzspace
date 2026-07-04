export interface ArtBlock {
  startRow: number
  endRow: number
  lines: string[]
  score: number
}

export interface ArtPresentation {
  blocks: ArtBlock[]
  scale: number
  collapsed: boolean
}

const BOX_DRAWING = new Set([
  '─', '│', '┌', '┐', '└', '┘', '├', '┤', '┬', '┴', '┼',
  '═', '║', '╒', '╓', '╔', '╕', '╖', '╗', '╘', '╙', '╚', '╛', '╜', '╝',
  '╞', '╟', '╠', '╡', '╢', '╣', '╤', '╥', '╦', '╧', '╨', '╩', '╪', '╫', '╬',
  '▀', '▄', '█', '▌', '▐', '▓', '▒', '░',
  '■', '□', '▪', '▫', '▲', '△', '▼', '▽', '◆', '◇', '○', '◎', '●',
  '◐', '◑', '◒', '◓', '★', '☆', '✦', '✧',
  '♠', '♣', '♥', '♦',
  '←', '↑', '→', '↓', '↔', '↕', '↖', '↗', '↘', '↙',
  '╭', '╮', '╯', '╰',
  '▔', '▁', '▂', '▃', '▄', '▅', '▆', '▇', '█', '▉', '▊', '▋', '▌', '▍', '▎', '▏',
  '▐', '░', '▒', '▓', '▔', '▕', '▖', '▗', '▘', '▙', '▚', '▛', '▜', '▝', '▞', '▟',
  '🬀', '🬁', '🬂', '🬃',
  '─', '━', '│', '┃', '┄', '┅', '┆', '┇', '┈', '┉', '┊', '┋',
  '┌', '┍', '┎', '┏', '┐', '┑', '┒', '┓',
  '└', '┕', '┖', '┗', '┘', '┙', '┚', '┛',
  '├', '┝', '┞', '┟', '┠', '┡', '┢', '┣',
  '┤', '┥', '┦', '┧', '┨', '┩', '┪', '┫',
  '┬', '┭', '┮', '┯', '┰', '┱', '┲', '┳',
  '┴', '┵', '┶', '┷', '┸', '┹', '┺', '┻',
  '┼', '┽', '┾', '┿', '╀', '╁', '╂', '╃', '╄', '╅', '╆', '╇', '╈', '╉', '╊', '╋',
  '╌', '╍', '╎', '╏',
  '═', '║', '╒', '╓', '╔', '╕', '╖', '╗',
  '╘', '╙', '╚', '╛', '╜', '╝', '╞', '╟',
  '╠', '╡', '╢', '╣', '╤', '╥', '╦', '╧',
  '╨', '╩', '╪', '╫', '╬',
  '╭', '╮', '╯', '╰',
  '╱', '╲', '╳', '╴', '╵', '╶', '╷', '╸', '╹', '╺', '╻', '╼', '╽', '╾', '╿',
  '▁', '▂', '▃', '▄', '▅', '▆', '▇', '█', '▉', '▊', '▋', '▌', '▍', '▎', '▏',
  '▐', '░', '▒', '▓', '▔', '▕', '▖', '▗', '▘', '▙', '▚', '▛', '▜', '▝', '▞', '▟',
  '▬', '▭', '▮', '▯',
  '☰', '☱', '☲', '☳', '☴', '☵', '☶', '☷',
  '⡀', '⡁', '⡂', '⡃', '⡄', '⡅', '⡆', '⡇', '⡈', '⡉', '⡊', '⡋', '⡌', '⡍', '⡎', '⡏',
  '⡐', '⡑', '⡒', '⡓', '⡔', '⡕', '⡖', '⡗', '⡘', '⡙', '⡚', '⡛', '⡜', '⡝', '⡞', '⡟',
  '⡠', '⡡', '⡢', '⡣', '⡤', '⡥', '⡦', '⡧', '⡨', '⡩', '⡪', '⡫', '⡬', '⡭', '⡮', '⡯',
  '⡰', '⡱', '⡲', '⡳', '⡴', '⡵', '⡶', '⡷', '⡸', '⡹', '⡺', '⡻', '⡼', '⡽', '⡾', '⡿',
  '⢀', '⢁', '⢂', '⢃', '⢄', '⢅', '⢆', '⢇', '⢈', '⢉', '⢊', '⢋', '⢌', '⢍', '⢎', '⢏',
  '⢐', '⢑', '⢒', '⢓', '⢔', '⢕', '⢖', '⢗', '⢘', '⢙', '⢚', '⢛', '⢜', '⢝', '⢞', '⢟',
  '⢠', '⢡', '⢢', '⢣', '⢤', '⢥', '⢦', '⢧', '⢨', '⢩', '⢪', '⢫', '⢬', '⢭', '⢮', '⢯',
  '⢰', '⢱', '⢲', '⢳', '⢴', '⢵', '⢶', '⢷', '⢸', '⢹', '⢺', '⢻', '⢼', '⢽', '⢾', '⢿',
  '⣀', '⣁', '⣂', '⣃', '⣄', '⣅', '⣆', '⣇', '⣈', '⣉', '⣊', '⣋', '⣌', '⣍', '⣎', '⣏',
  '⣐', '⣑', '⣒', '⣓', '⣔', '⣕', '⣖', '⣗', '⣘', '⣙', '⣚', '⣛', '⣜', '⣝', '⣞', '⣟',
  '⣠', '⣡', '⣢', '⣣', '⣤', '⣥', '⣦', '⣧', '⣨', '⣩', '⣪', '⣫', '⣬', '⣭', '⣮', '⣯',
  '⣰', '⣱', '⣲', '⣳', '⣴', '⣵', '⣶', '⣷', '⣸', '⣹', '⣺', '⣻', '⣼', '⣽', '⣾', '⣿',
])

const REPEATED_PATTERN = /^(.)\1{3,}$/
const BANNER_KEYWORDS = ['welcome', 'version', 'starting', 'initializing', 'loading']

function isArtLine(text: string): number {
  const trimmed = text.trimEnd()
  if (trimmed.length < 3) return 0

  const nonSpace = [...trimmed].filter(c => c !== ' ' && c !== '\t')

  if (nonSpace.length === 0) return 0

  let boxCount = 0
  let repeatCount = 0
  let decorCount = 0
  let alphaCount = 0

  for (let i = 0; i < nonSpace.length; i++) {
    const ch = nonSpace[i]
    if (BOX_DRAWING.has(ch)) {
      boxCount++
      continue
    }
    if (i > 0 && ch === nonSpace[i - 1]) {
      repeatCount++
      continue
    }
    if (/[a-zA-Z0-9]/.test(ch)) {
      alphaCount++
    } else {
      decorCount++
    }
  }

  const specialScore = (boxCount * 3 + repeatCount * 2 + decorCount) / nonSpace.length
  const alphaRatio = alphaCount / nonSpace.length

  if (specialScore > 0.4 && alphaRatio < 0.3) return specialScore
  if (specialScore > 0.6) return specialScore
  if (nonSpace.length > 15 && alphaRatio < 0.15 && specialScore > 0.3) return specialScore
  return 0
}

export function scanForArtBlocks(
  getLine: (y: number) => string | undefined,
  viewportY: number,
  visibleRows: number
): ArtPresentation {
  const scored: { index: number; score: number; text: string }[] = []

  for (let i = 0; i < visibleRows; i++) {
    const y = viewportY + i
    const line = getLine(y)
    if (!line) {
      scored.push({ index: i, score: 0, text: '' })
      continue
    }
    const score = isArtLine(line)
    scored.push({ index: i, score, text: line })
  }

  const blocks: ArtBlock[] = []
  let inBlock = false
  let blockStart = 0
  let blockLines: string[] = []
  let blockScores: number[] = []

  for (const s of scored) {
    if (s.score > 0.3) {
      if (!inBlock) {
        inBlock = true
        blockStart = s.index
        blockLines = []
        blockScores = []
      }
      blockLines.push(s.text)
      blockScores.push(s.score)
    } else {
      if (inBlock && blockLines.length >= 3) {
        blocks.push({
          startRow: blockStart,
          endRow: s.index - 1,
          lines: blockLines,
          score: blockScores.reduce((a, b) => a + b, 0) / blockScores.length
        })
      }
      inBlock = false
      blockLines = []
      blockScores = []
    }
  }

  if (inBlock && blockLines.length >= 3) {
    blocks.push({
      startRow: blockStart,
      endRow: scored[scored.length - 1].index,
      lines: blockLines,
      score: blockScores.reduce((a, b) => a + b, 0) / blockScores.length
    })
  }

  const scale = getScale(visibleRows)
  const collapsed = visibleRows < 12 && blocks.length > 0

  return { blocks, scale, collapsed }
}

function getScale(rows: number): number {
  if (rows >= 30) return 1.0
  if (rows >= 25) return 0.85
  if (rows >= 18) return 0.75
  if (rows >= 12) return 0.65
  return 0.50
}

export function getCollapsedHeader(lines: string[]): string[] {
  const relevant = lines.filter(l => l.trim().length > 0)
  for (const line of relevant) {
    const words = line.trim().split(/\s+/)
    const meaningful = words.filter(w => w.length > 1 && !BOX_DRAWING.has(w[0]))
    if (meaningful.length >= 2) {
      return [meaningful.slice(0, 3).join(' ') + '  ...']
    }
  }
  return ['CLI  ...']
}

export function getArtDimensions(lines: string[], scale: number): { width: number; height: number } {
  const w = Math.max(...lines.map(l => l.length))
  const h = Math.ceil(lines.length * scale)
  return { width: Math.ceil(w * scale), height: h }
}
