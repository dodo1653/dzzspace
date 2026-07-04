const fs = require('fs')
const zlib = require('zlib')

const SIZE = 256

function crc32(buf) {
  let crc = -1
  const table = []
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1)
    }
    table[n] = c
  }
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ -1) >>> 0
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const typeB = Buffer.from(type, 'ascii')
  const crcData = Buffer.concat([typeB, data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(crcData))
  return Buffer.concat([len, typeB, data, crc])
}

function getPNG(pixels) {
  const rawData = Buffer.alloc(SIZE * (SIZE * 4 + 1))
  for (let y = 0; y < SIZE; y++) {
    rawData[y * (SIZE * 4 + 1)] = 0
    for (let x = 0; x < SIZE; x++) {
      const i = (y * SIZE + x) * 4
      const offset = y * (SIZE * 4 + 1) + 1 + x * 4
      rawData[offset] = pixels[i]
      rawData[offset + 1] = pixels[i + 1]
      rawData[offset + 2] = pixels[i + 2]
      rawData[offset + 3] = pixels[i + 3]
    }
  }
  const compressed = zlib.deflateSync(rawData)

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(SIZE, 0)
  ihdr.writeUInt32BE(SIZE, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  return Buffer.concat([
    signature,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', compressed),
    pngChunk('IEND', Buffer.alloc(0))
  ])
}

function setPixel(pixels, x, y, r, g, b, a = 255) {
  if (x < 0 || x >= SIZE || y < 0 || y >= SIZE) return
  const i = (y * SIZE + x) * 4
  pixels[i] = r
  pixels[i + 1] = g
  pixels[i + 2] = b
  pixels[i + 3] = a
}

function fillRect(pixels, x1, y1, x2, y2, r, g, b, a = 255) {
  for (let y = y1; y <= y2; y++)
    for (let x = x1; x <= x2; x++)
      setPixel(pixels, x, y, r, g, b, a)
}

function drawRect(pixels, x1, y1, x2, y2, r, g, b, a = 255) {
  for (let x = x1; x <= x2; x++) {
    setPixel(pixels, x, y1, r, g, b, a)
    setPixel(pixels, x, y2, r, g, b, a)
  }
  for (let y = y1 + 1; y < y2; y++) {
    setPixel(pixels, x1, y, r, g, b, a)
    setPixel(pixels, x2, y, r, g, b, a)
  }
}

function getPixel(pixels, x, y) {
  const i = (y * SIZE + x) * 4
  return [pixels[i], pixels[i + 1], pixels[i + 2], pixels[i + 3]]
}

// === DRAW ICON ===
const pixels = Buffer.alloc(SIZE * SIZE * 4, 0)
const gold = [212, 163, 115]
const m = 28
const t = 4

const frameX1 = m
const frameY1 = m
const frameX2 = SIZE - m - 1
const frameY2 = SIZE - m - 1
const innerX1 = frameX1 + t
const innerY1 = frameY1 + t
const innerX2 = frameX2 - t
const innerY2 = frameY2 - t

// Outer frame
drawRect(pixels, frameX1, frameY1, frameX2, frameY2, ...gold, 220)

// Inner fill
fillRect(pixels, innerX1, innerY1, innerX2, innerY2, 12, 12, 18)

// Top bar
fillRect(pixels, innerX1 + 6, innerY1 + 6, innerX2 - 6, innerY1 + 6, ...gold, 100)

// Traffic dots
const dotY = innerY1 + 6
setPixel(pixels, innerX1 + 8, dotY, 227, 68, 86)
setPixel(pixels, innerX1 + 9, dotY, 227, 68, 86)
setPixel(pixels, innerX1 + 18, dotY, 234, 179, 8)
setPixel(pixels, innerX1 + 19, dotY, 234, 179, 8)
setPixel(pixels, innerX1 + 28, dotY, 34, 197, 94)
setPixel(pixels, innerX1 + 29, dotY, 34, 197, 94)

// Prompt "❯"
const promptY = innerY1 + 26
const promptX = innerX1 + 14
setPixel(pixels, promptX, promptY, ...gold, 200)
setPixel(pixels, promptX, promptY + 2, ...gold, 200)
setPixel(pixels, promptX, promptY + 4, ...gold, 200)
setPixel(pixels, promptX + 1, promptY + 1, ...gold, 200)
setPixel(pixels, promptX + 1, promptY + 3, ...gold, 200)
setPixel(pixels, promptX + 2, promptY + 2, ...gold, 200)

// "ls" command
const textX = promptX + 10
fillRect(pixels, textX, promptY, textX + 1, promptY, 224, 224, 232, 200)
fillRect(pixels, textX + 3, promptY, textX + 3, promptY + 4, 224, 224, 232, 100)
fillRect(pixels, textX + 3, promptY + 6, textX + 3, promptY + 6, 224, 224, 232, 100)

// Cursor block
fillRect(pixels, textX + 8, promptY, textX + 10, promptY + 6, ...gold, 180)

// Output line
fillRect(pixels, innerX1 + 14, promptY + 14, innerX1 + 30, promptY + 14, 140, 140, 155, 80)
fillRect(pixels, innerX1 + 14, promptY + 15, innerX1 + 24, promptY + 15, 140, 140, 155, 80)

// Corner pixel accents
fillRect(pixels, frameX1 - 3, frameY1 - 3, frameX1 - 1, frameY1 - 1, ...gold, 180)
fillRect(pixels, frameX2 + 1, frameY1 - 3, frameX2 + 3, frameY1 - 1, ...gold, 180)
fillRect(pixels, frameX1 - 3, frameY2 + 1, frameX1 - 1, frameY2 + 3, ...gold, 180)
fillRect(pixels, frameX2 + 1, frameY2 + 1, frameX2 + 3, frameY2 + 3, ...gold, 180)

// Highlight edges of frame
for (let x = frameX1; x <= frameX2; x++) {
  setPixel(pixels, x, frameY1, ...gold, 230)
  setPixel(pixels, x, frameY2, ...gold, 230)
}

// === GENERATE PNG DATA FOR ICO ===
const pngData = getPNG(pixels)

// === BUILD ICO FILE ===
// Header
const icoHeader = Buffer.alloc(6)
icoHeader.writeUInt16LE(0, 0)     // reserved
icoHeader.writeUInt16LE(1, 2)     // type = icon
icoHeader.writeUInt16LE(1, 4)     // count = 1

// Directory entry (16 bytes)
const dirEntry = Buffer.alloc(16)
dirEntry[0] = SIZE >= 256 ? 0 : SIZE    // width (0 = 256)
dirEntry[1] = SIZE >= 256 ? 0 : SIZE    // height (0 = 256)
dirEntry[2] = 0                          // colors
dirEntry[3] = 0                          // reserved
dirEntry[5] = 1                          // planes
dirEntry[7] = 32                         // bpp
dirEntry.writeUInt32LE(pngData.length, 8)   // image size
dirEntry.writeUInt32LE(22, 12)              // offset (header + dirEntry)

// Write ICO
const ico = Buffer.concat([icoHeader, dirEntry, pngData])
fs.writeFileSync('buildResources/icon.ico', ico)

// Also save PNG for reference
fs.writeFileSync('buildResources/icon.png', pngData)
console.log(`Generated icon.ico: ${(ico.length / 1024).toFixed(1)} KB (${SIZE}x${SIZE})`)
console.log(`Generated icon.png: ${(pngData.length / 1024).toFixed(1)} KB (${SIZE}x${SIZE})`)
