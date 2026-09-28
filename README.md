# Luqman Ismat / Consulting & Indus Blue

The existing luqmanismat.com Next.js site, refreshed around consulting for project delivery and connected operations, with EngiVault as an engineering software case study and Indus Blue as the apparel label and contract-development practice.

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

- `/`: consulting overview and selected work.
- `/consulting`: project management, project controls, dashboards, integrations, automation, and packages. The interactive dashboard is explicitly illustrative, not a live integration.
- `/engineering`: engineering systems, technical applications, and CAD support.
- `/indus-blue`: the developing apparel label and contract development for other brands. No product inventory, checkout, or mailing-list signup is simulated.
- `/projects`: EngiVault and Field 01.
- `/projects/engivault`: source-reviewed independent-product case study and real product screenshots.
- `/projects/field-01`: interactive garment and hardware viewers with downloadable CAD.
- `/blog`: searchable/filterable insights, with all existing article routes retained.
- `/contact`: service/package-aware project brief builder.
- `/privacy`: describes the site's actual handling of form data, theme preference, and hosting.

Legacy `/about`, `/apparel`, `/portfolio`, iNNOVARi, and Pinnacle portfolio URLs redirect to their relevant current sections. Unsupported historical promotional claims are no longer published as case studies.

## Inquiry behavior

The form prepares a draft locally and lets the visitor open their email app or copy the brief. It does not submit data to a backend or send mail automatically. Direct email and phone links remain available. No email-service credentials or database are needed to run this site. If server-side email delivery is added later, configure delivery, abuse protection, error handling, and privacy copy together.

## Brand and content

`PRODUCT.md` and `DESIGN.md` define the approved direction. Montserrat Variable is served locally from the installed font package. Monochrome consulting surfaces merge the personal site's split layouts with EngiVault's visual system. Indigo identifies Indus Blue. The shared header/footer/theme controls apply across all pages.

`content/articles.json` and `content/new-articles.json` are the article catalog. Keep unverified historical dates null; do not invent dates. Existing article bodies remain under `app/blog`. Case studies must distinguish independent development from client work and must not claim unmeasured results.

## Original CAD

`public/cad/field-01` includes millimetre-based layered DXFs, a STEP/STL hardware solid, four-sheet PDF, specifications/BOM CSVs, source, and a ZIP. The website viewer uses the same garment coordinates and triangulated hardware geometry as the exports.

Rebuild with Python, CadQuery 2.8.0, ezdxf 1.4.4, and ReportLab 4+:

```sh
python scripts/cad/build_field01.py public/cad/field-01
```

The generator audits both DXFs and reimports STEP to check validity, solid count, and dimensions. Sheet 03 is full scale on A3 at 100%; check the calibration bar. These are development studies, not approved manufacturing drawings, validated garment patterns, or load-rated hardware. The pull is a separate accessory study.

## Deployment boundary

This revision is prepared and verified locally on `website/consulting-launch`. No remote push or deployment has been performed. For the existing hosting project, use Node.js 22, npm installation, `npm run build`, and the Next.js framework preset. No runtime secrets are required. Before promoting, review the final content and the Indus Blue launch status. After deployment, verify the production domain, redirects, email handoff, and CAD downloads on the actual host.
