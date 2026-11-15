import "server-only"
import fs from "node:fs"
import path from "node:path"
import { DatabaseSync } from "node:sqlite"

// Everything the site writes lives in DATA_DIR (a Docker volume on the server): the SQLite file and uploads/.
export const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data")
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads")

export type Work = {
  id: number
  title: string
  description: string
  url: string
  images: string[]
  position: number
}

type Row = Omit<Work, "images"> & { images: string }

function open() {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
  const db = new DatabaseSync(path.join(DATA_DIR, "portfolio.db"))
  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS works (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      url TEXT NOT NULL,
      images TEXT NOT NULL DEFAULT '[]',
      position INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `)
  return db
}

// one connection per process (kept on globalThis so dev hot reload doesn't open a new one each time)
const g = globalThis as unknown as { __portfolioDb?: DatabaseSync }
export function db() {
  return (g.__portfolioDb ??= open())
}

function toWork(r: Row): Work {
  let images: string[] = []
  try {
    const parsed = JSON.parse(r.images)
    if (Array.isArray(parsed)) images = parsed.filter((x) => typeof x === "string")
  } catch {}
  return { id: r.id, title: r.title, description: r.description, url: r.url, position: r.position, images }
}

export function listWorks(): Work[] {
  const rows = db().prepare("SELECT id, title, description, url, images, position FROM works ORDER BY position, id").all()
  return (rows as unknown as Row[]).map(toWork)
}

// Saves the whole list from the admin editor in one go: the given order becomes the page order.
export function replaceWorks(works: { title: string; description: string; url: string; images: string[] }[]) {
  const conn = db()
  const insert = conn.prepare("INSERT INTO works (title, description, url, images, position) VALUES (?, ?, ?, ?, ?)")
  conn.exec("BEGIN")
  try {
    conn.exec("DELETE FROM works")
    works.forEach((w, i) => insert.run(w.title, w.description, w.url, JSON.stringify(w.images), i + 1))
    conn.exec("COMMIT")
  } catch (e) {
    conn.exec("ROLLBACK")
    throw e
  }
}
