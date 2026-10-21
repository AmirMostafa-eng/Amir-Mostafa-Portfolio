import Image from "next/image";
import Link from "next/link";
import type { Project, Tech } from "@/types";
import { TechBadge } from "@/components/projects/TechBadge";

type ProjectCardProps = { project: Project; techs: Tech[]; variant: "grid" | "list" };

export function ProjectCard({ project, techs, variant }: ProjectCardProps) {
  const projectTechs = project.techs
    .map((slug) => techs.find((tech) => tech.slug === slug))
    .filter((tech): tech is Tech => Boolean(tech));

  return (
    <Link className={`project-card${variant === "list" ? " project-card-list" : ""}`} href={`/projects/${project.slug}`}>
      <div className="project-cover">
        <Image src={project.cover} alt={`${project.title} project preview`} fill sizes={variant === "list" ? "(max-width: 640px) 100vw, 36vw" : "(max-width: 640px) 100vw, 50vw"} />
      </div>
      <div className="project-card-content">
        <h3>{project.title}</h3>
        <span className="project-card-year">{project.year}</span>
        <p className="project-summary">{project.summary}</p>
        <div className="badge-list" aria-label={`${project.title} technologies`}>
          {projectTechs.map((tech) => <TechBadge key={tech.slug} tech={tech} />)}
        </div>
      </div>
    </Link>
  );
}
