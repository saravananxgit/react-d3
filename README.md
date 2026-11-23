# D3 + React Dashboard

A responsive dashboard with five interactive charts built with React, TypeScript, D3 and Tailwind CSS:

- Line chart: monthly revenue
- Bar chart: sales by product category
- Donut chart: website traffic sources
- Tidy tree: company structure
- Scatter plot: advertising spend vs. revenue

## Requirements

- Node.js 18 or newer
- npm

## Getting started

```bash
npm ci
npm run dev
```

Open the address Vite prints in the terminal (usually http://localhost:5173).

## Production build

```bash
npm run build
npm run preview
```

`npm run build` runs the TypeScript check before building the app into `dist/`.
`npm run preview` serves that build locally.

## Project structure

```text
src/
  components/
    charts/        one file per chart
    ChartCard.tsx  titled card around each chart
    Legend.tsx
    Tooltip.tsx
  data/            JSON datasets and their typed exports
  hooks/
    useContainerSize.ts
  models/
    charts.ts      data, props, tooltip and margin types
  utils/           shared D3 chart, axis, color and style helpers
  App.tsx          page layout and chart composition
```

## Implementation notes

- **DOM ownership:** React owns the page and chart containers. Each chart uses a ref
  and effect; D3 draws and manages the contents of its SVG.
- **Tooltips:** D3 event handlers update React tooltip state. Tooltip state is not a
  dependency of the drawing effect, so showing a tooltip does not redraw the chart.
- **Responsive sizing:** `useContainerSize` measures each chart container with a
  `ResizeObserver`. A size change redraws the chart. Effect cleanup interrupts
  transitions and removes D3 elements.
- **Chart layout:** Charts use margins to reserve room for axes and labels. Shared
  axis helpers live in `utils/axis.ts`; tooltip events and SVG cleanup are shared
  in `utils/chart.ts`.
- **Data joins:** D3 joins use stable keys such as dates, categories, campaign IDs,
  and tree-node paths.
- **Styling:** Tailwind classes style the page, labels, axes and chart marks.
  Donut segments and scatter points receive colors from D3 ordinal scales.

## Interaction and design decisions

- Bar labels rotate on narrow charts to remain readable. The entrance animation
  plays on the first draw and is disabled for users who prefer reduced motion.
- Donut percentage labels are omitted for very small segments; the legend identifies
  every category.
- Line points, bars, donut segments and scatter points are keyboard-focusable and
  show tooltips on focus. Tree branches can be collapsed or expanded by clicking
  or pressing Enter or Space.
- The tree has a minimum SVG width and scrolls horizontally in its container on
  narrow screens. Collapsing a branch does not modify the source data.
- D3 is imported through named imports from `d3`. Tailwind CSS v3 is configured
  through PostCSS.
