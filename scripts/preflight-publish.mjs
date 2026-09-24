import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Admin Publish writes origin/main. Drafts are private and are not published changes.
export function preflight(cwd, { checkOnly = false } = {}) {
  const git = (...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  git('fetch', 'origin', 'main'); // Network failure must block; never trust stale refs.
  const [ahead, behind] = git('rev-list', '--left-right', '--count', 'HEAD...origin/main').split(/\s+/).map(Number);
  if (!behind) return { ahead, behind, synced: false, remote: git('rev-parse', 'origin/main') };
  const changes = git('log', '--oneline', 'HEAD..origin/main');
  if (checkOnly || ahead || git('status', '--porcelain')) {
    throw new Error(`원격 main에 새 변경 ${behind}개가 있습니다. 커밋·푸시 전에 관리자 게시 내용을 동기화하세요.\n${changes}\n로컬 작업은 그대로 보존했습니다. 깨끗하고 분기되지 않은 상태에서 npm run preflight:publish로 동기화하거나, 겹치는 변경을 검토·병합한 뒤 다시 검사하세요.`);
  }
  git('merge', '--ff-only', 'origin/main');
  return { ahead: 0, behind: 0, synced: true, remote: git('rev-parse', 'origin/main') };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try { console.log(preflight(process.cwd(), { checkOnly: process.argv.includes('--check-only') })); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
