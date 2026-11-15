"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { login, logout, requireAdmin } from "@/lib/auth"
import { listWorks, replaceWorks } from "@/lib/db"
import { cleanupImages, deleteImage, imageExists, MAX_IMAGES, saveImage, UploadError } from "@/lib/images"
import { IMAGE_NAME, safeHttpsUrl } from "@/lib/links"
import { saveProfile } from "@/lib/profile"
import { profileSchema } from "@/lib/profile-schema"

export type FormState = { error?: string; ok?: string }

export async function loginAction(_: FormState, form: FormData): Promise<FormState> {
  const r = await login(String(form.get("password") ?? ""))
  if (r === "ok") redirect("/admin")
  if (r === "locked") return { error: "ล็อกอินผิดหลายครั้ง ลองใหม่ใน 15 นาที" }
  if (r === "disabled") return { error: "ยังไม่ได้ตั้ง ADMIN_PASSWORD (≥12 ตัว) / SESSION_SECRET (≥32 ตัว) บนเซิร์ฟเวอร์" }
  return { error: "รหัสผ่านไม่ถูกต้อง" }
}

export async function logoutAction() {
  await logout()
  redirect("/admin")
}

// Pictures are uploaded as soon as they're picked; the editor keeps the returned names until "save".
export async function uploadImagesAction(form: FormData): Promise<{ names?: string[]; error?: string }> {
  await requireAdmin()
  const files = form.getAll("images").filter((f): f is File => f instanceof File && f.size > 0)
  if (files.length === 0) return { error: "ไม่ได้เลือกรูป" }
  if (files.length > MAX_IMAGES) return { error: `เลือกได้ครั้งละไม่เกิน ${MAX_IMAGES} รูป` }
  const names: string[] = []
  try {
    for (const f of files) names.push(await saveImage(f))
    return { names }
  } catch (e) {
    await Promise.all(names.map(deleteImage))
    if (e instanceof UploadError) return { error: e.message }
    throw e
  }
}

const worksSchema = z
  .array(
    z.object({
      title: z.string().trim().min(1).max(120),
      description: z.string().trim().max(1000),
      url: z
        .string()
        .trim()
        .refine((s) => safeHttpsUrl(s) !== null, "ลิงก์เว็บต้องขึ้นต้นด้วย https://")
        .transform((s) => safeHttpsUrl(s)!),
      images: z
        .array(z.string().regex(IMAGE_NAME))
        .min(1, "ต้องมีรูปอย่างน้อย 1 รูป")
        .max(MAX_IMAGES, `รูปได้สูงสุด ${MAX_IMAGES} รูป`),
    }),
  )
  .max(100)

const SECTION: Record<string, string> = {
  name: "ชื่อ",
  role: "ตำแหน่ง",
  about: "แนะนำตัว",
  siteDescription: "คำอธิบายเว็บ",
  skills: "Skills",
  experience: "Journey",
  projects: "Projects",
  contact: "Contact",
  footer: "footer",
  works: "Works",
}
const FIELD: Record<string, string> = {
  category: "หมวด",
  items: "รายการ",
  company: "บริษัท",
  role: "ตำแหน่ง",
  url: "ลิงก์",
  period: "ช่วงเวลา",
  description: "รายละเอียด",
  stack: "เทคโนโลยี",
  name: "ชื่อ",
  desc: "คำอธิบาย",
  title: "ชื่อผลงาน",
  images: "รูป",
  email: "อีเมล",
  linkedin: "LinkedIn",
  github: "GitHub",
}

function describe(issue: z.ZodIssue, prefix: string[] = []) {
  const parts = [...prefix, ...issue.path.map(String)]
  const where = parts
    .map((p, i) => (/^\d+$/.test(p) ? `#${Number(p) + 1}` : i === 0 ? (SECTION[p] ?? p) : (FIELD[p] ?? p)))
    .join(" › ")
  const msg =
    issue.code === "too_small" && issue.type === "string"
      ? "ห้ามว่าง"
      : issue.code === "too_big" && issue.type === "string"
        ? "ยาวเกินไป"
        : issue.message
  return `${where}: ${msg}`
}

// One save for the whole page: profile text + the works list (order = position on the page).
export async function saveAllAction(json: string): Promise<FormState> {
  await requireAdmin()
  let raw: { profile?: unknown; works?: unknown }
  try {
    raw = JSON.parse(json)
  } catch {
    return { error: "ข้อมูลเสียหาย ลองโหลดหน้าใหม่" }
  }
  const profile = profileSchema.safeParse(raw.profile)
  if (!profile.success) return { error: describe(profile.error.issues[0]) }
  const works = worksSchema.safeParse(raw.works)
  if (!works.success) return { error: describe(works.error.issues[0], ["works"]) }

  for (const w of works.data)
    for (const name of w.images) if (!(await imageExists(name))) return { error: `ไม่พบรูปของ "${w.title}" ลองอัปโหลดใหม่` }

  const before = listWorks().flatMap((w) => w.images)
  saveProfile(profile.data)
  replaceWorks(works.data)
  const used = new Set(works.data.flatMap((w) => w.images))
  await Promise.all(before.filter((n) => !used.has(n)).map(deleteImage)) // images removed from works
  await cleanupImages(used) // abandoned uploads older than a day
  revalidatePath("/")
  return { ok: "บันทึกแล้ว" }
}
