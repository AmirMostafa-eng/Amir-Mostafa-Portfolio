import type { IconType } from "react-icons";
import {
  SiAxios,
  SiBootstrap,
  SiCss3,
  SiDaisyui,
  SiExpress,
  SiFirebase,
  SiFlutter,
  SiGit,
  SiGithub,
  SiHtml5,
  SiJavascript,
  SiMongodb,
  SiMui,
  SiNextdotjs,
  SiNodedotjs,
  SiNpm,
  SiReact,
  SiShadcnui,
  SiTailwindcss,
  SiTypescript,
  SiVite,
} from "react-icons/si";
import { VscVscode } from "react-icons/vsc";
import { FlowbiteMark } from "@/components/landing/FlowbiteMark";

export type Skill = {
  name: string;
  icon: IconType;
  color: string | null;
  colorOnDark?: string;
  row: 1 | 2;
};

export const skills: readonly Skill[] = [
  { name: "React", icon: SiReact, color: "#61DAFB", row: 1 },
  { name: "Next.js", icon: SiNextdotjs, color: null, row: 1 },
  { name: "TypeScript", icon: SiTypescript, color: "#3178C6", colorOnDark: "#4D8DD3", row: 1 },
  { name: "JavaScript", icon: SiJavascript, color: "#F7DF1E", row: 1 },
  { name: "HTML5", icon: SiHtml5, color: "#E34F26", colorOnDark: "#E65F39", row: 1 },
  { name: "CSS3", icon: SiCss3, color: "#1572B6", colorOnDark: "#1A8FE4", row: 1 },
  { name: "Tailwind CSS", icon: SiTailwindcss, color: "#06B6D4", row: 1 },
  { name: "shadcn/ui", icon: SiShadcnui, color: null, row: 1 },
  { name: "DaisyUI", icon: SiDaisyui, color: "#1AD1A5", row: 1 },
  // { name: "Flowbite", icon: FlowbiteMark, color: "#1C64F2", colorOnDark: "#4F87F5", row: 1 },
  { name: "Material UI", icon: SiMui, color: "#007FFF", colorOnDark: "#1589FF", row: 1 },
  { name: "Bootstrap", icon: SiBootstrap, color: "#7952B3", colorOnDark: "#9A7CC6", row: 1 },
  { name: "Node.js", icon: SiNodedotjs, color: "#5FA04E", row: 2 },
  { name: "Express", icon: SiExpress, color: null, row: 2 },
  { name: "MongoDB", icon: SiMongodb, color: "#00ED64", row: 2 },
  { name: "Firebase", icon: SiFirebase, color: "#FFC400", row: 2 },
  { name: "React Native", icon: SiReact, color: "#61DAFB", row: 2 },
  { name: "Flutter", icon: SiFlutter, color: "#0553B1", colorOnDark: "#2D89F9", row: 2 },
  { name: "Axios", icon: SiAxios, color: "#5A29E4", colorOnDark: "#9575EE", row: 2 },
  { name: "Git", icon: SiGit, color: "#F05032", colorOnDark: "#F05538", row: 2 },
  { name: "GitHub", icon: SiGithub, color: null, row: 2 },
  // { name: "npm", icon: SiNpm, color: "#CB3837", colorOnDark: "#D76867", row: 2 },
  // { name: "Vite", icon: SiVite, color: "#646CFF", colorOnDark: "#757CFF", row: 2 },
  // { name: "VS Code", icon: VscVscode, color: "#007ACC", colorOnDark: "#008EED", row: 2 },
];
