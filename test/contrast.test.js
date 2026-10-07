import test from 'node:test';
import assert from 'node:assert/strict';
import { read } from './load.js';

const css = read('style.css');

/** CSS の宣言ブロックから --name: value を拾う。 */
function vars(block) {
  const out = {};
  for (const m of block.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) out[m[1]] = m[2].trim();
  return out;
}

const lightBlock = css.slice(css.indexOf(':root {'), css.indexOf('}', css.indexOf(':root {')));
const darkStart = css.indexOf('@media (prefers-color-scheme: dark)');
const darkBlock = css.slice(darkStart, css.indexOf('\n  }', darkStart));

const LIGHT = vars(lightBlock);
const DARK = Object.assign({}, LIGHT, vars(darkBlock));

const srgb = (c) => { const v = c / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };

/** #rgb・#rrggbb・rgba() を [r, g, b, a] にする。 */
function parseColor(value) {
  const rgba = value.match(/rgba?\(([^)]+)\)/);
  if (rgba) {
    const parts = rgba[1].split(',').map((s) => parseFloat(s.trim()));
    return [parts[0], parts[1], parts[2], parts.length > 3 ? parts[3] : 1];
  }
  const hex = value.trim().replace('#', '');
  const full = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)).concat(1);
}

/** 半透明の色を下地に重ねた実効色を出す。 */
function composite(top, bottom) {
  const [r1, g1, b1, a] = top;
  const [r2, g2, b2] = bottom;
  return [r1 * a + r2 * (1 - a), g1 * a + g2 * (1 - a), b1 * a + b2 * (1 - a), 1];
}

const lum = ([r, g, b]) => 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);

function ratio(fg, bg) {
  const [l1, l2] = [lum(fg), lum(bg)].sort((a, b) => b - a);
  return (l1 + 0.05) / (l2 + 0.05);
}

/** 文字と背景の組。背景が2つ書いてあるものは、1つ目に2つ目を重ねる。 */
const PAIRS = [
  ['--fg', '--bg'],
  ['--fg', '--surface'],
  ['--fg', '--output-bg'],
  ['--fg', '--legend-bg'],
  ['--fg', '--tips-from'],
  ['--fg', '--tips-to'],
  ['--muted', '--bg'],
  ['--muted', '--surface'],
  ['--muted', '--legend-bg'],
  ['--muted', '--presets-bg'],
  ['--link', '--bg'],
  ['--accent-fg', '--accent'],
  ['--accent-fg', '--accent-hover'],
  ['--secondary-fg', '--secondary'],
  ['--secondary-fg', '--secondary-hover'],
  ['--emergency-fg', '--emergency-bg'],
  ['--fear-fg', '--fear-bg'],
  ['--greed-fg', '--greed-bg'],
  ['--badge-fg', '--badge-very-low'],
  ['--badge-fg', '--badge-low'],
  ['--badge-fg', '--badge-medium'],
  ['--badge-fg', '--badge-high'],
  ['--summary-fg', '--summary-from'],
  ['--summary-fg', '--summary-to'],
  ['--summary-fg', '--summary-from', '--summary-inner'],
  ['--summary-fg', '--summary-to', '--summary-inner'],
  ['--radar-tick', '--surface'],
  ['--radar-label', '--surface'],
  ['--notice-fg', '--notice-bg'],
  ['--error-fg', '--error-bg'],
  ['--info-fg', '--info-bg'],
  ['--link', '--surface'],
  ['--link', '--legend-bg']
];

for (const [theme, table] of [['ライト', LIGHT], ['ダーク', DARK]]) {
  test(`${theme}の文字と背景が、すべて4.5:1以上である`, () => {
    for (const [fgName, bgName, overlayName] of PAIRS) {
      assert.ok(table[fgName], `${theme}: ${fgName} がない`);
      assert.ok(table[bgName], `${theme}: ${bgName} がない`);
      let bg = parseColor(table[bgName]);
      if (overlayName) {
        assert.ok(table[overlayName], `${theme}: ${overlayName} がない`);
        bg = composite(parseColor(table[overlayName]), bg);
      }
      const r = ratio(parseColor(table[fgName]), bg);
      const label = `${theme}: ${fgName} on ${bgName}${overlayName ? ` + ${overlayName}` : ''}`;
      assert.ok(r >= 4.5, `${label} = ${r.toFixed(2)}:1`);
    }
  });
}

test('ダークはライトで定義した変数だけを上書きしている', () => {
  const darkOnly = Object.keys(vars(darkBlock)).filter((k) => !(k in LIGHT));
  assert.deepEqual(darkOnly, [], `ライトにない変数がダークにある: ${darkOnly.join(', ')}`);
});

test('配色はすべて変数で書く（規則の中に色リテラルを残さない）', () => {
  // :root と @media の中の変数の定義だけが色リテラルを持ってよい
  const body = css.replace(lightBlock, '').replace(darkBlock, '');
  const leftovers = [...body.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map((m) => m[0]);
  assert.deepEqual(leftovers, [], `色リテラルが残っている: ${leftovers.join(', ')}`);
});

test('ダークモードの上書きがある', () => {
  assert.ok(darkStart > 0, 'prefers-color-scheme: dark の指定がない');
  assert.match(css, /color-scheme: light dark;/);
});
