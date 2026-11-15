"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { loginAction } from "./actions"

function Submit() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
    >
      {pending ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}
    </button>
  )
}

export function LoginForm() {
  const [state, action] = useActionState(loginAction, {})
  return (
    <form action={action} className="space-y-3">
      <label className="block">
        <span className="mb-1 block text-xs text-muted-foreground">รหัสผ่าน</span>
        <input
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground/40"
        />
      </label>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Submit />
    </form>
  )
}
