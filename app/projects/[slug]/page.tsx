import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft, FiExternalLink } from "react-icons/fi";
import { getProjectBySlug, getProjects, getTechBySlug } from "@/lib/projects";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { VideoEmbed } from "@/components/projects/VideoEmbed";
import { TechBadge } from "@/components/projects/TechBadge";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Project not found" };
  return {
    title: project.title,
    description: project.summary,
    openGraph: { title: project.title, description: project.summary, images: [project.cover] },
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();
  const projectTechs = await Promise.all(project.techs.map((techSlug) => getTechBySlug(techSlug)));
  const validTechs = projectTechs.filter((tech) => tech !== null);

  return (
    <main className="page-main project-detail">
      <Container>
        <header className="project-detail-header">
          <div className="project-detail-title">
            <Link className="back-link footer-back-top" href="/projects"><FiArrowLeft aria-hidden="true" title="All projects"/></Link>
            <h1 className="project-title">{project.title}</h1>
          </div>
          {/* <p className="project-year">{project.year}</p> */}
          <p className="project-intro">{project.summary}</p>
          {project.links.live || project.links.repo ? (
            <div className="project-actions">
              {project.links.live ? <Button href={project.links.live} variant="primary" target="_blank" rel="noopener noreferrer">Live demo <FiExternalLink aria-hidden="true" /></Button> : null}
              {project.links.repo ? <Button href={project.links.repo} variant="secondary" target="_blank" rel="noopener noreferrer">Source code <FiExternalLink aria-hidden="true" /></Button> : null}
            </div>
          ) : null}
        </header>
        <VideoEmbed video={project.video} poster={project.poster ?? project.cover} title={project.title} />

        <section className="detail-section" aria-labelledby="about-project-title">
          <h2 id="about-project-title">About the project</h2>
          <div className="detail-prose"><p>{project.description}</p></div>
        </section>

        <section className="detail-section" aria-labelledby="tech-used-title">
          <h2 id="tech-used-title">Tech used</h2>
          <div className="badge-list">
            {validTechs.map((tech) => tech ? <TechBadge key={tech.slug} tech={tech} /> : null)}
          </div>
        </section>

        {project.screenshots?.length ? (
          <section className="detail-section" aria-labelledby="screenshots-title">
            <h2 id="screenshots-title">Screenshots</h2>
            <div className="screenshot-grid">
              {project.screenshots.map((src, index) => (
                <div className="screenshot-frame" key={src}>
                  <Image src={src} alt={`${project.title} screenshot ${index + 1}`} fill sizes="(max-width: 640px) 100vw, 50vw" />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {project.learned?.length ? (
          <section className="detail-section" aria-labelledby="learned-title">
            <h2 id="learned-title">What I learned</h2>
            <ul className="learned-list">{project.learned.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>
        ) : null}
      </Container>
    </main>
  );
}
