import test from 'node:test';
import assert from 'node:assert/strict';
import { core, dictionary, readJson } from './load.js';

const C = core();
const JS_DICT = dictionary();
const JSON_DICT = readJson('data/dictionary.json');

test('js/dictionary.jsとdata/dictionary.jsonの内容が完全に一致する', () => {
  assert.deepEqual(Object.keys(JS_DICT), Object.keys(JSON_DICT));
  assert.deepEqual(JS_DICT, JSON_DICT);
});

test('辞書は検証を通る', () => {
  const result = C.validateDictionary(JSON_DICT);
  assert.deepEqual(result.errors, []);
  assert.equal(result.ok, true);
});

test('語数はREADMEに書いた値と一致する', () => {
  assert.equal(JSON_DICT.emergency.length, 38);
  assert.equal(JSON_DICT.fear.length, 56);
  assert.equal(JSON_DICT.greed.length, 73);
  assert.equal(C.validateDictionary(JSON_DICT).total, 167);
});

test('同じ語が2つのカテゴリーに入っていない', () => {
  const seen = new Map();
  for (const [category, words] of Object.entries(JSON_DICT)) {
    for (const word of words) {
      const key = word.toLowerCase();
      assert.ok(!seen.has(key), `「${word}」が ${seen.get(key)} と ${category} の両方にある`);
      seen.set(key, category);
    }
  }
});

test('語に前後の空白や改行が混ざっていない', () => {
  for (const [category, words] of Object.entries(JSON_DICT)) {
    for (const word of words) {
      assert.equal(word, word.trim(), `${category}: 「${word}」`);
      assert.ok(!/[\r\n\t]/.test(word), `${category}: 「${word}」`);
    }
  }
});

test('辞書のどの語も、単独で入力すれば検出できる', () => {
  // 並べ替えや境界の判定で、拾えなくなる語が出ていないかを全語で確かめる
  const entries = C.buildEntries(JSON_DICT);
  for (const [category, words] of Object.entries(JSON_DICT)) {
    for (const word of words) {
      const spans = C.findSpans(word, entries);
      assert.equal(spans.length, 1, `「${word}」が ${spans.length} 件で検出された`);
      assert.equal(spans[0].word, word, `「${word}」が「${spans[0].word}」として検出された`);
      assert.equal(spans[0].category, category, `「${word}」のカテゴリーが ${spans[0].category}`);
    }
  }
});

test('辞書のどの語も、日本語の文に埋めれば検出できる', () => {
  const entries = C.buildEntries(JSON_DICT);
  for (const words of Object.values(JSON_DICT)) {
    for (const word of words) {
      const text = `お知らせです。${word}。以上です。`;
      const found = C.findSpans(text, entries).map((s) => s.word);
      assert.ok(found.includes(word), `「${word}」が文中で検出されない（検出: ${found.join(', ')}）`);
    }
  }
});
