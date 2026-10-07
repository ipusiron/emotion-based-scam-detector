import test from 'node:test';
import assert from 'node:assert/strict';
import { core, dictionary, load, read } from './load.js';

const C = core();
const DICT = dictionary();
const SAMPLES = load('js/samples.js').SCAM_SAMPLES;

/**
 * サンプルごとの期待値。READMEの表と同じ値で、画面の表示とも一致する。
 * 採点の式を変えたら、ここも README も同時に直す。
 */
const EXPECTED = {
  phishing_jp: { emergency: 10, fear: 8, greed: 0, total: 84, level: 'high' },
  delivery_jp: { emergency: 10, fear: 0, greed: 0, total: 60, level: 'medium' },
  support_jp: { emergency: 10, fear: 10, greed: 0, total: 90, level: 'high' },
  tax_jp: { emergency: 7, fear: 6, greed: 0, total: 60, level: 'medium' },
  investment_jp: { emergency: 6, fear: 0, greed: 10, total: 78, level: 'high' },
  lottery_jp: { emergency: 8, fear: 2, greed: 10, total: 86, level: 'high' },
  job_jp: { emergency: 2, fear: 0, greed: 10, total: 66, level: 'medium' },
  romance_jp: { emergency: 2, fear: 0, greed: 10, total: 66, level: 'medium' },
  phishing_en: { emergency: 10, fear: 8, greed: 2, total: 86, level: 'high' }
};

test('サンプルは画面の選択肢とそろっている', () => {
  const html = read('index.html');
  const options = [...html.matchAll(/<option value="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(options.sort(), Object.keys(SAMPLES).sort());
  assert.deepEqual(Object.keys(EXPECTED).sort(), Object.keys(SAMPLES).sort());
});

test('サンプルのスコアが、期待どおりになる', () => {
  for (const [key, want] of Object.entries(EXPECTED)) {
    const result = C.analyze(SAMPLES[key], DICT);
    assert.equal(result.categories.emergency.score, want.emergency, `${key} の緊急性`);
    assert.equal(result.categories.fear.score, want.fear, `${key} の恐怖`);
    assert.equal(result.categories.greed.score, want.greed, `${key} の欲望`);
    assert.equal(result.total, want.total, `${key} の総合`);
    assert.equal(result.level, want.level, `${key} の判定`);
  }
});

test('典型的なフィッシングと偽サポートは高リスクになる', () => {
  // 平均式だった頃は、2つの感情が満点でも67点どまりで高リスクに届かなかった
  for (const key of ['phishing_jp', 'support_jp', 'phishing_en']) {
    assert.equal(C.analyze(SAMPLES[key], DICT).level, 'high', key);
  }
});

test('サンプルにはダミーの連絡先しか入れない', () => {
  for (const [key, text] of Object.entries(SAMPLES)) {
    for (const m of text.matchAll(/https?:\/\/([^\s/]+)/g)) {
      assert.match(m[1], /(^|\.)example\.(com|net|org)$/, `${key} に実在しそうなURL: ${m[0]}`);
    }
    // 電話番号は伏字にしておく
    for (const m of text.matchAll(/0\d{1,4}-\d{1,4}-\d{3,4}/g)) {
      assert.fail(`${key} に数字だけの電話番号: ${m[0]}`);
    }
  }
});

test('サンプルで、ハイライトされる語が取りこぼされない', () => {
  // 「24時間以内」は語境界の扱いを直すまで一度も検出できていなかった
  const entries = C.buildEntries(DICT);
  const found = (key) => C.findSpans(SAMPLES[key], entries).map((s) => s.word);
  assert.ok(found('delivery_jp').includes('24時間以内'));
  assert.ok(found('support_jp').includes('24時間以内'));
  assert.ok(found('phishing_jp').includes('24時間以内'));
  // 長い語が短い語に割り込まれない
  assert.ok(found('support_jp').includes('利用停止'));
  assert.ok(found('support_jp').includes('永久停止'));
  assert.ok(!found('support_jp').includes('停止'));
  assert.ok(found('lottery_jp').includes('完全無料'));
  assert.ok(!found('lottery_jp').includes('無料'));
});

test('ハイライトしたHTMLに、入れ子のspanが出ない', () => {
  const entries = C.buildEntries(DICT);
  for (const [key, text] of Object.entries(SAMPLES)) {
    const html = C.highlightHtml(text, C.findSpans(text, entries));
    assert.ok(!/<span[^>]*>[^<]*<span/.test(html), `${key} にspanの入れ子がある`);
  }
});
