import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const footerSource = await readFile(new URL("../components/layout/Footer.tsx", import.meta.url), "utf8");

test("footer cleanup kills GSAP tweens created by magnetic pointer handlers", () => {
  assert.match(footerSource, /removeEventListener\("pointerleave", onPointerLeave\);[\s\S]*?gsap\.killTweensOf\(target\)/);
});

test("footer refreshes its scoped effects when route layout changes", () => {
  assert.match(footerSource, /\}, \[pathname\]\);/);
});
