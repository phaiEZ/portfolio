"use client"

import { useCallback, useEffect, useState, useTransition } from "react"
import { Check, ExternalLink, Github, Linkedin, Loader2, LogOut, Mail } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Profile } from "@/lib/profile-schema"
import { logoutAction, saveAllAction } from "./actions"
import { AddButton, AddChip, Area, ChipInput, ChipX, Hint, RemoveButton, Text, Tools } from "./fields"
import { Grip, outsideInputs, Sortable } from "./sortable"
import { WorkCard, type DraftWork } from "./work-card"

// ---- editor state: the saved data plus a stable key on every list row (needed for drag & drop) ----
type Chip = { _k: string; v: string }
type Draft = Omit<Profile, "skills" | "experience" | "projects"> & {
  skills: { _k: string; category: string; items: Chip[] }[]
  experience: (Omit<Profile["experience"][number], "stack" | "highlights"> & { _k: string; stack: Chip[]; highlights: string })[]
  projects: (Profile["projects"][number] & { _k: string })[]
  works: DraftWork[]
}
type InitialWork = { title: string; description: string; url: string; images: string[] }

let seq = 0
const key = () => `k${++seq}`
const chips = (list: string[]) => list.map((v) => ({ _k: key(), v }))
const unchip = (list: Chip[]) => list.map((c) => c.v.trim()).filter(Boolean)

function toDraft(p: Profile, works: InitialWork[]): Draft {
  return {
    ...p,
    skills: p.skills.map((s) => ({ _k: key(), category: s.category, items: chips(s.items) })),
    experience: p.experience.map((e) => ({ ...e, _k: key(), stack: chips(e.stack), highlights: e.highlights.join("\n") })),
    projects: p.projects.map((x) => ({ ...x, _k: key() })),
    works: works.map((w) => ({ ...w, _k: key() })),
  }
}

function toPayload(d: Draft) {
  const profile: Profile = {
    name: d.name,
    role: d.role,
    siteDescription: d.siteDescription,
    about: d.about,
    footer: d.footer,
    contact: d.contact,
    skills: d.skills.map((s) => ({ category: s.category, items: unchip(s.items) })),
    experience: d.experience.map(({ _k, stack, highlights, ...e }) => ({
      ...e,
      stack: unchip(stack),
      highlights: highlights
        .split("\n")
        .map((h) => h.trim())
        .filter(Boolean),
    })),
    projects: d.projects.map(({ _k, ...x }) => x),
  }
  const works = d.works.map(({ _k, ...w }) => w)
  return JSON.stringify({ profile, works })
}

// ---- same building blocks as the public page ----
function SectionLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-6 flex items-baseline justify-between gap-4">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{children}</p>
      {hint && <Hint>{hint}</Hint>}
    </div>
  )
}
const Divider = () => <hr className="border-border" />

