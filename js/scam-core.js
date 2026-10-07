/**
 * ScamCore - 感情トリガー語の照合と採点。
 *
 * DOM に触れない純粋なロジックだけを置く。画面の処理は script.js が持つ。
 * 通常のスクリプトとして読み込むので、file:// でもそのまま動く。
 */
(function (global) {
  'use strict';

  /** カテゴリー1つあたりの上限。 */
  var MAX_CATEGORY_SCORE = 10;

  /** 上限に達する「異なり語数」。5語そろえば、その感情は十分かかっていると見なす。 */
  var SATURATION_WORDS = 5;

  /** 2回目以降の出現は半分の重みで数える。 */
  var REPEAT_WEIGHT = 0.5;

  /**
   * 総合点の重み。強い感情から順に掛ける。
   * 現実の詐欺は2つの感情に寄るので、平均ではなく上位を重く見る。
   * カテゴリーを増やすときは、ここに同じ長さの配列を足す（合計を1にする）。
   */
  var TOTAL_WEIGHTS = {
    3: [0.6, 0.3, 0.1]
  };

  /**
   * 説得の原理。Cialdini の6原理をこの順で並べる。
   * どれにも当てはまらない手口は 'none' とする（画面では別枠で出す）。
   */
  var PRINCIPLES = ['authority', 'socialProof', 'liking', 'reciprocity',
    'commitment', 'scarcity'];

  /** しきい値。総合点をこの順で判定する。 */
  var RISK_LEVELS = [
    { key: 'high', min: 70 },
    { key: 'medium', min: 40 },
    { key: 'low', min: 15 },
    { key: 'veryLow', min: 0 }
  ];

  /**
   * 重みの表にないカテゴリー数のときの備え。
   * 1位を1として順に半分にし、合計が1になるようにそろえる。
   * @param {number} n カテゴリー数
   * @returns {number[]} 長さ n の重み
   */
  function fallbackWeights(n) {
    var raw = [];
    var sum = 0;
    for (var i = 0; i < n; i++) {
      var w = Math.pow(0.5, i);
      raw.push(w);
      sum += w;
    }
    return raw.map(function (w) { return w / sum; });
  }

  /**
   * カテゴリー数に応じた重みを返す。
   * @param {number} n カテゴリー数
   * @returns {number[]}
   */
  function weightsFor(n) {
    if (n <= 0) return [];
    return TOTAL_WEIGHTS[n] ? TOTAL_WEIGHTS[n].slice() : fallbackWeights(n);
  }

  /**
   * ASCII の英数字（と下線）かどうか。語境界の判定に使う。
   * @param {string} ch 1文字。範囲外は undefined が来る
   * @returns {boolean}
   */
  function isAsciiWordChar(ch) {
    return typeof ch === 'string' && /^[0-9a-z_]$/.test(ch);
  }

  /**
   * 辞書の形を検べる。壊れた辞書で解析を走らせないための関門。
   * @param {unknown} dictionary
   * @returns {{ok: boolean, errors: string[], categories: string[], total: number}}
   */
  function validateDictionary(dictionary) {
    var errors = [];
    var categories = [];
    var total = 0;

    if (!dictionary || typeof dictionary !== 'object' || Array.isArray(dictionary)) {
      return { ok: false, errors: ['辞書がオブジェクトではない'], categories: [], total: 0 };
    }

    categories = Object.keys(dictionary);
    if (categories.length === 0) errors.push('カテゴリーが1つもない');

    categories.forEach(function (category) {
      var words = dictionary[category];
      if (!Array.isArray(words)) {
        errors.push(category + ': 語の配列ではない');
        return;
      }
      if (words.length === 0) errors.push(category + ': 語が1つもない');
      var seen = Object.create(null);
      words.forEach(function (word, index) {
        if (typeof word !== 'string') {
          errors.push(category + '[' + index + ']: 文字列ではない');
          return;
        }
        if (word.length === 0) {
          errors.push(category + '[' + index + ']: 空の語');
          return;
        }
        var key = word.toLowerCase();
        if (seen[key]) errors.push(category + ': 重複した語「' + word + '」');
        seen[key] = true;
        total++;
      });
    });

    return { ok: errors.length === 0, errors: errors, categories: categories, total: total };
  }

  /**
   * 辞書を「長い語が先」の決まった順に並べ替える。
   *
   * 長さが同じときは語の文字列、それも同じならカテゴリー名で並べるので、
   * 同じ辞書からはいつも同じ並びになる（照合の結果が実行ごとに変わらない）。
   *
   * @param {Object<string, string[]>} dictionary
   * @returns {{category: string, word: string, lower: string}[]}
   */
  function buildEntries(dictionary) {
    var entries = [];
    Object.keys(dictionary).forEach(function (category) {
      (dictionary[category] || []).forEach(function (word) {
        if (typeof word === 'string' && word.length > 0) {
          entries.push({ category: category, word: word, lower: word.toLowerCase() });
        }
      });
    });
    entries.sort(function (a, b) {
      if (b.lower.length !== a.lower.length) return b.lower.length - a.lower.length;
      if (a.lower !== b.lower) return a.lower < b.lower ? -1 : 1;
      if (a.category !== b.category) return a.category < b.category ? -1 : 1;
      return 0;
    });
    return entries;
  }

  /**
   * 本文を1回だけ走査して、重ならない一致箇所を取り出す。
   *
   * 長い語を先に試すので、「利用停止」は「停止」に割り込まれない。
   * 一致した範囲は読み飛ばすので、同じ場所が二度数えられることもない。
   *
   * 語境界は、語の端が ASCII の英数字のときだけ、その側に要求する。
   * 「24時間以内」は末尾が日本語なので、後ろに何が続いても一致する。
   * 「now」は両端が ASCII なので「known」の中では一致しない。
   *
   * @param {string} text 本文
   * @param {{category: string, word: string, lower: string}[]} entries buildEntries の結果
   * @returns {{start: number, end: number, category: string, word: string}[]} 出現順
   */
  function findSpans(text, entries) {
    var spans = [];
    if (typeof text !== 'string' || text.length === 0) return spans;

    var lower = text.toLowerCase();
    var i = 0;
    while (i < lower.length) {
      var hit = null;
      for (var k = 0; k < entries.length; k++) {
        var entry = entries[k];
        var len = entry.lower.length;
        if (i + len > lower.length) continue;
        if (!lower.startsWith(entry.lower, i)) continue;
        if (isAsciiWordChar(entry.lower.charAt(0)) && isAsciiWordChar(lower.charAt(i - 1))) continue;
        if (isAsciiWordChar(entry.lower.charAt(len - 1)) && isAsciiWordChar(lower.charAt(i + len))) continue;
        hit = { start: i, end: i + len, category: entry.category, word: entry.word };
        break;
      }
      if (hit) {
        spans.push(hit);
        i = hit.end;
      } else {
        i++;
      }
    }
    return spans;
  }

  /**
   * カテゴリー1つの点数を出す。
   * 異なり語数に、2回目以降の出現を半分の重みで足し、5語相当で上限に達する。
   * @param {number} distinct 異なり語数
   * @param {number} occurrences 出現回数
   * @returns {number} 0〜MAX_CATEGORY_SCORE の整数
   */
  function categoryScore(distinct, occurrences) {
    if (distinct <= 0) return 0;
    var raw = distinct + REPEAT_WEIGHT * (occurrences - distinct);
    var scaled = Math.round((raw * MAX_CATEGORY_SCORE) / SATURATION_WORDS);
    return Math.min(scaled, MAX_CATEGORY_SCORE);
  }

  /**
   * カテゴリーごとの点から総合点を出す。
   * 高い順に並べ、上位ほど重い重みを掛ける。
   * @param {number[]} scores カテゴリーごとの点
   * @returns {number} 0〜100 の整数
   */
  function totalScore(scores) {
    if (!scores.length) return 0;
    var sorted = scores.slice().sort(function (a, b) { return b - a; });
    var weights = weightsFor(sorted.length);
    var weighted = 0;
    for (var i = 0; i < sorted.length; i++) weighted += sorted[i] * (weights[i] || 0);
    return Math.round((weighted / MAX_CATEGORY_SCORE) * 100);
  }

  /**
   * 総合点から危険度の段階を返す。
   * @param {number} total
   * @returns {string} RISK_LEVELS の key
   */
  function riskLevel(total) {
    for (var i = 0; i < RISK_LEVELS.length; i++) {
      if (total >= RISK_LEVELS[i].min) return RISK_LEVELS[i].key;
    }
    return RISK_LEVELS[RISK_LEVELS.length - 1].key;
  }

  /**
   * 手口のまとまりの表を検べる。
   *
   * 辞書の全語がちょうど1つのまとまりに入っていること、
   * まとまりの語がすべて辞書にあること、原理の名前が決まった集合であることを見る。
   *
   * @param {unknown} principles SCAM_PRINCIPLES の形
   * @param {Object<string, string[]>} dictionary 辞書
   * @returns {{ok: boolean, errors: string[], groups: string[]}}
   */
  function validatePrinciples(principles, dictionary) {
    var errors = [];
    if (!principles || typeof principles !== 'object' || !principles.groups) {
      return { ok: false, errors: ['まとまりの表が読めない'], groups: [] };
    }

    var known = {};
    Object.keys(dictionary || {}).forEach(function (category) {
      (dictionary[category] || []).forEach(function (word) { known[word] = category; });
    });

    var seen = {};
    var ids = Object.keys(principles.groups);
    ids.forEach(function (id) {
      var group = principles.groups[id];
      if (!group || !Array.isArray(group.words)) {
        errors.push(id + ': 語の配列がない');
        return;
      }
      if (group.principle !== 'none' && PRINCIPLES.indexOf(group.principle) === -1) {
        errors.push(id + ': 知らない原理「' + group.principle + '」');
      }
      group.words.forEach(function (word) {
        if (!Object.prototype.hasOwnProperty.call(known, word)) {
          errors.push(id + ': 「' + word + '」は辞書にない');
        }
        if (seen[word]) errors.push('「' + word + '」が ' + seen[word] + ' と ' + id + ' の両方にある');
        seen[word] = id;
      });
    });
    Object.keys(known).forEach(function (word) {
      if (!seen[word]) errors.push('「' + word + '」がどのまとまりにも入っていない');
    });

    return { ok: errors.length === 0, errors: errors, groups: ids };
  }

  /**
   * 語から、属するまとまりと原理を引ける表を作る。
   * @param {Object} principles SCAM_PRINCIPLES の形
   * @returns {Object<string, {group: string, principle: string}>}
   */
  function buildGroupIndex(principles) {
    var index = {};
    if (!principles || !principles.groups) return index;
    Object.keys(principles.groups).forEach(function (id) {
      var group = principles.groups[id];
      (group.words || []).forEach(function (word) {
        index[word] = { group: id, principle: group.principle };
      });
    });
    return index;
  }

  /**
   * 本文を解析する。
   * @param {string} text 本文
   * @param {Object<string, string[]>} dictionary 辞書
   * @returns {{
   *   spans: {start: number, end: number, category: string, word: string}[],
   *   categories: Object<string, {distinct: number, occurrences: number, words: string[], score: number}>,
   *   order: string[], total: number, level: string
   * }}
   */
  function analyze(text, dictionary, principles) {
    var order = Object.keys(dictionary || {});
    var entries = buildEntries(dictionary || {});
    var spans = findSpans(text, entries);
    var index = buildGroupIndex(principles);

    var categories = {};
    order.forEach(function (category) {
      categories[category] = { distinct: 0, occurrences: 0, words: [], score: 0 };
    });

    var groups = {};
    var principleCounts = {};

    spans.forEach(function (span) {
      var bucket = categories[span.category];
      if (bucket) {
        bucket.occurrences++;
        if (bucket.words.indexOf(span.word) === -1) bucket.words.push(span.word);
      }

      var found = index[span.word];
      span.group = found ? found.group : null;
      span.principle = found ? found.principle : null;
      if (!found) return;

      if (!groups[found.group]) groups[found.group] = { occurrences: 0, words: [], principle: found.principle };
      groups[found.group].occurrences++;
      if (groups[found.group].words.indexOf(span.word) === -1) groups[found.group].words.push(span.word);

      if (!principleCounts[found.principle]) principleCounts[found.principle] = { occurrences: 0, groups: [] };
      principleCounts[found.principle].occurrences++;
      if (principleCounts[found.principle].groups.indexOf(found.group) === -1) {
        principleCounts[found.principle].groups.push(found.group);
      }
    });

    var scores = [];
    order.forEach(function (category) {
      var bucket = categories[category];
      bucket.distinct = bucket.words.length;
      bucket.score = categoryScore(bucket.distinct, bucket.occurrences);
      scores.push(bucket.score);
    });

    var total = totalScore(scores);
    return {
      spans: spans,
      categories: categories,
      groups: groups,
      principles: principleCounts,
      order: order,
      total: total,
      level: riskLevel(total)
    };
  }

  /**
   * HTML の特殊文字を実体参照にする。
   * @param {string} text
   * @returns {string}
   */
  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * 本文全体をエスケープしてから、一致箇所だけを包む。
   *
   * 先に全文をエスケープするので、入力に含まれるタグが
   * そのまま画面の組み立てに混ざることはない。
   *
   * 手口のまとまりがわかっている語はボタンにする（押すと解説を出せる）。
   * わからない語は span のままにして、押せる要素を増やさない。
   *
   * @param {string} text 本文
   * @param {{start: number, end: number, category: string, group?: string}[]} spans findSpans の結果
   * @returns {string} 画面に入れる HTML
   */
  function highlightHtml(text, spans) {
    var out = '';
    var pos = 0;
    (spans || []).forEach(function (span, index) {
      out += escapeHtml(text.slice(pos, span.start));
      var body = escapeHtml(text.slice(span.start, span.end));
      var klass = 'highlight ' + escapeHtml(span.category);
      if (span.group) {
        out += '<button type="button" class="' + klass + '"'
          + ' data-index="' + index + '"'
          + ' data-group="' + escapeHtml(span.group) + '">' + body + '</button>';
      } else {
        out += '<span class="' + klass + '">' + body + '</span>';
      }
      pos = span.end;
    });
    out += escapeHtml(text.slice(pos));
    return out;
  }

  global.ScamCore = {
    MAX_CATEGORY_SCORE: MAX_CATEGORY_SCORE,
    SATURATION_WORDS: SATURATION_WORDS,
    REPEAT_WEIGHT: REPEAT_WEIGHT,
    RISK_LEVELS: RISK_LEVELS,
    PRINCIPLES: PRINCIPLES,
    weightsFor: weightsFor,
    validateDictionary: validateDictionary,
    validatePrinciples: validatePrinciples,
    buildGroupIndex: buildGroupIndex,
    buildEntries: buildEntries,
    findSpans: findSpans,
    categoryScore: categoryScore,
    totalScore: totalScore,
    riskLevel: riskLevel,
    analyze: analyze,
    escapeHtml: escapeHtml,
    highlightHtml: highlightHtml
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
