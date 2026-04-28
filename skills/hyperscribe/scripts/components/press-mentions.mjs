import { escape } from "../lib/html.mjs";

export function PressMentions(props) {
  const eyebrow = props.eyebrow || "As featured in";
  const mentions = Array.isArray(props.mentions) ? props.mentions : [];
  const items = mentions.map(m =>
    `<li class="hs-press-item"><span class="hs-press-name">${escape(m.name || "")}</span>${m.note ? `<span class="hs-press-note">${escape(m.note)}</span>` : ""}</li>`
  ).join("");
  return `<section class="hs-press-mentions"><p class="hs-press-eyebrow">${escape(eyebrow)}</p><ul class="hs-press-list">${items}</ul></section>`;
}
