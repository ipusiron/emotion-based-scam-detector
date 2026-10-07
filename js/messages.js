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

      // 説得の原理（Cialdini の6原理）
      'principle.authority.label': '権威',
      'principle.authority.desc': '公的機関や有名企業の名を借りると、中身を確かめずに従いやすくなる。',
      'principle.socialProof.label': '社会的証明',
      'principle.socialProof.desc': '多くの人がそうしていると示されると、それが正しいと感じやすくなる。',
      'principle.liking.label': '好意',
      'principle.liking.desc': '自分に好意を向けてくる相手や、自分と似た相手の頼みは断りにくい。',
      'principle.reciprocity.label': '返報性',
      'principle.reciprocity.desc': '先に何かをもらうと、返さなければという気持ちが働く。',
      'principle.commitment.label': '一貫性',
      'principle.commitment.desc': '一度乗った前提と矛盾しないように、考えと行動を続けてしまう。',
      'principle.scarcity.label': '希少性',
      'principle.scarcity.desc': '手に入りにくいもの、残り時間が少ないものほど価値が高く見える。',
      'principle.none.label': '6原理の外',
      'principle.none.desc': 'Cialdiniの6原理には当てはまらない。損を避けたい気持ちや、金額そのものへの反応を使う。',

      // 手口のまとまりと、それが効く理由
      'group.immediacy.label': 'いますぐ動けと迫る',
      'group.immediacy.why': '考える時間を奪うのがねらいです。立ち止まって確かめられると困る側が使います。'
        + '正規の連絡でも急ぎのことはあるので、この語だけで詐欺とは決まりません。',
      'group.deadline.label': '期限を切る',
      'group.deadline.why': '締切があると、人は中身より間に合うかどうかに気を取られます。'
        + '期限が不自然に短くないか、過ぎたらどうなると書いてあるかを見てください。',
      'group.importance.label': '重要だと銘打つ',
      'group.importance.why': '件名や冒頭に「重要」と置くと、送り手が決めた重みを受け手が引き受けてしまいます。'
        + '誰にとって重要なのかは、たいてい書かれていません。',
      'group.legalThreat.label': '法と罰をちらつかせる',
      'group.legalThreat.why': '警察・法的措置・罰金といった言葉は、反論しにくい相手を連想させます。'
        + '本物の行政手続きが、メール1通とリンクだけで完結することはありません。',
      'group.accountLoss.label': '使えなくなると告げる',
      'group.accountLoss.why': 'いま使えているものを失うと言われると、同じだけ得をする話より強く反応します。'
        + 'アカウントの状態は、公式サイトに自分でログインすれば確かめられます。',
      'group.securityIncident.label': 'セキュリティ上の異常を装う',
      'group.securityIncident.why': '「不正アクセスを検知しました」と言われると、'
        + '受け手は自分を守る側に立ったつもりで指示に従います。'
        + '守る行動がリンクを押すことなら、そこを疑ってください。',
      'group.freeGift.label': 'ただで与えると言う',
      'group.freeGift.why': '先に何かをもらうと、返さなければという気持ちが働きます。'
        + '無料のものを受け取るために個人情報を求められたら、それが対価です。',
      'group.discount.label': '値引きや返金を示す',
      'group.discount.why': '返金や割引は、受け手が得をしたと感じる形の贈り物です。'
        + '返金を受け取るのに口座番号やカード情報が要るなら、流れが逆を向いています。',
      'group.winning.label': '当たったと告げる',
      'group.winning.why': '応募した覚えのない当選は、まず作り話です。'
        + '当たったと信じた時点で、受け取りの手続きという名目の要求が通りやすくなります。',
      'group.chosen.label': 'あなたが選ばれたと言う',
      'group.chosen.why': '「選ばれた」「特別な」と言われると、相手が自分に好意を持っていると感じ、'
        + '頼みを断りにくくなります。なぜ自分が選ばれたのかは、たいてい書かれていません。',
      'group.exclusivity.label': '数と枠を限る',
      'group.exclusivity.why': '残りが少ないと示されると、判断を急ぎます。'
        + '先着や限定の根拠を、自分の側から確かめられるかどうかを見てください。',
      'group.profit.label': '儲かると示す',
      'group.profit.why': '利益の話は、損のおそれとセットでしか成り立ちません。'
        + '片方しか書かれていない時点で、釣り合いが取れていません。',
      'group.guarantee.label': '確実だと請け合う',
      'group.guarantee.why': '言い切られると、受け手はその前提に乗ったまま考えを進めてしまいます。'
        + '確実な利益を約束できる投資はありません。',
      'group.money.label': '金額を見せる',
      'group.money.why': '具体的な金額は、話を現実のことのように感じさせます。'
        + '金額の大きさは、話の確からしさとは関わりません。',

      // 原理のパネルと、語の解説のパネル
      'panel.principles.heading': '使われている説得の原理',
      'panel.principles.empty': '辞書の語が見つからなかったので、内訳は出せません。',
      'panel.principles.count': '{occurrences}回',
      'panel.principles.absent': '見つからなかった原理：{names}',
      'panel.word.heading': '選んだ語について',
      'panel.word.hint': '色の付いた語を押すと、その語が何をねらっているかが出ます。',
      'panel.word.category': '感情',
      'panel.word.group': '手口',
      'panel.word.principle': '説得の原理',
      'panel.word.caution': 'この語は、正規の連絡でも使われます。',

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

      // 説得の原理（Cialdini の6原理）
      'principle.authority.label': 'Authority',
      'principle.authority.desc': 'Borrowing the name of an official body or a known company makes people comply without checking.',
      'principle.socialProof.label': 'Social proof',
      'principle.socialProof.desc': 'Being told that many others are doing something makes it feel like the right thing to do.',
      'principle.liking.label': 'Liking',
      'principle.liking.desc': 'A request is hard to refuse when it comes from someone who seems to like you, or to be like you.',
      'principle.reciprocity.label': 'Reciprocity',
      'principle.reciprocity.desc': 'Receiving something first creates a feeling that it has to be returned.',
      'principle.commitment.label': 'Commitment and consistency',
      'principle.commitment.desc': 'Once a premise is accepted, people keep reasoning and acting in line with it.',
      'principle.scarcity.label': 'Scarcity',
      'principle.scarcity.desc': 'Whatever is hard to get, or about to run out, looks more valuable.',
      'principle.none.label': 'Outside the six',
      'principle.none.desc': 'Not one of Cialdini\'s six. These rely on the wish to avoid a loss, or on a reaction to the sum itself.',

      // 手口のまとまりと、それが効く理由
      'group.immediacy.label': 'Demanding that you act now',
      'group.immediacy.why': 'The aim is to take away the time to think. It is used by someone who cannot afford '
        + 'for you to stop and check. Legitimate messages are sometimes urgent too, so this wording alone proves nothing.',
      'group.deadline.label': 'Setting a deadline',
      'group.deadline.why': 'A deadline shifts attention from what is being asked to whether you will make it. '
        + 'Look at whether the deadline is unreasonably short, and at what it says will happen once it passes.',
      'group.importance.label': 'Declaring it important',
      'group.importance.why': 'Putting "important" in the subject line makes the reader accept a weight the sender chose. '
        + 'Who it is important to is usually left unsaid.',
      'group.legalThreat.label': 'Invoking law and punishment',
      'group.legalThreat.why': 'Police, legal action and fines evoke a party you cannot argue with. '
        + 'A genuine administrative process is never completed through one email and a link.',
      'group.accountLoss.label': 'Threatening to cut you off',
      'group.accountLoss.why': 'Losing something you already have provokes a stronger reaction than gaining as much. '
        + 'The state of your account is something you can check by signing in to the official site yourself.',
      'group.securityIncident.label': 'Posing as a security incident',
      'group.securityIncident.why': '"We have detected unauthorised access" puts the reader on the defending side, '
        + 'and they follow the instructions from there. If the defending act is to click a link, that is the part to doubt.',
      'group.freeGift.label': 'Offering something for free',
      'group.freeGift.why': 'Receiving something first creates a feeling that it has to be returned. '
        + 'If personal details are required to collect the free thing, those details are the price.',
      'group.discount.label': 'Showing a discount or a refund',
      'group.discount.why': 'A refund or a discount is a gift shaped so the reader feels they gained. '
        + 'If collecting a refund needs your account or card number, the money is flowing the wrong way.',
      'group.winning.label': 'Announcing that you won',
      'group.winning.why': 'A prize from a draw you never entered is almost certainly an invention. '
        + 'Once the win is believed, requests made in the name of claiming it go through easily.',
      'group.chosen.label': 'Saying you were chosen',
      'group.chosen.why': '"Selected" and "special" make the reader feel the sender favours them, '
        + 'which makes a request harder to refuse. Why you in particular is usually left unsaid.',
      'group.exclusivity.label': 'Limiting the number of places',
      'group.exclusivity.why': 'Being shown that little is left makes people decide in a hurry. '
        + 'Look at whether you can verify the limit from your own side.',
      'group.profit.label': 'Promising a return',
      'group.profit.why': 'A return only exists alongside a risk of loss. '
        + 'If only one side is written down, the picture is not balanced.',
      'group.guarantee.label': 'Guaranteeing the outcome',
      'group.guarantee.why': 'A flat assurance keeps the reader reasoning on top of that premise. '
        + 'No investment can promise a certain return.',
      'group.money.label': 'Naming a sum',
      'group.money.why': 'A concrete figure makes the story feel like something that is actually happening. '
        + 'How large the sum is has nothing to do with how true the story is.',

      // 原理のパネルと、語の解説のパネル
      'panel.principles.heading': 'Persuasion principles in use',
      'panel.principles.empty': 'No dictionary words were found, so there is nothing to break down.',
      'panel.principles.count': '{occurrences} occurrences',
      'panel.principles.absent': 'Principles not found: {names}',
      'panel.word.heading': 'About the selected word',
      'panel.word.hint': 'Press a highlighted word to see what it is aiming for.',
      'panel.word.category': 'Emotion',
      'panel.word.group': 'Tactic',
      'panel.word.principle': 'Principle',
      'panel.word.caution': 'Legitimate messages use this word as well.',

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
