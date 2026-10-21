import { site } from "@/data/site";
import { PictureSlot } from "@/components/ui/PictureSlot";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Container } from "@/components/ui/Container";

export function About() {
  return (
    <section className="section about-section" id="about" aria-labelledby="about-title">
      <Container>
        <div className="about-grid">
          <PictureSlot src={site.aboutPicture} alt="Portrait" className="about-picture" sizes="(max-width: 640px) 100vw, 40vw" />
          <div className="about-copy">
            <SectionHeading title={site.aboutTitle} id="about-title" />
            {site.about.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <dl className="facts">
              {site.facts.map((fact) => <div className="fact" key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}
            </dl>
          </div>
        </div>
      </Container>
    </section>
  );
}
