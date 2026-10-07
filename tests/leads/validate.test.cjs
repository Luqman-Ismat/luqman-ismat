const test = require('node:test');
const assert = require('node:assert/strict');
const { checkLead, MIN_ELAPSED_MS } = require('../../.test-leads/validate.js');

const good = { name: ' Ada ', email: 'Ada@Example.com', company: 'Acme', service: 'Project management & controls', package: '', timeline: 'Q1', brief: 'We need a schedule we can actually trust.', website: '', elapsed: MIN_ELAPSED_MS + 10, sourcePath: '/?s=controls', referrer: 'https://www.linkedin.com/', utm: { utm_source: 'linkedin', bogus: 'x' } };

test('accepts a complete inquiry and normalises it', () => {
  const r = checkLead(good);
  assert.equal(r.ok, true);
  assert.equal(r.lead.name, 'Ada');
  assert.equal(r.lead.email, 'ada@example.com');
  assert.deepEqual(r.lead.utm, { utm_source: 'linkedin' });
  assert.equal('website' in r.lead, false);
});

test('flags honeypot and too-fast submissions as spam', () => {
  assert.deepEqual(checkLead({ ...good, website: 'http://spam' }), { ok: false, spam: true });
  assert.deepEqual(checkLead({ ...good, elapsed: 200 }), { ok: false, spam: true });
  assert.deepEqual(checkLead({ ...good, elapsed: undefined }), { ok: false, spam: true });
});

test('reports missing name, bad email and short brief', () => {
  const r = checkLead({ ...good, name: '  ', email: 'nope', brief: 'too short' });
  assert.equal(r.ok, false);
  assert.ok(r.errors.name && r.errors.email && r.errors.brief);
});

test('truncates oversized fields and ignores non-object input', () => {
  const r = checkLead({ ...good, brief: 'x'.repeat(9000), company: 'c'.repeat(900) });
  assert.equal(r.lead.brief.length, 5000);
  assert.equal(r.lead.company.length, 150);
  assert.equal(checkLead(null).ok, false);
});
