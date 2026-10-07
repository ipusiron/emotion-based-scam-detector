/**
 * ScamMessages - 画面に出す文言をまとめた辞書。
 *
 * ロジック（js/scam-core.js）は文言を持たず、キーだけを返す。
 * 画面の文言をここに集めておくと、言語を足すときに触る場所が1か所で済む。
 */
(function (global) {
  'use strict';

  var MESSAGES = {
    // 危険度の見出しと説明
    'risk.high.label': '高リスク',
    'risk.high.text': 'このメッセージは詐欺の可能性が非常に高いです。リンクをクリックせず、送信元に直接確認してください。',
    'risk.medium.label': '中リスク',
    'risk.medium.text': 'このメッセージには注意が必要です。送信元の信頼性を慎重に確認してください。',
    'risk.low.label': '低リスク',
    'risk.low.text': 'このメッセージは比較的安全ですが、念のため送信元を確認することをお勧めします。',
    'risk.veryLow.label': '極小リスク',
    'risk.veryLow.text': '感情的なトリガーワードはほとんど検出されませんでした。',

    // カテゴリーの名前と、その感情のねらい
    'category.emergency.label': '緊急性',
    'category.emergency.hint': '考える時間を奪う表現',
    'category.fear.label': '恐怖',
    'category.fear.hint': '不利益をちらつかせる表現',
    'category.greed.label': '欲望',
    'category.greed.hint': '得をすると思わせる表現',

    // 検出の内訳
    'detail.none': '辞書の語は見つかりませんでした。',
    'detail.summary': '{distinct}種類の語が{occurrences}回',
    'detail.empty': 'テキストが入力されていません。',
    'detail.caption': '検出した語（種類：回数）',

    // 辞書の読み込み
    'dictionary.fallback': 'data/dictionary.jsonを読み込めなかったので、内蔵の辞書を使っています。辞書の編集を反映するには、ローカルサーバー経由で開いてください。',
    'dictionary.broken': '辞書を読み込めませんでした。data/dictionary.jsonの形式を確認してください。',
    'dictionary.invalid': '辞書の形式が正しくありません。',

    // レーダーの凡例
    'radar.threshold': 'しきい値（警戒ライン）',
    'radar.detected': '検出スコア',
    'radar.title': 'カテゴリー別スコアのレーダーチャート',
    'radar.desc': '{summary}',

    // 画面の案内
    'result.heading': '解析結果',
    'result.total': '総合リスクスコア'
  };

  /**
   * キーから文言を取り出す。{name}の形の差し込みに対応する。
   * @param {string} key 文言のキー
   * @param {Object<string, string|number>} [params] 差し込む値
   * @returns {string} 見つからないときはキーをそのまま返す
   */
  function t(key, params) {
    var text = Object.prototype.hasOwnProperty.call(MESSAGES, key) ? MESSAGES[key] : key;
    if (!params) return text;
    return text.replace(/\{(\w+)\}/g, function (whole, name) {
      return Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : whole;
    });
  }

  global.ScamMessages = { MESSAGES: MESSAGES, t: t };
})(typeof globalThis !== 'undefined' ? globalThis : this);
