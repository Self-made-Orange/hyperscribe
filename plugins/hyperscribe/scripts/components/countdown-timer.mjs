import { escape } from "../lib/html.mjs";

const TIMER_JS = `
if (!window.__hsCountdownLoaded) {
  window.__hsCountdownLoaded = true;
  document.addEventListener('DOMContentLoaded', function() { setup(); });
  if (document.readyState !== 'loading') setup();

  function setup() {
    document.querySelectorAll('.hs-countdown').forEach(function(el) {
      if (el.__hsInit) return;
      el.__hsInit = true;
      var target = new Date(el.dataset.target).getTime();
      if (isNaN(target)) return;
      var dEl = el.querySelector('.hs-countdown-d');
      var hEl = el.querySelector('.hs-countdown-h');
      var mEl = el.querySelector('.hs-countdown-m');
      var sEl = el.querySelector('.hs-countdown-s');
      var liveLabel = el.dataset.liveLabel || 'LIVE NOW';
      function pad(n) { return String(Math.max(0, n)).padStart(2, '0'); }
      function tick() {
        var diff = target - Date.now();
        if (diff <= 0) {
          el.classList.add('hs-countdown-live');
          if (dEl) dEl.textContent = '00';
          if (hEl) hEl.textContent = '00';
          if (mEl) mEl.textContent = '00';
          if (sEl) sEl.textContent = '00';
          var label = el.querySelector('.hs-countdown-status');
          if (label) label.textContent = liveLabel;
          clearInterval(timer);
          return;
        }
        var s = Math.floor(diff / 1000);
        var d = Math.floor(s / 86400); s -= d * 86400;
        var h = Math.floor(s / 3600);  s -= h * 3600;
        var m = Math.floor(s / 60);    s -= m * 60;
        if (dEl) dEl.textContent = pad(d);
        if (hEl) hEl.textContent = pad(h);
        if (mEl) mEl.textContent = pad(m);
        if (sEl) sEl.textContent = pad(s);
      }
      tick();
      var timer = setInterval(tick, 1000);
    });
  }
}
`.trim();

export function CountdownTimer(props) {
  const target = typeof props.target === "string" ? props.target : "";
  if (!target) return "";
  const label = props.label ? `<div class="hs-countdown-status">${escape(props.label)}</div>` : "";
  const liveLabel = props.liveLabel ? ` data-live-label="${escape(props.liveLabel)}"` : "";
  return `<div class="hs-countdown" data-target="${escape(target)}"${liveLabel}>${label}<div class="hs-countdown-cells"><div class="hs-countdown-cell"><span class="hs-countdown-num hs-countdown-d">--</span><span class="hs-countdown-unit">DAYS</span></div><div class="hs-countdown-sep">:</div><div class="hs-countdown-cell"><span class="hs-countdown-num hs-countdown-h">--</span><span class="hs-countdown-unit">HOURS</span></div><div class="hs-countdown-sep">:</div><div class="hs-countdown-cell"><span class="hs-countdown-num hs-countdown-m">--</span><span class="hs-countdown-unit">MIN</span></div><div class="hs-countdown-sep">:</div><div class="hs-countdown-cell"><span class="hs-countdown-num hs-countdown-s">--</span><span class="hs-countdown-unit">SEC</span></div></div><script>${TIMER_JS}</script></div>`;
}
