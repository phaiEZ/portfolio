import type { Metadata } from "next"
import { isAdmin } from "@/lib/auth"
import { listWorks } from "@/lib/db"
import { getProfile } from "@/lib/profile"
import { Editor } from "./editor"
import { LoginForm } from "./forms"

export const metadata: Metadata = { title: "Admin — Portfolio", robots: { index: false, follow: false } }
export const dynamic = "force-dynamic"

export default async function AdminPage() {
  if (!(await isAdmin())) {
    return (
      <main className="flex min-h-svh items-center justify-center px-4">
        <div className="w-full max-w-xs space-y-6 rounded-xl border border-border bg-card p-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Admin</p>
            <h1 className="mt-1 text-lg font-medium">แก้ไขพอร์ตโฟลิโอ</h1>
          </div>
          <LoginForm />
        </div>
      </main>
    )
  }
  const works = listWorks().map(({ title, description, url, images }) => ({ title, description, url, images }))
  return <Editor profile={getProfile()} works={works} />
}
