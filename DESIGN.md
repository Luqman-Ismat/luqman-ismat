# Design: TEN21 Consulting (November 2026)

Replaces the October systems (archived in `docs/archive/`). Built from three references the user chose: 4wide.jp/service (visible grid, parenthetical labels, letter-roll hovers, bent WebGL image strip), mecha-xyz (sticky section index with progress, masked line reveals, hairlines that draw in, contrast through opacity), and esrbespoke.au (strict monochrome, colour only from media, scroll-focus list, full-screen wordmark footer, curtain transitions). Nothing was copied; principles only.

## Tokens (`styles/system.css`, the only design stylesheet)
- Ground `#0b0b0a`, raised `#121211`, ink `#ecebe6`, dim `#8e8d88`, dim-2 `#5c5b57`, hairline `rgba(236,235,230,.14)`, column line `rgba(236,235,230,.045)`. No accent colour. Footer inverts to ink-on-paper.
- Type: Host Grotesk Variable for everything readable (statements 450, headings 500, wordmark 600, tight negative tracking). Martian Mono Variable at 10.5px uppercase, +0.06em, for every label, number, nav item and button.
- Labels are parenthesised: `(Services)`, `(01)`. Section intro uses letter-spaced "Introduction".
- Grid: 12 columns (4 on phones), gutter `clamp(12px,1.4vw,20px)`, margin `clamp(18px,2.6vw,40px)`, faint column lines fixed behind the page. Sections: label in columns 1-3, content from column 4.
- Shapes: no cards or shadows. Lists are hairline rows. Buttons are full pills; everything else square.
- Images: greyscale by default, colour on hover; work strip shows the centred piece in colour.

## Motion (`components/site/motion.tsx`)
- Lenis smooth scroll on the GSAP ticker, ScrollTrigger synced. One easing family: expo (`cubic-bezier(.19,1,.22,1)`, `expo.inOut` for curtains and hairlines).
- Attributes: `data-lines` (SplitText masked line reveal), `data-rule`, `data-clip` (unclip + settle from 1.18), `data-parallax`, `data-fade`, `.rows > li` (top hairline draws, cells rise), `data-ftr` (footer rises from underneath).
- First viewport intro is pure CSS (`data-intro`, wordmark slot roll) so it cannot hang.
- Route curtain on internal links (capture-phase click handler), with a 1.8s safety push.
- Header: links and CTA step aside while scrolling down; `:: Menu` takes their place. Full-screen menu with clip reveal, focus trap, Esc.
- `prefers-reduced-motion`: no Lenis, no reveals, no curtain, no WebGL (strip falls back to a scroll-snap row).

## Signature pieces
- `ServicesFocus`: huge typographic list; the row nearest the viewport centre is lit, a sticky card beside it swaps glyph, deliverables and starting price.
- `WorkStrip`: three.js barrel-bent strip, drag/flick/trackpad, chromatic shift with velocity, greyscale off-centre, prev/next buttons and an Open link for keyboard users.
- `SectionIndex`: sticky index whose hairlines fill with reading progress (services page, articles).
- Footer: giant TEN21 wordmark, inverted palette.

## EngiVault
Legacy EngiVault components keep their own classes (`styles/engivault.css`, `styles/vault.css`) but read the system's HSL tokens, so they render in the new palette. `.vault` sits inside the shared shell.

## Titles (November 2026 revision)
The user found large bold headlines the clearest "AI-made" tell. Rules now:
- No display-size headlines. Every h1/h2 is a `Title` (`components/site/title.tsx`) at 17-28px, weight 450, max ~24ch.
- Titles sit in corners: section heads put the label in one corner and the title in the opposite one (`SectionHead pos="tl" | "tr"`, alternating down the page). Page heads: title top-left, label top-right, lede below the title.
- Motion (`[data-ttl]` in `motion.tsx`): letters assemble from scattered positions on entry, the line drifts sideways with scroll, letters come apart as the title moves into the top sixth of the screen (scrubbed, so scrolling back rebuilds it), random letters twitch every few seconds, and pointer contact jostles them. The TEN21 wordmarks assemble and break apart the same way. Reduced motion: all static.
- Statements are 19-27px; the services focus list is 24-48px.

## Products
`/work`, `/work/project-controls`, `/work/inspection-planning` mount the complete applications from `examples/` natively (`ProductMount`, bundles in `public/examples`, token bridge in `styles/products.css`). Fictional data, labelled on every page. Product screenshots in `public/images/work` are captured from these pages in the dark theme.

## Custom visuals and the cuts (November 2026)
- "Custom visuals" is service 02 (interactive diagrams, live charts, 3D/WebGL, motion). The homepage carries a live showcase (`components/site/visuals.tsx`): the P&ID schematic, a code-drawn chart with pointer readout, and a wireframe exchanger in three.js. Nothing in it is a screenshot.
- EngiVault lives under Work only (strip item and /work index). It is not in the nav or a homepage section of its own.
- Homepage is hero, intro, services, visuals, work, journal (3), close. Starting points and Process live on /services only.

## Case studies (November 2026)
`/work/<slug>` is a case study in the auge-xp shape: full-bleed cover with parallax, spec sheet (year, stack, feature chips, four facts), description with the project's own live visual (schedule / cost curves / P&ID), challenge, image band, solution, image band, the working application (or the live product link), related services, and a full-bleed Next project. Each project carries its own accent (`--accent`, also fed to the mounted app as `--demo-accent`): project controls amber, inspection teal, EngiVault blue. Every screenshot under `public/images/work` is captured from the dark site itself; no old-theme captures remain. The P&ID schematic lives on /engivault and the EngiVault case study; the homepage visuals panel uses the live schedule instead.

## No screenshots, ever (November 2026)
Every project is shown by the thing itself: a code-drawn visual (`components/site/live-gantt`, `cost-curves`, `inspection-visuals`, `plant-schematic`, `service-visuals`, `career-timeline`, `article-figure`) or the real application mounted into the page (`ProductMount`, bare `view` for a single chapter). `public/images/work` no longer exists. The embedded apps are re-coloured at build time by `scripts/theme-examples.mjs` (saturated hex and rgba mapped by hue: greens to the accent, blues and purples to greys, ambers to sand, reds to one red). Case studies are chaptered: brief, one live chapter per feature with question, text and steps, then All together. Social cards live in `public/og/<slug>.png`.

## Quality loop
Build, `npx next start -p 4400`, CDP harness screenshots reviewed by eye, then a blind critic subagent that never sees source or prior scorecards. Four rounds so far; fix lists applied in order of value.
