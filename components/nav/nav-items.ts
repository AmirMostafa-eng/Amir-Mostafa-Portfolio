export const navItems = [
  { id: "skills", label: "Skills", href: "#skills" },
  { id: "about", label: "About me", href: "#about" },
  { id: "projects", label: "Projects", href: "#projects" },
  { id: "contact", label: "Contact", href: "#contact" },
] as const;

export type NavItemId = (typeof navItems)[number]["id"];
