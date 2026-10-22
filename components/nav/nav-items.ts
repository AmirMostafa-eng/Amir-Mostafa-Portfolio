import { LuFolder, LuMail, LuUser, LuWrench } from "react-icons/lu";

export const navItems = [
  { id: "skills", label: "Skills", icon: LuWrench, href: "#skills" },
  { id: "about", label: "About me", icon: LuUser, href: "#about" },
  { id: "projects", label: "Projects", icon: LuFolder, href: "#projects" },
  { id: "contact", label: "Contact", icon: LuMail, href: "#contact" },
] as const;

export type NavItemId = (typeof navItems)[number]["id"];
