export const site = {
  name: "Your Name",
  role: "Front-End Developer",
  tagline: "I build fast, accessible, and polished web interfaces.",
  email: "you@example.com",
  cvUrl: "/cv.pdf",
  socials: { github: "#", linkedin: "#" },
  heroPicture: null as string | null,
  aboutPicture: null as string | null,
  greeting: "Hello, I'm",
  about: [
    "I’m a front-end developer who enjoys turning clear ideas into thoughtful digital experiences.",
    "I care about accessible interfaces, useful details, and work that feels as good as it functions.",
  ],
  facts: [
    { label: "Location", value: "Your city" },
    { label: "Focus", value: "Web interfaces" },
    { label: "Experience", value: "Open to opportunities" },
  ],
  skillsIntro: "A small toolkit for building thoughtful digital experiences.",
  projectsIntro: "A few selected pieces of work and practice.",
  contactIntro: "Have a project in mind or want to say hello? I’d love to hear from you.",
  aboutTitle: "About me",
} as const;
