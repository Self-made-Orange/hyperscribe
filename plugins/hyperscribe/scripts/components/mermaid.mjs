import { escape } from "../lib/html.mjs";

const LOADER = `
if (!window.__hsMermaidLoaded) {
  window.__hsMermaidLoaded = true;
  var s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
  s.onload = function() {
    window.mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      fontFamily: 'Inter, system-ui, sans-serif',
      themeVariables: {
        primaryColor: '#f6f5f4',
        primaryTextColor: 'rgba(0,0,0,0.95)',
        primaryBorderColor: 'rgba(0,0,0,0.12)',
        lineColor: '#615d59',
        secondaryColor: '#f2f9ff',
        tertiaryColor: '#ffffff',
        actorBkg: '#f6f5f4',
        actorBorder: 'rgba(0,0,0,0.12)',
        actorTextColor: 'rgba(0,0,0,0.95)',
        actorLineColor: 'rgba(0,0,0,0.14)',
        signalColor: 'rgba(0,0,0,0.85)',
        signalTextColor: 'rgba(0,0,0,0.95)',
        labelBoxBkgColor: '#f6f5f4',
        labelBoxBorderColor: 'rgba(0,0,0,0.12)',
        labelTextColor: 'rgba(0,0,0,0.95)',
        loopTextColor: 'rgba(0,0,0,0.95)',
        noteBkgColor: '#fef9c3',
        noteBorderColor: '#eab308',
        noteTextColor: '#713f12',
        activationBkgColor: '#eef2ff',
        activationBorderColor: '#6366f1'
      }
    });
    window.mermaid.run();
  };
  document.head.appendChild(s);
}
`.trim();

export function Mermaid(props) {
  const kind = props.kind;
  let source = props.source;
  if (kind === "flowchart" && props.direction && !/^\s*flowchart/.test(source)) {
    source = `flowchart ${props.direction}\n${source}`;
  }
  return `<div class="hs-mermaid-wrap" data-kind="${escape(kind)}"><pre class="mermaid">${escape(source)}</pre><script>${LOADER}</script></div>`;
}
