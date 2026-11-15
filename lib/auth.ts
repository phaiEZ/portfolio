import "server-only"
import crypto from "node:crypto"
import { cookies, headers } from "next/headers"

// One admin, password from the ADMIN_PASSWORD env var. The session is a signed cookie: "<expires>.<hmac>".
const COOKIE = "pf_admin"
const MAX_AGE = 60 * 60 * 12 // 12 hours

function secret() {
  const s = process.env.SESSION_SECRET
  return s && s.length >= 32 ? s : null
}

function sign(value: string, key: string) {
  return crypto.createHmac("sha256", key).update(value).digest("base64url")
}

function sameString(a: string, b: string) {
  const ha = crypto.createHash("sha256").update(a).digest()
  const hb = crypto.createHash("sha256").update(b).digest()
  return crypto.timingSafeEqual(ha, hb)
}

export async function isAdmin(): Promise<boolean> {
  const key = secret()
  if (!key) return false
  const raw = (await cookies()).get(COOKIE)?.value
  if (!raw) return false
  const [exp, mac] = raw.split(".")
  if (!exp || !mac || !/^\d+$/.test(exp) || Number(exp) < Date.now() / 1000) return false
  return sameString(mac, sign(exp, key))
}

export async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("unauthorized")
}

// Caddy sends exactly the visitor's address as X-Forwarded-For (its last entry); "local" in dev.
async function clientIp() {
  const xff = (await headers()).get("x-forwarded-for") || ""
  return xff.split(",").pop()?.trim() || "local"
}

// failed logins per IP: 5 in 15 minutes locks that IP out until the window ends
const WINDOW = 15 * 60 * 1000
const fails = new Map<string, { n: number; since: number }>()

export async function login(password: string): Promise<"ok" | "bad" | "locked" | "disabled"> {
  const key = secret()
  const expected = process.env.ADMIN_PASSWORD
  if (!key || !expected || expected.length < 12) return "disabled"
  const ip = await clientIp()
  const now = Date.now()
  const f = fails.get(ip)
  if (f && now - f.since > WINDOW) fails.delete(ip)
  if ((fails.get(ip)?.n ?? 0) >= 5) return "locked"
  if (!sameString(password, expected)) {
    const cur = fails.get(ip) ?? { n: 0, since: now }
    cur.n++
    fails.set(ip, cur)
    if (fails.size > 10_000) fails.clear() // memory cap
    return "bad"
  }
  fails.delete(ip)
  const exp = String(Math.floor(now / 1000) + MAX_AGE)
  ;(await cookies()).set(COOKIE, `${exp}.${sign(exp, key)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: MAX_AGE,
  })
  return "ok"
}

export async function logout() {
  ;(await cookies()).delete(COOKIE)
}
