import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { preflight } from './preflight-publish.mjs';

test('remote admin updates sync only when safe and gate commits/pushes when stale', () => {
  const root = mkdtempSync(join(tmpdir(), 'unistudio-preflight-'));
  const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  try {
    git(root, 'init', '--bare', 'remote.git');
    git(root, 'clone', 'remote.git', 'admin');
    const admin = join(root, 'admin'), local = join(root, 'local');
    git(admin, 'config', 'user.email', 'test@example.com'); git(admin, 'config', 'user.name', 'Test');
    git(admin, 'checkout', '-b', 'main');
    writeFileSync(join(admin, 'data.txt'), 'initial');
    git(admin, 'add', '.'); git(admin, 'commit', '-m', 'initial'); git(admin, 'push', 'origin', 'main');
    git(root, 'clone', '-b', 'main', 'remote.git', 'local');
    assert.equal(preflight(local).synced, false);
    writeFileSync(join(admin, 'data.txt'), 'admin update');
    git(admin, 'commit', '-am', 'Publish reviewed portfolio'); git(admin, 'push', 'origin', 'main');
    assert.throws(() => preflight(local, { checkOnly: true }), /새 변경/);
    writeFileSync(join(local, 'local.txt'), 'preserve');
    assert.throws(() => preflight(local), /로컬 작업은 그대로/);
    assert.equal(readFileSync(join(local, 'local.txt'), 'utf8'), 'preserve');
    rmSync(join(local, 'local.txt'));
    assert.equal(preflight(local).synced, true);
    assert.equal(readFileSync(join(local, 'data.txt'), 'utf8'), 'admin update');
    git(local, 'remote', 'set-url', 'origin', join(root, 'missing.git'));
    assert.throws(() => preflight(local));
  } finally { rmSync(root, { recursive: true, force: true }); }
});
