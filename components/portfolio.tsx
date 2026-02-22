import { TERMINAL_DATA } from "@/lib/terminal-data"
import { Mail, Github, Linkedin, ArrowUpRight } from "lucide-react"

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs tracking-widest uppercase text-muted-foreground mb-6">
      {children}
    </p>
  )
}

function Divider() {
  return <hr className="border-border" />
}

export function Portfolio() {
  return (
    <section className="w-full max-w-2xl mx-auto space-y-16">
      <div>
        <SectionLabel>About</SectionLabel>
        <div className="space-y-3">
          <h2 className="text-lg font-medium text-foreground text-balance">
            {TERMINAL_DATA.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            {TERMINAL_DATA.role}
          </p>
          <p className="text-sm text-foreground/80 leading-relaxed">
            {TERMINAL_DATA.about.join(" ")}
          </p>
        </div>
      </div>

      <Divider />

      {/* Skills */}
      <div>
        <SectionLabel>Skills</SectionLabel>
        <div className="space-y-4">
          {Object.entries(TERMINAL_DATA.skills).map(([category, items]) => (
            <div key={category}>
              <p className="text-xs text-muted-foreground mb-2">{category}</p>
              <div className="flex flex-wrap gap-2">
                {items.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 text-xs rounded-full border border-border text-foreground/80 bg-card"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-8">and i can learn other languages as well :D</p>
      </div>
      <Divider />
      <div>
        <SectionLabel>Journey</SectionLabel>
        <div className="relative">
          {TERMINAL_DATA.experience.map((exp, index) => {
            const isLast = index === TERMINAL_DATA.experience.length - 1
            return (
              <div key={exp.company} className="relative flex gap-6 ">
                {/* Timeline track */}
                <div className="flex flex-col items-center pt-1">
                  {/* Dot */}

                  <div
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${index === 0
                      ? "bg-foreground"
                      : "border-2 border-muted-foreground/40 bg-background"
                      }`}
                  />
                  {/* Line */}
                  {!isLast && (
                    <div className="w-px flex-1 bg-border mt-2 mb-2" />
                  )}
                </div>

                {/* Content */}
                <div className={`pb-10 ${isLast ? "pb-0" : ""}`}>
                  {/* Period badge */}
                  <span className="inline-block text-[11px] tracking-wider text-muted-foreground mb-2">
                    {exp.period}
                  </span>

                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={exp.url}
                    className="text-sm font-medium text-foreground group flex gap-1"
                  >
                    {exp.company}
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {exp.role}
                  </p>

                  <p className="text-sm text-foreground/80 leading-relaxed mt-3">
                    {exp.description}
                  </p>

                  {/* Tech stack pills */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {exp.stack.map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-0.5 text-[11px] rounded-md border border-border text-muted-foreground bg-card"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            )
          })}
        </div>
      </div>

      <Divider />

      {/* Projects */}
      <div>
        <SectionLabel>Projects</SectionLabel>
        <div className="space-y-4">
          {TERMINAL_DATA.projects.map((project) =>
            <a
              key={project.name}
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start justify-between gap-4 p-4 rounded-xl border border-border bg-card hover:bg-accent transition-colors"
              aria-label={`Open ${project.name}`}
            >
              <div className="space-y-1 min-w-0">
                <h3 className="text-sm font-medium text-foreground">
                  {project.name}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {project.desc}
                </p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          )}
        </div>
      </div>

      <Divider />

      {/* Contact */}
      <div>
        <SectionLabel>Contact</SectionLabel>
        <div className="space-y-3">
          <a
            href={`mailto:${TERMINAL_DATA.contact.email}`}
            className="flex items-center gap-3 text-sm text-foreground/80 hover:text-foreground transition-colors group"
          >
            <Mail className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            {TERMINAL_DATA.contact.email}
          </a>
          <a
            href={`https://${TERMINAL_DATA.contact.linkedin}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-sm text-foreground/80 hover:text-foreground transition-colors group"
          >
            <Linkedin className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            {TERMINAL_DATA.contact.linkedin}
          </a>
          <a
            href={`https://${TERMINAL_DATA.contact.github}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-sm text-foreground/80 hover:text-foreground transition-colors group"
          >
            <Github className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            {TERMINAL_DATA.contact.github}
          </a>
        </div>
      </div>
    </section>
  )
}
