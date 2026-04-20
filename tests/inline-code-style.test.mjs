import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Section } from "../plugins/hyperscribe/scripts/components/section.mjs";
import { Callout } from "../plugins/hyperscribe/scripts/components/callout.mjs";

test("Section lead: renders inline code markup", () => {
  const html = Section(
    { id: "x", title: "Title", lead: "Use `render.mjs` for the main entry." },
    () => "",
    {}
  );
  assert.match(html, /<code>render\.mjs<\/code>/);
});

test("Callout body: renders inline code markup", () => {
  const html = Callout({
    severity: "info",
    body: "Keep `ArchitectureGrid` for topology-heavy explanations."
  });
  assert.match(html, /<code>ArchitectureGrid<\/code>/);
});

test("Base CSS: styles inline code beyond prose blocks", () => {
  const pluginCss = readFileSync(
    new URL("../plugins/hyperscribe/assets/base.css", import.meta.url),
    "utf8"
  );
  const rootCss = readFileSync(
    new URL("../skills/hyperscribe/assets/base.css", import.meta.url),
    "utf8"
  );

  for (const css of [pluginCss, rootCss]) {
    assert.match(css, /\.hs-section-lead code/);
    assert.match(css, /\.hs-callout-body code/);
  }
});
