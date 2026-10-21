import Link from "next/link";
import { FiGithub, FiLinkedin } from "react-icons/fi";
import { site } from "@/data/site";
import { Container } from "@/components/ui/Container";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <Container>
        <div className="footer-row">
          <div>
            <p className="footer-name">{site.name}</p>
            <span>© {year}</span>
          </div>
          <nav className="footer-links" aria-label="Footer links">
            <Link href={site.socials.github} aria-label="GitHub"><FiGithub aria-hidden="true" /></Link>
            <Link href={site.socials.linkedin} aria-label="LinkedIn"><FiLinkedin aria-hidden="true" /></Link>
            <Link href="/#hero" className="back-top">Back to top</Link>
          </nav>
        </div>
      </Container>
    </footer>
  );
}
