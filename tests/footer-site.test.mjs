import assert from "node:assert/strict";
import test from "node:test";
import { site } from "../data/site.ts";

test("footer contact links and blurb use the approved profile data", () => {
  assert.equal(site.socials.github, "https://github.com/AmirMostafa-eng");
  assert.equal(site.socials.linkedin, "https://www.linkedin.com/in/amir-mostafa-522b29243");
  assert.equal(site.email, "amirmostafa119@gmail.com");
  assert.equal(site.whatsappNumber, "201280546430");
  assert.equal(site.footerBlurb, "Have a product to build or a team that needs a frontend developer? I’m open to roles and freelance projects, so say hello.");
});
