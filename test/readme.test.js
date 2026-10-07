import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { core, dictionary, load, read } from './load.js';

const C = core();
const DICT = dictionary();
const SAMPLES = load('js/samples.js').SCAM_SAMPLES;
const readme = read('README.md');
const claude = read('CLAUDE.md');
const meta = readme.slice(readme.indexOf('<!--'), readme.indexOf('-->'));

test('YAMLメタデータの構造と値が保たれている', () => {
  assert.match(meta, /^\s*<!--\n---\n/);
  assert.match(meta, /\nid: day081\n/);
  assert.match(meta, /\nslug: emotion-based-scam-detector\n/);
  assert.match(meta, /\nrepo_url: "https:\/\/github\.com\/ipusiron\/emotion-based-scam-detector"\n/);
  assert.match(meta, /\ndemo_url: "https:\/\/ipusiron\.github\.io\/emotion-based-scam-detector\/"\n/);
  assert.match(meta, /\nhub: true\n/);
  // 配列はブロック形式（フロー形式 [a, b] に書き換えない）
  for (const key of ['category_ja', 'category_en', 'tags']) {
    const block = meta.match(new RegExp(`\\n${key}:\\n((?:  - .*\\n)+)`));
    assert.ok(block, `${key} がブロック形式でない`);
    assert.ok(block[1].split('\n').filter(Boolean).length >= 3, `${key} の項目が少ない`);
  }
});

