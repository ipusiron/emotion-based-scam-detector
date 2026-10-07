import test from 'node:test';
import assert from 'node:assert/strict';
import { core, messages, read } from './load.js';

const C = core();
const M = messages();
const JA = M.MESSAGES.ja;
const script = read('script.js');

test('画面が呼ぶキーが、すべて辞書にある', () => {
  // t('…') と t('…', {…}) の形で直接書いたキー
  // （'a.' + x + '.b' のように組み立てるものは、下で段階ごとに確かめる）
  for (const m of script.matchAll(/\bt\('([^']+)'\s*[,)]/g)) {
    assert.ok(Object.prototype.hasOwnProperty.call(JA, m[1]), `${m[1]} が辞書にない`);
  }
  for (const level of C.RISK_LEVELS.map((l) => l.key)) {
    assert.ok(JA[`risk.${level}.label`], `risk.${level}.label がない`);
    assert.ok(JA[`risk.${level}.text`], `risk.${level}.text がない`);
  }
  for (const category of ['emergency', 'fear', 'greed']) {
    assert.ok(JA[`category.${category}.label`], `category.${category}.label がない`);
    assert.ok(JA[`category.${category}.hint`], `category.${category}.hint がない`);
  }
});

test('文言のキーらしい文字列は、すべて辞書にある', () => {
  // t() の引数が三項演算子などで組み立てられていても拾えるように、
  // 既知の前置きで始まる文字列はすべてキーとみなす
  const PREFIX = /^(risk|category|detail|dictionary|radar|result|sample|app|header|presets|input|button|tips|lang|output|footer)\./;
  for (const m of script.matchAll(/'([\w.]+)'/g)) {
    if (!PREFIX.test(m[1]) || m[1].endsWith('.')) continue;
    assert.ok(Object.prototype.hasOwnProperty.call(JA, m[1]), `${m[1]} が辞書にない`);
  }
});

test('辞書の値が空でない', () => {
  for (const [lang, table] of Object.entries(M.MESSAGES)) {
    for (const [key, value] of Object.entries(table)) {
      assert.equal(typeof value, 'string', `${lang}: ${key}`);
      assert.ok(value.trim().length > 0, `${lang}: ${key} が空`);
    }
  }
});

test('差し込みの名前を解決する', () => {
  M.setLanguage('ja');
  assert.equal(M.t('detail.summary', { distinct: 3, occurrences: 5 }), '3種類の語が5回');
  // 値を渡さなければ、差し込みの印をそのまま残す（空文字にしない）
  assert.equal(M.t('detail.summary'), '{distinct}種類の語が{occurrences}回');
  // 知らないキーはキーをそのまま返す
  assert.equal(M.t('no.such.key'), 'no.such.key');
  M.setLanguage('en');
  assert.equal(M.t('detail.summary', { distinct: 3, occurrences: 5 }), '3 distinct words, 5 occurrences');
  M.setLanguage('ja');
});

test('知らない言語を渡すと既定に戻る', () => {
  assert.equal(M.setLanguage('fr'), 'ja');
  assert.equal(M.setLanguage(null), 'ja');
  assert.equal(M.setLanguage('en'), 'en');
  assert.equal(M.getLanguage(), 'en');
  M.setLanguage('ja');
});

test('画面の処理に日本語の文字列が残っていない', () => {
  // 文言は辞書に集めておく。言語を足すときに触る場所を1か所にするため
  const JP = new RegExp(`[${String.fromCodePoint(0x3040)}-${String.fromCodePoint(0x30ff)}`
    + `${String.fromCodePoint(0x4e00)}-${String.fromCodePoint(0x9fff)}]`, 'u');
  const withoutComments = script
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
  for (const m of withoutComments.matchAll(/'([^'\\]*)'/g)) {
    assert.ok(!JP.test(m[1]), `script.js に日本語の文字列がある: ${m[1]}`);
  }
});

test('カテゴリーの説明は、画面の凡例から引いている', () => {
  // 凡例は data-i18n で引くので、HTMLに直接書かれていないこと
  const html = read('index.html');
  for (const category of ['emergency', 'fear', 'greed']) {
    assert.ok(html.includes(`data-i18n="category.${category}.label"`), `${category} の名前が凡例にない`);
    assert.ok(html.includes(`data-i18n="category.${category}.hint"`), `${category} の説明が凡例にない`);
    assert.ok(!html.includes(JA[`category.${category}.hint`]), `${category} の説明がHTMLに直書きされている`);
  }
});

test('危険度の見出しが、しきい値の段階とそろっている', () => {
  const levels = C.RISK_LEVELS.map((l) => l.key);
  assert.deepEqual(levels, ['high', 'medium', 'low', 'veryLow']);
  assert.deepEqual(levels.map((l) => JA[`risk.${l}.label`]),
    ['高リスク', '中リスク', '低リスク', '極小リスク']);
  assert.deepEqual(levels.map((l) => M.MESSAGES.en[`risk.${l}.label`]),
    ['High risk', 'Medium risk', 'Low risk', 'Very low risk']);
});
