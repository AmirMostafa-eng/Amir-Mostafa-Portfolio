import Link from "next/link";
import { site } from "@/data/site";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { Container } from "@/components/ui/Container";

const links = [
  { label: "Skills", href: "/#skills" },
  { label: "About", href: "/#about" },
  { label: "Projects", href: "/projects" },
  { label: "Contact", href: "/#contact" },
];

export function Navbar() {
  return (
    <header className="site-header">
      <Container>
        <div className="nav-row">
          <Link href="/" className="brand" aria-label={`${site.name}, home`}>{site.name}</Link>
          <nav className="desktop-nav" aria-label="Main navigation">
            {links.map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}
          </nav>
          <div className="nav-actions">
            <Link className="button button-primary button-small" href={site.cvUrl}>Download CV</Link>
          </div>
          <MobileMenu />
        </div>
      </Container>
    </header>
  );
}
