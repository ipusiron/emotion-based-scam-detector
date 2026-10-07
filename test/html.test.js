import test from 'node:test';
import assert from 'node:assert/strict';
import { read } from './load.js';

const html = read('index.html');
const csp = (html.match(/http-equiv="Content-Security-Policy" content="([^"]*)"/) || [])[1];

test('CSPのmetaがあり、metaでは効かない指示を書いていない', () => {
  assert.ok(csp, 'CSPのmetaがない');
  assert.match(csp, /default-src 'self'/);
  assert.match(csp, /script-src 'self'/);
  // frame-ancestors と X-Frame-Options は meta では無視される
  assert.ok(!csp.includes('frame-ancestors'), 'CSPにframe-ancestorsが残っている');
  assert.ok(!html.includes('X-Frame-Options'), 'X-Frame-Optionsのmetaが残っている');
  assert.ok(!html.includes('X-Content-Type-Options'), 'X-Content-Type-Optionsのmetaが残っている');
});

test('CSPが外部の取得元を許していない', () => {
  assert.ok(!/https?:\/\//.test(csp), `CSPに外部のURLがある: ${csp}`);
  assert.ok(!csp.includes("'unsafe-inline'"), "CSPに'unsafe-inline'が残っている");
  assert.ok(!csp.includes("'unsafe-eval'"), "CSPに'unsafe-eval'が残っている");
});

test('referrerのmetaがある', () => {
  assert.match(html, /<meta name="referrer" content="no-referrer">/);
});

test('外部のスクリプト・スタイルを読み込んでいない', () => {
  for (const m of html.matchAll(/<script[^>]*src="([^"]*)"/g)) {
    assert.ok(!/^(https?:)?\/\//.test(m[1]), `外部のスクリプト: ${m[1]}`);
  }
  for (const m of html.matchAll(/<link[^>]*href="([^"]*)"/g)) {
    assert.ok(!/^(https?:)?\/\//.test(m[1]), `外部のスタイル: ${m[1]}`);
  }
  assert.ok(!html.includes('cdn.jsdelivr.net'), 'CDNの参照が残っている');
  assert.ok(!html.includes('integrity='), 'SRIの指定が残っている（自己ホストでは不要）');
});

test('インラインのイベントハンドラーとstyle属性がない', () => {
  assert.ok(!/<[^>]+\son[a-z]+=/i.test(html), 'インラインのイベントハンドラーがある');
  assert.ok(!/<[^>]+\sstyle="/i.test(html), 'style属性がある');
  assert.ok(!/<script(?![^>]*\ssrc=)[^>]*>[\s\S]*?<\/script>/i.test(html), 'インラインのscriptがある');
});

test('noscriptがある', () => {
  assert.match(html, /<noscript>/);
});

test('画面が使う要素のidがそろっている', () => {
  const ids = ['presetSelect', 'inputText', 'analyzeBtn', 'clearBtn', 'result',
    'totalScore', 'riskBadge', 'assessmentText', 'highlightedText', 'radarChart',
    'safetyTipsToggle', 'safetyTipsContent', 'dictionaryNotice'];
  for (const category of ['emergency', 'fear', 'greed']) {
    ids.push(`${category}Bar`, `${category}Score`, `${category}Detail`);
  }
  for (const id of ids) assert.ok(html.includes(`id="${id}"`), `id="${id}" がない`);
});

test('読み込むスクリプトがすべてそろっている', () => {
  for (const src of ['js/dictionary.js', 'js/samples.js', 'js/messages.js',
    'js/scam-core.js', 'js/radar.js', 'script.js']) {
    assert.ok(html.includes(`<script src="${src}"></script>`), `${src} を読み込んでいない`);
  }
  // 読み込む順。script.js は最後
  const order = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]);
  assert.equal(order[order.length - 1], 'script.js');
  assert.ok(order.indexOf('js/scam-core.js') < order.indexOf('script.js'));
});

test('入力欄とセレクトにラベルがある', () => {
  assert.match(html, /<label[^>]*for="inputText"/);
  assert.match(html, /<label[^>]*for="presetSelect"/);
});

test('アコーディオンに開閉の状態が付いている', () => {
  const button = (html.match(/<button[^>]*id="safetyTipsToggle"[^>]*>/) || [])[0] || '';
  assert.match(button, /aria-expanded="false"/);
  assert.match(button, /aria-controls="safetyTipsContent"/);
});

test('結果の更新が読み上げに伝わる', () => {
  assert.match(html, /id="riskAssessment"[^>]*aria-live="polite"/);
});

test('ボタンにtype属性がある', () => {
  for (const m of html.matchAll(/<button\b([^>]*)>/g)) {
    assert.match(m[1], /type="button"/, `type のないボタン: ${m[0]}`);
  }
});

test('ノーブレークハイフンを使っていない', () => {
  // U+2011 は通常のハイフンと別の文字なので、検索やコピペで一致しなくなる
  const nbHyphen = String.fromCodePoint(0x2011);
  for (const file of ['index.html', 'style.css', 'script.js', 'README.md', 'CLAUDE.md']) {
    assert.ok(!read(file).includes(nbHyphen), `${file} にU+2011がある`);
  }
});

test('lang属性とviewportがある', () => {
  assert.match(html, /<html lang="ja">/);
  assert.match(html, /<meta name="viewport" content="width=device-width, initial-scale=1\.0">/);
});
