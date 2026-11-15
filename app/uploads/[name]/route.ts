import fs from "node:fs/promises"
import path from "node:path"
import { UPLOAD_DIR } from "@/lib/db"
import { IMAGE_NAME } from "@/lib/links"

// Serves uploaded work images. Names are server-generated <uuid>.webp and never reused, so they cache forever.
export async function GET(_: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  if (!IMAGE_NAME.test(name)) return new Response("Not found", { status: 404 })
  try {
    const body = await fs.readFile(path.join(UPLOAD_DIR, name))
    return new Response(body, {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch {
    return new Response("Not found", { status: 404 })
  }
}
