import { escape } from "../lib/html.mjs";

export function SiteHeader(props) {
  const brand = escape(props.brand || "Studio");
  const brandHref = props.brandHref ? ` href="${escape(props.brandHref)}"` : "";
  const links = Array.isArray(props.links) && props.links.length
    ? `<ul class="hs-site-header-nav">${props.links.map(l => `<li><a href="${escape(l.href || "#")}">${escape(l.label || "")}</a></li>`).join("")}</ul>`
    : "";
  const cta = props.cta && props.cta.label
    ? `<a class="hs-site-header-cta" href="${escape(props.cta.href || "#")}">${escape(props.cta.label)}<span class="hs-site-header-cta-dot" aria-hidden="true"></span></a>`
    : "";
  const scrollScript = `<script>(function(){var h=document.querySelector('.hs-site-header');if(!h)return;function u(){h.classList.toggle('hs-scrolled',window.scrollY>40);}window.addEventListener('scroll',u,{passive:true});u();}());</script>`;
  return `<header class="hs-site-header"><a class="hs-site-header-brand"${brandHref}>${brand}</a>${links}${cta}</header>${scrollScript}`;
}