test('シリーズ標準の見出しが、決まった順で並んでいる', () => {
  // コードブロックの中の # 始まりの行を見出しと数えないように外す
  const body = readme.replace(/```[\s\S]*?```/g, '');
  const headings = [...body.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
  // 前半の固定
  assert.deepEqual(headings.slice(0, 2), ['🌐 デモページ', '📸 スクリーンショット']);
  // 後半の固定
  assert.deepEqual(headings.slice(-6), ['🧪 テスト', '📁 ディレクトリー構造', '💻 動作環境',
    '📄 ライセンス', '🔗 参考', '🛠 このツールについて']);
  // 中間にツールごとの節がある
  for (const h of ['✨ 機能', '📖 使い方', '📐 画面構成', '🎯 ユースケース',
    '🔬 技術的な説明', '🔒 セキュリティ', '⚠️ 注意', '❓ FAQ']) {
    assert.ok(headings.includes(h), `${h} の節がない`);
  }
  // H1は1つだけ
  assert.equal([...body.matchAll(/^# .+$/gm)].length, 1);
});

test('シリーズの定型（Day番号・プロジェクト名・リンク）が正しい', () => {
  assert.ok(readme.includes('**Day081 - 生成AIで作るセキュリティツール100**'));
  assert.ok(readme.includes('https://akademeia.info/?page_id=42163'));
  // Day101以降のプロジェクトのリンクを混ぜない
  assert.ok(!readme.includes('page_id=44607'));
  assert.ok(!readme.includes('セキュリティツール200'));
});

test('バッジが5種そろっている', () => {
  for (const badge of ['github/stars', 'github/forks', 'github/last-commit', 'github/license']) {
    assert.ok(readme.includes(badge), `${badge} のバッジがない`);
  }
  assert.ok(readme.includes('demo-GitHub%20Pages-blue'), 'GitHub Pagesのバッジがない');
});

test('READMEが参照する画像がすべて実在する', () => {
  const images = [...readme.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)]
    .map((m) => m[1])
    .filter((p) => !/^https?:/.test(p));
  assert.ok(images.length >= 3, `画像の参照が ${images.length} 件しかない`);
  for (const rel of images) {
    assert.ok(fs.existsSync(new URL(`../${rel}`, import.meta.url)), `${rel} が存在しない`);
  }
});

test('消したファイルへの参照が残っていない', () => {
  // ルート直下の dictionary.json は削除した
  assert.ok(!/^├── dictionary\.json/m.test(readme));
  assert.ok(!readme.includes('chart.js'), 'Chart.jsへの言及が残っている');
  assert.ok(!readme.includes('Chart.js'), 'Chart.jsへの言及が残っている');
  assert.ok(!claude.includes('Chart.js'), 'CLAUDE.mdにChart.jsへの言及が残っている');
});

test('辞書の語数が、READMEとCLAUDE.mdとコードで一致する', () => {
  const counts = C.validateDictionary(DICT);
  assert.equal(counts.total, 167);
  const text = `${DICT.emergency.length}語、恐怖${DICT.fear.length}語、欲望${DICT.greed.length}語`;
  assert.ok(readme.includes(`現在${counts.total}語（緊急性${text}）`),
    'READMEの語数の記述がコードと合わない');
  assert.ok(readme.includes(`計${counts.total}語の辞書`), 'READMEの特徴の節の語数が合わない');
  assert.ok(readme.includes(`dictionary.json     # トリガーワード辞書（${counts.total}語）`),
    'ディレクトリー構造の語数が合わない');
  // 古い値が残っていないこと
  assert.ok(!readme.includes('169'), 'READMEに古い語数が残っている');
  assert.ok(!claude.includes('169'), 'CLAUDE.mdに古い語数が残っている');
});

test('サンプルのスコアの表が、実際の計算と一致する', () => {
  const rows = [...readme.matchAll(/^\| ([^|]+) \| (\d+) \| (\d+) \| (\d+) \| (\d+) \| (\S+リスク) \|$/gm)];
  assert.equal(rows.length, Object.keys(SAMPLES).length,
    `表の行が ${rows.length} 行（サンプルは ${Object.keys(SAMPLES).length} 件）`);
  // 詐欺と正規の両方が表に載っていること
  assert.ok(rows.length >= 14, '表の行が足りない');
  const label = {
    high: '高リスク', medium: '中リスク', low: '低リスク', veryLow: '極小リスク'
  };
  const byTotal = {};
  for (const key of Object.keys(SAMPLES)) {
    const r = C.analyze(SAMPLES[key].text, DICT);
    byTotal[`${r.categories.emergency.score}/${r.categories.fear.score}`
      + `/${r.categories.greed.score}/${r.total}`] = label[r.level];
  }
  for (const row of rows) {
    const key = `${row[2]}/${row[3]}/${row[4]}/${row[5]}`;
    assert.ok(key in byTotal, `表の行「${row[1].trim()}」に合うサンプルがない（${key}）`);
    assert.equal(row[6], byTotal[key], `「${row[1].trim()}」の判定が合わない`);
  }
});

test('しきい値の表が、コードのしきい値と一致する', () => {
  const levels = Object.fromEntries(C.RISK_LEVELS.map((l) => [l.key, l.min]));
  assert.ok(readme.includes(`| ${levels.high}以上 | 高リスク |`));
  assert.ok(readme.includes(`| ${levels.medium}〜${levels.high - 1} | 中リスク |`));
  assert.ok(readme.includes(`| ${levels.low}〜${levels.medium - 1} | 低リスク |`));
  assert.ok(readme.includes(`| ${levels.low - 1}以下 | 極小リスク |`));
});

test('採点の式の記述が、コードの定数と一致する', () => {
  assert.ok(readme.includes(`min(${C.MAX_CATEGORY_SCORE}, round(raw × 2))`));
  assert.ok(readme.includes(`${C.SATURATION_WORDS}種類の語がそろうと上限の`
    + `${C.MAX_CATEGORY_SCORE}点に達します`));
  const weights = C.weightsFor(3);
  assert.ok(readme.includes(`round(10 × (${weights[0]}×s1 + ${weights[1]}×s2 + ${weights[2]}×s3))`));
});

test('ディレクトリー構造が、実ファイルとそろっている', () => {
  const tree = readme.slice(readme.indexOf('## 📁 ディレクトリー構造'));
  const block = tree.slice(tree.indexOf('```') + 3, tree.indexOf('```', tree.indexOf('```') + 3));
  const lines = block.split('\n').filter((l) => l.trim() && !l.startsWith('emotion-based'));

  // 全行に説明が付いている
  for (const line of lines) {
    assert.ok(line.includes('# '), `説明のない行: ${line}`);
  }

  // 実在するファイルがすべて載っている
  const listed = new Set(lines.map((l) => (l.match(/([\w.\-]+\/?)\s+#/) || [])[1]).filter(Boolean));
  const files = [];
  const walk = (dir, prefix) => {
    for (const entry of fs.readdirSync(new URL(dir, import.meta.url), { withFileTypes: true })) {
      if (entry.name === '.git' || entry.name === '.claude' || entry.name === 'node_modules') continue;
      if (entry.isDirectory()) {
        files.push(`${entry.name}/`);
        walk(`${dir}${entry.name}/`, `${prefix}${entry.name}/`);
      } else {
        files.push(entry.name);
      }
    }
  };
  walk('../', '');
  for (const name of files) {
    assert.ok(listed.has(name), `ツリーに載っていない: ${name}`);
  }
});

test('過去の版との違いをREADMEに書かない', () => {
  // 訂正の経緯はコミットとPRに残す。READMEはいまの版で正しいことだけを書く
  for (const bad of ['改修前', '以前は', '旧版では', '初期の実装', 'かつては', '従来は']) {
    assert.ok(!readme.includes(bad), `READMEに「${bad}」がある`);
  }
});
