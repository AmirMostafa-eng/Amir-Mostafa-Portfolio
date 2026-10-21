import { projects } from "@/data/projects";
import { techs } from "@/data/techs";
import type { Project, Tech } from "@/types";

export async function getProjects(): Promise<Project[]> {
  return projects;
}

export async function getFeaturedProjects(): Promise<Project[]> {
  return projects.filter((project) => project.featured).slice(0, 4);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  return projects.find((project) => project.slug === slug) ?? null;
}

export async function getTechs(): Promise<Tech[]> {
  return techs;
}

export async function getTechBySlug(slug: string): Promise<Tech | null> {
  return techs.find((tech) => tech.slug === slug) ?? null;
}

export async function getFeaturedSkills(): Promise<Tech[]> {
  return techs.filter((tech) => tech.featuredSkill);
}
