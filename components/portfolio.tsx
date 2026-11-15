import { bareHref, webHref, type Profile } from "@/lib/profile-schema"
import { Mail, Github, Linkedin, ArrowUpRight } from "lucide-react"
import { Works, type PublicWork } from "@/components/works"

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

export function Portfolio({ profile, works = [] }: { profile: Profile; works?: PublicWork[] }) {
  const P = profile
  return (
    <section className="w-full max-w-2xl mx-auto space-y-16">
      <div>
        <SectionLabel>About</SectionLabel>
        <div className="space-y-3">
          <h2 className="text-lg font-medium text-foreground text-balance">
            {P.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            {P.role}
          </p>
          <p className="text-sm text-foreground/80 leading-relaxed">
            {P.about.split("\n").join(" ")}
          </p>
        </div>
      </div>

      <Divider />

      {/* Skills */}
      <div>
        <SectionLabel>Skills</SectionLabel>
        <div className="space-y-4">
          {P.skills.map(({ category, items }) => (
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
          {P.experience.map((exp, index) => {
            const isLast = index === P.experience.length - 1
            return (
              <div key={index} className="relative flex gap-6 ">
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
                    href={webHref(exp.url)}
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

      {/* Works (added in /admin) */}
      {works.length > 0 && (
        <>
          <div>
            <SectionLabel>Works</SectionLabel>
            <Works works={works} />
          </div>

          <Divider />
        </>
      )}

      {/* Projects */}
      <div>
        <SectionLabel>Projects</SectionLabel>
        <div className="space-y-4">
          {P.projects.map((project, i) =>
            <a
              key={i}
              href={webHref(project.url)}
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
            href={`mailto:${P.contact.email}`}
            className="flex items-center gap-3 text-sm text-foreground/80 hover:text-foreground transition-colors group"
          >
            <Mail className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            {P.contact.email}
          </a>
          <a
            href={bareHref(P.contact.linkedin)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-sm text-foreground/80 hover:text-foreground transition-colors group"
          >
            <Linkedin className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            {P.contact.linkedin}
          </a>
          <a
            href={bareHref(P.contact.github)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-sm text-foreground/80 hover:text-foreground transition-colors group"
          >
            <Github className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            {P.contact.github}
          </a>
        </div>
      </div>
    </section>
  )
}
