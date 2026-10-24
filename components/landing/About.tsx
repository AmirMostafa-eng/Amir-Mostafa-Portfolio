import { site } from "@/data/site";
import { PictureSlot } from "@/components/ui/PictureSlot";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Container } from "@/components/ui/Container";
import { AboutTimeline } from "@/components/landing/AboutTimeline";

export function About() {
  return (
    <section className="section about-section" id="about" aria-labelledby="about-title">
      <Container>
        <div className="about-grid">
          <PictureSlot src={site.aboutPicture} alt="Portrait" className="about-picture" sizes="(max-width: 640px) 100vw, 40vw" />
          <div className="about-copy">
            <SectionHeading title={site.aboutTitle} id="about-title" />
            {site.about}
            <AboutTimeline />
          </div>
        </div>
      </Container>
    </section>
  );
}
