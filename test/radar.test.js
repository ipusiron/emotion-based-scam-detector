import test from 'node:test';
import assert from 'node:assert/strict';
import { load } from './load.js';

const R = load('js/radar.js').ScamRadar;
const attr = (values, options) => R.toAttr(R.points(values, options));

test('最初の軸が真上を向き、時計回りに並ぶ', () => {
  // 3軸なら -90°・30°・150°
  assert.equal(Math.round(R.angleOf(0, 3) * 1000), Math.round((-Math.PI / 2) * 1000));
  assert.equal(Math.round(R.angleOf(1, 3) * 1000), Math.round((Math.PI / 6) * 1000));
  assert.equal(Math.round(R.angleOf(2, 3) * 1000), Math.round((5 * Math.PI / 6) * 1000));
});

test('3軸の頂点は、計算した値と一致する', () => {
  assert.equal(attr([10, 10, 10]), '150,40 236.6,190 63.4,190');
  assert.equal(attr([0, 0, 0]), '150,140 150,140 150,140');
  assert.equal(attr([10, 8, 0]), '150,40 219.28,180 150,140');
  assert.equal(attr([10, 10, 0]), '150,40 236.6,190 150,140');
  assert.equal(attr([6, 6, 6]), '150,80 201.96,170 98.04,170');
  assert.equal(attr([10, 0, 0]), '150,40 150,140 150,140');
  assert.equal(attr([2, 0, 10]), '150,120 150,140 63.4,190');
});

test('目盛りの輪は、中心から外へ等間隔に広がる', () => {
  assert.equal(attr([2, 2, 2]), '150,120 167.32,150 132.68,150');
  assert.equal(attr([4, 4, 4]), '150,100 184.64,160 115.36,160');
  assert.equal(attr([8, 8, 8]), '150,60 219.28,180 80.72,180');
});

test('範囲の外の値は、0と上限に丸める', () => {
  assert.equal(attr([-3, 14, 5]), '150,140 236.6,190 106.7,165');
  assert.equal(attr([Number.NaN, 10, 0]), '150,140 236.6,190 150,140');
});

test('軸の数が変わっても描き分けられる', () => {
  // 第2弾でカテゴリーを増やしたときに、ここが壊れていないことを確かめる
  assert.equal(attr([10, 10, 10, 10, 10, 10]),
    '150,40 236.6,90 236.6,190 150,240 63.4,190 63.4,90');
  assert.equal(R.points([10], {}).length, 1);
  assert.equal(R.points([5, 5, 5, 5], {}).length, 4);
  assert.deepEqual(R.points([], {}), []);
});

test('viewBoxは軸の数に合わせて縦に伸びる', () => {
  // 軸が6本だと真下にも頂点が来るので、3本のときより下が深くなる
  assert.equal(R.viewBox(3), '0 8 300 205');
  assert.equal(R.viewBox(6), '0 8 300 264');
  assert.equal(R.viewBox(0), '0 0 300 230');
});

test('ラベルの輪は、値の多角形より外にある', () => {
  assert.equal(attr([10, 10, 10], { r: R.LAYOUT.labelR }), '150,22 252.19,199 47.81,199');
  assert.ok(R.LAYOUT.labelR > R.LAYOUT.r);
});

test('同じ入力からは、いつも同じ文字列ができる', () => {
  const once = attr([7, 3, 9]);
  for (let i = 0; i < 5; i++) assert.equal(attr([7, 3, 9]), once);
  // 小数は第2位までに丸める
  for (const part of once.split(/[ ,]/)) {
    assert.ok(/^-?\d+(\.\d{1,2})?$/.test(part), part);
  }
});

test('しきい値の初期値は、画面の凡例と同じ6である', () => {
  assert.equal(R.LAYOUT.threshold, 6);
  assert.equal(R.LAYOUT.max, 10);
  assert.deepEqual(R.LAYOUT.ticks, [2, 4, 6, 8, 10]);
});
