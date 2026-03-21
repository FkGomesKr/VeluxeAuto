#!/usr/bin/env node
/**
 * Standardize & optimize full-size images in place (same path, no suffix).
 * Different from make-thumbnails.mjs: this targets originals you upload to Storage.
 *
 * Usage:
 *   node scripts/optimize-full-images.mjs ./car-1-0.jpg ./car-1-1.jpg
 *   npm run optimize-images -- ./folder/*.jpg
 *
 * Options:
 *   --max-width=1920   Max width (fit inside, keeps aspect). 0 = no limit.
 *   --max-height=1920  Max height. 0 = no limit.
 *   --no-resize        Only re-encode / strip metadata; no dimension change.
 *   --quality=85       JPEG quality (mozjpeg, progressive).
 *   --dry-run          Print actions only, do not write files.
 *
 * Writes via a temp file next to the original, then replaces it atomically.
 * Supports .jpg / .jpeg / .png (PNG stays PNG, optimized).
 */

import { readFile, rename, unlink, writeFile } from 'node:fs/promises'
import { basename, resolve } from 'node:path'
import sharp from 'sharp'

const DEFAULT_MAX_W = 1920
const DEFAULT_MAX_H = 1920
const DEFAULT_QUALITY = 85

function parseArgs(argv) {
  const paths = []
  let maxWidth = DEFAULT_MAX_W
  let maxHeight = DEFAULT_MAX_H
  let noResize = false
  let quality = DEFAULT_QUALITY
  let dryRun = false

  for (const arg of argv) {
    if (arg.startsWith('--max-width=')) {
      maxWidth = parseInt(arg.slice('--max-width='.length), 10)
      if (Number.isNaN(maxWidth)) maxWidth = DEFAULT_MAX_W
    } else if (arg.startsWith('--max-height=')) {
      maxHeight = parseInt(arg.slice('--max-height='.length), 10)
      if (Number.isNaN(maxHeight)) maxHeight = DEFAULT_MAX_H
    } else if (arg.startsWith('--quality=')) {
      quality = Math.min(100, Math.max(1, parseInt(arg.slice('--quality='.length), 10) || DEFAULT_QUALITY))
    } else if (arg === '--no-resize') {
      noResize = true
    } else if (arg === '--dry-run') {
      dryRun = true
    } else if (arg === '--help' || arg === '-h') {
      printHelp()
      process.exit(0)
    } else if (!arg.startsWith('-')) {
      paths.push(arg)
    }
  }

  return { paths, maxWidth, maxHeight, noResize, quality, dryRun }
}

function printHelp() {
  console.log(`
optimize-full-images.mjs — normalize & compress images, overwrite in place

  node scripts/optimize-full-images.mjs [options] <image> [image ...]

Options:
  --max-width=N    Default ${DEFAULT_MAX_W}. Use 0 for no width cap.
  --max-height=N   Default ${DEFAULT_MAX_H}. Use 0 for no height cap.
  --no-resize      Skip scaling (only JPEG/PNG re-encode + metadata strip).
  --quality=N      JPEG quality 1–100 (default ${DEFAULT_QUALITY}).
  --dry-run        Show what would run, no writes.

Defaults: fit inside max box, never upscale, EXIF auto-rotate, progressive JPEG.
`)
}

function isJpegPath(p) {
  const lower = p.toLowerCase()
  return lower.endsWith('.jpg') || lower.endsWith('.jpeg')
}

function isPngPath(p) {
  return p.toLowerCase().endsWith('.png')
}

async function optimizeInPlace(fsPath, { maxWidth, maxHeight, noResize, quality, dryRun }) {
  const name = basename(fsPath)
  if (!isJpegPath(fsPath) && !isPngPath(fsPath)) {
    throw new Error('only .jpg, .jpeg, .png supported')
  }

  const input = await readFile(fsPath)
  const meta = await sharp(input).metadata()

  let pipeline = sharp(input).rotate()

  if (!noResize && (maxWidth > 0 || maxHeight > 0)) {
    const w = maxWidth > 0 ? maxWidth : undefined
    const h = maxHeight > 0 ? maxHeight : undefined
    pipeline = pipeline.resize({
      width: w,
      height: h,
      fit: 'inside',
      withoutEnlargement: true,
    })
  }

  let outBuf
  if (isJpegPath(fsPath)) {
    outBuf = await pipeline.jpeg({ quality, mozjpeg: true, progressive: true }).toBuffer()
  } else {
    outBuf = await pipeline.png({ compressionLevel: 9, adaptiveFiltering: true }).toBuffer()
  }

  const before = input.length
  const after = outBuf.length
  const outMeta = await sharp(outBuf).metadata()
  const sizeLabel = `${meta.width}×${meta.height} → ${outMeta.width}×${outMeta.height}`

  if (dryRun) {
    return { name, before, after, dry: true, sizeLabel }
  }

  const tmpPath = `${fsPath}.optimize-tmp`
  const bakPath = `${fsPath}.bak`

  await writeFile(tmpPath, outBuf)
  try {
    await rename(fsPath, bakPath)
    try {
      await rename(tmpPath, fsPath)
    } catch (e) {
      await rename(bakPath, fsPath)
      throw e
    }
    await unlink(bakPath)
  } catch (e) {
    await unlink(tmpPath).catch(() => {})
    throw e
  }

  return { name, before, after, dry: false, sizeLabel }
}

async function main() {
  const opts = parseArgs(process.argv.slice(2))
  if (opts.paths.length === 0) {
    console.error('Error: pass at least one image path.\n')
    printHelp()
    process.exit(1)
  }

  let ok = 0
  let fail = 0

  for (const raw of opts.paths) {
    const fsPath = resolve(raw)
    try {
      const r = await optimizeInPlace(fsPath, opts)
      if (r.dry) {
        const pct = r.before > 0 ? ((1 - r.after / r.before) * 100).toFixed(1) : '0'
        console.log(
          `DRY ${r.name}  ${r.sizeLabel}  ${(r.before / 1024).toFixed(1)} → ${(r.after / 1024).toFixed(1)} KB (−${pct}%)`
        )
      } else {
        const pct = r.before > 0 ? ((1 - r.after / r.before) * 100).toFixed(1) : '0'
        console.log(
          `OK  ${r.name}  ${(r.before / 1024).toFixed(1)} KB → ${(r.after / 1024).toFixed(1)} KB (−${pct}%)`
        )
      }
      ok++
    } catch (e) {
      console.error(`FAIL ${raw}: ${e.message}`)
      fail++
    }
  }

  process.exit(fail > 0 ? 1 : 0)
}

main()
