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

## October 2026 redesign: Drafting Table
Supersedes the earlier "no background motion" rule at the user's request for a complete redesign drawing on Awwwards, Godly, Dribbble, 21st.dev, CodePen and Monet. `styles/redesign.css` loads last and sets the final tokens.

- Palette: warm paper (`45 18% 93%`) and ink (`60 6% 7%`), one signal orange (`14 100% 52%`) for accents, focus and selection. Dark mode inverts to ink paper. 
- Type: Geist for working text, Geist Mono for labels and metadata, Instrument Serif italic for the human accent phrase in each headline. All self-hosted.
- Motion: masked word reveals, clip-path image reveals, marquees, a pointer-following preview on the services index, spotlight borders on the bento grid, magnetic CTA, a custom cursor on fine pointers, and a reading-progress hairline. All of it is disabled under `prefers-reduced-motion`; content is server-rendered and readable without JavaScript motion.
- Home: oversized name hero with statement, cinematic photo band, services index, bento of real work, interactive lab, inverted EngiVault band, process, About, Indus Blue, journal list. Footer carries the primary "Start a project" call to action.
- Content rules from PRODUCT.md still apply: no fabricated results, live data or availability claims. The header clock shows real Houston time only.

## October 2026: journey, HUD and native demos
Supersedes the header and homepage sections above.

- Homepage: a fixed react-three-fiber scene behind seven chapters. Stations are wireframes in ink and signal (gyroscope core, 3D schedule, data network, shell-and-tube exchanger, the textured Pashk Coat, globe, portal). Scroll flies the camera; hold-to-interact controls (pointer, touch, Space/Enter) drive each station; a rail and arrow/number keys jump between chapters. Phones frame objects above the copy; no WebGL shows still images.
- Navigation: corner HUD chips, full-screen anime.js menu (circle reveal, split letters, previews, arrow keys, focus trap, Esc), a hide-on-scroll section dock, a Next step at the end of every page, and a tile curtain between pages. Lenis smooth scroll.
- Indus Blue: an indigo-night scope with madder red as the signal colour. Garments are drawn from shared millimetre pattern geometry; doch motifs (setareh with mirrors, toi, gol, kap) are generated on a 2.2 mm stitch grid and layered as pakka panels (kap border, rule, toi band, field). The same flats texture the 3D garment.
- Demos: native mounts with a token bridge; never a separate dark container.
- Reduced motion turns off every animation, including chapter entrances, the menu reveal, the curtain and smooth scroll; content never depends on an animation to become visible.

## October 2026: chapters, Explore and TEN21
Supersedes the journey section above where they differ.

- One content model (`lib/chapters.ts`). Overlapping pages (consulting, dashboards, integrations, projects, demos, portfolio) collapse into four chapters: Controls, Integrations, Engineering, TEN21. Each component appears once.
- Home chapters carry a title, one line and a single **Explore** control. Explore explodes the station (anime.js drives `journey.explode`), the camera pushes in, and the chapter opens on the same station already exploded, with every part labelled and linked to its component.
- Components rise into place in 3D as they enter (perspective, rotateX), their part glyph (the same plate as in 3D) traces itself in, and the explanation sits beside the working thing. Live views mount lazily, one per component.
- TEN21 (formerly Indus Blue) uses the site theme in light and dark. Flats draw in, then separate into named construction pieces with leader-line labels in collision-free columns; the view pulls back as the pieces separate.
- A labelled Light/Dark switch lives in the HUD and the menu.

## October 2026: sheets instead of chapter pages
- Work chapters open as frosted-glass sheets over the exploded station (aperture reveal from the Explore button); no nested chapter pages. The URL (`?s=`) carries the open sheet so Back, links and the menu work.
- The glass and the scrolling content each carry the reveal clip; nothing wrapping them sets filter, transform or clip-path, so the blur keeps a backdrop and fixed children (the re-brand dock) stay fixed. The clip is dropped once revealed.
- About: portrait hero and the experience schedule in the site's motion language (bars build in, live Today line, milestone).
