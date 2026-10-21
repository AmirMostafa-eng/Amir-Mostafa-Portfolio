import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { FiCode, FiDatabase, FiGitBranch, FiLayout, FiWind, FiZap } from "react-icons/fi";
import type { Tech } from "@/types";

const techIcons: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  react: FiCode,
  nextjs: FiLayout,
  typescript: FiCode,
  tailwindcss: FiWind,
  javascript: FiZap,
  nodejs: FiCode,
  firebase: FiDatabase,
  git: FiGitBranch,
  figma: FiLayout,
  accessibility: FiCode,
};

type TechBadgeProps = { tech: Tech; href?: string };

export function TechBadge({ tech, href }: TechBadgeProps) {
  const Icon = techIcons[tech.slug] ?? FiCode;
  const badge = <><Icon aria-hidden="true" /><span>{tech.name}</span></>;
  return href
    ? <Link href={href} className="tech-badge">{badge}</Link>
    : <span className="tech-badge">{badge}</span>;
}
