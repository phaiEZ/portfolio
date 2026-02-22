import { Terminal } from "@/components/terminal"
import { Portfolio } from "@/components/portfolio"

export default function Page() {
  return (
    <main className="min-h-svh flex flex-col items-center px-4 py-12 md:py-20">

      <div className="w-full flex items-center justify-center min-h-[70vh]">
        <Terminal />
      </div>


      <div className="mt-12 mb-16 flex flex-col items-center gap-2">
        <span className="text-xs text-muted-foreground tracking-widest uppercase">
          Scroll down
        </span>
        <div className="w-px h-8 bg-border" />
      </div>


      <Portfolio />
      {/* Footer */}
      <footer className="mt-20 mb-4 text-center">
        <p className="text-xs text-muted-foreground tracking-wide">
          {"phaiez.dev"}
        </p>
      </footer>
    </main>
  )
}
