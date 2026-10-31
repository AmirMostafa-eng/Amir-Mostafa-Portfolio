import Image from "next/image";
import Link from "next/link";
import { FiPlay } from "react-icons/fi";
import { TechList } from "@/components/projects/TechList";
import type { Project, Tech } from "@/types";

type ProjectCardProps = { project: Project; techs: Tech[]; variant: "grid" | "list" };

export function ProjectCard({ project, techs, variant }: ProjectCardProps) {
  const projectTechs = project.techs
    .map((slug) => techs.find((tech) => tech.slug === slug))
    .filter((tech): tech is Tech => Boolean(tech));

  return (
    <Link className={`project-card${variant === "list" ? " project-card-list" : ""}`} href={`/projects/${project.slug}`}>
      <div className="project-cover">
        <Image src={project.cover} alt={`${project.title} project preview`} fill sizes={variant === "list" ? "(max-width: 767px) 100vw, 40vw" : "(max-width: 640px) 100vw, 50vw"} />
        {project.video?.provider === "youtube" ? (
          <div className="video-overlay" aria-hidden="true">
            <span className="video-play"><FiPlay /></span>
          </div>
        ) : null}
      </div>
      <div className="project-card-content">
        <h3 className="line-clamp-2">{project.title}</h3>
        <p className="project-summary line-clamp-3">{project.summary}</p>
        <TechList techs={projectTechs} label={`${project.title} technologies`} maxItems={4} />
      </div>
    </Link>
  );
}
