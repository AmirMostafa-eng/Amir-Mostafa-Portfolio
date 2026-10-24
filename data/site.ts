export const site = {
  name: "Amir Mostafa",
  roles: [
    "Frontend Developer",
    "Web Developer",
    "React.js | Next Developer",
    "Full Stack MERN Developer",
    "Software Engineer",
  ] as const,
  roleEffect: "typewriter" as const,
  tagline: "I build fast, accessible, and polished web interfaces.",
  email: "amirmostafa119@gmail.com",
  // TODO: Confirm that WhatsApp is on this number.
  whatsappNumber: "201280546430",
  footerBlurb: "Open to frontend roles and freelance projects. Pick whichever way is easiest for you.",
  cvUrl: "/cv.pdf",
  socials: {
    github: "https://github.com/AmirMostafa-eng",
    linkedin: "https://www.linkedin.com/in/amir-mostafa-522b29243",
  },
  heroPicture: null as string | null,
  aboutPicture: null as string | null,
  greeting: "Hello, I'm",
  about: "Frontend developer from Egypt building fast, responsive web apps with React, Next.js and TypeScript, and always learning something new.",
  skillsIntro: "A small toolkit for building thoughtful digital experiences.",
  projectsIntro: "A few selected pieces of work and practice.",
  aboutTitle: "About me",
} as const;
