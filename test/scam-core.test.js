import test from 'node:test';
import assert from 'node:assert/strict';
import { core, dictionary } from './load.js';

const C = core();
const DICT = dictionary();

/** 本文を解析して、一致した語を出現順に並べる。 */
const words = (text) => C.findSpans(text, C.buildEntries(DICT)).map((s) => s.word);

/** 本文を解析して、一致した語をカテゴリーつきで並べる。 */
const tagged = (text) =>
  C.findSpans(text, C.buildEntries(DICT)).map((s) => `${s.word}:${s.category}`);

test('辞書の並びは、長い語が先で、同じ長さなら決まった順になる', () => {
  const entries = C.buildEntries(DICT);
  for (let i = 1; i < entries.length; i++) {
    const prev = entries[i - 1].lower;
    const cur = entries[i].lower;
    assert.ok(prev.length >= cur.length, `${prev} の後ろに ${cur} が来ている`);
    if (prev.length === cur.length) assert.ok(prev <= cur, `${prev} と ${cur} の順が逆`);
  }
  // 同じ辞書からは何度でも同じ並びになる
  assert.deepEqual(C.buildEntries(DICT).map((e) => e.word), entries.map((e) => e.word));
});

test('長い語が短い語に割り込まれない（最長一致）', () => {
  assert.deepEqual(words('利用停止を解除するには'), ['利用停止']);
  assert.deepEqual(words('永久停止となり'), ['永久停止']);
  assert.deepEqual(words('大至急お返事ください'), ['大至急']);
  assert.deepEqual(words('当選者の方へ'), ['当選者']);
  assert.deepEqual(words('完全無料で受け取れます'), ['完全無料']);
  assert.deepEqual(words('アカウント停止を回避'), ['アカウント停止']);
  assert.deepEqual(words('act now please'), ['act now']);
  assert.deepEqual(words('risk-free investment'), ['risk-free', 'investment']);
  assert.deepEqual(words('save money now'), ['save money', 'now']);
});

test('一致した範囲は重ならない', () => {
  const spans = C.findSpans('利用停止と完全無料とact now', C.buildEntries(DICT));
  for (let i = 1; i < spans.length; i++) {
    assert.ok(spans[i].start >= spans[i - 1].end, '範囲が重なっている');
  }
});

test('語の端が日本語なら、後ろに何が続いても一致する', () => {
  // 「24時間以内」「100万円」は数字で始まり日本語で終わる
  assert.deepEqual(words('期限は24時間以内です'), ['期限', '24時間以内']);
  assert.deepEqual(words('24時間以内に対応がない場合'), ['24時間以内']);
  assert.deepEqual(words('24時間以内'), ['24時間以内']);
  assert.deepEqual(words('月収100万円以上の収益'), ['100万円', '収益']);
});

test('両端がASCIIの語は、英単語の途中では一致しない', () => {
  assert.deepEqual(words('he is known now'), ['now']);
  assert.deepEqual(words('nowhere to go'), []);
  assert.deepEqual(words('the finest wine'), []);
  assert.deepEqual(words('freedom of speech'), []);
});

test('大文字と小文字を区別しない', () => {
  assert.deepEqual(words('URGENT action required'), ['urgent action']);
  assert.deepEqual(words('Congratulations'), ['congratulations']);
});

test('カテゴリーが正しく付く', () => {
  assert.deepEqual(tagged('至急'), ['至急:emergency']);
  assert.deepEqual(tagged('罰金'), ['罰金:fear']);
  assert.deepEqual(tagged('当選'), ['当選:greed']);
});

test('カテゴリーの点は、異なり語数と出現回数から決まる', () => {
  // 2回目以降の出現は半分の重み。5語相当で上限
  assert.equal(C.categoryScore(0, 0), 0);
  assert.equal(C.categoryScore(1, 1), 2);
  assert.equal(C.categoryScore(1, 3), 4); // 1 + 0.5×2 = 2 → ×2
  assert.equal(C.categoryScore(3, 3), 6);
  assert.equal(C.categoryScore(5, 5), 10);
  assert.equal(C.categoryScore(17, 20), 10); // 上限を超えない
});

test('総合点は、強い感情を重く見る', () => {
  assert.equal(C.totalScore([10, 10, 10]), 100);
  assert.equal(C.totalScore([0, 0, 0]), 0);
  assert.equal(C.totalScore([10, 10, 0]), 90);
  assert.equal(C.totalScore([10, 0, 0]), 60);
  assert.equal(C.totalScore([0, 0, 10]), 60); // 並びが変わっても同じ
  assert.equal(C.totalScore([6, 6, 0]), 54);
});

test('重みは合計1で、カテゴリー数が変わっても出せる', () => {
  assert.deepEqual(C.weightsFor(3), [0.6, 0.3, 0.1]);
  for (const n of [1, 2, 3, 4, 6, 8]) {
    const w = C.weightsFor(n);
    assert.equal(w.length, n);
    assert.ok(Math.abs(w.reduce((a, b) => a + b, 0) - 1) < 1e-9, `${n}個の重みの合計が1でない`);
    for (let i = 1; i < n; i++) assert.ok(w[i] <= w[i - 1], '重みが増えている');
  }
});

