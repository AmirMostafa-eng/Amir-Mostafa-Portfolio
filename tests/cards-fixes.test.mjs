import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const footer = read("../components/layout/Footer.tsx");
const hero = read("../components/landing/Hero.tsx");
const projectCard = read("../components/projects/ProjectCard.tsx");
const styles = read("../app/globals.css");
const nav = read("../components/nav/LiquidNav.tsx");
const detailPage = read("../app/projects/[slug]/page.tsx");

test("footer CV reveal is on a wrapper, while magnetic behavior stays on the link", () => {
  assert.match(footer, /<Reveal from="up" trigger="view" delay=\{400\}>\s*<div className="footer-cv-reveal">\s*<a className="button button-primary footer-cv-button" href=\{site\.cvUrl\} data-magnetic>/);
  assert.match(hero, /<Reveal from="left" delay=\{470\}>\s*<div className="hero-actions">[\s\S]*?Button href=\{site\.cvUrl\}/);
});

test("project cards omit dates and render a plain, limited technology list", () => {
  assert.doesNotMatch(projectCard, /project\.year|TechBadge/);
  assert.match(projectCard, /project-tech-list/);
  assert.match(projectCard, /slice\(0, 4\)/);
  assert.match(projectCard, /and \{remainingTechCount\} more technologies/);
  assert.match(projectCard, /className="project-summary line-clamp-3"/);
});

test("project cards use full-bleed media and a padded flex body with clamped text", () => {
  assert.match(styles, /\.project-card\s*\{[^}]*display:\s*flex;[^}]*overflow:\s*hidden;[^}]*flex-direction:\s*column/s);
  assert.match(styles, /\.project-card-content\s*\{[^}]*display:\s*flex;[^}]*flex-direction:\s*column;[^}]*padding:\s*20px;/s);
  assert.match(styles, /\.project-card h3[^}]*-webkit-line-clamp:\s*2/s);
  assert.match(styles, /\.project-summary[^}]*-webkit-line-clamp:\s*3/s);
  assert.match(styles, /\.project-tech-list\s*\{[^}]*margin-top:\s*auto/s);
});

test("wide list cards stretch edge-to-edge media and narrow list cards stack at 16:9", () => {
  assert.match(styles, /\.project-card-list\s*\{[^}]*grid-template-columns:\s*minmax\(240px, 40%\) minmax\(0, 1fr\);[^}]*overflow:\s*hidden/s);
  assert.match(styles, /\.project-card-list \.project-cover[^}]*align-self:\s*stretch;[^}]*min-height:\s*200px/s);
  assert.match(styles, /\.project-cover img[^}]*position:\s*absolute;[^}]*object-fit:\s*cover/s);
  assert.match(styles, /@media \(max-width: 767px\)[\s\S]*?\.project-card-list \.project-cover\s*\{[^}]*aspect-ratio:\s*16 \/ 9/s);
  assert.match(projectCard, /Image src=\{project\.cover\}/);
  assert.match(projectCard, /project\.video\?\.provider === "youtube"/);
});

test("active navigation tracking is restricted to the landing page", () => {
  assert.match(nav, /const \[active, setActive\] = useState<ActiveId>\(null\)/);
  assert.match(nav, /const hasActiveLink = pathname === "\/" && active !== null/);
  assert.match(nav, /const selected = pathname === "\/" && active === id/);
  assert.match(nav, /setActiveId\(null\);\s*\}, \[pathname, setActiveId\]\)/);
  assert.match(nav, /if \(pathname === "\/" && "IntersectionObserver" in window\)/);
});

test("empty navbar overlay space lets the detail-page All projects link receive pointer input", () => {
  assert.match(detailPage, /<Link className="back-link" href="\/projects">/);
  assert.match(styles, /\.project-detail\s*\{[^}]*padding:\s*76px 0 6rem;/s);
  assert.match(styles, /@media \(max-width: 767px\)[\s\S]*?\.project-detail\s*\{[^}]*padding-top:\s*84px;/s);
});
