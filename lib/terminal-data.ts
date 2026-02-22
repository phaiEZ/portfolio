export const TERMINAL_DATA = {
  name: "Chayut Phulphet",
  role: "Full-Stack Software Engineer",

  about: [
    "Full-Stack Software Engineer with experience building",
    "scalable and production-ready web applications.",
    "Skilled in designing and developing end-to-end systems",
    "across frontend, backend, and database layers.",
    "Focused on performance, maintainability, and clean architecture.",
  ],

  skills: {
    Frontend: ["React", "Next.js", "Tailwind", "Angular", "AntDesign"],
    Backend: [
      "Node.js",
      "Nest.js",
      "Express",
      "Java Spring Boot",
      "Python FastAPI",
    ],
    Database: ["MongoDB", "MySQL", "PostgreSQL"],
    Tools: [
      "Git",
      "Docker",
      "pm2",
      "Figma",
      "Postman",
      "Burpsuite",
      "MongoDB Compass",
      "HeidiSQL",
    ],
  },

  experience: [
    {
      company: "Funcrowd",
      role: "Full-Stack Developer",
      url: "https://funcrowd.co.th/",
      period: "2024 - Present",
      description:
        "Building and maintaining CRM and POS systems serving 2,000-3,000 stores across Thailand. Developing REST APIs and integrating notification systems including LINE OA and Telegram for real-time business communications.",
      highlights: [
        "Built CRM and POS systems serving 2,000-3,000 stores",
        "Developed REST APIs and notification systems (LINE OA, Telegram)",
      ],
      stack: ["React", "Node.js", "MongoDB"],
    },
    {
      company: "Telehealth Thailand",
      url: "https://telehealththailand.vercel.app/",
      role: "Front-end Developer",
      period: "2024",
      description:
        "Built a telemedicine platform enabling remote doctor consultations with online prescription workflows, improving healthcare accessibility for patients across the country.",
      highlights: [
        "Designed and developed a telemedicine platform with online prescription workflows",
      ],
      stack: ["React", "Next.js", "Tailwind", "AntDesign"],
    },
    {
      company: "Netbay",
      url: "https://www.netbay.co.th/index%20TH.html",
      role: "UX-UI & Full-Stack Developer (Intern)",
      period: "2023",
      description:
        "Designed and developed a tax deduction web application with structured form submission workflows Built frontend forms and backend processing to handle user-submitted tax data Assisted in database design and API integration for secure data management",
      highlights: [
        "Designed and developed a tax deduction web application with structured form submission workflows",
      ],
      stack: ["Angular", "Java Spring Boot"],
    },
    {
      company: "N-Squared Ecommerce",
      url: "http://www.nsquared.asia",
      role: "UX-UI & Front-end Developer",
      period: " 2023",
      description:
        "Designed and implemented a product claim submission form, from UX research to frontend development Delivered interactive UI prototypes in Figma for stakeholder review",
      highlights: ["Designed and implemented a product claim submission form"],
      stack: ["React", "Next.js", "Tailwind", "AntDesign"],
    },
  ],

  projects: [
    {
      name: "backjack_RPG",
      desc: "Game of Blackjack with RPG elements using C++.",
      url: "https://github.com/phaiEZ/backjack_RPG",
    },

    {
      name: "Blackjack_RPG_V2",
      desc: "Game of Blackjack with RPG elements using JAVA.",
      url: "https://github.com/phaiEZ/Blackjack_RPG_V2-JAVA-",
    },
    {
      name: "data-dictionary-generator",
      desc: "Generate data dictionary from database schema",
      url: "https://github.com/phaiEZ/data-dictionary-generator",
    },
    {
      name: "cattagram-frontend",
      desc: "Instagram but for cats useing Next.js",
      url: "https://github.com/phaiEZ/cattagram-frontend-v2",
    },
    {
      name: "cattagram-backend",
      desc: "Instagram but for cats useing Nest.js",
      url: "https://github.com/phaiEZ/cattagram-backend",
    },
  ],

  contact: {
    email: "chayutmail@gmail.com",
    linkedin: "linkedin.com/in/chayut-phunpeth-7664a5257/",
    github: "github.com/phaiEZ",
  },

  files: [
    "about.txt",
    "skills.txt",
    "experience.txt",
    "projects.txt",
    "contact.txt",
  ],
} as const;

export type CommandName =
  | "help"
  | "about"
  | "whoami"
  | "skills"
  | "experience"
  | "projects"
  | "contact"
  | "clear"
  | "ls";
