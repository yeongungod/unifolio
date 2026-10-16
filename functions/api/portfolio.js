// Cloudflare Pages Functions 진입점. 검증·게시 로직은 Vercel과 같은 api/portfolio.js 하나만 쓴다.
// 비밀값은 nodejs_compat의 process.env(대시보드 환경변수)에서 읽힌다.
import handler from '../../api/portfolio.js';

export async function onRequest({ request }) {
  let status = 200, body = null;
  const headers = new Headers();
  const req = { method: request.method, headers: Object.fromEntries(request.headers), body: request.method === 'POST' ? await request.text() : undefined };
  const res = {
    setHeader: (k, v) => headers.set(k, v),
    status(n) { status = n; return this; },
    json(value) { headers.set('Content-Type', 'application/json; charset=utf-8'); body = JSON.stringify(value); },
  };
  await handler(req, res);
  return new Response(body, { status, headers });
}
