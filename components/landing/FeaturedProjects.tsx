import { getFeaturedProjects, getTechs } from "@/lib/projects";
import { site } from "@/data/site";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export async function FeaturedProjects() {
  const [projects, techs] = await Promise.all([getFeaturedProjects(), getTechs()]);
  return (
    <section className="section" id="projects" aria-labelledby="featured-projects-title">
      <Container>
        <Reveal from="up" trigger="view">
          <div className="featured-projects-heading">
            <SectionHeading title={<><span className="hero-name-accent">Selected</span> projects</>} description={site.projectsIntro} id="featured-projects-title" />
          </div>
        </Reveal>
        {projects.length ? (
          <div className="project-grid">
            {projects.map((project, index) => (
              <Reveal key={project.slug} from="up" delay={Math.min(index, 3) * 100} trigger="view">
                <div className="project-card-reveal">
                  <ProjectCard project={project} techs={techs} variant="grid" />
                </div>
              </Reveal>
            ))}
          </div>
        ) : <p className="empty-state">Projects will appear here soon.</p>}
        <div className="view-all"><Button href="/projects" variant="secondary">View all projects</Button></div>
      </Container>
    </section>
  );
}
