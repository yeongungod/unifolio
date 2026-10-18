import { test } from 'node:test';
import assert from 'node:assert/strict';
import { groupedRecognition, formatRecognition } from '../src/lib/recognition.mjs';

test('groups a work once, uses archive production year, preserves all records and sources', () => {
  const rows = [{ id: 'film', name: '영화', year: 2022, recognition: '2023.11 영화제 작품상\n배급사 배급' }];
  const result = groupedRecognition(rows, [{ workId: 'film', year: '2023.11', title: '영화제', body: '작품상', source: 'https://example.com' }], []);
  assert.equal(result.length, 1);
  assert.equal(result[0].year, '2022');
  assert.equal(result[0].records.length, 2);
  assert.equal(result[0].records[0].text, '영화제 작품상');
  assert.equal(result[0].records[0].source, 'https://example.com');
});
test('normalizes event dates, streaming and distribution without inventing current availability', () => {
  assert.equal(formatRecognition({ text: '영화제(2023) 최우수작품상, 여자배우상', year: '2023', kind: 'event' }), '영화제 최우수작품상 · 여자배우상');
  assert.equal(formatRecognition({ text: '영화제 (2023, 벨기에)', year: '2023', kind: 'event' }), '영화제 (벨기에)');
  assert.equal(formatRecognition({ text: 'Apple TV, 왓챠 상영 중', kind: 'platform' }), '상영 플랫폼 · Apple TV · 왓챠');
  assert.equal(formatRecognition({ text: 'Google Play 영화, 무비, 왓챠', kind: 'platform' }), '상영 플랫폼 · Google Play 무비/TV · 왓챠');
  assert.equal(formatRecognition({ text: '㈜씨엠닉스 배급', kind: 'distribution' }), '배급 · ㈜씨엠닉스');
});
test('featured distribution fills missing archive distribution for both views', () => {
  const result = groupedRecognition([{ id: 'film', name: '영화', year: 2023, recognition: '영화제 선정' }], [], [], [{ slug: 'film', note: '작품상. 필름베리 배급.' }]);
  assert.equal(result[0].records.at(-1).text, '배급 · 필름베리');
});
test('standalone awards remain separate, release-only works are retained', () => {
  const result = groupedRecognition([{ id: 'a', name: '작업', year: 2024, recognition: '배급사 배급' }], [
    { year: '2021.05', title: '공모전 A', body: '최우수상' },
    { year: '2020.01', title: '공모전 B', body: '동상' },
  ], []);
  assert.deepEqual(result.map(x => x.year), ['2024', '2021', '2020']);
  assert.equal(result.length, 3);
});

test('화면 표시 정리: 대시는 하이픈, 이모지는 제거, 다른 글자(s 포함)는 그대로', async () => {
  const { displayText, displayYear } = await import('../src/lib/display.mjs');
  assert.equal(displayText('The First Descendant — UI 사운드'), 'The First Descendant - UI 사운드');
  assert.equal(displayText('Gods – Sessions'), 'Gods - Sessions');
  assert.equal(displayText('유니폼 룩북⚽️'), '유니폼 룩북');
  assert.equal(displayText('Sounds 🌏 test'), 'Sounds test');
  assert.equal(displayYear('2025 -'), '2025~');
  assert.equal(displayYear('2023 - 25'), '2023 - 25');
});

test('무대 크레딧 줄: 연출·의뢰·연도, 사운드·역할, 수상·배급·비고로 나눈다', async () => {
  const { creditRows } = await import('../src/lib/display.mjs');
  assert.deepEqual(creditRows({ title: '침묵', client: '배준원 감독', role: '믹싱 · 폴리', year: '2022', note: '제18회 대한민국대학영화제 최우수작품상 · 여자연기상. ㈜인디스토리 배급.' }),
    [['연출', '배준원 · 2022'], ['사운드', '믹싱 · 폴리'], ['수상', '제18회 대한민국대학영화제 최우수작품상 · 여자연기상'], ['배급', '㈜인디스토리']]);
  assert.deepEqual(creditRows({ title: '해보자시리즈', client: '해보자시리즈', role: '유튜브 롱폼·쇼츠 편집', year: '2025 -', note: '' }),
    [['연도', '2025~'], ['역할', '유튜브 롱폼·쇼츠 편집']]);
  assert.deepEqual(creditRows({ title: '온사이드 팬미팅', client: 'ONSIDE COMPANY', role: '라이브 PA', year: '2023 - 25', note: '팬미팅·콘서트 현장 오퍼레이팅.' }),
    [['의뢰', 'ONSIDE COMPANY · 2023 - 25'], ['역할', '라이브 PA'], ['비고', '팬미팅·콘서트 현장 오퍼레이팅']]);
});
