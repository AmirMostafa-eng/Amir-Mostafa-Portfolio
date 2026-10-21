import { Container } from "@/components/ui/Container";
import { ProjectListing } from "@/components/projects/ProjectListing";
import { ViewToggle } from "@/components/projects/ViewToggle";
import { getProjects, getTechs } from "@/lib/projects";

type SearchParams = Promise<{ view?: string | string[] }>;

export const metadata = { title: "Projects", description: "Selected projects and experiments." };

export default async function ProjectsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const requestedView = Array.isArray(params.view) ? params.view[0] : params.view;
  const view = requestedView === "list" ? "list" : "grid";
  const [projects, techs] = await Promise.all([getProjects(), getTechs()]);

  return (
    <main className="page-main">
      <Container>
        <header className="page-header">
          <h1 className="page-title">Projects</h1>
          <p>A selection of work, experiments, and things I’ve enjoyed making.</p>
        </header>
        <div className="projects-toolbar">
          <p>{projects.length} projects</p>
          <ViewToggle view={view} />
        </div>
        <ProjectListing projects={projects} techs={techs} view={view} />
      </Container>
    </main>
  );
}
