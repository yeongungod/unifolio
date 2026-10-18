import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, copyFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { stageStill, stageLook, SAFE_SCRIM, DEFAULT_FOCUS } from '../src/lib/stage.mjs';

const maxres = (id) => `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;

test('무대 스틸: 이미지 우선, 유튜브는 maxres(받아 둔 것이 아니면 hqdefault 대체 경로 포함)', () => {
  assert.deepEqual(stageStill({ image: '/images/work/a.jpg', youtube: 'abcdefghijk' }, {}), { src: '/images/work/a.jpg' });
  const known = stageStill({ youtube: 'abcdefghijk' }, { [maxres('abcdefghijk')]: [] });
  assert.equal(known.src, maxres('abcdefghijk'));
  assert.equal(known.fallback, undefined);
  const fresh = stageStill({ youtube: 'zzzzzzzzzzz' }, {});
  assert.equal(fresh.src, maxres('zzzzzzzzzzz'));
  assert.equal(fresh.fallback, 'https://i.ytimg.com/vi/zzzzzzzzzzz/hqdefault.jpg');
  assert.deepEqual([fresh.width, fresh.height], [1280, 720]);
});

test('막 농도·초점은 잰 이미지와 같을 때만, 바뀌었거나 없으면 안전한 기본값', () => {
  const scrims = { w: { src: '/images/work/old.jpg', scrim: 0.45 } };
  assert.deepEqual(stageLook({ slug: 'w', focus: '40% 40%' }, '/images/work/old.jpg', scrims), { scrim: 0.45, focus: '40% 40%' });
  assert.deepEqual(stageLook({ slug: 'w', focus: '40% 40%' }, '/images/notion/new.jpg', scrims), { scrim: SAFE_SCRIM, focus: DEFAULT_FOCUS });
  assert.deepEqual(stageLook({ slug: 'new', focus: '10% 10%' }, '/x.jpg', scrims), { scrim: SAFE_SCRIM, focus: DEFAULT_FOCUS });
});

test('public 폴더는 작업 폴더가 아니라 설정 파일 옆(노션 미리보기 사본)', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'unifolio-config-'));
  try {
    await copyFile(new URL('../astro.config.mjs', import.meta.url), join(dir, 'astro.config.mjs'));
    const config = await import(pathToFileURL(join(dir, 'astro.config.mjs')).href);
    assert.ok(JSON.parse(config.default.vite.define.__PUBLIC_DIR__).startsWith(join(dir, 'public')));
    assert.notEqual(config.publicDir, join(process.cwd(), 'public'));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('줄머리 방지: 구분 기호·한두 자리 숫자 앞 공백은 붙는 공백', async () => {
  const { glue } = await import('../src/lib/display.mjs');
  assert.equal(glue('최우수작품상 · 여자연기상'), '최우수작품상 · 여자연기상');
  assert.equal(glue('경쟁부문 일반공모 섹션 5 본선경쟁작'), '경쟁부문 일반공모 섹션 5 본선경쟁작');
  assert.equal(glue('제24회 대한민국 2023'), '제24회 대한민국 2023');
});
