const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const SIZES = [16, 32, 48, 64, 128, 256, 512]

async function generate() {
  const src = fs.readFileSync('Shortcut logo.png')

  // Generate PNG sizes
  for (const size of SIZES) {
    if (size === 256) {
      const buf = await sharp(src).resize(256, 256).png().toBuffer()
      fs.writeFileSync('buildResources/icon.png', buf)
      console.log(`Generated icon.png: ${(buf.length / 1024).toFixed(1)} KB (256x256)`)
    } else if (size === 512) {
      const buf = await sharp(src).resize(512, 512).png().toBuffer()
      fs.writeFileSync('buildResources/icon-512.png', buf)
      console.log(`Generated icon-512.png: ${(buf.length / 1024).toFixed(1)} KB (512x512)`)
    } else {
      const buf = await sharp(src).resize(size, size).png().toBuffer()
      fs.writeFileSync(`buildResources/icon-${size}.png`, buf)
    }
  }
  console.log('Generated icons for sizes:', SIZES.join(', '))

  // Generate 256x256 ICO
  const png256 = await sharp(src).resize(256, 256).png().toBuffer()
  const icoHeader = Buffer.alloc(6)
  icoHeader.writeUInt16LE(0, 0)
  icoHeader.writeUInt16LE(1, 2)
  icoHeader.writeUInt16LE(1, 4)
  const dirEntry = Buffer.alloc(16)
  dirEntry[0] = 0
  dirEntry[1] = 0
  dirEntry[2] = 0
  dirEntry[3] = 0
  dirEntry[5] = 1
  dirEntry[7] = 32
  dirEntry.writeUInt32LE(png256.length, 8)
  dirEntry.writeUInt32LE(22, 12)
  const ico = Buffer.concat([icoHeader, dirEntry, png256])
  fs.writeFileSync('buildResources/icon.ico', ico)
  console.log(`Generated icon.ico: ${(ico.length / 1024).toFixed(1)} KB (256x256)`)
}

generate().catch(err => {
  console.error('Failed:', err)
  process.exit(1)
})
