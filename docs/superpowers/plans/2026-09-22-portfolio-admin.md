# Portfolio admin implementation plan

> Execute inline in this repository; user requested preserving the open folder and existing work. No commit or deployment in this task.

**Goal:** Owner adds portfolio items, privately previews a saved draft, and explicitly publishes selected content.

**Architecture:** Existing static Astro pages stay. Supabase manages Google OAuth, one private JSON draft and private image storage. A Node Vercel function verifies the owner and writes a reviewed public snapshot to GitHub main with a non-forced ref update. No extra npm dependencies.

**Confirmed decisions:** Google `unistudio@yeongungod.com`; private drafts; explicit Publish; nine selected works in user order; sixth is the existing Navy/Air Force card.

## Files and execution

- [x] `src/data/featured.ts`, `public/images/work/pd.jpg`: reorder seven existing cards, add PD poster and live clip from their Notion records. Keep archive intact.
- [x] `scripts/admin.test.mjs`: first assert non-owner denial, private item exclusion, invalid URL/path/rank rejection, image signatures and stale revision/base rejection. Run `node --test scripts/admin.test.mjs` before implementation.
- [x] `src/lib/admin-portfolio.mjs`: `publicPortfolio(items)` returns only allowlisted public archive/card fields; `sourceHash(archive, featured)` normalizes CRLF; `imageType(bytes)` checks raster signatures and size. Server and tests share this module.
- [x] `supabase/portfolio.sql`: deny anonymous access; owner UUID plus verified Google identity for all draft and storage operations; compare-and-swap revision; immutable object keys, private bucket, no public URLs. Start with an empty owner allowlist.
- [x] `api/portfolio.js`: authenticate with Supabase `/auth/v1/user`, then owner allowlist. `prepare` reads saved draft, compares its base with GitHub main and returns review hash/head; `publish` rechecks all three, copies only selected images and creates one fixed-path Git tree/commit/ref update. Reject unexpected origins and methods. Never return provider error bodies or secrets.
- [x] `src/pages/admin.astro`, `src/scripts/admin.js`, `src/pages/admin/initial.json.ts`: PKCE Google login, tab-scoped session, edit/add, upload raster image, save, private review and explicit publication. New rows start private. Public initial data is the already published source only. No Notion private import. No raw HTML rendering from fields. Clear private UI on logout.
- [x] `.env.admin.example`, `docs/admin-management.md`, `AGENTS.md`: document service setup, permissions, limits and remaining live verification; update deployment rule for the user-authorized admin Publish action only.
- [x] Run `npm test`, `npm run build`, `npm run check`; browser check desktop/mobile, 9-card order, unauthenticated admin lock and `/intro` A4. Remote auth/RLS/storage and real publish remain explicitly unverified until services connect; never publish a test draft publicly.

## Security acceptance

Only the verified Google identity of the registered owner UUID can read drafts or files. An empty allowlist denies everyone. Tokens are not embedded in builds or logged. Database and bucket both enforce access independently of UI. Public/private checkboxes and rank are server validated. Review includes complete archive and representative cards, public counts and removals. Editing invalidates review. Publishing rejects a stale draft or changed Git source. Only visible public fields and selected raster files reach GitHub. Failed branch advancement leaves live branch unchanged.

## Limits

One owner, one whole-portfolio draft, max 500 items, images <=8 MiB each and <=24 MiB per publication. Session lasts until tab closes or access token expires; sign in again, no refresh token persistence. A deployment request is reported separately from confirmed live deployment. No automatic Notion sync and no public video-file hosting; videos use explicit external URLs.

## Live service checkpoint (2026-09-23)

Google owner login, draft save/reload and 12 real Supabase authorization/storage checks passed. Production environment variables are configured. No commit, push or publication has been performed. Deployment routing, production-domain login, remote preview and actual publication remain unverified until an explicitly authorized first deployment. Another real Google account was not used for testing.
