import { test } from "node:test";
import assert from "node:assert/strict";
import { DependencyGraph } from "../../plugins/hyperscribe/scripts/components/dependency-graph.mjs";

const sample = {
  layout: "ranks",
  nodes: [
    { id: "app", label: "app.ts", type: "module" },
    { id: "lib", label: "lib/util.ts", type: "module" },
    { id: "ext", label: "lodash", type: "external" }
  ],
  edges: [
    { from: "app", to: "lib", kind: "import" },
    { from: "lib", to: "ext", kind: "import" },
    { from: "app", to: "app", kind: "import", cyclic: true }
  ],
  ranks: [["app"], ["lib"], ["ext"]]
};

test("DependencyGraph: root element is SVG", () => {
  const html = DependencyGraph(sample);
  assert.match(html, /<svg[^>]*class="hs-dep-graph"/);
});

test("DependencyGraph: renders a node group per node id", () => {
  const html = DependencyGraph(sample);
  assert.match(html, /data-node-id="app"/);
  assert.match(html, /data-node-id="lib"/);
  assert.match(html, /data-node-id="ext"/);
});

test("DependencyGraph: node labels appear as text", () => {
  const html = DependencyGraph(sample);
  assert.match(html, />app\.ts</);
  assert.match(html, />lib\/util\.ts</);
});

test("DependencyGraph: cyclic edge gets hs-dep-graph-edge-cyclic class", () => {
  const html = DependencyGraph(sample);
  assert.match(html, /class="[^"]*hs-dep-graph-edge-cyclic/);
});

test("DependencyGraph: external node type class applied", () => {
  const html = DependencyGraph(sample);
  assert.match(html, /hs-dep-graph-node-external/);
});

test("DependencyGraph: throws when layout=ranks without ranks", () => {
  assert.throws(() => DependencyGraph({ layout: "ranks", nodes: sample.nodes, edges: [] }),
    /ranks/i);
});

test("DependencyGraph: escapes labels", () => {
  const html = DependencyGraph({
    layout: "ranks",
    nodes: [{ id: "a", label: "<x>" }],
    edges: [],
    ranks: [["a"]]
  });
  assert.match(html, />&lt;x&gt;</);
});