test('危険度の段階は、しきい値どおりに切り替わる', () => {
  assert.equal(C.riskLevel(100), 'high');
  assert.equal(C.riskLevel(70), 'high');
  assert.equal(C.riskLevel(69), 'medium');
  assert.equal(C.riskLevel(40), 'medium');
  assert.equal(C.riskLevel(39), 'low');
  assert.equal(C.riskLevel(15), 'low');
  assert.equal(C.riskLevel(14), 'veryLow');
  assert.equal(C.riskLevel(0), 'veryLow');
});

test('同じ場所が二度数えられない', () => {
  // 「停止」と「利用停止」の両方が数えられていた不具合の再発を止める
  const r = C.analyze('利用停止', DICT);
  assert.equal(r.categories.fear.distinct, 1);
  assert.equal(r.categories.fear.occurrences, 1);
  assert.deepEqual(r.categories.fear.words, ['利用停止']);
  assert.equal(r.total, 12);
});

test('解析の結果は、カテゴリーごとの内訳を持つ', () => {
  const r = C.analyze('至急ご確認ください。至急です。無料の特典。', DICT);
  assert.equal(r.categories.emergency.distinct, 1);
  assert.equal(r.categories.emergency.occurrences, 2);
  assert.equal(r.categories.greed.distinct, 2);
  assert.deepEqual(r.order, Object.keys(DICT));
  assert.ok(C.RISK_LEVELS.some((l) => l.key === r.level));
});

test('空の入力と、辞書にない文は0点になる', () => {
  for (const text of ['', '   ', 'おはようございます。本日の議事録を送ります。']) {
    const r = C.analyze(text, DICT);
    assert.equal(r.total, 0);
    assert.equal(r.level, 'veryLow');
    assert.equal(r.spans.length, 0);
  }
});

test('長い入力・絵文字・サロゲートペアでも落ちない', () => {
  const r = C.analyze('🎉当選おめでとう🎉'.repeat(200), DICT);
  assert.ok(r.total > 0);
  assert.ok(r.spans.length > 0);
  // 範囲が文字列の外に出ない
  for (const s of r.spans) assert.ok(s.start >= 0 && s.end <= '🎉当選おめでとう🎉'.repeat(200).length);
});

test('壊れた入力を渡しても例外にならない', () => {
  assert.deepEqual(C.findSpans(null, C.buildEntries(DICT)), []);
  assert.deepEqual(C.findSpans(undefined, C.buildEntries(DICT)), []);
  assert.equal(C.analyze('至急', {}).total, 0);
});

test('HTMLの特殊文字をエスケープする', () => {
  assert.equal(C.escapeHtml('<img src=x>'), '&lt;img src=x&gt;');
  assert.equal(C.escapeHtml('a & b'), 'a &amp; b');
  assert.equal(C.escapeHtml('"q" \'s\''), '&quot;q&quot; &#39;s&#39;');
});

test('ハイライトは、本文全体をエスケープしてから包む', () => {
  const evil = '<img src=x onerror=alert(1)>至急';
  const html = C.highlightHtml(evil, C.findSpans(evil, C.buildEntries(DICT)));
  assert.ok(!html.includes('<img'), '入力のタグがそのまま残っている');
  assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
  assert.equal(html, '&lt;img src=x onerror=alert(1)&gt;<span class="highlight emergency">至急</span>');
});

test('ハイライトのspanが入れ子にならない', () => {
  const text = 'アカウント停止を回避';
  const html = C.highlightHtml(text, C.findSpans(text, C.buildEntries(DICT)));
  assert.equal(html, '<span class="highlight fear">アカウント停止</span>を回避');
  assert.ok(!/<span[^>]*>[^<]*<span/.test(html), 'spanが入れ子になっている');
});

test('ハイライトしても本文の文字が落ちない', () => {
  const texts = ['至急ご確認ください', '利用停止と完全無料', 'ふつうの連絡です', ''];
  for (const text of texts) {
    const html = C.highlightHtml(text, C.findSpans(text, C.buildEntries(DICT)));
    const plain = html.replace(/<[^>]*>/g, '')
      .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&');
    assert.equal(plain, text);
  }
});

test('辞書の検証が、壊れた辞書をはじく', () => {
  assert.equal(C.validateDictionary(DICT).ok, true);
  assert.equal(C.validateDictionary(DICT).total, 167);
  assert.equal(C.validateDictionary(null).ok, false);
  assert.equal(C.validateDictionary([]).ok, false);
  assert.equal(C.validateDictionary({}).ok, false);
  assert.equal(C.validateDictionary({ a: 'not array' }).ok, false);
  assert.equal(C.validateDictionary({ a: [] }).ok, false);
  assert.equal(C.validateDictionary({ a: [''] }).ok, false);
  assert.equal(C.validateDictionary({ a: [1] }).ok, false);
  assert.equal(C.validateDictionary({ a: ['x', 'X'] }).ok, false); // 大文字小文字だけの重複
});
