"use client"

import { TERMINAL_DATA } from "@/lib/terminal-data"

interface OutputLine {
  type: "command" | "response" | "error"
  content: string
  id: string
}

export function TerminalOutput({ line }: { line: OutputLine }) {
  if (line.type === "command") {
    return (
      <div className="flex items-start gap-2">
        <span className="text-muted-foreground select-none shrink-0">{"$"}</span>
        <span className="text-foreground">{line.content}</span>
      </div>
    )
  }

  if (line.type === "error") {
    return (
      <div className="animate-fade-in pl-4 text-muted-foreground">
        <p>
          {"command not found: "}
          {line.content}
        </p>
        <p className="mt-1">
          {"Type "}
          <span className="text-foreground">help</span>
          {" for available commands."}
        </p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in pl-4">
      <ResponseContent content={line.content} />
    </div>
  )
}

function ResponseContent({ content }: { content: string }) {
  switch (content) {
    case "help":
      return <HelpResponse />
    case "about":
    case "whoami":
      return <AboutResponse />
    case "skills":
      return <SkillsResponse />
    case "experience":
      return <ExperienceResponse />
    case "projects":
      return <ProjectsResponse />
    case "contact":
      return <ContactResponse />
    case "ls":
      return <LsResponse />
    default:
      return null
  }
}

function HelpResponse() {
  const commands = [
    { cmd: "about", desc: "Who I am" },
    { cmd: "whoami", desc: "Alias of about" },
    { cmd: "skills", desc: "Technologies I work with" },
    { cmd: "experience", desc: "Where I've worked" },
    { cmd: "projects", desc: "What I've built" },
    { cmd: "contact", desc: "How to reach me" },
    { cmd: "ls", desc: "List files" },
    { cmd: "clear", desc: "Clear terminal" },
  ]
  return (
    <div className="space-y-1">
      <p className="text-muted-foreground mb-2">Available commands:</p>
      {commands.map((c) => (
        <div key={c.cmd} className="flex gap-4">
          <span className="text-foreground w-20 shrink-0">{c.cmd}</span>
          <span className="text-muted-foreground">{c.desc}</span>
        </div>
      ))}
    </div>
  )
}

function AboutResponse() {
  return (
    <div className="space-y-2">
      <p className="text-foreground font-medium">
        {TERMINAL_DATA.name}
      </p>
      <p className="text-muted-foreground text-sm">{TERMINAL_DATA.role}</p>
      <div className="mt-3 space-y-0.5">
        {TERMINAL_DATA.about.map((line, i) => (
          <p key={i} className="text-foreground/80 leading-relaxed">
            {line}
          </p>
        ))}
      </div>
    </div>
  )
}

function SkillsResponse() {
  return (
    <div className="space-y-2">
      {Object.entries(TERMINAL_DATA.skills).map(([category, items]) => (
        <div key={category} className="flex gap-4">
          <span className="text-muted-foreground w-20 shrink-0 text-right">
            {category}
          </span>
          <span className="text-foreground">{items.join(", ")}</span>
        </div>
      ))}
    </div>
  )
}

function ExperienceResponse() {
  return (
    <div className="space-y-4">
      {TERMINAL_DATA.experience.map((exp) => (
        <div key={exp.company}>
          <p className="text-foreground font-medium">
            {exp.company}
            <span className="text-muted-foreground font-normal">
              {" — "}
              {exp.role}
            </span>
          </p>
          <div className="mt-1 space-y-0.5 pl-2">
            {exp.highlights.map((h, i) => (
              <p key={i} className="text-foreground/80 before:content-['›_'] before:text-muted-foreground">
                {h}
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function ProjectsResponse() {
  return (
    <div className="space-y-2">
      {TERMINAL_DATA.projects.map((p) => (
        <div key={p.name} className="flex gap-4">
          <span className="text-foreground w-28 shrink-0">{p.name}</span>
          <span className="text-muted-foreground">{p.desc}</span>
        </div>
      ))}
    </div>
  )
}

function ContactResponse() {
  return (
    <div className="space-y-1">
      <div className="flex gap-4">
        <span className="text-muted-foreground w-20 shrink-0 text-right">Email</span>
        <a
          href={`mailto:${TERMINAL_DATA.contact.email}`}
          className="text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground transition-colors"
        >
          {TERMINAL_DATA.contact.email}
        </a>
      </div>
      <div className="flex gap-4">
        <span className="text-muted-foreground w-20 shrink-0 text-right">LinkedIn</span>
        <a
          href={`https://${TERMINAL_DATA.contact.linkedin}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground transition-colors"
        >
          {TERMINAL_DATA.contact.linkedin}
        </a>
      </div>
      <div className="flex gap-4">
        <span className="text-muted-foreground w-20 shrink-0 text-right">GitHub</span>
        <a
          href={`https://${TERMINAL_DATA.contact.github}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground transition-colors"
        >
          {TERMINAL_DATA.contact.github}
        </a>
      </div>
    </div>
  )
}

function LsResponse() {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-1">
      {TERMINAL_DATA.files.map((f) => (
        <span key={f} className="text-foreground">{f}</span>
      ))}
    </div>
  )
}
