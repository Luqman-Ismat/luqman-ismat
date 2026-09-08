import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const existing = JSON.parse(read('content/articles.json'))
const added = JSON.parse(read('content/new-articles.json'))
const posts = [...existing, ...added]
assert.equal(new Set(posts.map(p => p.slug)).size, posts.length, 'Article slugs must be unique')
const index = read('.next/server/app/blog.html')
const home = read('.next/server/app/index.html')
const sitemap = read('.next/server/app/sitemap.xml.body')
for (const post of posts) {
  assert.ok(index.includes(`href="${post.href}"`), `${post.slug} missing from blog index`)
  assert.ok(sitemap.includes(`https://www.luqmanismat.com${post.href}`), `${post.slug} missing from sitemap`)
  const html = read(`.next/server/app/blog/${post.slug}.html`)
  assert.ok(html.includes('<h1'), `${post.slug} missing heading`)
  assert.ok(html.includes('id="section-1"'), `${post.slug} missing reading anchors`)
  if (!post.date) assert.ok(html.includes('From the archive'), `${post.slug} must not invent publication date`)
}
for (const post of added) {
  assert.ok(home.includes(`href="${post.href}"`), `${post.slug} missing from recent articles`)
  const html = read(`.next/server/app/blog/${post.slug}.html`)
  assert.ok(html.includes(`rel="canonical" href="https://www.luqmanismat.com${post.href}"`), `${post.slug} missing canonical`)
  for (const source of post.sources) assert.ok(html.includes(`href="${source.url}"`), `${post.slug} missing source`)
  for (const [index] of post.sections.entries()) assert.ok(html.includes(`id="section-${index + 1}"`), `${post.slug} missing section`)
  assert.ok(existsSync(new URL(`../public${post.image}`, import.meta.url)), `${post.slug} missing cover asset`)
}
const sorted = [...posts].sort((a, b) => (b.date ? Date.parse(b.date) : 0) - (a.date ? Date.parse(a.date) : 0) || a.slug.localeCompare(b.slug))
for (let i = 1; i < sorted.length; i++) assert.ok(index.indexOf(`href="${sorted[i - 1].href}"`) < index.indexOf(`href="${sorted[i].href}"`), 'Blog index must be newest first')
console.log(`Verified ${posts.length} article pages, index ordering, sitemap coverage, archive dates, and ${added.length} new articles with references.`)
