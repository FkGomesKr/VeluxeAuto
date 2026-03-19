#!/usr/bin/env node
/**
 * Generate thumbnails for local images (run manually).
 *
 * Usage:
 *   node scripts/make-thumbnails.mjs ./car-1-0.jpg ./car-1-1.jpg
 *   node scripts/make-thumbnails.mjs --width 480 --quality 85 ./photos/*.jpg
 *   npm run thumbs -- ./my-folder/car-2-0.jpg
 *
 * For each input file writes: <name>-thumb.jpg next to the original
 * (e.g. car-1-0.jpg → car-1-0-thumb.jpg)
 *
 * For full-size originals (overwrite in place), see optimize-full-images.mjs
 *
 * Requires: npm install (adds sharp as devDependency)
 */

import { readFile, writeFile } from 'node:fs/promises'
import { basename, dirname, join, resolve } from 'node:path'
import sharp from 'sharp'

const DEFAULT_WIDTH = 640
const DEFAULT_QUALITY = 82

function parseArgs(argv) {
  const paths = []
  let width = DEFAULT_WIDTH
  let quality = DEFAULT_QUALITY

  for (const arg of argv) {
    if (arg.startsWith('--width=')) {
      width = Math.max(1, parseInt(arg.slice('--width='.length), 10) || DEFAULT_WIDTH)
    } else if (arg.startsWith('--quality=')) {
      quality = Math.min(100, Math.max(1, parseInt(arg.slice('--quality='.length), 10) || DEFAULT_QUALITY))
    } else if (arg === '--help' || arg === '-h') {
      printHelp()
      process.exit(0)
    } else if (!arg.startsWith('-')) {
      paths.push(arg)
    }
  }

  return { paths, width, quality }
}

function printHelp() {
  console.log(`
make-thumbnails.mjs — write JPEG thumbnails next to each input file

  node scripts/make-thumbnails.mjs [options] <image> [image ...]

Options:
  --width=N     Max width in px (default ${DEFAULT_WIDTH}), height scales, never upscales
  --quality=N   JPEG quality 1–100 (default ${DEFAULT_QUALITY})

Output:
  car-1-0.jpg  →  car-1-0-thumb.jpg  (same directory)
`)
}

function thumbPathFor(inputPath) {
  const base = basename(inputPath)
  const dot = base.lastIndexOf('.')
  const name = dot === -1 ? base : base.slice(0, dot)
  return join(dirname(inputPath), `${name}-thumb.jpg`)
}

async function makeThumb(inputPath, width, quality) {
  const outPath = thumbPathFor(inputPath)
  const buf = await readFile(inputPath)

  const pipeline = sharp(buf).rotate().resize({
    width,
    withoutEnlargement: true,
    fit: 'inside',
  })

  const jpeg = await pipeline.jpeg({ quality, mozjpeg: true }).toBuffer()
  await writeFile(outPath, jpeg)
  return { outPath, bytes: jpeg.length }
}

async function main() {
  const { paths, width, quality } = parseArgs(process.argv.slice(2))

  if (paths.length === 0) {
    console.error('Error: pass at least one image path.\n')
    printHelp()
    process.exit(1)
  }

  let ok = 0
  let fail = 0

  for (const raw of paths) {
    const fsPath = resolve(raw)

    try {
      const { outPath, bytes } = await makeThumb(fsPath, width, quality)
      console.log(`OK  ${raw} → ${outPath} (${(bytes / 1024).toFixed(1)} KB)`)
      ok++
    } catch (e) {
      console.error(`FAIL ${raw}: ${e.message}`)
      fail++
    }
  }

  process.exit(fail > 0 ? 1 : 0)
}

main()
