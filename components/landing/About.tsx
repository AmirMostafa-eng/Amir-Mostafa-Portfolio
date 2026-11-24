import { site } from "@/data/site";
import { Container } from "@/components/ui/Container";
import { AboutTimeline } from "@/components/landing/AboutTimeline";

const headingParts = site.aboutHeading.split(site.aboutHeadingAccent);

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
            <div className="section-heading">
              <h2 id="about-title">
                {headingParts.length === 2 ? (
                  <>
                    {headingParts[0]}
                    <span className="hero-name-accent">{site.aboutHeadingAccent}</span>
                    {headingParts[1]}
                  </>
                ) : (
                  site.aboutHeading
                )}
              </h2>
              <p className="about-heading-attribution">{site.aboutHeadingAttribution}</p>
            </div>
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
