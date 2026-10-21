import { getFeaturedProjects, getTechs } from "@/lib/projects";
import { site } from "@/data/site";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export async function FeaturedProjects() {
  const [projects, techs] = await Promise.all([getFeaturedProjects(), getTechs()]);
  return (
    <section className="section" id="projects" aria-labelledby="featured-projects-title">
      <Container>
        <SectionHeading title="Selected projects" description={site.projectsIntro} id="featured-projects-title" />
        {projects.length ? (
          <div className="project-grid">
            {projects.map((project) => <ProjectCard key={project.slug} project={project} techs={techs} variant="grid" />)}
          </div>
        ) : <p className="empty-state">Projects will appear here soon.</p>}
        <div className="view-all"><Button href="/projects" variant="secondary">View all projects</Button></div>
      </Container>
    </section>
  );
}
