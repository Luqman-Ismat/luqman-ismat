# Unified practice design

A project lead is reviewing a prospective consultant on a laptop in a daytime office, then sending the link to a colleague on a phone. Use a readable light default, an explicit dark option, and compact controls that stay consistent across content and tools.

Reference: the existing personal site's large split compositions, merged with EngiVault's documented Montserrat typography and monochrome control system. Voice: precise, practical, considered. Retain the personal-name identity and main page components. Indus Blue receives an indigo surface and pale blue CAD canvas within the shared system.

Typography is self-hosted Montserrat Variable, chosen to preserve the EngiVault identity. Body 13–16px for dense supporting copy, 16px article prose; large but readable title hierarchy. Components use 6–9px radii, thin neutral borders, restrained state changes, and visible keyboard focus. Theme selection uses next-themes with a light default and persistent user choice.

Home prioritizes consulting and uses real EngiVault imagery; a concise service index and two evidence-led work panels route users. Consulting groups project delivery, connected operations, and technical systems. The interactive controls example is explicitly illustrative. Indus Blue uses an indigo split hero, original garment CAD, collection status, and contract-development packages.

Articles use a searchable text index, reliable local imagery where available, stable publication dates, per-page canonical metadata, and a readable shared layout. Case studies retain evidence and shed repeated promotional sections. Header, footer, buttons, contact, privacy, 404 and the CAD study share the same system.

No fabricated results, testimonials, inventory or production-ready claims. No background motion, decorative gradients, or simulated live data. Mobile tables scroll within their own region; the page itself does not overflow.

## September 27 integration revision
The current EngiVault source at ea8d7f2 supersedes the older theme duplication guide. Its floating rounded navigation, Montserrat weights, raised surfaces, and light/dark OKLCH palette are shared across the website. `styles/engivault.css` is the final shared theme layer; its HSL token values are converted from EngiVault's OKLCH values for compatibility with the existing Tailwind configuration. Site containers are fluid with 20–64px responsive gutters, without a desktop max-width cap. Article prose retains a readable measure.

EngiVault has native calculator pages and unit conversion under /engivault. The Blog is explicitly named in navigation and featured on the homepage. Project controls, dashboards, and integrations have dedicated consulting landing pages.

## Work and experience revision
Homepage uses an interactive workbench preview aligned with the rest of the site. Three neutral workflow demos use compact controls, traceable tables, visible sample-data labels, and illustrative charts. About restores the user's existing portrait and personal background. Experience is shown in an expandable, keyboard-operable Gantt with employer filters and year/quarter zoom. Wide timelines and tables scroll inside their regions.

The global persistent header displays the current page after the slash. Shared-layout motion transfers the selected desktop navigation label to that location and returns the previous label to navigation. Respect reduced-motion preference. Keep text and controls usable on phone widths.

## Navigation simplification
Keep all primary destinations visible in a stable order. The current page label slides into place beside the slash, independently of navigation links. Use one flat row of related destinations in each section. Work is the single demos and case studies index; About owns experience. Keep the Work introduction compact so the examples appear immediately.
