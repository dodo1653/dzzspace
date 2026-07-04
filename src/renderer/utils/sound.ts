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

function noise(duration: number, volume: number, highpass = 2000, lowpass = 8000) {
  try {
    const c = getCtx()
    const sr = c.sampleRate
    const len = sr * duration
    const buf = c.createBuffer(1, len, sr)
    const data = buf.getChannelData(0)
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-3 * i / len)
    }
    const src = c.createBufferSource()
    src.buffer = buf

    const hp = c.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = highpass

    const lp = c.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = lowpass

    const gain = c.createGain()
    gain.gain.setValueAtTime(volume, c.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration)

    src.connect(hp)
    hp.connect(lp)
    lp.connect(gain)
    gain.connect(c.destination)

    src.start(c.currentTime)
    src.stop(c.currentTime + duration)
  } catch {}
}

function ring(freq: number, duration: number, volume: number) {
  try {
    const c = getCtx()
    const osc = c.createOscillator()
    const gain = c.createGain()

    osc.type = 'sine'
    osc.frequency.value = freq

    gain.gain.setValueAtTime(volume, c.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration)

    osc.connect(gain)
    gain.connect(c.destination)

    osc.start(c.currentTime)
    osc.stop(c.currentTime + duration)
  } catch {}
}

function transientClick(volume: number) {
  noise(0.004, volume, 3000, 10000)
  ring(4200, 0.006, volume * 0.5)
}

function softTic(volume: number) {
  noise(0.003, volume, 2000, 8000)
  ring(2800, 0.005, volume * 0.3)
}

function deepThump(volume: number) {
  noise(0.006, volume, 500, 4000)
  ring(600, 0.01, volume * 0.4)
}

export function playClick() {
  transientClick(0.4)
}

export function playHover() {
  softTic(0.12)
}

export function playSwitch() {
  softTic(0.3)
  setTimeout(() => softTic(0.2), 35)
}

export function playCreate() {
  deepThump(0.25)
  setTimeout(() => transientClick(0.3), 40)
}

export function playDelete() {
  transientClick(0.35)
}

export function playLayoutChange() {
  noise(0.005, 0.25, 1000, 6000)
  ring(1800, 0.008, 0.2)
  setTimeout(() => {
    noise(0.004, 0.3, 2000, 8000)
    ring(3200, 0.006, 0.25)
  }, 50)
}

export function playWindowClose() {
  deepThump(0.2)
  setTimeout(() => transientClick(0.25), 30)
}

// --- Darker, more ambient sounds for landing screen ---

function lowThud(volume: number) {
  noise(0.008, volume, 100, 800)
  ring(150, 0.015, volume * 0.3)
}

function softMuffle(volume: number) {
  noise(0.005, volume, 200, 1500)
  ring(300, 0.008, volume * 0.2)
}

export function playLandingClick() {
  softMuffle(0.18)
}

export function playLandingHover() {
  noise(0.002, 0.05, 500, 2000)
}

export function playLandingSwitch() {
  lowThud(0.15)
  setTimeout(() => softMuffle(0.12), 30)
}

export function playLandingCreate() {
  lowThud(0.25)
  setTimeout(() => {
    noise(0.004, 0.15, 300, 2000)
    ring(500, 0.01, 0.12)
  }, 50)
}

export function playLandingDelete() {
  lowThud(0.18)
  noise(0.003, 0.1, 100, 600)
}
