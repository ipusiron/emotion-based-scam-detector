/**
 * ScamMessages - 画面に出す文言をまとめた辞書。
 *
 * ロジック（js/scam-core.js）は文言を持たず、キーだけを返す。
 * 画面の文言をここに集めてあるので、言語を足すときに触る場所はこのファイルと
 * index.html の data-i18n 属性だけで済む。
 *
 * ja と en のキーが一致することは test/i18n.test.js が検べる。
 */
(function (global) {
  'use strict';

  var MESSAGES = {
    ja: {
      // ページ全体
      'app.title': 'Emotion-Based Scam Detector - メッセージの感情トリガー検出ツール',
      'app.description': 'フィッシングや詐欺メッセージの感情的トリガーワードを検出する無料ツール',
      'header.lead1': 'フィッシングや詐欺メッセージによく使われる感情的な言葉を分析するツールです。',
      'header.lead2': '怪しいメールやチャットメッセージを下に貼り付けて、解析ボタンを押すと、ハイライト表示とリスクスコアが出ます。',
      'noscript': 'このツールはJavaScriptで動きます。ブラウザーのJavaScriptを有効にしてください。',

      // 言語の切り替え
      'lang.toggle': 'English',
      'lang.toggleLabel': '表示を英語に切り替える',

      // サンプルの選択
      'presets.label': 'サンプルメッセージを選択',
      'presets.placeholder': '-- メッセージの例を選ぶ --',
      'presets.group.scamJa': '詐欺メッセージ（日本語）',
      'presets.group.scamEn': '詐欺メッセージ（英語）',
      'presets.group.legit': '正規のメッセージ（誤検出の例）',
      'sample.phishing_jp.label': 'フィッシング詐欺（アカウント確認）',
      'sample.delivery_jp.label': '偽配送通知（不在通知）',
      'sample.support_jp.label': '偽サポート（アカウント停止）',
      'sample.tax_jp.label': '偽税務署（未納税金）',
      'sample.investment_jp.label': '投資詐欺（高額収益）',
      'sample.lottery_jp.label': '偽当選通知（高額賞金）',
      'sample.job_jp.label': '偽副業案内（高収入）',
      'sample.romance_jp.label': 'ロマンス詐欺（投資勧誘）',
      'sample.phishing_en.label': 'フィッシング詐欺（英語・アカウント確認）',
      'sample.legit_delivery_jp.label': '正規の配送通知',
      'sample.legit_bank_jp.label': '正規の銀行からのお知らせ',
      'sample.legit_work_jp.label': '正規の社内リマインド',
      'sample.legit_campaign_jp.label': '正規のキャンペーン案内',
      'sample.legit_signin_en.label': '正規のログイン通知（英語）',

      // 入力
      'input.label': '解析するメッセージ',
      'input.placeholder': 'メールやチャットメッセージをここに貼り付けてください...',
      'button.analyze': '解析',
      'button.clear': 'クリア',

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
      'radar.desc': '{summary}。10点満点。',
      'radar.item': '{label}{score}',
      'radar.separator': '、',

      // サンプルの種類の案内（偽陽性の体験）
      'sample.legit.notice': 'これは正規のメッセージの例です。正規の通知にも「至急」「本日中」'
        + '「無料」のような語は使われるため、スコアが上がることがあります。'
        + 'スコアの高さだけで詐欺とは決められません。',
      'sample.legit.zero': 'これは正規のメッセージの例です。今回は辞書の語がほとんど出ませんでしたが、'
        + '語を選んで書かれた詐欺も同じように低く出ます。スコアの低さは安全の証明にはなりません。',

      // 結果の画面
      'result.heading': '解析結果',
      'result.total': '総合リスクスコア',
      'result.max': '/ 100',
      'output.heading': '本文のハイライト',
      'limits': 'このスコアは、本文に出てくる語を辞書と照合しただけの目安です。'
        + '送信元・ヘッダー・リンク先は見ていません。スコアが低くても詐欺のことはあります。',

      // 対処法
      'tips.heading': '🛡️ 詐欺メッセージへの対処法',
      'tips.link.title': 'リンクをクリックしない',
      'tips.link.desc': 'メール内のリンクやボタンはクリックしないでください。',
      'tips.official.title': '公式サイトを確認',
      'tips.official.desc': '検索エンジンで公式サイトを探し、お知らせページをチェックしてください。',
      'tips.login.title': '直接ログイン',
      'tips.login.desc': 'ブラウザーで公式サイトに直接アクセスし、マイページから状況を確認してください。',
      'tips.contact.title': '公式に問い合わせ',
      'tips.contact.desc': '不安な場合は、公式サイトに記載された電話番号に直接連絡してください。',
      'tips.secret.title': '個人情報を入力しない',
      'tips.secret.desc': 'パスワードやクレジットカード情報を求められても入力しないでください。',
      'tips.calm.title': '焦らず冷静に',
      'tips.calm.desc': '「今すぐ」「至急」などの言葉に焦らされず、一度冷静になって考えましょう。',
      'tips.search.title': 'SNSで検索',
      'tips.search.desc': 'Xで同様のメッセージについての報告がないか検索してみましょう。',
      'tips.ask.title': '詳しい人に相談',
      'tips.ask.desc': 'コンピューターに詳しい友人や家族に相談してからアクションしてください。',

      // フッター
      'footer.text': 'GitHubリポジトリー（ipusiron/emotion-based-scam-detector）'
    },

    en: {
      // ページ全体
      'app.title': 'Emotion-Based Scam Detector - Emotional trigger detector for messages',
      'app.description': 'Free tool that detects emotional trigger words in phishing and scam messages',
      'header.lead1': 'This tool analyses the emotional language that phishing and scam messages rely on.',
      'header.lead2': 'Paste a suspicious email or chat message below and press Analyse to see the highlighted words and a risk score.',
      'noscript': 'This tool runs on JavaScript. Please enable JavaScript in your browser.',

      // 言語の切り替え
      'lang.toggle': '日本語',
      'lang.toggleLabel': 'Switch the display to Japanese',

      // サンプルの選択
      'presets.label': 'Choose a sample message',
      'presets.placeholder': '-- Choose a sample message --',
      'presets.group.scamJa': 'Scam messages (Japanese)',
      'presets.group.scamEn': 'Scam messages (English)',
      'presets.group.legit': 'Legitimate messages (false positives)',
      'sample.phishing_jp.label': 'Phishing (account verification, Japanese)',
      'sample.delivery_jp.label': 'Fake delivery notice (Japanese)',
      'sample.support_jp.label': 'Fake support (account suspension, Japanese)',
      'sample.tax_jp.label': 'Fake tax office (unpaid tax, Japanese)',
      'sample.investment_jp.label': 'Investment scam (high returns, Japanese)',
      'sample.lottery_jp.label': 'Fake prize notice (Japanese)',
      'sample.job_jp.label': 'Fake side job offer (Japanese)',
      'sample.romance_jp.label': 'Romance scam (investment pitch, Japanese)',
      'sample.phishing_en.label': 'Phishing (account security, English)',
      'sample.legit_delivery_jp.label': 'Legitimate delivery notice (Japanese)',
      'sample.legit_bank_jp.label': 'Legitimate bank notice (Japanese)',
      'sample.legit_work_jp.label': 'Legitimate workplace reminder (Japanese)',
      'sample.legit_campaign_jp.label': 'Legitimate campaign notice (Japanese)',
      'sample.legit_signin_en.label': 'Legitimate sign-in alert (English)',

      // 入力
      'input.label': 'Message to analyse',
      'input.placeholder': 'Paste an email or chat message here...',
      'button.analyze': 'Analyse',
      'button.clear': 'Clear',

      // 危険度の見出しと説明
      'risk.high.label': 'High risk',
      'risk.high.text': 'This message is very likely to be a scam. Do not click any link, and confirm with the sender through a channel you already trust.',
      'risk.medium.label': 'Medium risk',
      'risk.medium.text': 'This message needs care. Check carefully whether the sender is who they claim to be.',
      'risk.low.label': 'Low risk',
      'risk.low.text': 'This message looks relatively safe, but it is still worth confirming the sender.',
      'risk.veryLow.label': 'Very low risk',
      'risk.veryLow.text': 'Almost no emotional trigger words were detected.',

      // カテゴリーの名前と、その感情のねらい
      'category.emergency.label': 'Urgency',
      'category.emergency.hint': 'wording that takes away time to think',
      'category.fear.label': 'Fear',
      'category.fear.hint': 'wording that threatens a loss',
      'category.greed.label': 'Greed',
      'category.greed.hint': 'wording that promises a gain',

      // 検出の内訳
      'detail.none': 'No dictionary words were found.',
      'detail.summary': '{distinct} distinct words, {occurrences} occurrences',
      'detail.empty': 'No text has been entered.',
      'detail.caption': 'Detected words (distinct: occurrences)',

      // 辞書の読み込み
      'dictionary.fallback': 'data/dictionary.json could not be loaded, so the built-in '
        + 'dictionary is in use. To pick up your edits, open the page through a local server.',
      'dictionary.broken': 'The dictionary could not be loaded. Check the format of data/dictionary.json.',
      'dictionary.invalid': 'The dictionary format is not valid.',

      // レーダーの凡例
      'radar.threshold': 'Threshold (alert line)',
      'radar.detected': 'Detected score',
      'radar.title': 'Radar chart of the score for each category',
      'radar.desc': '{summary}. Out of 10.',
      'radar.item': '{label} {score}',
      'radar.separator': ', ',

      // サンプルの種類の案内（偽陽性の体験）
      'sample.legit.notice': 'This is an example of a legitimate message. Legitimate notices also use words '
        + 'such as "urgent", "today" and "free", so the score can rise. '
        + 'A high score on its own does not make a message a scam.',
      'sample.legit.zero': 'This is an example of a legitimate message. Few dictionary words appeared this time, '
        + 'but a carefully worded scam scores just as low. A low score is not proof of safety.',

      // 結果の画面
      'result.heading': 'Analysis result',
      'result.total': 'Overall risk score',
      'result.max': '/ 100',
      'output.heading': 'Highlighted message',
      'limits': 'This score only reflects how the words in the message compare with a dictionary. '
        + 'The sender, the headers and the links are not examined. A low score does not rule out a scam.',

      // 対処法
      'tips.heading': '🛡️ What to do with a scam message',
      'tips.link.title': 'Do not click links',
      'tips.link.desc': 'Do not click the links or buttons inside the message.',
      'tips.official.title': 'Check the official site',
      'tips.official.desc': 'Search for the official site yourself and check its announcements page.',
      'tips.login.title': 'Sign in directly',
      'tips.login.desc': 'Open the official site in your browser and check your account from there.',
      'tips.contact.title': 'Ask the company',
      'tips.contact.desc': 'If you are unsure, call the number published on the official site.',
      'tips.secret.title': 'Never enter secrets',
      'tips.secret.desc': 'Do not enter your password or card details, however the message asks.',
      'tips.calm.title': 'Slow down',
      'tips.calm.desc': 'Words such as "now" and "urgent" are there to rush you. Stop and think once.',
      'tips.search.title': 'Search social media',
      'tips.search.desc': 'Search X and similar sites for reports of the same message.',
      'tips.ask.title': 'Ask someone you trust',
      'tips.ask.desc': 'Talk to a friend or a family member who knows computers before you act.',

      // フッター
      'footer.text': 'GitHub repository (ipusiron/emotion-based-scam-detector)'
    }
  };

  /** 対応する言語。先頭が既定。 */
  var LANGUAGES = ['ja', 'en'];

  var current = LANGUAGES[0];

  /**
   * 表示する言語を決める。知らない言語なら既定に戻す。
   * @param {string} lang
   * @returns {string} 実際に設定された言語
   */
  function setLanguage(lang) {
    current = Object.prototype.hasOwnProperty.call(MESSAGES, lang) ? lang : LANGUAGES[0];
    return current;
  }

  /**
   * いまの言語を返す。
   * @returns {string}
   */
  function getLanguage() {
    return current;
  }

  /**
   * キーから文言を取り出す。{name}の形の差し込みに対応する。
   *
   * いまの言語になければ既定の言語を見て、それにもなければキーをそのまま返す。
   *
   * @param {string} key 文言のキー
   * @param {Object<string, string|number>} [params] 差し込む値
   * @returns {string}
   */
  function t(key, params) {
    var table = MESSAGES[current] || MESSAGES[LANGUAGES[0]];
    var text = Object.prototype.hasOwnProperty.call(table, key) ? table[key] : null;
    if (text === null) {
      var base = MESSAGES[LANGUAGES[0]];
      text = Object.prototype.hasOwnProperty.call(base, key) ? base[key] : key;
    }
    if (!params) return text;
    return text.replace(/\{(\w+)\}/g, function (whole, name) {
      return Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : whole;
    });
  }

  global.ScamMessages = {
    MESSAGES: MESSAGES,
    LANGUAGES: LANGUAGES,
    setLanguage: setLanguage,
    getLanguage: getLanguage,
    t: t
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
