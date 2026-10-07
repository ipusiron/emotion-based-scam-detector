/**
 * SCAM_PRINCIPLES - 辞書の語を「手口のまとまり」に分け、説得の原理を割り当てた表。
 *
 * 実体は data/principles.json で、画面は HTTP で配信されているときはそちらを読む。
 * file:// で開いたときは fetch が使えないので、この控えを使う。
 * 2つの内容が一致することと、辞書の全語がちょうど1つのまとまりに入ることは
 * test/principles.test.js が検べる。
 *
 * principle は Cialdini の6原理（authority・socialProof・liking・reciprocity・
 * commitment・scarcity）。どれにも当てはまらないものは 'none' とする。
 */
(function (global) {
  'use strict';

  global.SCAM_PRINCIPLES = {
    groups: {
      // いますぐ動けと迫る（24語）
      immediacy: {
        principle: "scarcity",
        words: [
          "urgent",
          "immediately",
          "now",
          "asap",
          "act now",
          "hurry",
          "quick",
          "fast",
          "instant",
          "don't delay",
          "urgent action",
          "immediate action",
          "至急",
          "緊急",
          "今すぐ",
          "早急",
          "急ぎ",
          "速やかに",
          "直ちに",
          "すぐに",
          "大至急",
          "急いで",
          "迅速",
          "即座に"
        ]
      },
      // 期限を切る（10語）
      deadline: {
        principle: "scarcity",
        words: [
          "deadline",
          "expires soon",
          "time sensitive",
          "within 24 hours",
          "limited time",
          "期限",
          "本日中",
          "24時間以内",
          "本日限り",
          "お早めに"
        ]
      },
      // 重要だと銘打つ（4語）
      importance: {
        principle: "authority",
        words: [
          "important",
          "response required",
          "重要",
          "確認のお願い"
        ]
      },
      // 法と罰をちらつかせる（18語）
      legalThreat: {
        principle: "authority",
        words: [
          "penalty",
          "fine",
          "police",
          "lawsuit",
          "legal action",
          "court",
          "criminal",
          "arrest",
          "prosecution",
          "forfeit",
          "violation",
          "consequences",
          "罰金",
          "警察",
          "差し押さえ",
          "法的措置",
          "訴訟",
          "違反"
        ]
      },
      // 使えなくなると告げる（23語）
      accountLoss: {
        principle: "none",
        words: [
          "account suspension",
          "suspend",
          "terminate",
          "locked",
          "blocked",
          "frozen",
          "lose access",
          "permanent",
          "revoke",
          "cancel",
          "アカウント停止",
          "一時停止",
          "一時保留",
          "停止",
          "凍結",
          "利用停止",
          "ロック",
          "ブロック",
          "制限",
          "無効",
          "取り消し",
          "失効",
          "永久停止"
        ]
      },
      // セキュリティ上の異常を装う（15語）
      securityIncident: {
        principle: "authority",
        words: [
          "warning",
          "fraud",
          "unauthorized",
          "security alert",
          "breach",
          "compromised",
          "investigate",
          "異常",
          "不正アクセス",
          "不正利用",
          "セキュリティ警告",
          "検知",
          "調査",
          "疑わしい",
          "危険"
        ]
      },
      // ただで与えると言う（11語）
      freeGift: {
        principle: "reciprocity",
        words: [
          "free",
          "gift",
          "bonus",
          "100% free",
          "no cost",
          "無料",
          "ボーナス",
          "特典",
          "プレゼント",
          "ギフト",
          "完全無料"
        ]
      },
      // 値引き・返金を示す（5語）
      discount: {
        principle: "reciprocity",
        words: [
          "discount",
          "save money",
          "割引",
          "キャッシュバック",
          "返金"
        ]
      },
      // 当たったと告げる（11語）
      winning: {
        principle: "none",
        words: [
          "prize",
          "jackpot",
          "lottery",
          "claim",
          "congratulations",
          "当選",
          "賞金",
          "おめでとう",
          "当選者",
          "抽選",
          "受け取り"
        ]
      },
      // あなたが選ばれたと言う（7語）
      chosen: {
        principle: "liking",
        words: [
          "winner",
          "exclusive",
          "selected",
          "chosen",
          "lucky",
          "選ばれた",
          "特別"
        ]
      },
      // 数と枠を限る（9語）
      exclusivity: {
        principle: "scarcity",
        words: [
          "limited offer",
          "special offer",
          "limited slots",
          "act fast",
          "限定",
          "先着",
          "残りわずか",
          "今だけ",
          "チャンス"
        ]
      },
      // 儲かると示す（18語）
      profit: {
        principle: "none",
        words: [
          "reward",
          "big earnings",
          "profit",
          "earn",
          "income",
          "investment",
          "returns",
          "double your",
          "triple your",
          "報酬",
          "収益",
          "利益",
          "儲かる",
          "稼げる",
          "副業",
          "投資",
          "配当",
          "リターン"
        ]
      },
      // 確実だと請け合う（6語）
      guarantee: {
        principle: "commitment",
        words: [
          "guaranteed",
          "risk-free",
          "確実",
          "保証",
          "必ず",
          "リスクなし"
        ]
      },
      // 金額を見せる（6語）
      money: {
        principle: "none",
        words: [
          "cash",
          "money",
          "現金",
          "お金",
          "100万円",
          "高額"
        ]
      }
    }
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
