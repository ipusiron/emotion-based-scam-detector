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
  // 詐欺メッセージの模造品
  phishing_jp: { emergency: 10, fear: 8, greed: 0, total: 84, level: 'high' },
  delivery_jp: { emergency: 10, fear: 0, greed: 0, total: 60, level: 'medium' },
  support_jp: { emergency: 10, fear: 10, greed: 0, total: 90, level: 'high' },
  tax_jp: { emergency: 7, fear: 6, greed: 0, total: 60, level: 'medium' },
  investment_jp: { emergency: 6, fear: 0, greed: 10, total: 78, level: 'high' },
  lottery_jp: { emergency: 8, fear: 2, greed: 10, total: 86, level: 'high' },
  job_jp: { emergency: 2, fear: 0, greed: 10, total: 66, level: 'medium' },
  romance_jp: { emergency: 2, fear: 0, greed: 10, total: 66, level: 'medium' },
  phishing_en: { emergency: 10, fear: 8, greed: 2, total: 86, level: 'high' },
  // 正規の通知の模造品（偽陽性の体験に使う）
  legit_delivery_jp: { emergency: 0, fear: 0, greed: 0, total: 0, level: 'veryLow' },
  legit_bank_jp: { emergency: 0, fear: 2, greed: 0, total: 12, level: 'veryLow' },
  legit_work_jp: { emergency: 7, fear: 0, greed: 0, total: 42, level: 'medium' },
  legit_campaign_jp: { emergency: 0, fear: 2, greed: 8, total: 54, level: 'medium' },
  legit_signin_en: { emergency: 0, fear: 6, greed: 0, total: 36, level: 'low' }
};

const kindOf = (key) => SAMPLES[key].kind;

test('サンプルは画面の選択肢とそろっている', () => {
  const html = read('index.html');
  const options = [...html.matchAll(/<option value="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(options.sort(), Object.keys(SAMPLES).sort());
  assert.deepEqual(Object.keys(EXPECTED).sort(), Object.keys(SAMPLES).sort());
});

test('サンプルはkindとtextを持つ', () => {
  for (const [key, sample] of Object.entries(SAMPLES)) {
    assert.ok(['scam', 'legit'].includes(sample.kind), `${key} のkindが不正: ${sample.kind}`);
    assert.equal(typeof sample.text, 'string', `${key} のtextが文字列でない`);
    assert.ok(sample.text.length > 50, `${key} の本文が短すぎる`);
    // キーの頭と kind がそろっている（選択肢の分類と食い違わないため）
    assert.equal(key.startsWith('legit_'), sample.kind === 'legit', `${key} のkindとキーが食い違う`);
  }
  const kinds = Object.values(SAMPLES).map((s) => s.kind);
  assert.equal(kinds.filter((k) => k === 'scam').length, 9);
  assert.equal(kinds.filter((k) => k === 'legit').length, 5);
});

test('サンプルのスコアが、期待どおりになる', () => {
  for (const [key, want] of Object.entries(EXPECTED)) {
    const result = C.analyze(SAMPLES[key].text, DICT);
    assert.equal(result.categories.emergency.score, want.emergency, `${key} の緊急性`);
    assert.equal(result.categories.fear.score, want.fear, `${key} の恐怖`);
    assert.equal(result.categories.greed.score, want.greed, `${key} の欲望`);
    assert.equal(result.total, want.total, `${key} の総合`);
    assert.equal(result.level, want.level, `${key} の判定`);
  }
});

test('典型的なフィッシングと偽サポートは高リスクになる', () => {
  for (const key of ['phishing_jp', 'support_jp', 'phishing_en']) {
    assert.equal(C.analyze(SAMPLES[key].text, DICT).level, 'high', key);
  }
});

test('正規のサンプルにも、スコアが上がるものと上がらないものがある', () => {
  // 偽陽性の体験が成り立つ条件。どちらかに寄ると教材にならない
  const levels = Object.keys(SAMPLES)
    .filter((k) => kindOf(k) === 'legit')
    .map((k) => C.analyze(SAMPLES[k].text, DICT).level);
  assert.ok(levels.includes('medium'), '正規のサンプルに中リスクになるものがない');
  assert.ok(levels.includes('veryLow'), '正規のサンプルに極小リスクのものがない');
  // 正規のものが高リスクまで行くと、ツールの目安としての意味が薄れる
  assert.ok(!levels.includes('high'), '正規のサンプルが高リスクになっている');
});

test('詐欺のサンプルは、正規のサンプルより総じて高く出る', () => {
  const avg = (kind) => {
    const keys = Object.keys(SAMPLES).filter((k) => kindOf(k) === kind);
    return keys.reduce((n, k) => n + C.analyze(SAMPLES[k].text, DICT).total, 0) / keys.length;
  };
  assert.ok(avg('scam') > avg('legit') + 20,
    `詐欺の平均 ${avg('scam').toFixed(1)} と正規の平均 ${avg('legit').toFixed(1)} の差が小さい`);
});

test('サンプルにはダミーの連絡先しか入れない', () => {
  for (const [key, sample] of Object.entries(SAMPLES)) {
    for (const m of sample.text.matchAll(/https?:\/\/([^\s/]+)/g)) {
      assert.match(m[1], /(^|\.)example\.(com|net|org)$/, `${key} に実在しそうなURL: ${m[0]}`);
    }
    for (const m of sample.text.matchAll(/0\d{1,4}-\d{1,4}-\d{3,4}/g)) {
      assert.fail(`${key} に数字だけの電話番号: ${m[0]}`);
    }
    // 実在の企業名・銀行名を入れない
    for (const name of ['三菱', '三井', 'みずほ', 'ゆうちょ', 'Amazon', '楽天', 'ヤマト', '佐川']) {
      assert.ok(!sample.text.includes(name), `${key} に実在の名前: ${name}`);
    }
  }
});

test('サンプルで、ハイライトされる語が取りこぼされない', () => {
  const entries = C.buildEntries(DICT);
  const found = (key) => C.findSpans(SAMPLES[key].text, entries).map((s) => s.word);
  assert.ok(found('delivery_jp').includes('24時間以内'));
  assert.ok(found('support_jp').includes('24時間以内'));
  assert.ok(found('phishing_jp').includes('24時間以内'));
  assert.ok(found('support_jp').includes('利用停止'));
  assert.ok(found('support_jp').includes('永久停止'));
  assert.ok(!found('support_jp').includes('停止'));
  assert.ok(found('lottery_jp').includes('完全無料'));
  assert.ok(!found('lottery_jp').includes('無料'));
});

test('ハイライトしたHTMLに、入れ子のspanが出ない', () => {
  const entries = C.buildEntries(DICT);
  for (const [key, sample] of Object.entries(SAMPLES)) {
    const html = C.highlightHtml(sample.text, C.findSpans(sample.text, entries));
    assert.ok(!/<span[^>]*>[^<]*<span/.test(html), `${key} にspanの入れ子がある`);
  }
});
