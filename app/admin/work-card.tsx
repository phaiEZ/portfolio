"use client"

import { useRef, useState } from "react"
import { ArrowUpRight, ImagePlus, Loader2, Pencil, Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { imageUrl, safeHttpsUrl } from "@/lib/links"
import { uploadImagesAction } from "./actions"
import { Area, RemoveButton, Text, Tools } from "./fields"
import { Grip, Sortable, type Handle } from "./sortable"

export type DraftWork = { _k: string; title: string; description: string; url: string; images: string[] }

const MAX = 6
const ACCEPT = "image/jpeg,image/png,image/webp,image/avif"

export function WorkCard({
  work,
  onChange,
  onRemove,
  handle,
  dragging,
}: {
  work: DraftWork
  onChange: (w: DraftWork) => void
  onRemove: () => void
  handle: Handle
  dragging: boolean
}) {
  const [current, setCurrent] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [dropping, setDropping] = useState(false)
  const addInput = useRef<HTMLInputElement>(null)
  const replaceInput = useRef<HTMLInputElement>(null)
  const images = work.images
  const shown = Math.min(current, Math.max(images.length - 1, 0))
  const href = safeHttpsUrl(work.url)

  async function upload(files: File[]): Promise<string[] | null> {
    if (files.length === 0) return null
    setBusy(true)
    setError("")
    try {
      const form = new FormData()
      files.forEach((f) => form.append("images", f))
      const r = await uploadImagesAction(form)
      if (r.error || !r.names) {
        setError(r.error ?? "อัปโหลดไม่สำเร็จ")
        return null
      }
      return r.names
    } catch {
      setError("อัปโหลดไม่สำเร็จ (ไฟล์ใหญ่เกินหรือเน็ตหลุด)")
      return null
    } finally {
      setBusy(false)
    }
  }

  async function add(files: File[]) {
    const room = MAX - images.length
    if (room <= 0) return setError(`รูปได้สูงสุด ${MAX} รูป`)
    const names = await upload(files.slice(0, room))
    if (names) {
      onChange({ ...work, images: [...images, ...names] })
      setCurrent(images.length) // show the first new picture
    }
  }

  async function replace(file: File | undefined) {
    if (!file) return
    const names = await upload([file])
    if (names) onChange({ ...work, images: images.map((n, i) => (i === shown ? names[0] : n)) })
  }

  function removeImage(i: number) {
    onChange({ ...work, images: images.filter((_, k) => k !== i) })
    setCurrent(Math.max(0, i - 1))
  }

  const imageButton =
    "flex items-center gap-1.5 rounded-lg bg-background/90 px-2.5 py-1.5 text-xs text-foreground shadow-sm backdrop-blur hover:bg-background"

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-card transition-shadow",
        dragging && "shadow-xl ring-1 ring-foreground/10",
      )}
    >
      <Tools className="absolute left-2 top-2 z-10">
        <Grip handle={handle} label="ลากเพื่อย้ายผลงาน" />
        <RemoveButton
          label="ลบผลงานนี้"
          onClick={() => {
            if (confirm(`ลบผลงาน "${work.title || "ไม่มีชื่อ"}" ?`)) onRemove()
          }}
        />
      </Tools>

      {/* main picture: change / delete buttons, or drop files here */}
      <div
        className={cn("relative aspect-[16/10] w-full border-b border-border bg-muted", dropping && "ring-2 ring-inset ring-foreground/40")}
        onDragOver={(e) => {
          if (!e.dataTransfer.types.includes("Files")) return
          e.preventDefault()
          setDropping(true)
        }}
        onDragLeave={() => setDropping(false)}
        onDrop={(e) => {
          if (!e.dataTransfer.files.length) return
          e.preventDefault()
          setDropping(false)
          add([...e.dataTransfer.files])
        }}
      >
        {images.length > 0 ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl(images[shown])} alt={work.title} className="h-full w-full object-cover" />
            {shown === 0 && (
              <span className="absolute bottom-2 left-2 rounded-md bg-background/90 px-2 py-0.5 text-[10px] text-muted-foreground">
                รูปปก
              </span>
            )}
            <div className="absolute bottom-2 right-2 flex gap-1.5">
              <button type="button" className={imageButton} onClick={() => replaceInput.current?.click()} disabled={busy}>
                <Pencil className="h-3.5 w-3.5" /> เปลี่ยนรูป
              </button>
              <button
                type="button"
                className={cn(imageButton, "text-red-600")}
                onClick={() => removeImage(shown)}
                disabled={busy}
              >
                <Trash2 className="h-3.5 w-3.5" /> ลบรูป
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => addInput.current?.click()}
            className="flex h-full w-full flex-col items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <ImagePlus className="h-6 w-6" />
            คลิกหรือลากรูปมาวางเพื่อเพิ่มรูป
          </button>
        )}
        {busy && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 text-xs">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> กำลังอัปโหลด…
          </div>
        )}
      </div>

      <input
        ref={addInput}
        type="file"
        accept={ACCEPT}
        multiple
        hidden
        onChange={(e) => {
          add([...(e.target.files ?? [])])
          e.target.value = ""
        }}
      />
      <input
        ref={replaceInput}
        type="file"
        accept={ACCEPT}
        hidden
        onChange={(e) => {
          replace(e.target.files?.[0])
          e.target.value = ""
        }}
      />

      <div className="space-y-3 p-4">
        {/* thumbnails: click to pick, drag to reorder (first = cover), + to add */}
        {images.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <Sortable
              items={images}
              getId={(n) => n}
              layout="horizontal"
              className="flex gap-2"
              onChange={(next) => {
                const cur = images[shown]
                onChange({ ...work, images: next })
                setCurrent(Math.max(0, next.indexOf(cur)))
              }}
            >
              {(name, i, h) => (
                <button
                  type="button"
                  {...h}
                  onClick={() => setCurrent(i)}
                  title="คลิกเพื่อดู ลากเพื่อสลับลำดับ (รูปแรก = ปก)"
                  className={cn(
                    "h-10 w-16 shrink-0 cursor-grab touch-none overflow-hidden rounded-md border",
                    i === shown ? "border-foreground" : "border-border opacity-60 hover:opacity-100",
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageUrl(name)} alt="" className="pointer-events-none h-full w-full object-cover" />
                </button>
              )}
            </Sortable>
            {images.length < MAX && (
              <button
                type="button"
                onClick={() => addInput.current?.click()}
                disabled={busy}
                title="เพิ่มรูป"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-dashed border-border text-muted-foreground hover:text-foreground"
              >
                <Plus className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
        {error && <p className="text-xs text-red-600">{error}</p>}

        <div className="space-y-1">
          <Text
            value={work.title}
            onChange={(v) => onChange({ ...work, title: v })}
            placeholder="ชื่อผลงาน"
            className="text-sm font-medium text-foreground"
          />
          <Area
            value={work.description}
            onChange={(v) => onChange({ ...work, description: v })}
            placeholder="คำอธิบายสั้น ๆ"
            className="text-xs leading-relaxed text-muted-foreground"
          />
        </div>

        <div className="flex items-center gap-2">
          <Text
            value={work.url}
            onChange={(v) => onChange({ ...work, url: v })}
            placeholder="https://ลิงก์เว็บจริง"
            invalid={work.url !== "" && !href}
            className="flex-1 text-xs text-muted-foreground"
          />
          <a
            href={href ?? undefined}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!href}
            className={cn(
              "inline-flex shrink-0 items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground hover:bg-accent",
              !href && "pointer-events-none opacity-40",
            )}
          >
            Visit site
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </article>
  )
}
