# Neutral work demonstrations

## Source review
The user supplied two local application folders for review. Inspection was limited to source architecture, UI components, and calculation/workflow structure. Bundled operational snapshots, database extracts, and production credentials were not loaded into the site. Neither source application was started or connected to its original services.

- Task-planning workbench: reviewed the README and ranking/review-hold components and display vocabulary. Demonstrated asset selection, timing comparison, an illustrative risk curve, explicit holds, and controlled export.
- Project-controls platform: reviewed architecture, cost rollup logic, productivity UI, and deterministic mapping structure. Demonstrated scoped forecasts, role-priced remaining effort, schedule inspection, record reconciliation, and a review/apply step.

The demos are newly authored reconstructions, not sanitized copies of operational applications. Fixtures are invented in `lib/demos/models.ts`. No source app screenshots, logos, records, SQL, endpoints, authentication, database clients, or production optimization engine are copied. Every demo visibly identifies fictional data and no live client connection. The simplified inspection model is explicitly labeled illustrative and not inspection advice.

## Restored personal content
The original website's About and portfolio source was recovered from the local Git baseline. The rebuild restores a personal introduction, existing local portrait, background, education, personal interests, recitation link, technical toolkit, and an experience Gantt chart. Employer names remain public at the user's explicit request. Client names and unverified quantified outcomes from old role descriptions were omitted.

User-confirmed updates: University of Houston graduation in May 2026; Project Controls Consultant at Pinnacle November 2025–May 2026; current Risk Analyst at Pinnacle. May 2026 was used as the Risk Analyst start month, with that assumption stated to the user; an exact start month was not separately supplied. Reliability Data Analyst is shown through the November 2025 transition. Overlapping boundary months are intentional at month-level resolution.

## Navigation and homepage
The homepage now uses an interactive work preview, demo links, and personal background links instead of the earlier EngiVault screenshot hero. Header moved into the root layout so it persists across navigation. Shared motion layout identifiers transfer the selected navigation label beside the slash. Fixed-header layout roots account for page scrolling; reduced-motion preference disables the transition.

## Checks
`npm run test:demos` checks forecast arithmetic/scoping, action timing, review hold exclusion, reconciliation, CSV quoting, and career bar positions. Production route validation now includes About, Portfolio, the demo library, and all three demos. Browser verification covers sliders, filters, drill-downs, mapping/apply, actual downloaded CSVs, timeline expansion/zoom, and header label movement.
