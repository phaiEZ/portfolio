import { z } from "zod"
import { TERMINAL_DATA } from "./terminal-data"

// Everything on the page except the works, editable in /admin/profile. Pure module: safe for client components.

const text = (max: number) => z.string().trim().max(max)
const required = (max: number) => z.string().trim().min(1).max(max)

// links for experience/projects: http(s) only (some old company sites have no https)
const webUrl = z
  .string()
  .trim()
  .max(500)
  .refine((s) => {
    if (s === "") return true
    try {
      const u = new URL(s)
      return (u.protocol === "https:" || u.protocol === "http:") && !!u.hostname && !u.username && !u.password
    } catch {
      return false
    }
  }, "ลิงก์ต้องขึ้นต้นด้วย https:// หรือ http://")

// LinkedIn / GitHub are written without the scheme ("github.com/user") and shown as https://<value>
const bareLink = z
  .string()
  .trim()
  .max(200)
  .regex(/^$|^[a-z0-9-]+(\.[a-z0-9-]+)+(\/[A-Za-z0-9._~%\-\/]*)?$/i, "เขียนแบบ github.com/ชื่อ (ไม่ต้องมี https://)")

const tags = z.array(required(60)).max(40)

export const profileSchema = z.object({
  name: required(100),
  role: required(100),
  siteDescription: text(300),
  about: text(3000),
  skills: z.array(z.object({ category: required(60), items: tags })).max(20),
  experience: z
    .array(
      z.object({
        company: required(120),
        role: text(120),
        url: webUrl,
        period: text(60),
        description: text(2000),
        highlights: z.array(required(300)).max(20),
        stack: tags,
      }),
    )
    .max(30),
  projects: z.array(z.object({ name: required(120), desc: text(500), url: webUrl })).max(50),
  contact: z.object({
    email: z.union([z.literal(""), z.string().trim().email("อีเมลไม่ถูกต้อง").max(200)]),
    linkedin: bareLink,
    github: bareLink,
  }),
  footer: text(100),
})

export type Profile = z.infer<typeof profileSchema>

// first run: the content that used to be hardcoded in terminal-data.ts
export const DEFAULT_PROFILE: Profile = {
  name: TERMINAL_DATA.name,
  role: TERMINAL_DATA.role,
  siteDescription:
    "Full-Stack Software Engineer experienced in building scalable CRM, POS, and healthcare systems.",
  about: TERMINAL_DATA.about.join("\n"),
  skills: Object.entries(TERMINAL_DATA.skills).map(([category, items]) => ({ category, items: [...items] })),
  experience: TERMINAL_DATA.experience.map((e) => ({
    company: e.company,
    role: e.role,
    url: e.url,
    period: e.period.trim(),
    description: e.description,
    highlights: [...e.highlights],
    stack: [...e.stack],
  })),
  projects: TERMINAL_DATA.projects.map((p) => ({ ...p })),
  contact: { ...TERMINAL_DATA.contact },
  footer: "phaiez.dev",
}

// links rendered on the page are re-checked here, so a bad stored value is dropped instead of rendered
export function webHref(url: string): string | undefined {
  return webUrl.safeParse(url).success && url ? url : undefined
}
export function bareHref(link: string): string | undefined {
  return link && bareLink.safeParse(link).success ? `https://${link}` : undefined
}
