/**
 * SCAM_SAMPLES - 画面のドロップダウンから読み込むサンプル本文。
 *
 * kind が 'scam' のものは詐欺メッセージの模造品で、'legit' のものは正規の通知の模造品である。
 * どれも実在のメッセージそのものではなく、よくある言い回しを集めた作り物である。
 * 連絡先とURLはexample.comなど、実在しないものに置き換えてある。
 *
 * 正規のものを混ぜてあるのは、「正規の通知にも同じ語が使われる」ことを
 * 画面の上で確かめられるようにするためである（偽陽性の体験）。
 */
(function (global) {
  'use strict';

  global.SCAM_SAMPLES = {
    // フィッシング詐欺（アカウント確認）
    phishing_jp: {
      kind: 'scam',
      text: `【重要】アカウント確認のお願い

お客様各位

至急ご確認ください。
お客様のアカウントに不正なアクセスが検知されました。
アカウント停止を回避するため、今すぐ以下のリンクから本人確認を行ってください。

24時間以内に対応がない場合、アカウントは一時停止され、罰金が発生する可能性があります。

今すぐ確認する: https://example.com/verify

※このメールは緊急を要します。`
    },

    // 偽配送通知（不在通知）
    delivery_jp: {
      kind: 'scam',
      text: `【配送業者】荷物配達のお知らせ

お荷物をお届けに伺いましたが、ご不在でした。

24時間以内に再配達のご依頼がない場合、荷物は返送されます。
保管期限が本日限りとなっておりますので、至急以下のURLより再配達をご依頼ください。

https://example.com/redelivery

※このメッセージに速やかにご対応いただけない場合、追加の保管料金が発生する可能性があります。

重要：今すぐご確認ください。`
    },

    // 偽サポート（アカウント停止）
    support_jp: {
      kind: 'scam',
      text: `【緊急】カスタマーサポートからの重要通知

お客様

異常なアクティビティが検知されたため、アカウントを一時保留しております。

利用停止を解除するには、以下の情報を至急ご確認ください：
・本人確認書類
・クレジットカード情報

24時間以内にご対応いただけない場合、永久停止となり、違反金が課せられる可能性があります。

今すぐ確認：https://example.com/support

カスタマーサポートチーム`
    },

    // 偽税務署（未納税金）
    tax_jp: {
      kind: 'scam',
      text: `【国税庁】未納税金に関する重要なお知らせ

重要な通知

お客様の税金に未納が確認されました。
このまま放置すると法的措置を取らざるを得ません。

差し押さえを回避するため、本日中に以下の連絡先までご連絡ください。

連絡先：03-XXXX-XXXX
※緊急の案件につき、速やかな対応をお願いします。

未対応の場合、訴訟手続きに入ります。`
    },

    // 投資詐欺（高額収益）
    investment_jp: {
      kind: 'scam',
      text: `🎉当選おめでとうございます🎉

あなたが特別に選ばれました！

今だけの限定オファーで、月収100万円以上の収益が確実に得られる投資案件にご招待します。

【特典】
✅ 無料コンサルティング
✅ 初回ボーナス10万円プレゼント
✅ 成功者続出の実績

このチャンスを逃すと二度と参加できません。
重要なお知らせです。今すぐ下記URLをクリック！

※至急お返事ください`
    },

    // 偽当選通知（高額賞金）
    lottery_jp: {
      kind: 'scam',
      text: `【当選通知】高額賞金が当たりました！

おめでとうございます！

あなたが今月の特別抽選で当選しました！
賞金：500万円

受け取りには本日中の手続きが必要です。
このチャンスは今だけ！先着10名様限定の特典もご用意しております。

完全無料で受け取れますので、今すぐ以下のフォームからお申し込みください。

※期限を過ぎると受取権利は失効します。
至急お手続きください。`
    },

    // 偽副業案内（高収入）
    job_jp: {
      kind: 'scam',
      text: `【副業案内】月収50万円確実に稼げます

こんにちは

選ばれた方だけへの限定オファーです。

スマホ1台で月収50万円以上が必ず稼げる副業をご紹介します。
リスクなし、完全在宅、初心者でも確実に収益が出る保証付きです。

【今だけの特典】
・初月無料
・ボーナス3万円プレゼント
・先着20名限定

残りわずかです。このチャンスを逃すと二度と参加できません。
今すぐ下記URLから登録してください！

https://example.com/job`
    },

    // ロマンス詐欺（投資勧誘）
    romance_jp: {
      kind: 'scam',
      text: `こんにちは

突然のメッセージ失礼します。
あなたのプロフィールを見て、ぜひお話ししたいと思いました。

実は私は海外で投資の仕事をしていて、今とても成功しています。
あなたにも大きな報酬を得られるチャンスをお教えしたいです。

限定的なオファーで、今だけ無料で始められます。
一緒に素敵な未来を築きませんか？

すぐに返信してくださいね。`
    },

    // Phishing (Account Security)
    phishing_en: {
      kind: 'scam',
      text: `URGENT: Account Security Alert

Dear Valued Customer,

We have detected suspicious activity on your account. Immediate action is required to prevent account suspension.

Your account will be permanently closed and you may face penalties if you do not verify your identity now.

Click here immediately: https://example.com/verify

This is an important security warning. You have 24 hours to respond or face legal consequences.

Act now to claim your account and avoid fines.

Security Team`
    },

    // 正規の配送通知
    legit_delivery_jp: {
      kind: 'legit',
      text: `お届け予定のお知らせ

ご注文いただいた商品の発送が完了しました。

お届け予定日：10月9日（木）
時間帯：午前中
お問い合わせ番号：1234-5678-9012

ご不在の場合は、不在連絡票を投函いたします。
再配達のご依頼は、お問い合わせ番号をご用意のうえ、
配送業者の公式サイト、または電話窓口からお願いいたします。`
    },

    // 正規の銀行からのお知らせ
    legit_bank_jp: {
      kind: 'legit',
      text: `【○○銀行】システムメンテナンスのお知らせ

いつもご利用いただきありがとうございます。

設備の更新にともない、下記の日時にインターネットバンキングのサービスを停止いたします。

日時：10月15日（日）2:00〜5:00
対象：残高照会、振込、定期預金のお手続き

ご不便をおかけしますが、ご了承ください。
ご不明な点は、通帳やキャッシュカードに記載の番号へお問い合わせください。

※本メールは配信専用です。返信は受け付けておりません。`
    },

    // 正規の社内リマインド
    legit_work_jp: {
      kind: 'legit',
      text: `【リマインド】経費精算の締切について

お疲れさまです。総務部です。

今月分の経費精算は、本日中が提出の期限となっています。
未提出の方は至急ご対応をお願いします。

提出先：社内ポータルの経費精算フォーム
締切：本日18時

期限を過ぎた分は翌月の精算となりますので、ご了承ください。
やむをえない事情がある方は、個別にご相談ください。`
    },

    // 正規のキャンペーン案内
    legit_campaign_jp: {
      kind: 'legit',
      text: `会員限定キャンペーンのご案内

平素よりご愛顧いただき、ありがとうございます。

会員の皆さまへ、期間限定で送料無料クーポンをお配りしています。

特典：全商品の送料が無料
期間：10月31日まで
対象：会員登録がお済みのお客様

クーポンはマイページから取得できます。
配信の停止をご希望の場合は、マイページの設定からお手続きください。`
    },

    // Legitimate sign-in alert
    legit_signin_en: {
      kind: 'legit',
      text: `Security alert: sign-in from a new device

Hello,

We noticed a sign-in to your account from a new device on October 5.

Device: Windows PC
Location: Tokyo, Japan

If this was you, no action is needed. If you do not recognize this
sign-in, open the app and review your security settings. Accounts with
unauthorized access are locked automatically after our review.

We will never ask for your password or payment details by email.`
    }
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
