import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { publicPortfolio, assertOwner, imageType, sourceHash, assertReview } from '../src/lib/admin-portfolio.mjs';
import handler from '../api/portfolio.js';

const owner = '11111111-1111-4111-8111-111111111111';
const item = (extra = {}) => ({ id: owner, name: 'Public film', year: 2023, platform: ['Film'], process: ['Mixing'], client: 'Director', public: true, archive: true, rank: 1, title: 'Public film', role: 'Mixing', displayYear: '2023', note: '', image: '/images/work/pd.jpg', ...extra });

test('private items and unrecognized internal fields never enter public output', () => {
  const out = publicPortfolio([item({ internalNotes: 'INTERNAL' }), item({ id: '22222222-2222-4222-8222-222222222222', public: false, name: 'CONFIDENTIAL' })]);
  assert.equal(out.archive.length, 1);
  assert.equal(out.featured.length, 1);
  assert.doesNotMatch(JSON.stringify(out), /INTERNAL|CONFIDENTIAL|internalNotes/);
});
test('publication requires actual booleans and unique IDs/ranks', () => {
  assert.throws(() => publicPortfolio([item({ public: 'false' })]));
  assert.throws(() => publicPortfolio([item(), item()]));
  assert.throws(() => publicPortfolio([item(), item({ id: '22222222-2222-4222-8222-222222222222' })]));
});
test('rejects unsafe links, untrusted public image paths and invalid categories', () => {
  for (const url of ['javascript:alert(1)', 'http://example.com', 'https://127.0.0.1/x', 'https://user:pass@example.com', 'https://10.0.0.1/x']) assert.throws(() => publicPortfolio([item({ url })]));
  for (const image of ['/images/../secret', '//evil.com/x.jpg', '/images/x.svg', '/images/work/a.jpg?token=secret']) assert.throws(() => publicPortfolio([item({ image })]));
  assert.throws(() => publicPortfolio([item({ platform: ['Secret'] })]));
});
test('featured ranks sort cards while archive-only items remain in archive', () => {
  const out = publicPortfolio([item({ rank: 2 }), item({ id: '22222222-2222-4222-8222-222222222222', rank: 1 }), item({ id: '33333333-3333-4333-8333-333333333333', rank: 0 })]);
  assert.equal(out.archive.length, 3);
  assert.equal(out.featured[0].slug, '22222222-2222-4222-8222-222222222222');
  assert.equal(out.featured.length, 2);
});
test('private uploaded paths must belong to owner and do not become public URLs', () => {
  const upload = `${owner}/22222222-2222-4222-8222-222222222222.jpg`;
  const out = publicPortfolio([item({ upload })], owner);
  assert.equal(out.uploads.length, 1);
  assert.doesNotMatch(JSON.stringify(out.featured), /upload|11111111-1111-4111-8111-111111111111\//);
  assert.throws(() => publicPortfolio([item({ upload: 'someone/secret.jpg' })], owner));
});
test('owner authorization requires registered UUID, verified matching Google identity', () => {
  const user = { id: owner, email: 'unistudio@yeongungod.com', email_confirmed_at: '2026-09-22', app_metadata: { provider: 'google' }, identities: [{ provider: 'google', identity_data: { email: 'unistudio@yeongungod.com', email_verified: true } }] };
  assert.doesNotThrow(() => assertOwner(user, owner));
  for (const altered of [null, { ...user, id: 'other' }, { ...user, email: 'other@example.com' }, { ...user, identities: [] }, { ...user, email_confirmed_at: null }, { ...user, app_metadata: { provider: 'email' } }]) assert.throws(() => assertOwner(altered, owner));
  assert.throws(() => assertOwner(user, ''));
});
test('only bounded raster signatures accepted, not extension labels', () => {
  assert.equal(imageType(Buffer.from([255,216,255,224,0,16])), 'jpg');
  assert.equal(imageType(Buffer.from([137,80,78,71,13,10,26,10])), 'png');
  assert.throws(() => imageType(Buffer.from('<svg onload="alert(1)"/>')));
  assert.throws(() => imageType(Buffer.alloc(8 * 1024 * 1024 + 1)));
});
test('review rejects changed draft, changed branch, stale source', () => {
  const review = { revision: 3, hash: 'a'.repeat(64), head: 'b'.repeat(40) };
  assert.doesNotThrow(() => assertReview(review, review));
  for (const key of ['revision', 'hash', 'head']) assert.throws(() => assertReview({ ...review, [key]: 'changed' }, review));
  assert.equal(sourceHash('a\r\n', 'b\r\n'), sourceHash('a\n', 'b\n'));
  assert.notEqual(sourceHash('a', 'b'), sourceHash('c', 'b'));
});

async function callApi({ method = 'POST', headers = {}, body = {} } = {}) {
  const response = { headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(n) { this.code = n; return this; }, json(value) { this.body = value; } };
  await handler({ method, headers, body }, response);
  return response;
}
test('API fails closed without configuration and never leaks provider secrets', async () => {
  const result = await callApi({ method: 'GET' });
  assert.equal(result.code, 503);
  assert.equal(result.headers['Cache-Control'], 'no-store');
  assert.doesNotMatch(JSON.stringify(result.body), /process\.env|stack|token/i);
});
test('API rejects cross-origin requests and unauthenticated callers before provider access', async () => {
  process.env.SUPABASE_URL = 'https://test.supabase.co';
  process.env.SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_test';
  try {
    assert.equal((await callApi({ headers: { origin: 'https://evil.example' } })).code, 403);
    assert.equal((await callApi({ headers: { origin: 'https://yeongungod.com', 'content-type': 'application/json' } })).code, 401);
    assert.equal((await callApi({ method: 'DELETE' })).code, 405);
  } finally { delete process.env.SUPABASE_URL; delete process.env.SUPABASE_PUBLISHABLE_KEY; }
});
test('misconfigured secret key is never returned as browser configuration', async () => {
  process.env.SUPABASE_URL = 'https://test.supabase.co';
  process.env.SUPABASE_PUBLISHABLE_KEY = 'sb_secret_NEVER_EXPOSE';
  try {
    const result = await callApi({ method: 'GET' });
    assert.equal(result.code, 503);
    assert.doesNotMatch(JSON.stringify(result.body), /NEVER_EXPOSE/);
  } finally { delete process.env.SUPABASE_URL; delete process.env.SUPABASE_PUBLISHABLE_KEY; }
});

// Provider network is stubbed; the real handler, validation and publication run.
// A permissive auth check or forced branch update makes these assertions fail.
async function withProviders(options, check) {
  const archiveText = readFileSync('src/data/archive.json', 'utf8');
  const featuredText = readFileSync('src/data/featured.ts', 'utf8');
  const cards = JSON.parse(featuredText.slice(featuredText.indexOf('= [') + 2).trim().replace(/;$/, ''));
  const document = { base: sourceHash(archiveText, featuredText), items: cards.map((c, i) => item({ id: c.slug, name: c.title, year: Number(c.year.slice(0, 4)), rank: i + 1, title: c.title, displayYear: c.year, role: c.role, image: c.image || '', url: c.url || '' })) };
  document.items.push(item({ id: '99999999-9999-4999-8999-999999999999', public: false, name: 'CONFIDENTIAL_SENTINEL', upload: 'NEVER_DOWNLOAD' }));
  if (options.staleSource) document.base = '0'.repeat(64);
  let revision = 7;
  const head = 'a'.repeat(40), calls = [];
  const oldFetch = globalThis.fetch;
  const keys = ['SUPABASE_URL', 'SUPABASE_PUBLISHABLE_KEY', 'PORTFOLIO_GITHUB_TOKEN'];
  const before = keys.map((k) => process.env[k]);
  process.env.SUPABASE_URL = 'https://test.supabase.co'; process.env.SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_test'; process.env.PORTFOLIO_GITHUB_TOKEN = 'SECRET_SENTINEL';
  globalThis.fetch = async (input, init = {}) => {
    const u = new URL(input), method = init.method || 'GET';
    const body = init.body ? JSON.parse(init.body) : undefined;
    calls.push({ path: u.pathname, method, body });
    const json = (value, status = 200) => new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json' } });
    if (u.pathname === '/auth/v1/user') return json({ id: owner, email: 'unistudio@yeongungod.com', email_confirmed_at: '2026-09-22', app_metadata: { provider: 'google' }, identities: [{ provider: 'google', identity_data: { email: 'unistudio@yeongungod.com', email_verified: true } }] });
    if (u.pathname === '/rest/v1/portfolio_owners') return json(options.denied ? [] : [{ user_id: owner }]);
    if (u.pathname === '/rest/v1/portfolio_drafts') return json([{ revision, document }]);
    if (u.pathname === '/rest/v1/rpc/save_portfolio') { revision++; return json(revision); }
    if (u.pathname.endsWith('/git/ref/heads/main')) return json({ object: { sha: head } });
    if (u.pathname.includes('/contents/')) {
      const path = u.pathname.split('/contents/')[1];
      const text = path === 'src/data/archive.json' ? archiveText : path === 'src/data/featured.ts' ? featuredText : path === 'AGENTS.md' ? '## 5. 상태\n' : 'image';
      return json({ type: 'file', encoding: options.largeImage && path.startsWith('public/') ? 'none' : 'base64', content: Buffer.from(text).toString('base64') });
    }
    if (u.pathname.endsWith(`/git/commits/${head}`)) return json({ tree: { sha: 'c'.repeat(40) } });
    if (u.pathname.endsWith('/git/trees')) return json({ sha: 'd'.repeat(40) });
    if (u.pathname.endsWith('/git/commits')) return json({ sha: 'e'.repeat(40) });
    if (u.pathname.endsWith('/git/refs/heads/main')) return json(options.conflict ? { error: 'conflict' } : { object: { sha: 'e'.repeat(40) } }, options.conflict ? 422 : 200);
    throw Error(`Unexpected provider call ${u.pathname}`);
  };
  const call = (action, extra = {}) => callApi({ headers: { origin: 'https://yeongungod.com', 'content-type': 'application/json', authorization: 'Bearer test-session' }, body: { action, ...extra } });
  try { await check(call, calls); } finally { globalThis.fetch = oldFetch; keys.forEach((k, i) => { if (before[i] === undefined) delete process.env[k]; else process.env[k] = before[i]; }); }
}
test('non-owner cannot reach GitHub or retrieve drafts', async () => withProviders({ denied: true }, async (call, calls) => {
  assert.equal((await call('prepare')).code, 403);
  assert.equal(calls.length, 2);
}));
test('stale site source and altered preview cause no Git mutations', async () => {
  await withProviders({ staleSource: true }, async (call, calls) => {
    assert.equal((await call('prepare')).code, 409);
    assert.ok(calls.every((c) => c.method === 'GET'));
  });
  await withProviders({}, async (call, calls) => {
    const prepared = await call('prepare'); assert.equal(prepared.code, 200);
    assert.equal((await call('publish', { review: { ...prepared.body.review, revision: 6 } })).code, 409);
    assert.ok(calls.every((c) => c.method === 'GET'));
  });
});
test('publication tree excludes private data and advances main without force', async () => withProviders({ largeImage: true }, async (call, calls) => {
  const prepared = await call('prepare'); assert.equal(prepared.code, 200);
  const result = await call('publish', { review: prepared.body.review }); assert.equal(result.code, 200, JSON.stringify(result.body));
  const tree = calls.find((c) => c.path.endsWith('/git/trees')).body.tree;
  assert.deepEqual(tree.map((f) => f.path), ['src/data/archive.json', 'src/data/featured.ts', 'AGENTS.md']);
  assert.doesNotMatch(JSON.stringify(tree), /CONFIDENTIAL_SENTINEL|NEVER_DOWNLOAD|SECRET_SENTINEL/);
  assert.equal(calls.find((c) => c.path.endsWith('/git/refs/heads/main')).body.force, false);
  assert.doesNotMatch(JSON.stringify(result.body), /SECRET_SENTINEL/);
}));
test('branch race is reported as conflict and does not mark the draft published', async () => withProviders({ conflict: true }, async (call, calls) => {
  const prepared = await call('prepare');
  const result = await call('publish', { review: prepared.body.review });
  assert.equal(result.code, 409);
  assert.ok(!calls.some((c) => c.path.includes('save_portfolio')));
}));
