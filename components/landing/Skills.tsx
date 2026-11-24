import { site } from "@/data/site";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Container } from "@/components/ui/Container";
import { SkillsMarquee } from "@/components/landing/SkillsMarquee";

export function Skills() {
  return (
    <section className="section" id="skills" aria-labelledby="skills-title">
      <Container>
        <SectionHeading title={<><span className="hero-name-accent">Tools</span> I work with</>} description={site.skillsIntro} id="skills-title" />
        <SkillsMarquee />
      </Container>
    </section>
  );
}
