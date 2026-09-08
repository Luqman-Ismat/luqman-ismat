# Luqman Ismat — personal website

Local working copy of `Luqman-Ismat/luqman-ismat`, the existing Next.js site for https://www.luqmanismat.com. The similarly named `luqmanismat` repository is an older, incomplete source and is not used here.

## Run

```sh
npm ci
npm run dev -- --port 3187
```

Open http://localhost:3187. Production verification:

```sh
npm run build
node scripts/verify-articles.mjs
```

The production build checks TypeScript. The inherited lint script has no configured ESLint installation, so lint is not included in verification.

## Writing

- `content/articles.json` holds metadata for the 15 existing articles. Their bodies remain in `app/blog/<slug>/page.tsx`.
- `content/new-articles.json` holds three new articles and is the place to add further writing. Each record contains a unique slug, matching href, title, description, category, ISO date, existing local image, sections, and references.
- `app/blog/[slug]/page.tsx` generates pages and metadata for those new records.
- `lib/articles.ts` provides the sorted catalog for the blog index, homepage, related articles, search component, and sitemap.
- Leave unverified historical dates null in the existing catalog and omit the corresponding page date. These entries show “From the archive.” Do not replace publication dates with the current date at render time.

New writing added September 8, 2026:

1. AI in Engineering: Build the Review Before the Automation
2. What Makes an Engineering Calculation Reviewable?
3. Better EPC Handoffs Start with a Decision Record

The articles use illustrative examples, not claims about completed client work. References are included in each article. Review the wording and date when preparing a public release.

## Changes in this working copy

The reading layout now uses an opaque, centered text column, section navigation, reading time, and visible references. Existing article bodies and routes are retained. Lists share one catalog, recent articles sort by date, three fabricated live dates were removed, and the footer year updates automatically. Existing TypeScript errors were fixed and build-time type checking is enabled.

## Deployment

This is the existing Vercel/Next.js application; no domain, production deployment, or remote branch has been changed. Keep its existing hosting workflow. It does not currently produce the Cloudflare Worker output required by Sites hosting, so a Sites deployment would require a separate migration. The changes are on local branch `website/editorial-update`.
