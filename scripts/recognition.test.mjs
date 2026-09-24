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
