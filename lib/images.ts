import "server-only"
import crypto from "node:crypto"
import fs from "node:fs/promises"
import path from "node:path"
import sharp from "sharp"
import { UPLOAD_DIR } from "./db"
import { IMAGE_NAME } from "./links"

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024 // per file, before compression
export const MAX_IMAGES = 6

// Decide the type from the file's first bytes, never from its name or the browser's MIME type.
// Only plain raster formats: no SVG (scripts), no GIF.
function sniff(b: Buffer): "jpeg" | "png" | "webp" | "avif" | null {
  if (b.length < 16) return null
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpeg"
  if (b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png"
  if (b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") return "webp"
  if (b.toString("ascii", 4, 8) === "ftyp" && ["avif", "avis"].includes(b.toString("ascii", 8, 12))) return "avif"
  return null
}

export class UploadError extends Error {}

// Validate, re-encode to WebP (≤1600px wide, metadata/EXIF dropped) and store under a random name.
export async function saveImage(file: File): Promise<string> {
  if (file.size === 0) throw new UploadError("ไฟล์ว่าง")
  if (file.size > MAX_UPLOAD_BYTES) throw new UploadError(`ไฟล์ ${file.name} ใหญ่เกิน 10 MB`)
  const input = Buffer.from(await file.arrayBuffer())
  if (!sniff(input)) throw new UploadError(`ไฟล์ ${file.name} ไม่ใช่รูป JPG / PNG / WebP / AVIF`)
  let out: Buffer
  try {
    out = await sharp(input, { limitInputPixels: 50_000_000, animated: false })
      .rotate() // apply EXIF orientation before the metadata is dropped
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer()
  } catch {
    throw new UploadError(`อ่านรูป ${file.name} ไม่ได้`)
  }
  const name = `${crypto.randomUUID()}.webp`
  await fs.writeFile(path.join(UPLOAD_DIR, name), out, { flag: "wx" })
  return name
}

export async function deleteImage(name: string) {
  if (!IMAGE_NAME.test(name)) return
  await fs.rm(path.join(UPLOAD_DIR, name), { force: true })
}

export async function imageExists(name: string) {
  if (!IMAGE_NAME.test(name)) return false
  try {
    await fs.access(path.join(UPLOAD_DIR, name))
    return true
  } catch {
    return false
  }
}

// After a save: drop images no work uses any more. Fresh uploads not saved yet are kept for a day
// (the editor uploads as soon as a picture is picked, before the owner presses save).
export async function cleanupImages(used: Set<string>) {
  const dayAgo = Date.now() - 24 * 60 * 60 * 1000
  for (const name of await fs.readdir(UPLOAD_DIR)) {
    if (!IMAGE_NAME.test(name) || used.has(name)) continue
    const st = await fs.stat(path.join(UPLOAD_DIR, name)).catch(() => null)
    if (st && st.mtimeMs < dayAgo) await deleteImage(name)
  }
}