export function Editor({ profile, works }: { profile: Profile; works: InitialWork[] }) {
  const [d, setD] = useState<Draft>(() => toDraft(profile, works))
  const [dirty, setDirty] = useState(false)
  const [status, setStatus] = useState<{ error?: string; ok?: string }>({})
  const [saving, startSaving] = useTransition()

  const update = useCallback((fn: (draft: Draft) => void) => {
    setD((cur) => {
      const next = structuredClone(cur)
      fn(next)
      return next
    })
    setDirty(true)
    setStatus({})
  }, [])

  const save = useCallback(() => {
    startSaving(async () => {
      const r = await saveAllAction(toPayload(d))
      setStatus(r)
      if (r.ok) setDirty(false)
    })
  }, [d])

  // warn before leaving with unsaved changes; Ctrl/⌘+S saves
  useEffect(() => {
    const onLeave = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault()
    }
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault()
        if (!saving) save()
      }
    }
    window.addEventListener("beforeunload", onLeave)
    window.addEventListener("keydown", onKey)
    return () => {
      window.removeEventListener("beforeunload", onLeave)
      window.removeEventListener("keydown", onKey)
    }
  }, [dirty, save, saving])

  return (
    <>
      {/* admin bar */}
      <div className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-2.5">
          <span className="rounded-md bg-primary px-2 py-0.5 text-[10px] uppercase tracking-wider text-primary-foreground">
            Edit
          </span>
          <p className="hidden min-w-0 flex-1 truncate text-xs text-muted-foreground sm:block">
            คลิกข้อความเพื่อแก้ · ลาก ⠿ เพื่อย้าย · กดบันทึกเมื่อเสร็จ
          </p>
          <div className="ml-auto flex items-center gap-2">
            {status.error && <p className="max-w-56 truncate text-xs text-red-600" title={status.error}>{status.error}</p>}
            {status.ok && !dirty && (
              <p className="flex items-center gap-1 text-xs text-green-700">
                <Check className="h-3.5 w-3.5" /> {status.ok}
              </p>
            )}
            <a
              href="/"
              target="_blank"
              className="flex items-center gap-1 rounded-md border border-border px-2 py-1.5 text-xs hover:bg-accent"
              title="ดูหน้าเว็บจริง"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">ดูหน้าเว็บ</span>
            </a>
            <button
              type="button"
              onClick={save}
              disabled={saving || !dirty}
              className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground disabled:opacity-40"
            >
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {dirty ? "บันทึก" : "บันทึกแล้ว"}
            </button>
            <form action={logoutAction}>
              <button
                className="flex items-center rounded-md border border-border p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                title="ออกจากระบบ"
                aria-label="ออกจากระบบ"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      <main className="flex min-h-svh flex-col items-center px-4 py-12 md:py-16">
        <section className="mx-auto w-full max-w-2xl space-y-16">
          {/* About */}
          <div>
            <SectionLabel hint="แต่ละบรรทัด = 1 บรรทัดใน terminal">About</SectionLabel>
            <div className="space-y-3">
              <Text
                value={d.name}
                onChange={(v) => update((x) => void (x.name = v))}
                placeholder="ชื่อ"
                className="text-lg font-medium text-foreground"
              />
              <Text
                value={d.role}
                onChange={(v) => update((x) => void (x.role = v))}
                placeholder="ตำแหน่ง"
                className="text-sm text-muted-foreground"
              />
              <Area
                value={d.about}
                onChange={(v) => update((x) => void (x.about = v))}
                placeholder="แนะนำตัว"
                className="text-sm leading-relaxed text-foreground/80"
              />
            </div>
          </div>

          <Divider />

          {/* Skills */}
          <div>
            <SectionLabel hint="พิมพ์แล้วกด Enter เพื่อเพิ่ม">Skills</SectionLabel>
            <Sortable
              items={d.skills}
              getId={(s) => s._k}
              onChange={(next) => update((x) => void (x.skills = next))}
              className="space-y-4"
            >
              {(s, i, handle) => (
                <div className="group flex gap-2">
                  <div className="min-w-0 flex-1">
                    <Text
                      value={s.category}
                      onChange={(v) => update((x) => void (x.skills[i].category = v))}
                      placeholder="หมวด"
                      className="mb-2 text-xs text-muted-foreground"
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <Sortable
                        items={s.items}
                        getId={(c) => c._k}
                        layout="grid"
                        className="contents"
                        onChange={(next) => update((x) => void (x.skills[i].items = next))}
                      >
                        {(c, j, h) => (
                          <span
                            {...outsideInputs(h)}
                            className="flex cursor-grab touch-none items-center rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground/80"
                          >
                            <ChipInput value={c.v} onChange={(v) => update((x) => void (x.skills[i].items[j].v = v))} />
                            <ChipX onClick={() => update((x) => void x.skills[i].items.splice(j, 1))} />
                          </span>
                        )}
                      </Sortable>
                      <AddChip onAdd={(v) => update((x) => void x.skills[i].items.push({ _k: key(), v }))} />
                    </div>
                  </div>
                  <Tools className="flex-col">
                    <Grip handle={handle} />
                    <RemoveButton label="ลบหมวดนี้" onClick={() => update((x) => void x.skills.splice(i, 1))} />
                  </Tools>
                </div>
              )}
            </Sortable>
            <div className="mt-4">
              <AddButton onClick={() => update((x) => void x.skills.push({ _k: key(), category: "", items: [] }))}>
                เพิ่มหมวด
              </AddButton>
            </div>
          </div>

          <Divider />

          {/* Journey */}
          <div>
            <SectionLabel>Journey</SectionLabel>
            <div className="mb-6">
              <AddButton
                onClick={() =>
                  update((x) =>
                    void x.experience.unshift({
                      _k: key(),
                      company: "",
                      role: "",
                      url: "",
                      period: "",
                      description: "",
                      highlights: "",
                      stack: [],
                    }),
                  )
                }
              >
                เพิ่มที่ทำงาน (บนสุด)
              </AddButton>
            </div>
            <Sortable
              items={d.experience}
              getId={(e) => e._k}
              onChange={(next) => update((x) => void (x.experience = next))}
            >
              {(exp, i, handle, dragging) => {
                const isLast = i === d.experience.length - 1
                const set = (fn: (e: Draft["experience"][number]) => void) => update((x) => fn(x.experience[i]))
                return (
                  <div className={cn("group relative flex gap-6 rounded-xl bg-background", dragging && "shadow-xl")}>
                    <div className="flex flex-col items-center pt-1">
                      <div
                        className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                          i === 0 ? "bg-foreground" : "border-2 border-muted-foreground/40 bg-background"
                        }`}
                      />
                      {!isLast && <div className="mb-2 mt-2 w-px flex-1 bg-border" />}
                    </div>
                    <div className={cn("min-w-0 flex-1", isLast ? "pb-0" : "pb-10")}>
                      <Text
                        value={exp.period}
                        onChange={(v) => set((e) => void (e.period = v))}
                        placeholder="ช่วงเวลา เช่น 2024 - Present"
                        className="mb-1 text-[11px] tracking-wider text-muted-foreground"
                      />
                      <Text
                        value={exp.company}
                        onChange={(v) => set((e) => void (e.company = v))}
                        placeholder="บริษัท"
                        className="text-sm font-medium text-foreground"
                      />
                      <Text
                        value={exp.role}
                        onChange={(v) => set((e) => void (e.role = v))}
                        placeholder="ตำแหน่ง"
                        className="mt-0.5 text-xs text-muted-foreground"
                      />
                      <Text
                        value={exp.url}
                        onChange={(v) => set((e) => void (e.url = v))}
                        placeholder="https://ลิงก์บริษัท"
                        className="mt-0.5 text-[11px] text-muted-foreground/70"
                      />
                      <Area
                        value={exp.description}
                        onChange={(v) => set((e) => void (e.description = v))}
                        placeholder="รายละเอียดงาน"
                        className="mt-3 text-sm leading-relaxed text-foreground/80"
                      />
                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        <Sortable
                          items={exp.stack}
                          getId={(c) => c._k}
                          layout="grid"
                          className="contents"
                          onChange={(next) => set((e) => void (e.stack = next))}
                        >
                          {(c, j, h) => (
                            <span
                              {...outsideInputs(h)}
                              className="flex cursor-grab touch-none items-center rounded-md border border-border bg-card px-2 py-0.5 text-[11px] text-muted-foreground"
                            >
                              <ChipInput value={c.v} onChange={(v) => set((e) => void (e.stack[j].v = v))} />
                              <ChipX onClick={() => set((e) => void e.stack.splice(j, 1))} />
                            </span>
                          )}
                        </Sortable>
                        <AddChip
                          placeholder="+ tech"
                          className="rounded-md px-2 py-0.5 text-[11px]"
                          onAdd={(v) => set((e) => void e.stack.push({ _k: key(), v }))}
                        />
                      </div>
                      <div className="mt-3 rounded-lg border border-dashed border-border px-3 py-2">
                        <Hint>ไฮไลต์ใน terminal (บรรทัดละข้อ)</Hint>
                        <Area
                          value={exp.highlights}
                          onChange={(v) => set((e) => void (e.highlights = v))}
                          placeholder="เช่น Built CRM and POS systems"
                          className="mt-1 text-xs text-muted-foreground"
                        />
                      </div>
                    </div>
                    <Tools className="absolute right-0 top-0">
                      <Grip handle={handle} />
                      <RemoveButton
                        label="ลบที่ทำงานนี้"
                        onClick={() => {
                          if (confirm(`ลบ "${exp.company || "รายการนี้"}" ?`)) update((x) => void x.experience.splice(i, 1))
                        }}
                      />
                    </Tools>
                  </div>
                )
              }}
            </Sortable>
          </div>

          <Divider />

          {/* Works */}
          <div>
            <SectionLabel hint="ลากรูปมาวางบนการ์ดได้">Works</SectionLabel>
            {d.works.length === 0 && (
              <p className="mb-4 text-xs text-muted-foreground">ยังไม่มีผลงาน (ส่วนนี้จะซ่อนบนหน้าเว็บจนกว่าจะมีผลงาน)</p>
            )}
            <Sortable
              items={d.works}
              getId={(w) => w._k}
              layout="grid"
              className="grid gap-4 sm:grid-cols-2"
              onChange={(next) => update((x) => void (x.works = next))}
            >
              {(w, i, handle, dragging) => (
                <WorkCard
                  work={w}
                  handle={handle}
                  dragging={dragging}
                  onChange={(next) => update((x) => void (x.works[i] = next))}
                  onRemove={() => update((x) => void x.works.splice(i, 1))}
                />
              )}
            </Sortable>
            <div className="mt-4">
              <AddButton
                onClick={() => update((x) => void x.works.push({ _k: key(), title: "", description: "", url: "", images: [] }))}
              >
                เพิ่มผลงาน
              </AddButton>
            </div>
          </div>

          <Divider />

          {/* Projects */}
          <div>
            <SectionLabel>Projects</SectionLabel>
            <Sortable
              items={d.projects}
              getId={(p) => p._k}
              className="space-y-4"
              onChange={(next) => update((x) => void (x.projects = next))}
            >
              {(p, i, handle, dragging) => (
                <div
                  className={cn(
                    "group flex items-start gap-3 rounded-xl border border-border bg-card p-4",
                    dragging && "shadow-xl",
                  )}
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <Text
                      value={p.name}
                      onChange={(v) => update((x) => void (x.projects[i].name = v))}
                      placeholder="ชื่อโปรเจกต์"
                      className="text-sm font-medium text-foreground"
                    />
                    <Text
                      value={p.desc}
                      onChange={(v) => update((x) => void (x.projects[i].desc = v))}
                      placeholder="คำอธิบาย"
                      className="text-xs text-muted-foreground"
                    />
                    <Text
                      value={p.url}
                      onChange={(v) => update((x) => void (x.projects[i].url = v))}
                      placeholder="https://github.com/..."
                      className="text-[11px] text-muted-foreground/70"
                    />
                  </div>
                  <Tools>
                    <Grip handle={handle} />
                    <RemoveButton label="ลบโปรเจกต์นี้" onClick={() => update((x) => void x.projects.splice(i, 1))} />
                  </Tools>
                </div>
              )}
            </Sortable>
            <div className="mt-4">
              <AddButton onClick={() => update((x) => void x.projects.push({ _k: key(), name: "", desc: "", url: "" }))}>
                เพิ่มโปรเจกต์
              </AddButton>
            </div>
          </div>

          <Divider />

          {/* Contact */}
          <div>
            <SectionLabel>Contact</SectionLabel>
            <div className="space-y-3">
              {(
                [
                  ["email", Mail, "อีเมล"],
                  ["linkedin", Linkedin, "linkedin.com/in/... (ไม่ต้องมี https://)"],
                  ["github", Github, "github.com/... (ไม่ต้องมี https://)"],
                ] as const
              ).map(([field, Icon, placeholder]) => (
                <div key={field} className="flex items-center gap-3 text-sm text-foreground/80">
                  <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <Text
                    value={d.contact[field]}
                    onChange={(v) => update((x) => void (x.contact[field] = v))}
                    placeholder={placeholder}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="mb-4 mt-20 w-full max-w-2xl space-y-6 text-center">
          <Text
            value={d.footer}
            onChange={(v) => update((x) => void (x.footer = v))}
            placeholder="ข้อความท้ายเว็บ"
            className="text-center text-xs tracking-wide text-muted-foreground"
          />
          <div className="rounded-xl border border-dashed border-border p-4 text-left">
            <Hint>คำอธิบายเว็บสำหรับ Google (meta description)</Hint>
            <Area
              value={d.siteDescription}
              onChange={(v) => update((x) => void (x.siteDescription = v))}
              className="mt-1 text-xs text-muted-foreground"
            />
          </div>
        </footer>
      </main>
    </>
  )
}
