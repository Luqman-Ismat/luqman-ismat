# Source application examples

These examples adapt user-supplied application code. All bundled operational records are generated fictional fixtures. No production database, client assets, credentials, source exports, or original branded HTML are included.

## Component provenance and scope

- `inspection/`: Task Optimizer workbench, lifetime curves, rankings, contributors, asset panels, task pool, settings, search and workbook exporters. The original calculation engine and worker are in `public/examples/inspection`. Scenario service access is replaced with generated local models. Recalculation, scenario comparison, credits, gates, and Excel exports run locally.
- `project/WbsPage.tsx`: PPC Final WBS/Gantt including zoom, columns, split panes, dependencies, baseline/projected overlays, milestones and filters. Source network reads are replaced with local rows.
- `project/components/assignments`: original paired capacity heatmaps; wrapper provides fictional role demand, allocation and capacity scenarios.
- `project/components/mapping` and `lib/matching.ts`: original picker, hours hierarchy and deterministic matcher; wrapper provides fictional source buckets and local review/application state.
- `project/lib/mpp-mapper.ts`, `lib/version-diff.ts`: original imported schedule mapping and version comparison.
- `project/components/forecast`: original variance, sparkline and approval trail, inside a local forecast worksheet. Approval illustrates workflow; it is not authenticated multi-user approval.
- `project/components/quality`: original quality trend chart, with invented weekly measures.
- `parser/mpp_parser.py`: user-supplied Railway Python/MPXJ parser. Local adapter caps requests at 8 MB, binds loopback only and cleans temporary files after success or failure. No Railway account or live service is connected.

This is a portfolio adaptation of these components, not a migration of the entire enterprise application: production authentication, persistence, connectors and multi-user workflows are not included. Project workspace edits survive tab changes but reset on reload. Inspection settings use a separate portfolio browser-storage prefix.

## Build and run

`npm run build` regenerates both fixture sets and bundles the examples, then builds Next.js. Public examples are only embeddable on the same origin and are marked noindex. Their network policy allows same-origin requests only.

For parsing, install `parser/requirements.txt` into a Python virtual environment and provide Java 17+ through `JAVA_HOME`. Start `python examples/parser/run_local.py` (port 3188). Start the site with `DEMO_MPP_PARSER_URL=http://127.0.0.1:3188 npm run start -- --hostname 127.0.0.1 --port 3187` after building.

`npm run test:source-examples` requires both running services. It runs the actual inspection worker on two scenarios and the parser→mapper→revision comparison pipeline, asserting resource extraction and dependency integrity.

Deployment remains separate. The optional parser requires its own configured service; the local Flask development server is not a production server. The hosted parser needs a production process manager and upload/traffic limits before enabling public uploads. The other example views are static browser applications.

## Expanded reporting and guided exploration

The September 28 extension adds the original PPC cost and productivity charts and the complete risk page (matrix, trend, source distribution, response timing, kind groups, clusters, co-occurrence, ranking, relationship review and signal feed). Cost and productivity share `reporting-data.ts`: 240 wholly invented ledger entries. Weekly/monthly grouping and cumulative drilldowns conserve the same totals. Risk uses a separate six-project scenario with derived aggregates and browser-local relationship review. It is not tied to the imported schedule.

`npm run test:reporting` type-checks the reporting integration and checks ledger aggregation, trace totals, risk aggregates, response order and local review mutations. It runs in CI without a parser service. `npm run test:source-examples` retains the real Python service integration checks for local verification.

The Start here index and per-view guides explain the operational question, interactions, measures and limitations. Indices 0–8 are functional views and 9 is the overview. Chapter pages mount single views with `window.__demos[kind].mount(el, { view, bare: true })` (no header, tabs or guide; the chapter supplies the explanation from `lib/work/guides.ts`). Their stylesheets are scoped to `.demo-scope` by `scripts/scope-demo-css.mjs` and themed by `styles/demos.css`, so they follow the site's light/dark theme and can be re-branded live. Work thumbnails are real captures of the themed fictional applications.
