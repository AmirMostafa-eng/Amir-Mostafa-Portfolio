import { site } from "@/data/site";
import { Container } from "@/components/ui/Container";
import { AboutTimeline } from "@/components/landing/AboutTimeline";

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const accentWords: readonly string[] = site.aboutHeadingAccents;
const accentSet = new Set(accentWords);
const headingParts = accentWords.length
  ? site.aboutHeading.split(new RegExp(`\\b(${accentWords.map(escapeRegExp).join("|")})\\b`))
  : [site.aboutHeading];

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
                {headingParts.map((part, index) =>
                  accentSet.has(part) ? (
                    <span className="hero-name-accent" key={index}>
                      {part}
                    </span>
                  ) : (
                    part
                  ),
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
