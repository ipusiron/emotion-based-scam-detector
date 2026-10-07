import test from 'node:test';
import assert from 'node:assert/strict';
import { core, dictionary, principles, readJson } from './load.js';

const C = core();
const DICT = dictionary();
const JS_P = principles();
const JSON_P = readJson('data/principles.json');

test('js/principles.jsとdata/principles.jsonの内容が完全に一致する', () => {
  assert.deepEqual(JS_P, JSON_P);
});

test('辞書の全語が、ちょうど1つのまとまりに入っている', () => {
  const result = C.validatePrinciples(JSON_P, DICT);
  assert.deepEqual(result.errors, []);
  assert.equal(result.ok, true);
});

test('まとまりの語数の合計が、辞書の語数と一致する', () => {
  const total = Object.values(JSON_P.groups)
    .reduce((n, group) => n + group.words.length, 0);
  assert.equal(total, C.validateDictionary(DICT).total);
  assert.equal(total, 167);
});

test('原理は、Cialdiniの6原理か none である', () => {
  assert.deepEqual(C.PRINCIPLES,
    ['authority', 'socialProof', 'liking', 'reciprocity', 'commitment', 'scarcity']);
  for (const [id, group] of Object.entries(JSON_P.groups)) {
    assert.ok(group.principle === 'none' || C.PRINCIPLES.includes(group.principle),
      `${id} の原理が不正: ${group.principle}`);
  }
});

test('壊れたまとまりの表をはじく', () => {
  assert.equal(C.validatePrinciples(null, DICT).ok, false);
  assert.equal(C.validatePrinciples({}, DICT).ok, false);
  assert.equal(C.validatePrinciples({ groups: { a: {} } }, DICT).ok, false);
  // 知らない原理
  assert.equal(C.validatePrinciples({ groups: { a: { principle: 'magic', words: ['至急'] } } }, DICT).ok, false);
  // 辞書にない語
  assert.equal(C.validatePrinciples({ groups: { a: { principle: 'none', words: ['ない語'] } } }, DICT).ok, false);
  // 同じ語が2つのまとまりに
  const dupe = { groups: { a: { principle: 'none', words: ['至急'] }, b: { principle: 'none', words: ['至急'] } } };
  assert.equal(C.validatePrinciples(dupe, DICT).ok, false);
});

test('語から、まとまりと原理を引ける', () => {
  const index = C.buildGroupIndex(JSON_P);
  assert.deepEqual(index['至急'], { group: 'immediacy', principle: 'scarcity' });
  assert.deepEqual(index['罰金'], { group: 'legalThreat', principle: 'authority' });
  assert.deepEqual(index['無料'], { group: 'freeGift', principle: 'reciprocity' });
  assert.deepEqual(index['利用停止'], { group: 'accountLoss', principle: 'none' });
  assert.deepEqual(index['保証'], { group: 'guarantee', principle: 'commitment' });
  assert.deepEqual(index['選ばれた'], { group: 'chosen', principle: 'liking' });
  assert.equal(index['辞書にない語'], undefined);
});

test('解析の結果に、まとまりと原理の内訳が付く', () => {
  const r = C.analyze('【重要】至急ご確認ください。利用停止を回避するため、完全無料の特典もあります。',
    DICT, JSON_P);
  assert.deepEqual(Object.keys(r.groups).sort(),
    ['accountLoss', 'freeGift', 'immediacy', 'importance']);
  assert.equal(r.groups.freeGift.occurrences, 2);
  assert.deepEqual(r.groups.freeGift.words, ['完全無料', '特典']);
  assert.equal(r.groups.freeGift.principle, 'reciprocity');
  assert.equal(r.principles.reciprocity.occurrences, 2);
  assert.deepEqual(r.principles.reciprocity.groups, ['freeGift']);
  assert.equal(r.principles.authority.occurrences, 1);
});

test('一致した語ごとに、まとまりと原理が付く', () => {
  const r = C.analyze('至急', DICT, JSON_P);
  assert.equal(r.spans[0].group, 'immediacy');
  assert.equal(r.spans[0].principle, 'scarcity');
});

test('まとまりの表を渡さなくても解析できる', () => {
  // 第1弾・第2弾と同じ呼び方を壊さない。スコアは表の有無で変わらない
  const withTable = C.analyze('至急ご確認ください。無料の特典。', DICT, JSON_P);
  const without = C.analyze('至急ご確認ください。無料の特典。', DICT);
  assert.equal(without.total, withTable.total);
  assert.deepEqual(without.categories, withTable.categories);
  assert.deepEqual(without.groups, {});
  assert.deepEqual(without.principles, {});
  assert.equal(without.spans[0].group, null);
  assert.equal(without.spans[0].principle, null);
});

test('いまの辞書は、6原理のうち4つしか使っていない', () => {
  // 足りない軸がわかることも学習の材料になる。辞書を広げたらここも直す
  const used = new Set(Object.values(JSON_P.groups).map((g) => g.principle));
  assert.ok(used.has('authority'));
  assert.ok(used.has('scarcity'));
  assert.ok(used.has('reciprocity'));
  assert.ok(used.has('liking'));
  assert.ok(used.has('commitment'));
  assert.ok(!used.has('socialProof'), '社会的証明の語が入った。READMEの記述も直すこと');
});

test('まとまりの数と名前は決まっている', () => {
  assert.deepEqual(Object.keys(JSON_P.groups), [
    'immediacy', 'deadline', 'importance',
    'legalThreat', 'accountLoss', 'securityIncident',
    'freeGift', 'discount', 'winning', 'chosen', 'exclusivity',
    'profit', 'guarantee', 'money'
  ]);
});
