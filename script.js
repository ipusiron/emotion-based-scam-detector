/**
 * 画面の処理。解析そのものは js/scam-core.js、描画は js/radar.js が受け持つ。
 *
 * 辞書は data/dictionary.json を読む。file:// で開いたときは fetch が使えないので、
 * js/dictionary.js の内蔵の控えに切り替えて、そのことを画面に出す。
 */
(function (global) {
  'use strict';

  var Core = global.ScamCore;
  var Radar = global.ScamRadar;
  var t = global.ScamMessages.t;
  var SAMPLES = global.SCAM_SAMPLES || {};

  /** 画面に出すカテゴリーの並びと、対応する要素の id の前置き。 */
  var CATEGORIES = ['emergency', 'fear', 'greed'];

  /** 解析に使う辞書。読み込みが終わるまでは空にしておく。 */
  var dictionary = null;

  /**
   * id から要素を引く。
   * @param {string} id
   * @returns {HTMLElement}
   */
  function byId(id) {
    return global.document.getElementById(id);
  }

  /**
   * 画面の上部にひとこと出す。
   * @param {string} text 本文。空文字なら隠す
   * @param {boolean} isError エラーとして見せるか
   */
  function showNotice(text, isError) {
    var notice = byId('dictionaryNotice');
    if (!notice) return;
    notice.textContent = text || '';
    notice.className = isError ? 'notice notice-error' : 'notice';
    notice.hidden = !text;
  }

  /**
   * 解析ボタンの使用可否を切り替える。
   * @param {boolean} enabled
   */
  function setAnalyzeEnabled(enabled) {
    var button = byId('analyzeBtn');
    if (button) button.disabled = !enabled;
  }

  /**
   * 受け取った辞書を検証して採用する。通らなければ false を返す。
   * @param {unknown} candidate
   * @returns {boolean}
   */
  function adoptDictionary(candidate) {
    var result = Core.validateDictionary(candidate);
    if (!result.ok) return false;
    dictionary = candidate;
    return true;
  }

  /**
   * 辞書を用意する。
   *
   * HTTP で配信されているときは data/dictionary.json を読む。
   * file:// のときは fetch が使えないので、はじめから内蔵の控えを使う。
   */
  function loadDictionary() {
    var builtIn = global.SCAM_DICTIONARY;

    function fallBack(message) {
      if (adoptDictionary(builtIn)) {
        setAnalyzeEnabled(true);
        if (message) showNotice(message, false);
      } else {
        setAnalyzeEnabled(false);
        showNotice(t('dictionary.broken'), true);
      }
    }

    if (global.location && global.location.protocol === 'file:') {
      fallBack(t('dictionary.fallback'));
      return;
    }

    setAnalyzeEnabled(false);
    global.fetch('data/dictionary.json')
      .then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
      })
      .then(function (data) {
        if (adoptDictionary(data)) {
          setAnalyzeEnabled(true);
          showNotice('', false);
        } else {
          fallBack(t('dictionary.invalid'));
        }
      })
      .catch(function () {
        fallBack(t('dictionary.fallback'));
      });
  }

  /**
   * カテゴリーの内訳を、画面に出す1行の文にする。
   * @param {{distinct: number, occurrences: number}} bucket
   * @returns {string}
   */
  function detailText(bucket) {
    if (!bucket || bucket.distinct === 0) return '';
    return t('detail.summary', { distinct: bucket.distinct, occurrences: bucket.occurrences });
  }

  /**
   * レーダーチャートに渡す読み上げ用の説明を作る。
   * @param {Object} result Core.analyze の結果
   * @returns {string}
   */
  function radarDescription(result) {
    return CATEGORIES.map(function (category) {
      var bucket = result.categories[category];
      return t('category.' + category + '.label') + (bucket ? bucket.score : 0);
    }).join('、') + '。10点満点。';
  }

  /** 入力された本文を解析して、画面を更新する。 */
  function analyze() {
    if (!dictionary) return;

    var text = byId('inputText').value;
    var result = Core.analyze(text, dictionary);

    byId('result').hidden = false;
    byId('totalScore').textContent = String(result.total);

    var badge = byId('riskBadge');
    badge.textContent = t('risk.' + result.level + '.label');
    badge.className = 'assessment-badge ' + result.level;
    byId('assessmentText').textContent = t('risk.' + result.level + '.text');

    CATEGORIES.forEach(function (category) {
      var bucket = result.categories[category] || { score: 0, distinct: 0, occurrences: 0 };
      byId(category + 'Score').textContent = String(bucket.score);
      byId(category + 'Bar').style.width = (bucket.score * 10) + '%';
      byId(category + 'Detail').textContent = detailText(bucket);
    });

    var output = byId('highlightedText');
    if (text.length === 0) {
      output.textContent = t('detail.empty');
    } else {
      output.innerHTML = Core.highlightHtml(text, result.spans);
    }

    Radar.render(byId('radarChart'), {
      values: CATEGORIES.map(function (category) {
        return result.categories[category] ? result.categories[category].score : 0;
      }),
      labels: CATEGORIES.map(function (category) {
        return t('category.' + category + '.label');
      }),
      title: t('radar.title'),
      desc: radarDescription(result)
    });
  }

  /**
   * サンプル本文を入力欄に読み込む。
   * @param {string} key SCAM_SAMPLES のキー
   */
  function loadSample(key) {
    if (!Object.prototype.hasOwnProperty.call(SAMPLES, key)) return;
    byId('inputText').value = SAMPLES[key];
    byId('result').hidden = true;
  }

  /** 入力欄と結果を消す。 */
  function clearInput() {
    byId('inputText').value = '';
    byId('result').hidden = true;
    byId('presetSelect').value = '';
  }

  /** 対処法のアコーディオンを開閉する。 */
  function toggleTips() {
    var toggle = byId('safetyTipsToggle');
    var content = byId('safetyTipsContent');
    var open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.classList.toggle('active', open);
    content.classList.toggle('active', open);
  }

  global.document.addEventListener('DOMContentLoaded', function () {
    loadDictionary();

    byId('analyzeBtn').addEventListener('click', analyze);
    byId('clearBtn').addEventListener('click', clearInput);

    byId('presetSelect').addEventListener('change', function (event) {
      var key = event.target.value;
      if (key) loadSample(key);
    });

    byId('safetyTipsToggle').addEventListener('click', toggleTips);
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
