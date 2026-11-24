import { site } from "@/data/site";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Container } from "@/components/ui/Container";
import { AboutTimeline } from "@/components/landing/AboutTimeline";

export function About() {
  return (
    <section className="section about-section" id="about" aria-labelledby="about-title">
      <Container>
        <div className="about-grid">
          <div className="about-road">
            <p className="about-eyebrow">{site.roadEyebrow}</p>
            <AboutTimeline />
          </div>
          <div className="about-copy">
            <p className="about-eyebrow">{site.aboutEyebrow}</p>
            <SectionHeading title={site.aboutHeading} id="about-title" />
            <p className="about-bio">{site.about}</p>
            <div className="about-currently">
              <p className="about-currently-label">{site.currently.label}</p>
              <p className="about-currently-title">{site.currently.title}</p>
              <p className="about-currently-detail">{site.currently.detail}</p>
            </div>
            <ul className="tech-list about-chips">
              {site.quickFacts.map((fact) => (
                <li className="tech-badge" key={fact}>
                  {fact}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
