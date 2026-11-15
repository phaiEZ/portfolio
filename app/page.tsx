import type { Metadata } from "next"
import { Terminal } from "@/components/terminal"
import { Portfolio } from "@/components/portfolio"
import { listWorks } from "@/lib/db"
import { getProfile } from "@/lib/profile"
import { ProfileProvider } from "@/components/profile-context"

// works come from the database, so render on each request
export const dynamic = "force-dynamic"

export function generateMetadata(): Metadata {
  const p = getProfile()
  return { title: `${p.name} — ${p.role}`, description: p.siteDescription || undefined }
}

export default function Page() {
  const profile = getProfile()
  const works = listWorks().map(({ id, title, description, url, images }) => ({ id, title, description, url, images }))
  return (
    <main className="min-h-svh flex flex-col items-center px-4 py-12 md:py-20">

      <div className="w-full flex items-center justify-center min-h-[70vh]">
        <ProfileProvider profile={profile}>
          <Terminal />
        </ProfileProvider>
      </div>


      <div className="mt-12 mb-16 flex flex-col items-center gap-2">
        <span className="text-xs text-muted-foreground tracking-widest uppercase">
          Scroll down
        </span>
        <div className="w-px h-8 bg-border" />
      </div>


      <Portfolio profile={profile} works={works} />
      {/* Footer */}
      <footer className="mt-20 mb-4 text-center">
        <p className="text-xs text-muted-foreground tracking-wide">
          {profile.footer}
        </p>
      </footer>
    </main>
  )
}
