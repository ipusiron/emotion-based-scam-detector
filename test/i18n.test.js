import test from 'node:test';
import assert from 'node:assert/strict';
import { load, messages, read } from './load.js';

const M = messages();
const SAMPLES = load('js/samples.js').SCAM_SAMPLES;
const html = read('index.html');
const script = read('script.js');

const JP = new RegExp(`[${String.fromCodePoint(0x3040)}-${String.fromCodePoint(0x30ff)}`
  + `${String.fromCodePoint(0x4e00)}-${String.fromCodePoint(0x9fff)}`
  + `${String.fromCodePoint(0xff00)}-${String.fromCodePoint(0xffef)}]`, 'u');

test('対応する言語は ja と en の2つ', () => {
  assert.deepEqual(M.LANGUAGES, ['ja', 'en']);
  assert.deepEqual(Object.keys(M.MESSAGES).sort(), ['en', 'ja']);
});

test('日本語と英語のキーが完全に一致する', () => {
  const ja = Object.keys(M.MESSAGES.ja).sort();
  const en = Object.keys(M.MESSAGES.en).sort();
  const missingEn = ja.filter((k) => !(k in M.MESSAGES.en));
  const missingJa = en.filter((k) => !(k in M.MESSAGES.ja));
  assert.deepEqual(missingEn, [], `英語にないキー: ${missingEn.join(', ')}`);
  assert.deepEqual(missingJa, [], `日本語にないキー: ${missingJa.join(', ')}`);
  assert.deepEqual(ja, en);
});

test('英語の辞書に日本語の文字が入っていない', () => {
  // 切り替えボタンだけは、押した先の言語の名前を出すので例外
  const EXCEPT = ['lang.toggle'];
  for (const [key, value] of Object.entries(M.MESSAGES.en)) {
    if (EXCEPT.includes(key)) continue;
    assert.ok(!JP.test(value), `${key} に日本語の文字がある: ${value}`);
  }
  assert.equal(M.MESSAGES.en['lang.toggle'], '日本語');
  assert.equal(M.MESSAGES.ja['lang.toggle'], 'English');
});

test('差し込みの印が、日本語と英語でそろっている', () => {
  for (const key of Object.keys(M.MESSAGES.ja)) {
    const names = (text) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
    assert.deepEqual(names(M.MESSAGES.ja[key]), names(M.MESSAGES.en[key]),
      `${key} の差し込みの印が食い違う`);
  }
});

test('index.html が引くキーが、すべて辞書にある', () => {
  const attrs = ['data-i18n', 'data-i18n-placeholder', 'data-i18n-label', 'data-i18n-optgroup'];
  let count = 0;
  for (const attr of attrs) {
    for (const m of html.matchAll(new RegExp(`${attr}="([^"]+)"`, 'g'))) {
      assert.ok(Object.prototype.hasOwnProperty.call(M.MESSAGES.ja, m[1]),
        `${m[1]} が辞書にない`);
      count++;
    }
  }
  assert.ok(count >= 50, `data-i18n の数が ${count} 件しかない`);
});

test('すべてのサンプルに、選択肢の文言がある', () => {
  for (const key of Object.keys(SAMPLES)) {
    assert.ok(M.MESSAGES.ja[`sample.${key}.label`], `sample.${key}.label がない`);
    assert.ok(html.includes(`data-i18n="sample.${key}.label"`), `${key} の選択肢が引いていない`);
  }
});

test('画面の文言がHTMLに直書きされていない', () => {
  // body のタグの外に残っている日本語を拾う。noscript だけは JavaScript が
  // 動かないときに出すものなので、日英を直書きしてよい
  const body = html.slice(html.indexOf('<body>'))
    .replace(/<noscript>[\s\S]*?<\/noscript>/g, '')
    .replace(/<script[\s\S]*?<\/script>/g, '');
  const texts = body.replace(/<[^>]+>/g, '\n').split('\n')
    .map((s) => s.trim()).filter(Boolean);
  for (const s of texts) {
    assert.ok(!JP.test(s), `index.html に直書きの日本語がある: ${s}`);
  }
});

test('属性にも直書きの日本語が残っていない', () => {
  for (const attr of ['placeholder', 'aria-label', 'label', 'title', 'alt', 'content']) {
    for (const m of html.matchAll(new RegExp(`\\s${attr}="([^"]*)"`, 'g'))) {
      // meta の description だけは、JavaScript が動かないときのために日本語を残す
      if (attr === 'content' && m[1].includes('フィッシング')) continue;
      assert.ok(!JP.test(m[1]), `${attr}="${m[1]}" が直書きされている`);
    }
  }
});

test('言語の決め方が、問い合わせ・保存・ブラウザーの順である', () => {
  assert.match(script, /lang=\(\[a-zA-Z-\]\+\)/);
  assert.ok(script.includes('LANG_STORAGE_KEY'), '選択を保存していない');
  assert.ok(script.includes('navigator.language'), 'ブラウザーの言語を見ていない');
  // localStorage が使えなくても止まらないようにする
  assert.ok(script.includes('function withStorage'), 'localStorage を包んでいない');
  assert.match(script, /try \{[\s\S]*?localStorage[\s\S]*?\} catch/);
});

test('html要素のlangを切り替えている', () => {
  assert.ok(script.includes('documentElement.lang'), 'html の lang を切り替えていない');
  assert.ok(script.includes("doc.title = t('app.title')"), 'タイトルを切り替えていない');
});

test('README.en.md が日本語版と同じ節をそろえている', () => {
  const ja = read('README.md');
  const en = read('README.en.md');
  const strip = (s) => s.replace(/```[\s\S]*?```/g, '');
  const heads = (s) => [...strip(s).matchAll(/^(#{1,3}) (.+)$/gm)]
    .map((m) => `${m[1].length}:${m[2].replace(/^[^\p{L}\p{N}]+\s*/u, '')}`);
  const jaHeads = heads(ja);
  const enHeads = heads(en);
  assert.equal(enHeads.length, jaHeads.length,
    `見出しの数が違う（日本語 ${jaHeads.length} / 英語 ${enHeads.length}）`);
  // 階層とアイコンの並びが一致していること（文言は訳すので比べない）
  assert.deepEqual(enHeads.map((h) => h.split(':')[0]), jaHeads.map((h) => h.split(':')[0]));
});

test('README.en.md に日本語の本文が残っていない', () => {
  const en = read('README.en.md');
  // 1行目の言語の切り替え、コード例、表の中の日本語は題材そのものなので許す
  const body = en.replace(/```[\s\S]*?```/g, '').replace(/^\|.*\|$/gm, '');
  for (const line of body.split('\n').slice(1)) {
    assert.ok(!JP.test(line), `README.en.md に日本語がある: ${line.trim()}`);
  }
});

test('2つのREADMEが互いを指している', () => {
  assert.ok(read('README.md').includes('[English](README.en.md) · 日本語'),
    'README.md の先頭に言語の切り替えがない');
  assert.ok(read('README.en.md').startsWith('English · [日本語](README.md)'),
    'README.en.md の1行目が決まった形になっていない');
});

test('YAMLメタデータは日本語版だけに置く', () => {
  // hackinglab.online が読むのは README.md
  assert.ok(!read('README.en.md').includes('slug: emotion-based-scam-detector'),
    'README.en.md にYAMLメタデータがある');
});
