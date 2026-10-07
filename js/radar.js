/**
 * ScamRadar - カテゴリー別スコアのレーダーチャートを SVG で描く。
 *
 * 外部のライブラリーを使わない。軸の数は値の数で決まるので、
 * カテゴリーを増やしても描き分けは変わらない。
 * 色は style.css のクラスで決める（ダークモードにそのまま追従する）。
 */
(function (global) {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';

  /** 既定の寸法。viewBox は 300×230 で、ラベルの分を下に残す。 */
  var LAYOUT = {
    cx: 150,
    cy: 140,
    r: 100,
    labelR: 118,
    max: 10,
    ticks: [2, 4, 6, 8, 10],
    threshold: 6
  };

  /**
   * 軸の角度（ラジアン）。最初の軸が真上を向き、時計回りに並ぶ。
   * @param {number} index 軸の番号
   * @param {number} count 軸の数
   * @returns {number}
   */
  function angleOf(index, count) {
    return (-90 + (index * 360) / count) * (Math.PI / 180);
  }

  /**
   * 値の並びから多角形の頂点を出す。
   *
   * 値は 0〜max に丸める。小数第2位までに丸めるので、
   * 同じ入力からはいつも同じ文字列ができる。
   *
   * @param {number[]} values カテゴリーごとの値
   * @param {{cx?: number, cy?: number, r?: number, max?: number}} [options]
   * @returns {{x: number, y: number}[]}
   */
  function points(values, options) {
    var opt = options || {};
    var cx = typeof opt.cx === 'number' ? opt.cx : LAYOUT.cx;
    var cy = typeof opt.cy === 'number' ? opt.cy : LAYOUT.cy;
    var r = typeof opt.r === 'number' ? opt.r : LAYOUT.r;
    var max = typeof opt.max === 'number' ? opt.max : LAYOUT.max;
    var count = values.length;

    return values.map(function (value, index) {
      var v = Math.min(Math.max(Number(value) || 0, 0), max);
      var rad = angleOf(index, count);
      var d = (r * v) / max;
      return {
        x: Math.round((cx + d * Math.cos(rad)) * 100) / 100,
        y: Math.round((cy + d * Math.sin(rad)) * 100) / 100
      };
    });
  }

  /**
   * 頂点の並びを points 属性の文字列にする。
   * @param {{x: number, y: number}[]} pts
   * @returns {string}
   */
  function toAttr(pts) {
    return pts.map(function (p) { return p.x + ',' + p.y; }).join(' ');
  }

  /**
   * 軸の数に合わせた viewBox を出す。
   *
   * 軸が3本なら真下に頂点が来ないが、6本なら来る。
   * ラベルの輪の上端と下端から高さを決めるので、軸が増えても切れない。
   *
   * @param {number} count 軸の数
   * @param {{pad?: number}} [options]
   * @returns {string} viewBox 属性の値
   */
  function viewBox(count, options) {
    var pad = options && typeof options.pad === 'number' ? options.pad : 14;
    if (count <= 0) return '0 0 300 230';
    var ring = [];
    for (var i = 0; i < count; i++) ring.push(LAYOUT.max);
    var ys = points(ring, { r: LAYOUT.labelR }).map(function (p) { return p.y; });
    var top = Math.min.apply(null, ys) - pad;
    var bottom = Math.max.apply(null, ys) + pad;
    return '0 ' + Math.round(top) + ' 300 ' + Math.round(bottom - top);
  }

  /**
   * SVG の要素を属性つきで作る。
   * @param {string} name 要素名
   * @param {Object<string, string|number>} attrs 属性
   * @returns {SVGElement}
   */
  function el(name, attrs) {
    var node = global.document.createElementNS(NS, name);
    Object.keys(attrs || {}).forEach(function (key) {
      node.setAttribute(key, String(attrs[key]));
    });
    return node;
  }

  /**
   * レーダーチャートを描き直す。
   *
   * @param {SVGElement} svg 描画先の svg 要素
   * @param {{
   *   values: number[], labels: string[], max?: number, threshold?: number,
   *   title?: string, desc?: string, titleId?: string, descId?: string
   * }} data
   */
  function render(svg, data) {
    if (!svg) return;
    var values = data.values || [];
    var labels = data.labels || [];
    var count = values.length;
    var max = typeof data.max === 'number' ? data.max : LAYOUT.max;
    var threshold = typeof data.threshold === 'number' ? data.threshold : LAYOUT.threshold;

    while (svg.firstChild) svg.removeChild(svg.firstChild);
    svg.setAttribute('viewBox', viewBox(count));
    svg.setAttribute('role', 'img');

    if (count === 0) return;

    var titleId = data.titleId || 'radarTitle';
    var descId = data.descId || 'radarDesc';
    var title = el('title', { id: titleId });
    title.textContent = data.title || '';
    var desc = el('desc', { id: descId });
    desc.textContent = data.desc || '';
    svg.appendChild(title);
    svg.appendChild(desc);
    svg.setAttribute('aria-labelledby', titleId + ' ' + descId);

    // 目盛りの輪
    LAYOUT.ticks.forEach(function (tick) {
      if (tick > max) return;
      var ring = new Array(count);
      for (var i = 0; i < count; i++) ring[i] = tick;
      svg.appendChild(el('polygon', {
        points: toAttr(points(ring, { max: max })),
        class: 'radar-grid'
      }));
    });

    // 中心から外へ伸びる軸
    var outer = points(values.map(function () { return max; }), { max: max });
    outer.forEach(function (p) {
      svg.appendChild(el('line', {
        x1: LAYOUT.cx, y1: LAYOUT.cy, x2: p.x, y2: p.y, class: 'radar-axis'
      }));
    });

    // 目盛りの数字（真上の軸にだけ添える）
    LAYOUT.ticks.forEach(function (tick) {
      if (tick > max) return;
      var text = el('text', {
        x: LAYOUT.cx - 6,
        y: LAYOUT.cy - (LAYOUT.r * tick) / max + 4,
        class: 'radar-tick',
        'text-anchor': 'end'
      });
      text.textContent = String(tick);
      svg.appendChild(text);
    });

    // 警戒ライン
    if (threshold > 0) {
      var line = new Array(count);
      for (var k = 0; k < count; k++) line[k] = threshold;
      svg.appendChild(el('polygon', {
        points: toAttr(points(line, { max: max })),
        class: 'radar-threshold'
      }));
    }

    // 検出したスコアの多角形
    var shape = points(values, { max: max });
    svg.appendChild(el('polygon', { points: toAttr(shape), class: 'radar-shape' }));
    shape.forEach(function (p) {
      svg.appendChild(el('circle', { cx: p.x, cy: p.y, r: 3.5, class: 'radar-point' }));
    });

    // 軸のラベル
    var labelPoints = points(values.map(function () { return max; }), { r: LAYOUT.labelR, max: max });
    labelPoints.forEach(function (p, index) {
      var anchor = 'middle';
      if (p.x > LAYOUT.cx + 1) anchor = 'start';
      else if (p.x < LAYOUT.cx - 1) anchor = 'end';
      var text = el('text', {
        x: p.x, y: p.y + 4, class: 'radar-label', 'text-anchor': anchor
      });
      text.textContent = labels[index] || '';
      svg.appendChild(text);
    });
  }

  global.ScamRadar = {
    LAYOUT: LAYOUT,
    angleOf: angleOf,
    points: points,
    toAttr: toAttr,
    viewBox: viewBox,
    render: render
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
