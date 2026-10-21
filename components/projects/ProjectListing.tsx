import { ProjectCard } from "@/components/projects/ProjectCard";
import type { Project, Tech } from "@/types";

type ProjectListingProps = { projects: Project[]; techs: Tech[]; view: "grid" | "list" };

export function ProjectListing({ projects, techs, view }: ProjectListingProps) {
  if (projects.length === 0) {
    return <p className="empty-state">Projects will appear here soon.</p>;
  }

  return (
    <div className={view === "grid" ? "project-grid all-project-grid" : "project-list"}>
      {projects.map((project) => <ProjectCard key={project.slug} project={project} techs={techs} variant={view} />)}
    </div>
  );
}
