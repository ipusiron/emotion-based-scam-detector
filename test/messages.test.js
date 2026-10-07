import test from 'node:test';
import assert from 'node:assert/strict';
import { core, messages, read } from './load.js';

const C = core();
const M = messages();
const script = read('script.js');

test('画面が呼ぶキーが、すべて辞書にある', () => {
  // t('…') と t('…', {…}) の形で直接書いたキー
  // （'a.' + x + '.b' のように組み立てるものは、下で段階ごとに確かめる）
  for (const m of script.matchAll(/\bt\('([^']+)'\s*[,)]/g)) {
    assert.ok(Object.prototype.hasOwnProperty.call(M.MESSAGES, m[1]), `${m[1]} が辞書にない`);
  }
  // 'risk.' + level + '.label' のように組み立てるキー
  for (const level of C.RISK_LEVELS.map((l) => l.key)) {
    assert.ok(M.MESSAGES[`risk.${level}.label`], `risk.${level}.label がない`);
    assert.ok(M.MESSAGES[`risk.${level}.text`], `risk.${level}.text がない`);
  }
  for (const category of ['emergency', 'fear', 'greed']) {
    assert.ok(M.MESSAGES[`category.${category}.label`], `category.${category}.label がない`);
    assert.ok(M.MESSAGES[`category.${category}.hint`], `category.${category}.hint がない`);
  }
});

test('文言のキーらしい文字列は、すべて辞書にある', () => {
  // t() の引数が三項演算子などで組み立てられていても拾えるように、
  // 既知の前置きで始まる文字列はすべてキーとみなす
  const PREFIX = /^(risk|category|detail|dictionary|radar|result|sample)\./;
  for (const m of script.matchAll(/'([\w.]+)'/g)) {
    if (!PREFIX.test(m[1])) continue;
    // 'risk.' のように組み立ての途中で切れたものは除く
    if (m[1].endsWith('.')) continue;
    assert.ok(Object.prototype.hasOwnProperty.call(M.MESSAGES, m[1]), `${m[1]} が辞書にない`);
  }
});

test('辞書の値が空でない', () => {
  for (const [key, value] of Object.entries(M.MESSAGES)) {
    assert.equal(typeof value, 'string', key);
    assert.ok(value.trim().length > 0, `${key} が空`);
  }
});

test('差し込みの名前を解決する', () => {
  assert.equal(M.t('detail.summary', { distinct: 3, occurrences: 5 }), '3種類の語が5回');
  // 値を渡さなければ、差し込みの印をそのまま残す（空文字にしない）
  assert.equal(M.t('detail.summary'), '{distinct}種類の語が{occurrences}回');
  // 知らないキーはキーをそのまま返す
  assert.equal(M.t('no.such.key'), 'no.such.key');
});

test('画面の処理に日本語の文字列が残っていない', () => {
  // 文言は辞書に集めておく。第2弾で言語を足すときに触る場所を1か所にするため
  const JP = new RegExp(`[${String.fromCodePoint(0x3040)}-${String.fromCodePoint(0x30ff)}`
    + `${String.fromCodePoint(0x4e00)}-${String.fromCodePoint(0x9fff)}]`, 'u');
  const withoutComments = script
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
  for (const m of withoutComments.matchAll(/'([^'\\]*)'/g)) {
    assert.ok(!JP.test(m[1]), `script.js に日本語の文字列がある: ${m[1]}`);
  }
});

test('カテゴリーの説明が、画面の凡例と同じ言い回しである', () => {
  const html = read('index.html');
  for (const category of ['emergency', 'fear', 'greed']) {
    assert.ok(html.includes(M.MESSAGES[`category.${category}.label`]),
      `${category} の名前が画面にない`);
    assert.ok(html.includes(M.MESSAGES[`category.${category}.hint`]),
      `${category} の説明が画面の凡例と違う`);
  }
});

test('危険度の見出しが、しきい値の段階とそろっている', () => {
  const levels = C.RISK_LEVELS.map((l) => l.key);
  assert.deepEqual(levels, ['high', 'medium', 'low', 'veryLow']);
  const labels = levels.map((l) => M.MESSAGES[`risk.${l}.label`]);
  assert.deepEqual(labels, ['高リスク', '中リスク', '低リスク', '極小リスク']);
});
