import { escape } from "../lib/html.mjs";

export function EditorialStatement(props) {
  const text = escape(props.text || "");
  const eyebrow = props.eyebrow
    ? `<span class="hs-editorial-eyebrow">${escape(props.eyebrow)}</span>`
    : "";
  const cta = props.cta && props.cta.label
    ? `<a class="hs-editorial-cta" href="${escape(props.cta.href || "#")}"><span>${escape(props.cta.label)}</span><span class="hs-editorial-cta-arrow" aria-hidden="true">→</span></a>`
    : "";
  return `<section class="hs-editorial-statement"><div class="hs-editorial-inner">${eyebrow}<h2 class="hs-editorial-text">${text}</h2>${cta}</div></section>`;
}
