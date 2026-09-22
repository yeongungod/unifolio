const $ = (id) => document.getElementById(id);
const form = $('editor');
const labels = { Film: '영화', Live: '라이브', Music: '음악', Web: '웹콘텐츠', Edit: '편집', Game: '게임사운드', Filming: '촬영' };
const processLabels = { Mixing: '믹싱', 'Sound Design': '사운드디자인', ADR: 'ADR', Foley: '폴리', Record: '녹음', Mastering: '마스터링', 'Sound Assistant': '사운드 어시스트', PA: 'PA', Cinamatic: '시네마틱', Skill: '스킬', UI: 'UI' };
let config, owner, draft, revision = 0, selected, review, fallback = {}, dirty = false, busy = false, demo = false;
const blobs = new Map();
const status = (text) => { $('status').textContent = text; };
const token = () => sessionStorage.getItem('portfolio-session');
const el = (tag, text, parent) => { const n = document.createElement(tag); if (text !== undefined) n.textContent = text; if (parent) parent.append(n); return n; };
function invalidate() { dirty = true; review = null; $('publish').disabled = true; }
function clearPrivate() {
  draft = selected = review = null;
  blobs.forEach((url) => URL.revokeObjectURL(url)); blobs.clear();
  $('items').replaceChildren(); $('review-cards').replaceChildren(); $('review-archive').replaceChildren();
  $('review-removed').textContent = ''; $('image-preview').removeAttribute('src'); form.reset();
  $('editor-title').textContent = '작업 선택'; $('image-name').textContent = ''; $('review-count').textContent = ''; $('total').textContent = ''; $('search').value = '';
  $('workspace').hidden = true; $('logout').hidden = true; $('login-panel').hidden = false;
  $('review-dialog').close();
}
async function api(action, data = {}) {
  const response = await fetch('/api/portfolio', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token() || ''}` }, body: JSON.stringify({ action, ...data }), cache: 'no-store' });
  const result = await response.json();
  if (!response.ok) {
    if ([401, 403].includes(response.status)) { sessionStorage.removeItem('portfolio-session'); clearPrivate(); }
    throw Error(result.error || '요청을 완료하지 못했습니다.');
  }
  return result;
}
async function run(task) {
  if (busy) return;
  busy = true;
  const controls = [...document.querySelectorAll('button, input, textarea, select')];
  const disabled = controls.map((control) => control.disabled);
  controls.forEach((control) => { control.disabled = true; });
  try { await task(); } catch (error) { status(error.message || '연결을 확인하세요.'); }
  finally {
    controls.forEach((control, i) => { if (control.isConnected) control.disabled = disabled[i]; });
    $('publish').disabled = demo || !review || !$('confirm-public').checked;
    $('login').disabled = !config;
    busy = false;
  }
}
async function initial() {
  const r = await fetch('/admin/initial.json', { cache: 'no-store' });
  if (!r.ok) throw Error('기존 공개 작업을 불러오지 못했습니다.');
  const seed = await r.json(); fallback = seed.recognition; return seed.document;
}
function list() {
  const q = $('search').value.trim().toLowerCase();
  $('total').textContent = `${draft.items.length}개 · 공개 선택 ${draft.items.filter((i) => i.public).length}개`;
  $('items').replaceChildren();
  draft.items.filter((i) => i.name.toLowerCase().includes(q)).forEach((item) => {
    const button = el('button', `${item.public ? '공개' : '비공개'}${item.rank ? ` · 대표 ${item.rank}` : ''} — ${item.name || '새 작업'}`, $('items'));
    button.type = 'button'; button.setAttribute('aria-current', String(item === selected));
    button.onclick = () => { if (!busy) show(item); };
  });
}
async function imageURL(item) {
  if (item.upload) {
    if (blobs.has(item.upload)) return blobs.get(item.upload);
    const r = await fetch(`${config.supabase}/storage/v1/object/authenticated/portfolio-private/${item.upload}`, { headers: { apikey: config.key, Authorization: `Bearer ${token()}` }, cache: 'no-store' });
    if (!r.ok) throw Error('비공개 이미지를 불러오지 못했습니다. 다시 로그인하세요.');
    const url = URL.createObjectURL(await r.blob()); blobs.set(item.upload, url); return url;
  }
  if (/^\/images\/(?:work|portfolio)\/[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp)$/.test(item.image || '')) return item.image;
  let id;
  try { const u = new URL(item.url); id = u.hostname === 'youtu.be' ? u.pathname.slice(1) : ['www.youtube.com', 'youtube.com'].includes(u.hostname) ? u.searchParams.get('v') : ''; } catch { /* No video. */ }
  return /^[\w-]{11}$/.test(id || '') ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : '';
}
function show(item) {
  selected = item; form.hidden = !item; list();
  if (!item) return;
  $('editor-title').textContent = item.name || '새 작업';
  for (const input of form.elements) {
    if (!input.name) continue;
    if (input.name === 'platform') input.checked = item.platform.includes(input.value);
    else if (input.type === 'checkbox') input.checked = item[input.name];
    else input.value = input.name === 'process' ? item.process.join(', ') : item[input.name] ?? '';
  }
  $('upload').value = '';
  $('image-name').textContent = item.upload ? '비공개 저장소에 새 이미지 보관 중' : item.image ? '기존 사이트 이미지 사용' : '영상 썸네일 사용';
  $('image-preview').hidden = true;
  imageURL(item).then((url) => { if (selected === item && url) { $('image-preview').src = url; $('image-preview').hidden = false; } }).catch((error) => status(error.message));
}
function openWorkspace() {
  $('login-panel').hidden = true; $('workspace').hidden = false; $('logout').hidden = false;
  dirty = false; show(draft.items[0]);
}
async function load() {
  const seed = await initial();
  const result = await api('load'); owner = result.owner;
  draft = result.draft?.document || seed; revision = result.draft?.revision || 0;
  review = null; openWorkspace();
  status(revision ? `비공개 초안 ${revision}을 불러왔습니다.` : '현재 공개 작업으로 시작합니다. 수정 후 초안을 저장하세요.');
}
form.onsubmit = (event) => event.preventDefault();
form.addEventListener('input', (event) => {
  const input = event.target;
  if (!selected || !input.name) return;
  if (input.name === 'platform') selected.platform = [...form.querySelectorAll('[name=platform]:checked')].map((n) => n.value);
  else if (input.type === 'checkbox') selected[input.name] = input.checked;
  else if (['year', 'rank'].includes(input.name)) selected[input.name] = Number(input.value);
  else if (input.name === 'process') selected.process = input.value.split(',').map((v) => v.trim()).filter(Boolean);
  else selected[input.name] = input.value;
  invalidate(); list(); status('저장하지 않은 변경사항이 있습니다.');
});
$('search').oninput = list;
$('add').onclick = () => {
  const item = { id: crypto.randomUUID(), name: '새 작업', year: new Date().getFullYear(), client: '', platform: ['Film'], process: [], url: '', recognition: '', public: false, archive: true, rank: 0, title: '', displayYear: '', role: '', note: '', image: '', upload: '' };
  draft.items.unshift(item); $('search').value = ''; invalidate(); show(item); status('새 비공개 작업을 추가했습니다.');
};
$('remove').onclick = () => {
  if (!selected || !confirm(`「${selected.name}」을 초안에서 삭제할까요? 공개 사이트는 게시 전까지 유지됩니다.`)) return;
  draft.items = draft.items.filter((i) => i !== selected); invalidate(); show(draft.items[0]);
};
$('save').onclick = () => run(async () => {
  if (demo) { status('화면 체험에서는 서버에 저장하지 않습니다.'); return; }
  const result = await api('save', { document: draft, revision }); revision = result.revision; dirty = false; review = null;
  status(`비공개 초안 ${revision} 저장 완료. 공개 사이트는 아직 바뀌지 않았습니다.`);
});
$('reload').onclick = () => run(async () => {
  if (dirty && !confirm('저장하지 않은 변경을 버리고 다시 불러올까요?')) return;
  if (demo) { draft = await initial(); openWorkspace(); } else await load();
});
$('reset').onclick = () => run(async () => {
  if (!confirm('초안을 내려받아 보관했나요? 현재 편집 내용을 최신 공개본으로 교체합니다. 초안 저장 전에는 서버 사본이 유지됩니다.')) return;
  draft = await initial(); invalidate(); show(draft.items[0]); status('최신 공개본을 불러왔습니다. 초안을 저장해야 서버 사본도 교체됩니다.');
});
$('export').onclick = () => {
  const url = URL.createObjectURL(new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json' }));
  const a = el('a'); a.href = url; a.download = `unistudio-private-draft-${new Date().toISOString().slice(0, 10)}.json`; a.click(); URL.revokeObjectURL(url);
  status('비공개 초안을 내려받았습니다. 이미지 원본은 비공개 저장소에 남습니다.');
};
$('upload').onchange = () => run(async () => {
  const file = $('upload').files[0]; if (!file || !selected) return;
  if (demo) throw Error('이미지 업로드는 실제 로그인 연결 후 사용할 수 있습니다.');
  if (file.size > 8 * 1024 * 1024) throw Error('이미지는 8 MiB 이하만 올릴 수 있습니다.');
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const ext = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 ? 'jpg' : bytes.slice(0, 8).join(',') === '137,80,78,71,13,10,26,10' ? 'png' : new TextDecoder().decode(bytes.slice(0, 4)) === 'RIFF' && new TextDecoder().decode(bytes.slice(8, 12)) === 'WEBP' ? 'webp' : '';
  if (!ext) throw Error('JPG, PNG, WebP 이미지를 선택하세요.');
  const bitmap = await createImageBitmap(file); bitmap.close();
  const path = `${owner}/${crypto.randomUUID()}.${ext}`;
  const response = await fetch(`${config.supabase}/storage/v1/object/portfolio-private/${path}`, { method: 'POST', headers: { apikey: config.key, Authorization: `Bearer ${token()}`, 'Content-Type': ext === 'jpg' ? 'image/jpeg' : `image/${ext}` }, body: file });
  if (!response.ok) throw Error('이미지를 올리지 못했습니다. 저장소 연결과 로그인 상태를 확인하세요.');
  selected.upload = path; blobs.set(path, URL.createObjectURL(file)); invalidate(); show(selected); status('이미지를 비공개로 올렸습니다. 초안 저장 후 확인하세요.');
});
$('clear-image').onclick = () => { if (selected) { selected.upload = ''; invalidate(); show(selected); } };

async function renderReview(portfolio, removed) {
  $('confirm-public').checked = false; $('publish').disabled = true;
  $('review-cards').replaceChildren(); $('review-archive').replaceChildren();
  $('review-count').textContent = `대표작 ${portfolio.featured.length}개 · 전체 작업 ${portfolio.archive.length}개${demo ? ' · 로컬 화면 체험, 게시 불가' : ''}`;
  for (const card of portfolio.featured) {
    const article = el('article', undefined, $('review-cards'));
    const item = draft.items.find((i) => i.id === card.slug);
    const url = await imageURL(item);
    if (url) { const img = el('img', undefined, article); img.src = url; img.alt = ''; }
    el('p', `${card.year} · ${card.client}`, article); el('h3', card.title, article); el('p', card.role, article); el('p', card.note, article);
    if (card.url) el('p', `영상: ${card.url}`, article);
  }
  for (const row of [...portfolio.archive].sort((a, b) => b.year - a.year)) {
    const article = el('article', undefined, $('review-archive'));
    el('strong', `${row.year} · ${row.name}`, article);
    el('p', `${row.platform.map((p) => labels[p]).join(', ')} · ${row.process.map((p) => processLabels[p] || p).join(' · ')} · ${row.client}`, article);
    if (row.recognition || fallback[row.id]) el('p', row.recognition || fallback[row.id], article);
    if (row.url) el('p', row.url, article);
  }
  $('review-removed').textContent = removed.length ? removed.join(' · ') : '없음';
  $('review-dialog').showModal();
}
$('preview').onclick = () => run(async () => {
  if (demo) {
    const items = draft.items.filter((i) => i.public);
    await renderReview({ archive: items.filter((i) => i.archive), featured: items.filter((i) => i.rank).sort((a, b) => a.rank - b.rank).map((i) => ({ ...i, slug: i.id, title: i.title || i.name, year: i.displayYear || String(i.year) })) }, []);
    return;
  }
  if (dirty || !revision) throw Error('미리보기 전에 초안을 저장하세요.');
  const result = await api('prepare');
  // Another tab may have saved a different draft. Do not preview mismatched local images.
  if (result.review.revision !== revision) throw Error('다른 창에서 초안이 바뀌었습니다. 다시 불러오세요.');
  await renderReview(result.portfolio, result.removed); review = result.review;
});
$('close-review').onclick = () => $('review-dialog').close();
$('confirm-public').onchange = () => { $('publish').disabled = demo || !review || !$('confirm-public').checked; };
$('publish').onclick = () => run(async () => {
  if (demo || !review || !$('confirm-public').checked || dirty) throw Error('저장된 미리보기를 먼저 확인하세요.');
  const result = await api('publish', { review });
  review = null; $('review-dialog').close();
  draft.base = result.base;
  if (result.revision !== null) revision = result.revision;
  else { dirty = true; $('workspace').hidden = true; }
  status(`${result.message}${result.revision === null ? ' 초안 상태 갱신은 실패했습니다. 다시 로그인해 불러오세요.' : ''}`);
  const a = el('a', ' 변경 기록 보기', $('status')); a.href = result.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
});

const b64 = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes))).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
$('login').onclick = () => run(async () => {
  const verifier = b64(crypto.getRandomValues(new Uint8Array(48)));
  sessionStorage.setItem('portfolio-pkce', JSON.stringify({ verifier, time: Date.now() }));
  const challenge = b64(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)));
  const params = new URLSearchParams({ provider: 'google', redirect_to: `${location.origin}/admin`, code_challenge: challenge, code_challenge_method: 's256', scopes: 'email profile', prompt: 'select_account' });
  location.assign(`${config.supabase}/auth/v1/authorize?${params}`);
});
$('logout').onclick = () => run(async () => {
  const previous = token(); sessionStorage.removeItem('portfolio-session'); sessionStorage.removeItem('portfolio-pkce');
  clearPrivate(); dirty = false; demo = false; status('로그아웃했습니다.');
  if (previous && config) await fetch(`${config.supabase}/auth/v1/logout?scope=local`, { method: 'POST', headers: { apikey: config.key, Authorization: `Bearer ${previous}` } });
});
addEventListener('beforeunload', (event) => { if (dirty && !demo) event.preventDefault(); });
$('demo').hidden = !['127.0.0.1', 'localhost'].includes(location.hostname);
$('demo').onclick = () => run(async () => { demo = true; draft = await initial(); openWorkspace(); status('로컬 화면 체험입니다. 기존 공개 자료만 사용하며 저장·업로드·게시는 동작하지 않습니다.'); });

run(async () => {
  const params = new URLSearchParams(location.search), code = params.get('code'), error = params.has('error');
  if (code || error) history.replaceState(null, '', '/admin');
  const response = await fetch('/api/portfolio', { cache: 'no-store' });
  if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) throw Error('Google 로그인과 비공개 저장소 연결을 준비 중입니다.');
  config = await response.json();
  if (error) throw Error('Google 로그인이 완료되지 않았습니다. 다시 시도하세요.');
  if (code) {
    const stored = JSON.parse(sessionStorage.getItem('portfolio-pkce') || 'null'); sessionStorage.removeItem('portfolio-pkce');
    if (!stored || Date.now() - stored.time > 10 * 60 * 1000) throw Error('로그인 요청이 만료됐습니다. 이 창에서 다시 로그인하세요.');
    const r = await fetch(`${config.supabase}/auth/v1/token?grant_type=pkce`, { method: 'POST', headers: { apikey: config.key, 'Content-Type': 'application/json' }, body: JSON.stringify({ auth_code: code, code_verifier: stored.verifier }) });
    if (!r.ok) throw Error('로그인을 확인하지 못했습니다. 다시 로그인하세요.');
    const session = await r.json();
    sessionStorage.setItem('portfolio-session', session.access_token);
    // Refresh tokens intentionally not persisted. Reauthenticate after expiry.
  }
  if (token()) await load(); else status('Google로 로그인하면 비공개 초안을 관리할 수 있습니다.');
});
