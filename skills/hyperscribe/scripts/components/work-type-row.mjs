import { escape } from "../lib/html.mjs";

const ALIGNS = new Set(["left", "right"]);

export function WorkTypeRow(props) {
  const align = ALIGNS.has(props.align) ? props.align : "left";
  const image = props.image
    ? `<div class="hs-work-row-media"><img src="${escape(props.image)}" alt="${escape(props.title || "")}" loading="lazy"></div>`
    : "";
  const meta = Array.isArray(props.meta) && props.meta.length
    ? `<ul class="hs-work-row-meta">${props.meta.map(m => `<li>${escape(m)}</li>`).join("")}</ul>`
    : "";
  const body = `<div class="hs-work-row-body">${meta}<h3 class="hs-work-row-title">${escape(props.title || "")}</h3>${props.description ? `<p class="hs-work-row-desc">${escape(props.description)}</p>` : ""}${props.cta && props.cta.label ? `<a class="hs-work-row-cta" href="${escape(props.cta.href || "#")}">${escape(props.cta.label)} <span aria-hidden="true">→</span></a>` : ""}</div>`;
  return `<article class="hs-work-row hs-work-row-align-${align}">${image}${body}</article>`;
}
