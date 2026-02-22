"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { TerminalOutput } from "./terminal-output"
import type { CommandName } from "@/lib/terminal-data"

interface OutputLine {
  type: "command" | "response" | "error"
  content: string
  id: string
}

const VALID_COMMANDS: CommandName[] = [
  "help",
  "about",
  "whoami",
  "skills",
  "experience",
  "projects",
  "contact",
  "clear",
  "ls",
]

export function Terminal() {
  const [input, setInput] = useState("")
  const [suggestion, setSuggestion] = useState("")
  const [output, setOutput] = useState<OutputLine[]>([])
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [output, scrollToBottom])

  useEffect(() => {
    const trimmed = input.trim().toLowerCase()
    if (!trimmed || trimmed.includes(" ")) {
      setSuggestion("")
      return
    }
    const match = VALID_COMMANDS.find(
      (cmd) => cmd.startsWith(trimmed) && cmd !== trimmed
    )
    setSuggestion(match ? match.slice(trimmed.length) : "")
  }, [input])

  const handleCommand = useCallback(
    (cmd: string) => {
      const trimmed = cmd.trim().toLowerCase()
      if (!trimmed) return

      const newHistory = [trimmed, ...history]
      setHistory(newHistory)
      setHistoryIndex(-1)

      if (trimmed === "clear") {
        setOutput([])
        return
      }

      const commandLine: OutputLine = {
        type: "command",
        content: trimmed,
        id: `cmd-${Date.now()}`,
      }

      if (VALID_COMMANDS.includes(trimmed as CommandName)) {
        const responseLine: OutputLine = {
          type: "response",
          content: trimmed,
          id: `res-${Date.now()}`,
        }
        setOutput((prev) => [...prev, commandLine, responseLine])
      } else {
        const errorLine: OutputLine = {
          type: "error",
          content: trimmed,
          id: `err-${Date.now()}`,
        }
        setOutput((prev) => [...prev, commandLine, errorLine])
      }
    },
    [history]
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCommand(input)
      setInput("")
      setSuggestion("")
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (history.length > 0) {
        const newIndex = Math.min(historyIndex + 1, history.length - 1)
        setHistoryIndex(newIndex)
        setInput(history[newIndex])
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setInput(history[newIndex])
      } else {
        setHistoryIndex(-1)
        setInput("")
      }
    } else if (e.key === "Tab") {
      if (suggestion) {
        e.preventDefault()
        setInput((prev) => prev + suggestion)
        setSuggestion("")
      }
    } else if (e.key === "ArrowRight") {
      if (suggestion) {
        e.preventDefault()
        setInput((prev) => prev + suggestion)
        setSuggestion("")
      }
    }
  }

  const focusInput = () => {
    inputRef.current?.focus()
  }

  return (
    <div
      className="w-full max-w-2xl mx-auto my-10"
      onClick={focusInput}
      role="application"
      aria-label="Interactive terminal"
    >
      <div className="border border-border rounded-2xl shadow-sm overflow-hidden bg-card">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF5C54]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD44]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#00C853]" />
          </div>
          <span className="text-xs text-muted-foreground ml-2 select-none">
            terminal
          </span>
        </div>


        <div
          ref={scrollRef}
          className="p-5 h-[60vh] md:h-[65vh] overflow-y-auto text-sm leading-relaxed space-y-3 scroll-smooth"
        >

          <div className="space-y-1 pb-3 border-b border-border mb-3">
            <p className="text-foreground">
              Chayut Phunphet
            </p>
            <p className="text-muted-foreground text-xs">
              Full-Stack Software Engineer
            </p>
            <p className="text-muted-foreground text-xs mt-2">
              {"Type "}
              <span className="text-foreground">help</span>
              {" to see available commands."}
            </p>
          </div>

          {output.map((line) => (
            <TerminalOutput key={line.id} line={line} />
          ))}


          <div className="flex items-start gap-2">
            <span className="text-muted-foreground select-none shrink-0">
              {"$"}
            </span>
            <div className="relative flex-1 min-w-0">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent outline-none text-foreground caret-transparent font-mono text-sm"
                autoFocus
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                aria-label="Terminal input"
              />
              {suggestion && (
                <span
                  className="absolute top-0 pointer-events-none text-muted-foreground/40"
                  style={{ left: `${input.length}ch` }}
                  aria-hidden="true"
                >
                  {suggestion}
                </span>
              )}

              <span
                className="absolute top-0 pointer-events-none text-foreground"
                style={{ left: `${input.length}ch` }}
                aria-hidden="true"
              >
                <span className="inline-block w-[0.55em] h-[1.2em] bg-foreground/80 animate-blink translate-y-px" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
