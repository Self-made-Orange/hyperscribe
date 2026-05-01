import { escape } from "../lib/html.mjs";

const CAROUSEL_JS = `
if (!window.__hsHeroCarouselLoaded) {
  window.__hsHeroCarouselLoaded = true;
  document.addEventListener('DOMContentLoaded', function() { setup(); });
  if (document.readyState !== 'loading') setup();

  function setup() {
    document.querySelectorAll('.hs-hero-carousel').forEach(function(el) {
      if (el.__hsInit) return;
      el.__hsInit = true;
      var slides = Array.from(el.querySelectorAll('.hs-hero-slide'));
      if (slides.length === 0) return;
      var counter = el.querySelector('.hs-hero-counter');
      var interval = parseInt(el.dataset.interval || '5500', 10);
      var i = 0;
      function show(n) {
        i = ((n % slides.length) + slides.length) % slides.length;
        slides.forEach(function(s, idx) { s.classList.toggle('hs-hero-slide-active', idx === i); });
        if (counter) counter.textContent = (i + 1) + ' / ' + slides.length;
      }
      show(0);
      var timer = setInterval(function() { show(i + 1); }, interval);
      el.addEventListener('mouseenter', function() { clearInterval(timer); });
      el.addEventListener('mouseleave', function() { timer = setInterval(function() { show(i + 1); }, interval); });
    });
  }
}
`.trim();

export function HeroCarousel(props) {
  const slides = Array.isArray(props.slides) ? props.slides : [];
  if (slides.length === 0) return "";
  const interval = Number.isFinite(props.interval) ? Math.max(2000, props.interval) : 5500;
  const slidesHtml = slides.map((s, i) => {
    const img = s.image ? `<img src="${escape(s.image)}" alt="${escape(s.title || "")}" loading="${i === 0 ? "eager" : "lazy"}">` : "";
    const overlay = s.title || s.subtitle
      ? `<div class="hs-hero-slide-meta">${s.subtitle ? `<span class="hs-hero-slide-subtitle">${escape(s.subtitle)}</span>` : ""}${s.title ? `<span class="hs-hero-slide-title">${escape(s.title)}</span>` : ""}</div>`
      : "";
    return `<div class="hs-hero-slide${i === 0 ? " hs-hero-slide-active" : ""}">${img}${overlay}</div>`;
  }).join("");
  const playReel = props.playReel && props.playReel.label
    ? `<a class="hs-hero-play-reel" href="${escape(props.playReel.url || "#")}"><span class="hs-hero-play-reel-icon" aria-hidden="true">▶</span><span>${escape(props.playReel.label)}</span></a>`
    : "";
  const lead = props.lead ? `<div class="hs-hero-lead"><p>${escape(props.lead)}</p></div>` : "";
  return `<section class="hs-hero-carousel" data-interval="${interval}"><div class="hs-hero-stage">${slidesHtml}<div class="hs-hero-overlay">${playReel}<span class="hs-hero-counter">1 / ${slides.length}</span></div></div>${lead}<script>${CAROUSEL_JS}</script></section>`;
}
