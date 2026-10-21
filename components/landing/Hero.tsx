import Link from "next/link";
import { FiGithub, FiLinkedin } from "react-icons/fi";
import { site } from "@/data/site";
import { PictureSlot } from "@/components/ui/PictureSlot";
import { Button } from "@/components/ui/Button";

export function Hero() {
  return (
    <section className="hero" id="hero" aria-labelledby="hero-title">
      <div className="hero-inner">
        <div className="hero-copy">
          <p className="eyebrow">{site.greeting}</p>
          <h1 id="hero-title">{site.name}</h1>
          <p className="hero-role">{site.role}</p>
          <p className="hero-tagline">{site.tagline}</p>
          <div className="hero-actions">
            <Button href="/projects">View projects</Button>
            <Button href="/#contact" variant="secondary">Contact me</Button>
          </div>
          <div className="hero-socials" aria-label="Social profiles">
            <Link className="icon-link" href={site.socials.github} aria-label="GitHub"><FiGithub aria-hidden="true" /></Link>
            <Link className="icon-link" href={site.socials.linkedin} aria-label="LinkedIn"><FiLinkedin aria-hidden="true" /></Link>
          </div>
        </div>
        <PictureSlot src={site.heroPicture} className="hero-picture" sizes="(max-width: 640px) 100vw, 45vw" />
      </div>
    </section>
  );
}
