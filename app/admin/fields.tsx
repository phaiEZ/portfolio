"use client"

import { useLayoutEffect, useRef, useState } from "react"
import { Plus, Trash2, X } from "lucide-react"
import { cn } from "@/lib/utils"

// Inputs that look like the page's own text until hovered or focused.
const inline =
  "w-full rounded-md bg-transparent px-1 -mx-1 outline-none transition-colors placeholder:text-muted-foreground/50 hover:bg-accent focus:bg-accent focus:ring-1 focus:ring-border"

export function Text({
  value,
  onChange,
  className,
  placeholder,
  invalid,
}: {
  value: string
  onChange: (v: string) => void
  className?: string
  placeholder?: string
  invalid?: boolean
}) {
  return (
    <input
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={cn(inline, invalid && "ring-1 ring-red-400", className)}
    />
  )
}

export function Area({
  value,
  onChange,
  className,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  className?: string
  placeholder?: string
}) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${el.scrollHeight}px`
  }, [value])
  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={cn(inline, "resize-none overflow-hidden", className)}
    />
  )
}

// a chip whose text is editable in place; its width follows the text
export function ChipInput({ value, onChange, className }: { value: string; onChange: (v: string) => void; className?: string }) {
  return (
    <input
      value={value}
      size={Math.max(value.length, 2)}
      onChange={(e) => onChange(e.target.value)}
      className={cn("bg-transparent outline-none", className)}
    />
  )
}

// "+ add" box at the end of a chip list: Enter or comma adds the chip
export function AddChip({ onAdd, placeholder = "+ เพิ่ม", className }: { onAdd: (v: string) => void; placeholder?: string; className?: string }) {
  const [v, setV] = useState("")
  function commit() {
    const t = v.trim()
    if (t) onAdd(t)
    setV("")
  }
  return (
    <input
      value={v}
      placeholder={placeholder}
      size={Math.max(v.length, placeholder.length)}
      onChange={(e) => {
        const next = e.target.value
        if (next.endsWith(",")) {
          setV(next.slice(0, -1))
          setTimeout(commit)
          return
        }
        setV(next)
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault()
          commit()
        }
      }}
      onBlur={commit}
      className={cn(
        "rounded-full border border-dashed border-border bg-transparent px-3 py-1 text-xs outline-none placeholder:text-muted-foreground focus:border-foreground/40",
        className,
      )}
    />
  )
}

export function RemoveButton({ onClick, label = "ลบ" }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background text-muted-foreground shadow-sm hover:border-red-300 hover:text-red-600"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  )
}

export function ChipX({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="ลบ"
      className="-mr-1 ml-1 rounded-full p-0.5 text-muted-foreground hover:bg-red-50 hover:text-red-600"
    >
      <X className="h-3 w-3" />
    </button>
  )
}

export function AddButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-3 text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
    >
      <Plus className="h-3.5 w-3.5" />
      {children}
    </button>
  )
}

// small toolbar (drag + delete) that sits on an item; always visible on touch screens, on hover elsewhere
export function Tools({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex gap-1 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100", className)}>
      {children}
    </div>
  )
}

export function Hint({ children }: { children: React.ReactNode }) {
  return <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">{children}</span>
}
