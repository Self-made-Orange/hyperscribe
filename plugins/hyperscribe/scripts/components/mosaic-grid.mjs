export function MosaicGrid(props, renderChildren) {
  const cols = Number.isFinite(props.columns) ? Math.max(2, Math.min(12, props.columns)) : 12;
  const gap = typeof props.gap === "string" ? props.gap : "1rem";
  const rowHeight = typeof props.rowHeight === "string" ? props.rowHeight : "minmax(200px, auto)";
  const dense = props.dense === false ? "" : " hs-mosaic-grid-dense";
  const style = `--hs-mosaic-cols: ${cols}; --hs-mosaic-gap: ${gap}; --hs-mosaic-row: ${rowHeight};`;
  return `<section class="hs-mosaic-grid${dense}" style="${style}">${renderChildren()}</section>`;
}
