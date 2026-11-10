import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const base = process.env.SITE_URL || "http://127.0.0.1:3187";
const live = "https://www.luqmanismat.com";
const posts = [
  ...JSON.parse(
    await readFile(new URL("../content/articles.json", import.meta.url)),
  ),
  ...JSON.parse(
    await readFile(new URL("../content/new-articles.json", import.meta.url)),
  ),
];
const routes = [
  "/",
  "/services",
  "/work",
  "/work/project-controls",
  "/work/inspection-planning",
  "/engivault",
  "/engivault/unit-converter",
  ...Object.keys(
    JSON.parse(
      await readFile(
        new URL("../.next/prerender-manifest.json", import.meta.url),
      ),
    ).routes,
  ).filter((path) => path.startsWith("/engivault/calculators/")),
  "/about",
  "/blog",
  "/contact",
  "/privacy",
  ...posts.map((p) => p.href),
];
const seen = new Set();
for (const path of routes) {
  const res = await fetch(base + path);
  assert.equal(res.status, 200, path);
  assert.equal(
    res.headers.get("x-content-type-options"),
    "nosniff",
    path + " content type protection",
  );
  assert.equal(
    res.headers.get("x-frame-options"),
    "DENY",
    path + " frame protection",
  );
  const html = await res.text();
  assert.equal(
    (html.match(/<h1[ >]/g) || []).length,
    1,
    path + " one main heading",
  );
  assert.equal(
    (html.match(/rel="canonical"/g) || []).length,
    1,
    path + " one canonical",
  );
  assert.ok(
    html.includes(`href="${live}${path === "/" ? "" : path}"`) ||
      html.includes(`href="${live}${path}"`),
    path + " canonical target",
  );
  assert.ok(
    !html.includes("NEXT_HTTP_ERROR_FALLBACK;500"),
    path + " no server error",
  );
  for (const match of html.matchAll(/href="(\/(?!\/)[^"?&#]*)[^" ]*"/g))
    seen.add(match[1]);
  console.log("PASS " + path);
}
for (const path of seen) {
  if (path.startsWith("/_next/")) continue;
  const res = await fetch(base + path, { redirect: "follow" });
  assert.ok(res.ok, path + " internal link");
}
for (const [from, to] of [
  ["/controls", "/services#engineering"],
  ["/integrations", "/services#integrations"],
  ["/engineering", "/services#engineering"],
  ["/ten21", "/"],
  ["/ten21/sample", "/"],
  ["/consulting", "/services"],
  ["/consulting/sample", "/services"],
  ["/projects", "/work"],
  ["/projects/engivault", "/engivault"],
  ["/projects/field-01", "/"],
  ["/projects/innovari", "/work"],
  ["/demos", "/work"],
  ["/demos/sample", "/work"],
  ["/demos/project-controls", "/work/project-controls"],
  ["/portfolio", "/about#experience"],
  ["/portfolio/sample", "/about#experience"],
  ["/indus-blue", "/"],
  ["/indus-blue/sample", "/"],
  ["/apparel", "/"],
]) {
  const res = await fetch(base + from, { redirect: "manual" });
  assert.equal(res.status, 308, from + " permanent redirect");
  assert.equal(res.headers.get("location"), to, from + " destination");
}
// inquiry endpoint: refuses non-JSON and reports invalid fields without storing
{
  const wrongType = await fetch(base + "/api/inquiry", { method: "POST", headers: { "Content-Type": "text/plain" }, body: "x" });
  assert.equal(wrongType.status, 415, "inquiry rejects non-JSON");
  const invalid = await fetch(base + "/api/inquiry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "", email: "nope", brief: "", elapsed: 10000 }) });
  assert.equal(invalid.status, 422, "inquiry validates fields");
}
const sitemap = await (await fetch(base + "/sitemap.xml")).text();
for (const path of routes)
  assert.ok(
    sitemap.includes(live + (path === "/" ? "" : path)),
    path + " sitemap",
  );
assert.ok(
  !sitemap.includes(live + "/apparel<"),
  "redirects excluded from sitemap",
);
assert.equal((await fetch(base + "/not-a-real-page")).status, 404);
for (const file of [
  "/icon.svg",
  "/apple-icon.png",
  "/icon-192.png",
  "/icon-512.png",
  "/social-card.png",
  "/manifest.webmanifest",
  "/robots.txt",
])
  assert.ok((await fetch(base + file)).ok, file);
console.log(
  `PASS ${routes.length} pages, ${seen.size} internal targets, redirects, sitemap, 404, security headers, brand assets.`,
);
