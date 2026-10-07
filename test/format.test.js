import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { read } from './load.js';

const JS = ['script.js', 'js/scam-core.js', 'js/radar.js', 'js/messages.js',
  'js/dictionary.js', 'js/samples.js',
  ...fs.readdirSync(new URL('./', import.meta.url))
    .filter((f) => f.endsWith('.js')).map((f) => `test/${f}`)];

// ひらがな・カタカナ・CJK統合漢字・全角形（数値から組み立てる）
const JP = `${String.fromCodePoint(0x3040)}-${String.fromCodePoint(0x30ff)}`
  + `${String.fromCodePoint(0x4e00)}-${String.fromCodePoint(0x9fff)}`
  + `${String.fromCodePoint(0xff00)}-${String.fromCodePoint(0xffef)}`;
const SPACED = new RegExp(`[${JP}] [A-Za-z0-9]|[A-Za-z0-9] [${JP}]`, 'u');

test('1行に詰め込まない（JS・CSS・テストは160文字、HTMLは250文字まで）', () => {
  for (const f of [...JS, 'style.css']) {
    read(f).split('\n').forEach((line, i) => {
      assert.ok([...line].length <= 160, `${f}:${i + 1} が ${[...line].length} 文字`);
    });
  }
  read('index.html').split('\n').forEach((line, i) => {
    assert.ok([...line].length <= 250, `index.html:${i + 1} が ${[...line].length} 文字`);
  });
});

test('主なファイルの行数の下限（縮めて書き直していない）', () => {
  const min = {
    'script.js': 150, 'js/scam-core.js': 250, 'js/radar.js': 150,
    'js/messages.js': 50, 'js/samples.js': 100, 'style.css': 600, 'index.html': 150
  };
  for (const [f, n] of Object.entries(min)) {
    const lines = read(f).split('\n').length;
    assert.ok(lines >= n, `${f} が ${lines} 行（下限 ${n}）`);
  }
});

test('画面の文言で、日本語と英数字の間に空白を入れない', () => {
  const html = read('index.html');
  const texts = [
    ...html.replace(/<[^>]+>/g, '\n').split('\n'),
    ...[...html.matchAll(/(?:aria-label|placeholder|alt|title|label)="([^"]*)"/g)].map((m) => m[1])
  ];
  for (const s of texts) assert.ok(!SPACED.test(s), `index.html: ${s.trim()}`);
  for (const m of read('js/messages.js').matchAll(/^\s*'[^']+': '(.*)',?$/gm)) {
    assert.ok(!SPACED.test(m[1]), `messages.js: ${m[1]}`);
  }
});

test('表記のゆれを残さない', () => {
  // 長音を省かない。漢字で書かない語を漢字にしない
  const NG = [
    [/全て/, '「すべて」と書く'],
    [/分か(る|り|っ|ら)/, '理解の意味は「わかる」と書く'],
    [/既に/, '「すでに」と書く'],
    [/インターフェース/, '「インターフェイス」と書く'],
    [/(ヶ月|か月)/, '「カ月」と書く'],
    [/サーバ(?!ー)/, '「サーバー」と書く'],
    [/ユーザ(?!ー)/, '「ユーザー」と書く'],
    [/ブラウザ(?!ー)/, '「ブラウザー」と書く'],
    [/エディタ(?!ー)/, '「エディター」と書く'],
    [/パラメータ(?!ー)/, '「パラメーター」と書く'],
    [/フォルダ(?!ー)/, '「フォルダー」と書く'],
    [/マネージャ(?!ー)/, '「マネージャー」と書く'],
    [/ディレクトリ(?!ー)/, '「ディレクトリー」と書く'],
    [/カテゴリ(?!ー)/, '「カテゴリー」と書く'],
    [/リポジトリ(?!ー)/, '「リポジトリー」と書く']
  ];
  // js/samples.js は詐欺メッセージの模造品なので、文体の規則の外に置く
  for (const f of ['index.html', 'js/messages.js', 'js/scam-core.js', 'js/radar.js',
    'script.js', 'style.css', 'README.md', 'CLAUDE.md']) {
    const text = read(f);
    for (const [pattern, why] of NG) {
      const hit = text.match(pattern);
      assert.ok(!hit, `${f}: 「${hit && hit[0]}」 → ${why}`);
    }
  }
});

test('ファイルはLFで、制御文字を含まない', () => {
  for (const f of [...JS, 'style.css', 'index.html', 'README.md', 'CLAUDE.md']) {
    const s = read(f);
    assert.ok(!s.includes('\r'), `${f} にCRがある`);
    assert.ok(!/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(s), `${f} に制御文字がある`);
  }
});

test('ファイルの末尾に改行がある', () => {
  for (const f of [...JS, 'style.css', 'index.html', 'README.md', 'CLAUDE.md']) {
    assert.ok(read(f).endsWith('\n'), `${f} の末尾に改行がない`);
  }
});
