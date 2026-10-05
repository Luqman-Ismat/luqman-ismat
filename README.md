# Luqman Ismat / Consulting & TEN21

The existing luqmanismat.com Next.js site, refreshed around consulting for project delivery and connected operations, with EngiVault as an engineering software case study and TEN21 as the apparel label and contract-development practice.

## Run locally

Use Node.js 22 LTS and npm. Dependencies are locked in `package-lock.json`.

```sh
npm ci
npm run dev -- --port 3187 --hostname 127.0.0.1
```

Development writes to `.next-dev`; production builds write to `.next`.

## Release checks

```sh
npm run lint
npm run build
npm run verify:content
npm audit --audit-level=moderate
npm run start -- --port 3187 --hostname 127.0.0.1
```

In another terminal:

```sh
npm run verify:site
```

`verify:site` checks every public content route, canonical metadata, internal destinations, sitemap, redirects, 404, security headers, brand assets, and byte-for-byte CAD downloads. Override `SITE_URL` to check another local preview. `verify:content` preserves all 18 articles, source links, archive labels, valid dates, and index order. GitHub Actions runs the same checks without deploying.

Next.js 16.3.6 / React 19.3.0. ESLint 9 is pinned for compatibility with the React plugin in Next's lint configuration. The production build uses webpack; no experimental bundler migration is required.

## Site structure

Content lives in one model, `lib/chapters.ts`. Each chapter is a station in the homepage scene and a page whose components are the station's exploded parts.

- `/`: a 3D chapter journey (react-three-fiber). Each chapter says one thing and offers one action, **Explore**: the station explodes into its parts, the camera pushes in, and the chapter page opens. Still images when WebGL is unavailable.
- `/controls`: schedule, capacity heatmaps, MS Project import, forecast & approval, portfolio risk. Each is a live component with its purpose, how it works and what to try.
- `/integrations`: hours mapping & reconciliation, cost & margin, productivity, quality trend, data model & access.
- `/engineering`: the inspection-planning workbench and the EngiVault plant schematic.
- `/ten21`: Collection 01. Each garment is a component: the production flat draws itself in, then separates into labelled construction pieces (front/back, line/colour).
- `/ten21/[slug]`: per-piece development tech packs (assembled/exploded flats, construction callouts, graded measurement spec, BOM, colourways, printable sheet).
- `/engivault`: the calculator library and unit converter.
- `/blog`: searchable/filterable insights, with all existing article routes retained.
- `/contact`: service/package-aware project brief builder.
- `/privacy`: describes the site's actual handling of form data, theme preference, and hosting.

`/consulting*`, `/projects*`, `/demos*`, `/portfolio*`, `/apparel` and `/indus-blue*` redirect permanently to the chapter that now holds their content (see `next.config.mjs`). Unsupported historical promotional claims are no longer published as case studies.

## Inquiry behavior

The form prepares a draft locally and lets the visitor open their email app or copy the brief. It does not submit data to a backend or send mail automatically. Direct email and phone links remain available. No email-service credentials or database are needed to run this site. If server-side email delivery is added later, configure delivery, abuse protection, error handling, and privacy copy together.

## Navigation and motion

There is no header bar. A corner HUD shows identity and location, a labelled Light/Dark switch sits beside "Let's talk", a full-screen menu (button or `M`) lists the chapters, a floating dock follows the current chapter's components (scrollspy), and each page ends with a Next step along Controls → Integrations → Engineering → TEN21 → EngiVault → Journal → About → Contact. Page changes use an anime.js tile curtain; scrolling uses Lenis. Every effect is disabled under `prefers-reduced-motion`.

## Working demos

The project-controls and inspection-planning applications mount natively (no iframe), one view per component via `mount(el, { view, bare: true })`, and only when that component nears the viewport. Their frosted-glass layers are flattened in-page (`backdrop-filter` off) because they repainted on every scroll frame. `npm run build:examples` bundles them and runs `scripts/scope-demo-css.mjs`, which scopes their CSS to `.demo-scope` and routes their colours through the site's tokens; `styles/demos.css` bridges the tokens. One dock per chapter re-brands every live component at once (accent, type, corners, density). The standalone `public/examples/*/index.html` pages still work on their own.

## Brand and content

`PRODUCT.md` and `DESIGN.md` define the approved direction. Geist, Geist Mono and Instrument Serif are self-hosted from installed packages (Montserrat remains a fallback). Warm paper and ink with one signal colour, everywhere, TEN21 included. The shared HUD, menu, footer and theme controls apply across all pages.

`content/articles.json` and `content/new-articles.json` are the article catalog. Keep unverified historical dates null; do not invent dates. Existing article bodies remain under `app/blog`. Case studies must distinguish independent development from client work and must not claim unmeasured results.

## Field 01 CAD (retired from the site)

`/projects/field-01` now redirects to `/ten21`. The original study files remain in `public/cad/field-01`, and `verify:site` still checks them byte for byte. That folder includes millimetre-based layered DXFs, a STEP/STL hardware solid, four-sheet PDF, specifications/BOM CSVs, source, and a ZIP. The site no longer renders these files.

Rebuild with Python, CadQuery 2.8.0, ezdxf 1.4.4, and ReportLab 4+:

```sh
python scripts/cad/build_field01.py public/cad/field-01
```

The generator audits both DXFs and reimports STEP to check validity, solid count, and dimensions. Sheet 03 is full scale on A3 at 100%; check the calibration bar. These are development studies, not approved manufacturing drawings, validated garment patterns, or load-rated hardware. The pull is a separate accessory study.

## Deployment boundary

This revision is prepared and verified locally on `website/consulting-launch`. No remote push or deployment has been performed. For the existing hosting project, use Node.js 22, npm installation, `npm run build`, and the Next.js framework preset. No runtime secrets are required. Before promoting, review the final content and the TEN21 launch status. After deployment, verify the production domain, redirects, email handoff, and CAD downloads on the actual host.
