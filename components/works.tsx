"use client"

import { useState } from "react"
import { ArrowUpRight } from "lucide-react"
import { imageUrl, safeHttpsUrl } from "@/lib/links"

export type PublicWork = { id: number; title: string; description: string; url: string; images: string[] }

function WorkCard({ work }: { work: PublicWork }) {
  const [current, setCurrent] = useState(0)
  const images = work.images.map(imageUrl).filter(Boolean)
  const href = safeHttpsUrl(work.url) // re-checked on render, a bad link is simply not shown
  return (
    <article className="overflow-hidden rounded-xl border border-border bg-card">
      {images.length > 0 && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={images[current] ?? images[0]}
          alt={work.title}
          loading="lazy"
          className="aspect-[16/10] w-full border-b border-border bg-muted object-cover"
        />
      )}
      <div className="space-y-3 p-4">
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setCurrent(i)}
                aria-label={`${work.title} image ${i + 1}`}
                className={`h-10 w-16 shrink-0 overflow-hidden rounded-md border ${
                  i === current ? "border-foreground" : "border-border opacity-60 hover:opacity-100"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-foreground">{work.title}</h3>
          {work.description && (
            <p className="whitespace-pre-line text-xs leading-relaxed text-muted-foreground">{work.description}</p>
          )}
        </div>
        {href && (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground hover:bg-accent"
          >
            Visit site
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </article>
  )
}

export function Works({ works }: { works: PublicWork[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {works.map((w) => (
        <WorkCard key={w.id} work={w} />
      ))}
    </div>
  )
}
