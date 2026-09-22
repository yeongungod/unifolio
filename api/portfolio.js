import { assertOwner, assertReview, digest, fail, featuredSource, imageType, publicPortfolio, sourceHash, UUID } from '../src/lib/admin-portfolio.mjs';

const REPO = 'https://api.github.com/repos/yeongungod/unifolio';
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  try {
    const supabase = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!supabase || !/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(supabase) || !/^sb_publishable_[A-Za-z0-9_-]+$/.test(key || '')) fail('관리자 연결 설정이 아직 완료되지 않았습니다.', 503);
    if (req.method === 'GET') return res.status(200).json({ supabase, key });
    if (req.method !== 'POST') fail('허용되지 않는 요청입니다.', 405);
    if (req.headers.origin !== (process.env.ADMIN_ORIGIN || 'https://yeongungod.com')) fail('허용되지 않는 요청 주소입니다.', 403);
    if (!req.headers['content-type']?.startsWith('application/json')) fail('JSON 요청이 필요합니다.', 415);
    const authorization = req.headers.authorization;
    if (!/^Bearer [A-Za-z0-9._-]+$/.test(authorization || '')) fail('로그인이 필요합니다.', 401);
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (!body || Buffer.byteLength(JSON.stringify(body)) > 2 * 1024 * 1024) fail('초안 크기가 너무 큽니다.', 413);
    const sb = async (path, data) => {
      const r = await fetch(`${supabase}${path}`, { method: data === undefined ? 'GET' : 'POST', headers: { apikey: key, Authorization: authorization, 'Content-Type': 'application/json' }, ...(data !== undefined && { body: JSON.stringify(data) }), signal: AbortSignal.timeout(15000), redirect: 'error' });
      if (!r.ok) fail(path.includes('save_portfolio') ? '저장하지 못했습니다. 다른 창에서 바뀐 초안인지 확인하고 다시 불러오세요.' : '로그인 또는 저장소 권한을 확인하세요.', r.status === 401 ? 401 : 409);
      return r.json();
    };
    const user = await sb('/auth/v1/user');
    if (!UUID.test(user.id || '')) fail('로그인을 확인하세요.', 403);
    const owners = await sb(`/rest/v1/portfolio_owners?user_id=eq.${user.id}&select=user_id`);
    assertOwner(user, owners[0]?.user_id);
    const readDraft = async () => (await sb(`/rest/v1/portfolio_drafts?owner_id=eq.${user.id}&select=revision,document`))[0];
    if (body.action === 'load') return res.status(200).json({ owner: user.id, draft: (await readDraft()) || null });
    if (body.action === 'save') {
      if (!Number.isSafeInteger(body.revision) || body.revision < 0 || !/^[a-f0-9]{64}$/.test(body.document?.base || '') || !Array.isArray(body.document?.items) || body.document.items.length > 500) fail('초안 형식이 올바르지 않습니다.');
      const revision = await sb('/rest/v1/rpc/save_portfolio', { expected_revision: body.revision, document: body.document });
      return res.status(200).json({ revision });
    }
    if (!['prepare', 'publish'].includes(body.action)) fail('알 수 없는 작업입니다.');
    if (!process.env.PORTFOLIO_GITHUB_TOKEN) fail('게시 연결이 아직 완료되지 않았습니다.', 503);
    const gh = async (path, data, method = 'POST') => {
      const r = await fetch(`${REPO}${path}`, { method: data === undefined ? 'GET' : method, headers: { Authorization: `Bearer ${process.env.PORTFOLIO_GITHUB_TOKEN}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json' }, ...(data !== undefined && { body: JSON.stringify(data) }), signal: AbortSignal.timeout(20000), redirect: 'error' });
      if (!r.ok) fail('GitHub 요청을 완료하지 못했습니다. 사이트 상태를 확인한 뒤 다시 미리보기하세요.', [409, 422].includes(r.status) ? 409 : 502);
      return r.json();
    };
    const draft = await readDraft();
    if (!draft) fail('초안을 먼저 저장하세요.');
    const out = publicPortfolio(draft.document.items, user.id);
    if (out.featured.length !== 9) fail('대표작 1~9번을 하나씩 선택하세요.');
    const head = (await gh('/git/ref/heads/main')).object.sha;
    const readSource = async (path) => {
      const file = await gh(`/contents/${path}?ref=${head}`);
      if (file.type !== 'file' || file.encoding !== 'base64') fail('공개 파일을 확인하지 못했습니다.', 502);
      return Buffer.from(file.content, 'base64').toString('utf8');
    };
    const [oldArchive, oldFeatured, agents] = await Promise.all([readSource('src/data/archive.json'), readSource('src/data/featured.ts'), readSource('AGENTS.md')]);
    if (sourceHash(oldArchive, oldFeatured) !== draft.document.base) fail('사이트의 원본이 변경됐습니다. 초안을 내려받아 보관하고 최신 공개본으로 다시 시작하세요.', 409);
    const review = { revision: draft.revision, hash: digest(JSON.stringify(draft.document)), head };
    const publishedIds = new Set(out.archive.map((r) => r.id));
    const removed = JSON.parse(oldArchive).filter((r) => !publishedIds.has(r.id)).map((r) => r.name);
    if (body.action === 'prepare') return res.status(200).json({ review, portfolio: out, removed });
    assertReview(body.review, review);

    const files = [];
    let size = 0;
    for (const upload of out.uploads) {
      const r = await fetch(`${supabase}/storage/v1/object/authenticated/portfolio-private/${upload.path}`, { headers: { apikey: key, Authorization: authorization }, signal: AbortSignal.timeout(15000), redirect: 'error' });
      if (!r.ok || Number(r.headers.get('content-length')) > 8 * 1024 * 1024) fail('선택한 비공개 이미지를 읽지 못했습니다.');
      const chunks = []; let length = 0;
      for await (const chunk of r.body) { length += chunk.length; if (length > 8 * 1024 * 1024) fail('이미지가 8 MiB를 초과합니다.'); chunks.push(chunk); }
      const bytes = Buffer.concat(chunks), ext = imageType(bytes);
      size += bytes.length;
      if (size > 24 * 1024 * 1024) fail('한 번에 게시할 새 이미지는 합계 24 MiB 이하로 줄여 주세요.');
      const path = `public/images/portfolio/${digest(bytes)}.${ext}`;
      if (!files.some((f) => f.path === path)) files.push({ path, bytes });
      out.featured.find((c) => c.slug === upload.id).image = path.replace(/^public/, '');
    }
    // Ensure existing image references really exist at the reviewed commit.
    for (const image of new Set(out.featured.map((c) => c.image).filter(Boolean))) {
      if (!files.some((f) => f.path === `public${image}`)) {
        const existing = await gh(`/contents/public${image}?ref=${head}`);
        if (existing.type !== 'file') fail('기존 대표 이미지가 없습니다.');
      }
    }
    const latest = await readDraft();
    assertReview({ revision: latest.revision, hash: digest(JSON.stringify(latest.document)), head }, review);
    const archive = `${JSON.stringify(out.archive, null, 2)}\n`, featured = featuredSource(out.featured);
    const base = sourceHash(archive, featured);
    const status = `**관리자 게시 요청 (${new Date().toISOString()})**: 저장된 초안 ${draft.revision}에서 공개 선택한 전체 작업 ${out.archive.length}건·대표작 9건을 반영했다. 비공개 초안과 미선택 업로드는 제외했다. GitHub 변경 반영 후 Vercel 배포 완료 확인은 별도다.\n\n`;
    if (!/^## 5\..*$/m.test(agents)) fail('상태 기록 위치를 확인하지 못했습니다.');
    const tree = [
      { path: 'src/data/archive.json', content: archive },
      { path: 'src/data/featured.ts', content: featured },
      { path: 'AGENTS.md', content: agents.replace(/^(## 5\..*\r?\n)/m, `$1\n${status}`) },
    ].map((f) => ({ ...f, mode: '100644', type: 'blob' }));
    for (const file of files) {
      const blob = await gh('/git/blobs', { content: file.bytes.toString('base64'), encoding: 'base64' });
      tree.push({ path: file.path, mode: '100644', type: 'blob', sha: blob.sha });
    }
    const parent = await gh(`/git/commits/${head}`);
    const nextTree = await gh('/git/trees', { base_tree: parent.tree.sha, tree });
    const commit = await gh('/git/commits', { message: `Publish reviewed portfolio (${out.archive.length} works)`, tree: nextTree.sha, parents: [head] });
    // Never force: another publisher or developer advancing main makes this fail.
    await gh('/git/refs/heads/main', { sha: commit.sha, force: false }, 'PATCH');
    let revision = null;
    try { revision = await sb('/rest/v1/rpc/save_portfolio', { expected_revision: draft.revision, document: { ...draft.document, base } }); } catch { /* Publication succeeded; do not report it as failed or retry it. */ }
    return res.status(200).json({ commit: commit.sha, url: `https://github.com/yeongungod/unifolio/commit/${commit.sha}`, base, revision, message: '게시할 내용을 GitHub에 반영했습니다. 공개 사이트 반영은 배포 완료 후 확인하세요.' });
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.status ? error.message : '요청을 처리하지 못했습니다. 로그인과 연결 상태를 확인하세요.' });
  }
}
