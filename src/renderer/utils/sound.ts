let ctx: AudioContext | null = null

function getCtx() {
  if (!ctx) {
    ctx = new AudioContext()
  }
  if (ctx.state === 'suspended') {
    ctx.resume()
  }
  return ctx
}

function playTone(freq: number, endFreq: number, duration: number, volume: number) {
  try {
    const c = getCtx()
    const osc = c.createOscillator()
    const gain = c.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, c.currentTime)
    osc.frequency.exponentialRampToValueAtTime(endFreq, c.currentTime + duration)

    gain.gain.setValueAtTime(volume, c.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration)

    osc.connect(gain)
    gain.connect(c.destination)

    osc.start(c.currentTime)
    osc.stop(c.currentTime + duration)
  } catch {
  }
}

export function playClick() {
  playTone(900, 500, 0.035, 0.06)
}

export function playHover() {
  playTone(1200, 800, 0.02, 0.02)
}

export function playSwitch() {
  playTone(700, 500, 0.05, 0.05)
}

export function playCreate() {
  playTone(600, 900, 0.06, 0.05)
}

export function playDelete() {
  playTone(500, 200, 0.06, 0.04)
}

export function playLayoutChange() {
  playTone(500, 700, 0.04, 0.04)
}
