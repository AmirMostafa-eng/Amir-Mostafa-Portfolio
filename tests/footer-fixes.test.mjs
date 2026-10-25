import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
const footer = await readFile(new URL("../components/layout/Footer.tsx", import.meta.url), "utf8");
const site = await readFile(new URL("../data/site.ts", import.meta.url), "utf8");
const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");

test("html and body prevent vertical overscroll and use the page background", () => {
  assert.match(css, /html\s*\{[^}]*overscroll-behavior-y:\s*none[^}]*background-color:\s*var\(--bg\)/s);
  assert.match(css, /body\s*\{[^}]*overscroll-behavior-y:\s*none[^}]*background-color:\s*var\(--bg\)/s);
  assert.doesNotMatch(css, /(?:html|body)\s*\{[^}]*overflow:\s*hidden/s);
});

test("watermark uses a bounded display size, stays behind content and ignores pointer input", () => {
  assert.match(css, /\.footer-watermark\s*\{[^}]*font-size:\s*clamp\(/s);
  assert.match(css, /\.footer-watermark\s*\{[^}]*bottom:\s*-\.\d+em/s);
  assert.match(css, /\.footer-watermark\s*\{[^}]*z-index:\s*0[^}]*pointer-events:\s*none/s);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.footer-watermark\s*\{[^}]*opacity:\s*1/s);
});

test("magnetic controls reuse three per-target quick setters across pointer entries", () => {
  assert.match(footer, /querySelectorAll<HTMLAnchorElement>\("\[data-magnetic\]"\)/);
  assert.equal((footer.match(/gsap\.quickTo\(target,/g) ?? []).length, 3);
  assert.match(footer, /quickX\(0\);\s*quickY\(0\);\s*quickScale\(1\)/);
  assert.match(footer, /quickScale\(1\.04\)/);
  assert.match(footer, /const onPointerEnter[\s\S]*?getBoundingClientRect\(\)/);
  assert.match(footer, /event\.pointerType !== "mouse"/);
  assert.doesNotMatch(footer, /gsap\.to\(target,/);
  assert.doesNotMatch(footer, /addEventListener\([^\n]*\{\s*once:\s*true/);
});

test("removed footer section links leave no handlers or styles behind", () => {
  assert.doesNotMatch(footer, /sectionLinks|footer-section-links|handleSectionClick/);
  assert.doesNotMatch(css, /footer-section-links|footer-eyebrow/);
  assert.match(footer, /scrollToTarget\(document\.getElementById\("hero"\)\)/);
  assert.match(layout, /<Footer\s*\/>/);
});

test("footer blurb uses the approved copy and narrow readable measure", () => {
  assert.match(site, /footerBlurb:\s*"Have a product to build or a team that needs a frontend developer\? I’m open to roles and freelance projects, so say hello\."/);
  assert.match(css, /\.footer-blurb\s*\{[^}]*max-width:\s*34rem[^}]*text-wrap:\s*pretty/s);
});

test("the footer CV button only transitions color properties", () => {
  assert.match(css, /\.button\s*\{[^}]*transition:\s*background-color 180ms ease, border-color 180ms ease, color 180ms ease/s);
  assert.doesNotMatch(css, /\.footer-cv-button[^}]*transition:[^}]*transform/);
});
