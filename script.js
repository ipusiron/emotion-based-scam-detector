/**
 * 画面の処理。解析そのものは js/scam-core.js、描画は js/radar.js が受け持つ。
 *
 * 辞書は data/dictionary.json を読む。file:// で開いたときは fetch が使えないので、
 * js/dictionary.js の内蔵の控えに切り替えて、そのことを画面に出す。
 *
 * 表示する言語は、?lang= → 保存した選択 → ブラウザーの言語 の順で決める。
 */
(function (global) {
  'use strict';

  var Core = global.ScamCore;
  var Radar = global.ScamRadar;
  var M = global.ScamMessages;
  var t = M.t;
  var SAMPLES = global.SCAM_SAMPLES || {};

  /** 画面に出すカテゴリーの並びと、対応する要素の id の前置き。 */
  var CATEGORIES = ['emergency', 'fear', 'greed'];

  /** 選んだ言語を覚えておくキー。 */
  var LANG_STORAGE_KEY = 'scam-detector-lang';

  /** 解析に使う辞書。読み込みが終わるまでは空にしておく。 */
  var dictionary = null;

  /** 直前に読み込んだサンプルのキー。入力欄が書き換えられたら忘れる。 */
  var loadedSample = null;

  /** 直前の解析の結果。言語を切り替えたときに描き直すために持つ。 */
  var lastAnalysis = null;

  /** 辞書について出しているお知らせのキー。言語の切り替えで出し直す。 */
  var dictionaryNoticeKey = null;

  /** そのお知らせをエラーとして見せているか。 */
  var dictionaryNoticeIsError = false;

  /**
   * id から要素を引く。
   * @param {string} id
   * @returns {HTMLElement}
   */
  function byId(id) {
    return global.document.getElementById(id);
  }

  /**
   * localStorage を使う。使えない設定でも画面が止まらないように包む。
   * @param {function(Storage): *} fn
   * @returns {*}
   */
  function withStorage(fn) {
    try {
      return fn(global.localStorage);
    } catch (e) {
      return null;
    }
  }

  /**
   * 表示する言語を決める。
   * ?lang= → 保存した選択 → ブラウザーの言語 → 既定、の順に見る。
   * @returns {string}
   */
  function resolveLanguage() {
    var supported = M.LANGUAGES;
    var match = /[?&]lang=([a-zA-Z-]+)/.exec(global.location.search || '');
    if (match && supported.indexOf(match[1].toLowerCase()) !== -1) return match[1].toLowerCase();

    var saved = withStorage(function (store) { return store.getItem(LANG_STORAGE_KEY); });
    if (supported.indexOf(saved) !== -1) return saved;

    var nav = ((global.navigator && global.navigator.language) || '').toLowerCase();
    return nav.indexOf('ja') === 0 ? 'ja' : 'en';
  }

  /**
   * data-i18n 系の属性を見て、画面の文言を入れ替える。
   */
  function applyTranslations() {
    var doc = global.document;
    doc.documentElement.lang = M.getLanguage();
    doc.title = t('app.title');

    var description = byId('pageDescription');
    if (description) description.setAttribute('content', t('app.description'));

    var i;
    var nodes = doc.querySelectorAll('[data-i18n]');
    for (i = 0; i < nodes.length; i++) {
      nodes[i].textContent = t(nodes[i].getAttribute('data-i18n'));
    }
    var placeholders = doc.querySelectorAll('[data-i18n-placeholder]');
    for (i = 0; i < placeholders.length; i++) {
      placeholders[i].setAttribute('placeholder',
        t(placeholders[i].getAttribute('data-i18n-placeholder')));
    }
    var labels = doc.querySelectorAll('[data-i18n-label]');
    for (i = 0; i < labels.length; i++) {
      labels[i].setAttribute('aria-label', t(labels[i].getAttribute('data-i18n-label')));
    }
    var groups = doc.querySelectorAll('[data-i18n-optgroup]');
    for (i = 0; i < groups.length; i++) {
      groups[i].setAttribute('label', t(groups[i].getAttribute('data-i18n-optgroup')));
    }
  }

  /**
   * 辞書についてのお知らせを出す。キーを覚えておき、言語の切り替えで出し直す。
   * @param {string|null} key 文言のキー。null なら隠す
   * @param {boolean} [isError] エラーとして見せるか
   */
  function showNotice(key, isError) {
    var notice = byId('dictionaryNotice');
    if (!notice) return;
    dictionaryNoticeKey = key;
    dictionaryNoticeIsError = !!isError;
    notice.textContent = key ? t(key) : '';
    notice.className = isError ? 'notice notice-error' : 'notice';
    notice.hidden = !key;
  }

  /**
   * 言語を切り替えて、画面を描き直す。
   * @param {string} lang
   * @param {boolean} [remember] 選択を保存するか
   */
  function changeLanguage(lang, remember) {
    M.setLanguage(lang);
    if (remember) {
      withStorage(function (store) {
        return store.setItem(LANG_STORAGE_KEY, M.getLanguage());
      });
    }
    applyTranslations();
    if (dictionaryNoticeKey) showNotice(dictionaryNoticeKey, dictionaryNoticeIsError);
    if (lastAnalysis) renderResult(lastAnalysis.text, lastAnalysis.result);
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

    function fallBack(key) {
      if (adoptDictionary(builtIn)) {
        setAnalyzeEnabled(true);
        showNotice(key || null, false);
      } else {
        setAnalyzeEnabled(false);
        showNotice('dictionary.broken', true);
      }
    }

    if (global.location && global.location.protocol === 'file:') {
      fallBack('dictionary.fallback');
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
          showNotice(null, false);
        } else {
          fallBack('dictionary.invalid');
        }
      })
      .catch(function () {
        fallBack('dictionary.fallback');
      });
  }

  /**
   * 読み込んだサンプルが正規のものだったときに、その旨を画面に出す。
   *
   * 入力欄が書き換えられていたら、もうそのサンプルではないので何も出さない。
   *
   * @param {string} text いま解析した本文
   * @param {string} level 判定の段階
   */
  function updateSampleNotice(text, level) {
    var notice = byId('sampleNotice');
    var sample = loadedSample ? SAMPLES[loadedSample] : null;
    var show = sample && sample.kind === 'legit' && sample.text === text;
    notice.textContent = show
      ? t(level === 'veryLow' ? 'sample.legit.zero' : 'sample.legit.notice')
      : '';
    notice.hidden = !show;
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
    var items = CATEGORIES.map(function (category) {
      var bucket = result.categories[category];
      return t('radar.item', {
        label: t('category.' + category + '.label'),
        score: bucket ? bucket.score : 0
      });
    });
    return t('radar.desc', { summary: items.join(t('radar.separator')) });
  }

  /**
   * 解析の結果を画面に描く。言語を切り替えたときも、同じ結果でここを呼び直す。
   * @param {string} text 解析した本文
   * @param {Object} result Core.analyze の結果
   */
  function renderResult(text, result) {
    byId('result').hidden = false;
    updateSampleNotice(text, result.level);
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

  /** 入力された本文を解析して、画面を更新する。 */
  function analyze() {
    if (!dictionary) return;
    var text = byId('inputText').value;
    var result = Core.analyze(text, dictionary);
    lastAnalysis = { text: text, result: result };
    renderResult(text, result);
  }

  /**
   * サンプル本文を入力欄に読み込む。
   * @param {string} key SCAM_SAMPLES のキー
   */
  function loadSample(key) {
    if (!Object.prototype.hasOwnProperty.call(SAMPLES, key)) return;
    byId('inputText').value = SAMPLES[key].text;
    loadedSample = key;
    lastAnalysis = null;
    byId('result').hidden = true;
  }

  /** 入力欄と結果を消す。 */
  function clearInput() {
    byId('inputText').value = '';
    loadedSample = null;
    lastAnalysis = null;
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
    changeLanguage(resolveLanguage(), false);
    loadDictionary();

    byId('analyzeBtn').addEventListener('click', analyze);
    byId('clearBtn').addEventListener('click', clearInput);

    byId('langToggle').addEventListener('click', function () {
      var languages = M.LANGUAGES;
      var next = languages[(languages.indexOf(M.getLanguage()) + 1) % languages.length];
      changeLanguage(next, true);
    });

    byId('presetSelect').addEventListener('change', function (event) {
      var key = event.target.value;
      if (key) loadSample(key);
    });

    byId('safetyTipsToggle').addEventListener('click', toggleTips);
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
