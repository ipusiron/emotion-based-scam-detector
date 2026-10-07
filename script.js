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

  /** 手口のまとまりと説得の原理の表。読めなければ null のままにする。 */
  var principleTable = null;

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
    loadPrinciples(dictionary);
    return true;
  }

  /**
   * 手口のまとまりの表を用意する。
   *
   * 辞書と同じで、HTTP なら data/principles.json、file:// なら内蔵の控えを使う。
   * 読めなければ null のままにし、原理のパネルを出さないだけにする
   * （解析そのものは表がなくても動く）。
   *
   * @param {Object<string, string[]>} dict 検証に使う辞書
   */
  function loadPrinciples(dict) {
    function adopt(candidate) {
      if (Core.validatePrinciples(candidate, dict).ok) {
        principleTable = candidate;
        return true;
      }
      return false;
    }

    if (global.location && global.location.protocol === 'file:') {
      adopt(global.SCAM_PRINCIPLES);
      return Promise.resolve();
    }

    return global.fetch('data/principles.json')
      .then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
      })
      .then(function (data) {
        if (!adopt(data)) adopt(global.SCAM_PRINCIPLES);
      })
      .catch(function () {
        adopt(global.SCAM_PRINCIPLES);
      });
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
   * 要素を作って、文字を入れて返す。
   * @param {string} name 要素名
   * @param {string} [className] クラス
   * @param {string} [text] 文字
   * @returns {HTMLElement}
   */
  function make(name, className, text) {
    var node = global.document.createElement(name);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  /**
   * 使われている説得の原理と、その下の手口のまとまりを描く。
   *
   * 出現の多い原理から並べる。6原理のうち出てこなかったものは、
   * まとめて1行で示す（辞書に足りない軸がわかる）。
   *
   * @param {Object} result Core.analyze の結果
   */
  function renderPrinciples(result) {
    var panel = byId('principlesPanel');
    var list = byId('principlesList');
    var absent = byId('principlesAbsent');
    if (!panel || !list) return;

    while (list.firstChild) list.removeChild(list.firstChild);

    var found = Object.keys(result.principles || {});
    if (!principleTable || found.length === 0) {
      panel.hidden = true;
      return;
    }
    panel.hidden = false;

    found.sort(function (a, b) {
      return result.principles[b].occurrences - result.principles[a].occurrences
        || (a < b ? -1 : 1);
    });

    found.forEach(function (principle) {
      var entry = result.principles[principle];
      var article = make('article', 'principle');

      var heading = make('h4', 'principle-name');
      heading.appendChild(make('span', null, t('principle.' + principle + '.label')));
      heading.appendChild(make('span', 'principle-count',
        t('panel.principles.count', { occurrences: entry.occurrences })));
      article.appendChild(heading);
      article.appendChild(make('p', 'principle-desc', t('principle.' + principle + '.desc')));

      entry.groups.forEach(function (groupId) {
        var group = result.groups[groupId];
        var details = make('details', 'tactic');
        details.id = 'tactic-' + groupId;
        var summary = make('summary');
        summary.appendChild(make('span', 'tactic-name', t('group.' + groupId + '.label')));
        summary.appendChild(make('span', 'tactic-words', group.words.join(t('radar.separator'))));
        details.appendChild(summary);
        details.appendChild(make('p', 'tactic-why', t('group.' + groupId + '.why')));
        details.appendChild(make('p', 'tactic-caution', t('panel.word.caution')));
        article.appendChild(details);
      });

      list.appendChild(article);
    });

    var missing = Core.PRINCIPLES.filter(function (name) { return found.indexOf(name) === -1; });
    if (missing.length) {
      absent.textContent = t('panel.principles.absent', {
        names: missing.map(function (name) {
          return t('principle.' + name + '.label');
        }).join(t('radar.separator'))
      });
      absent.hidden = false;
    } else {
      absent.hidden = true;
    }
  }

  /**
   * ハイライトした語を押したときに、その手口の解説を開いて見せる。
   * @param {Event} event
   */
  function onHighlightClick(event) {
    var button = event.target.closest ? event.target.closest('button[data-group]') : null;
    if (!button) return;
    var details = byId('tactic-' + button.getAttribute('data-group'));
    if (!details) return;

    var opened = global.document.querySelectorAll('#principlesList details[open]');
    for (var i = 0; i < opened.length; i++) {
      if (opened[i] !== details) opened[i].open = false;
    }
    details.open = true;
    details.scrollIntoView({ block: 'nearest' });
    var marked = global.document.querySelectorAll('.tactic.selected');
    for (var k = 0; k < marked.length; k++) marked[k].classList.remove('selected');
    details.classList.add('selected');
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

    renderPrinciples(result);

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
    var result = Core.analyze(text, dictionary, principleTable);
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
    byId('highlightedText').addEventListener('click', onHighlightClick);
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
