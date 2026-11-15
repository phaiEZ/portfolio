import "server-only"
import { db } from "./db"
import { DEFAULT_PROFILE, profileSchema, type Profile } from "./profile-schema"

export function getProfile(): Profile {
  const row = db().prepare("SELECT value FROM settings WHERE key = 'profile'").get() as { value: string } | undefined
  if (!row) return DEFAULT_PROFILE
  try {
    const parsed = profileSchema.safeParse(JSON.parse(row.value))
    return parsed.success ? parsed.data : DEFAULT_PROFILE
  } catch {
    return DEFAULT_PROFILE
  }
}

export function saveProfile(p: Profile) {
  db()
    .prepare("INSERT INTO settings (key, value) VALUES ('profile', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
    .run(JSON.stringify(p))
}
