const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const SIZES = [16, 32, 48, 64, 128, 256]

async function generate() {
  const svg = fs.readFileSync('website/logo.svg', 'utf-8')

  // Generate 256x256 PNG for general use
  const png256 = await sharp(Buffer.from(svg))
    .resize(256, 256)
    .png()
    .toBuffer()

  fs.writeFileSync('buildResources/icon.png', png256)
  console.log(`Generated icon.png: ${(png256.length / 1024).toFixed(1)} KB (256x256)`)

  // Generate multi-size ICO
  // ICO stores images as either BMP or PNG data. Using PNG is supported by Windows Vista+.
  // We'll embed a 256x256 PNG inside the ICO for the best quality.
  const icoHeader = Buffer.alloc(6)
  icoHeader.writeUInt16LE(0, 0)    // reserved
  icoHeader.writeUInt16LE(1, 2)    // type = icon
  icoHeader.writeUInt16LE(1, 4)    // count = 1 (just the largest size)

  const dirEntry = Buffer.alloc(16)
  dirEntry[0] = 0    // 0 means 256 for width/height in ICO
  dirEntry[1] = 0    // 0 means 256
  dirEntry[2] = 0    // colors
  dirEntry[3] = 0    // reserved
  dirEntry[5] = 1    // planes
  dirEntry[7] = 32   // bpp
  dirEntry.writeUInt32LE(png256.length, 8)  // image size
  dirEntry.writeUInt32LE(22, 12)             // offset (header + dirEntry)

  const ico = Buffer.concat([icoHeader, dirEntry, png256])
  fs.writeFileSync('buildResources/icon.ico', ico)
  console.log(`Generated icon.ico: ${(ico.length / 1024).toFixed(1)} KB (256x256)`)

  // Generate smaller PNGs for various use cases
  for (const size of SIZES) {
    if (size === 256) continue
    const buf = await sharp(Buffer.from(svg))
      .resize(size, size)
      .png()
      .toBuffer()
    fs.writeFileSync(`buildResources/icon-${size}.png`, buf)
  }
  console.log('Generated smaller icons for sizes:', SIZES.filter(s => s !== 256).join(', '))
}

generate().catch(err => {
  console.error('Failed:', err)
  process.exit(1)
})
