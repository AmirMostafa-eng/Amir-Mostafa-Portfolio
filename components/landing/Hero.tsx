import Link from "next/link";
import { FiGithub, FiLinkedin } from "react-icons/fi";
import { site } from "@/data/site";
import { PictureSlot } from "@/components/ui/PictureSlot";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { HeroRole } from "@/components/landing/HeroRole";

export function Hero() {
  return (
    <section className="hero" id="hero" aria-labelledby="hero-title">
      <div className="hero-inner">
        <div className="hero-copy">
          <Reveal from="left" delay={150}><p className="eyebrow">{site.greeting}</p></Reveal>
          <Reveal from="left" delay={230}><h1 id="hero-title">{site.name}</h1></Reveal>
          <Reveal from="left" delay={310}>
            <p className="hero-role"><HeroRole roles={site.roles} effect={site.roleEffect} /></p>
          </Reveal>
          <Reveal from="left" delay={390}><p className="hero-tagline">{site.tagline}</p></Reveal>
          <Reveal from="left" delay={470}>
            <div className="hero-actions">
              <Button href="/projects">View projects</Button>
              <Button href="/#contact" variant="secondary">Contact me</Button>
              <Button href={site.cvUrl} small className="hero-mobile-cv">Download CV</Button>
            </div>
          </Reveal>
          <Reveal from="left" delay={550}>
            <div className="hero-socials" aria-label="Social profiles">
              <Link className="icon-link" href={site.socials.github} aria-label="GitHub"><FiGithub aria-hidden="true" /></Link>
              <Link className="icon-link" href={site.socials.linkedin} aria-label="LinkedIn"><FiLinkedin aria-hidden="true" /></Link>
            </div>
          </Reveal>
        </div>
        <Reveal from="right" delay={250}>
          <PictureSlot src={site.heroPicture} className="hero-picture" sizes="(max-width: 640px) 100vw, 45vw" />
        </Reveal>
      </div>
    </section>
  );
}



