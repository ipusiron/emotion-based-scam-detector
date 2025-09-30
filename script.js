let dictionary = {};

// Sample messages for testing
const sampleMessages = {
  phishing_jp: `【重要】アカウント確認のお願い

お客様各位

至急ご確認ください。
お客様のアカウントに不正なアクセスが検知されました。
アカウント停止を回避するため、今すぐ以下のリンクから本人確認を行ってください。

24時間以内に対応がない場合、アカウントは一時停止され、罰金が発生する可能性があります。

今すぐ確認する: https://example.com/verify

※このメールは緊急を要します。`,

  romance_jp: `こんにちは

突然のメッセージ失礼します。
あなたのプロフィールを見て、ぜひお話ししたいと思いました。

実は私は海外で投資の仕事をしていて、今とても成功しています。
あなたにも大きな報酬を得られるチャンスをお教えしたいです。

限定的なオファーで、今だけ無料で始められます。
一緒に素敵な未来を築きませんか？

すぐに返信してくださいね。`,

  investment_jp: `🎉当選おめでとうございます🎉

あなたが特別に選ばれました！

今だけの限定オファーで、月収100万円以上の収益が確実に得られる投資案件にご招待します。

【特典】
✅ 無料コンサルティング
✅ 初回ボーナス10万円プレゼント
✅ 成功者続出の実績

このチャンスを逃すと二度と参加できません。
重要なお知らせです。今すぐ下記URLをクリック！

※至急お返事ください`,

  delivery_jp: `【配送業者】荷物配達のお知らせ

お荷物をお届けに伺いましたが、ご不在でした。

24時間以内に再配達のご依頼がない場合、荷物は返送されます。
保管期限が本日限りとなっておりますので、至急以下のURLより再配達をご依頼ください。

https://example.com/redelivery

※このメッセージに速やかにご対応いただけない場合、追加の保管料金が発生する可能性があります。

重要：今すぐご確認ください。`,

  tax_jp: `【国税庁】未納税金に関する重要なお知らせ

重要な通知

お客様の税金に未納が確認されました。
このまま放置すると法的措置を取らざるを得ません。

差し押さえを回避するため、本日中に以下の連絡先までご連絡ください。

連絡先：03-XXXX-XXXX
※緊急の案件につき、速やかな対応をお願いします。

未対応の場合、訴訟手続きに入ります。`,

  support_jp: `【緊急】カスタマーサポートからの重要通知

お客様

異常なアクティビティが検知されたため、アカウントを一時保留しております。

利用停止を解除するには、以下の情報を至急ご確認ください：
・本人確認書類
・クレジットカード情報

24時間以内にご対応いただけない場合、永久停止となり、違反金が課せられる可能性があります。

今すぐ確認：https://example.com/support

カスタマーサポートチーム`,

  lottery_jp: `【当選通知】高額賞金が当たりました！

おめでとうございます！

あなたが今月の特別抽選で当選しました！
賞金：500万円

受け取りには本日中の手続きが必要です。
このチャンスは今だけ！先着10名様限定の特典もご用意しております。

完全無料で受け取れますので、今すぐ以下のフォームからお申し込みください。

※期限を過ぎると受取権利は失効します。
至急お手続きください。`,

  job_jp: `【副業案内】月収50万円確実に稼げます

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

https://example.com/job`,

  phishing_en: `URGENT: Account Security Alert

Dear Valued Customer,

We have detected suspicious activity on your account. Immediate action is required to prevent account suspension.

Your account will be permanently closed and you may face penalties if you do not verify your identity now.

Click here immediately: https://example.com/verify

This is an important security warning. You have 24 hours to respond or face legal consequences.

Act now to claim your account and avoid fines.

Security Team`
};

/**
 * Fetch the dictionary of trigger words from dictionary.json and
 * set up the click handler for the analyze button.
 */
document.addEventListener('DOMContentLoaded', () => {
  fetch('data/dictionary.json')
    .then(response => {
      if (!response.ok) throw new Error('Failed to load dictionary');
      return response.json();
    })
    .then(data => {
      dictionary = data;
    })
    .catch(err => {
      console.error(err);
    });

  const analyzeBtn = document.getElementById('analyzeBtn');
  analyzeBtn.addEventListener('click', analyze);

  const clearBtn = document.getElementById('clearBtn');
  clearBtn.addEventListener('click', clearInput);

  // Set up preset select handler
  const presetSelect = document.getElementById('presetSelect');
  presetSelect.addEventListener('change', (e) => {
    const sampleKey = e.target.value;
    if (sampleKey) {
      loadSample(sampleKey);
    }
  });

  // Set up accordion toggle
  const accordionToggle = document.getElementById('safetyTipsToggle');
  const accordionContent = document.getElementById('safetyTipsContent');
  accordionToggle.addEventListener('click', () => {
    accordionToggle.classList.toggle('active');
    accordionContent.classList.toggle('active');
  });
});

let radarChartInstance = null;

/**
 * Analyze the input text for scam-related emotional triggers.
 */
function analyze() {
  const inputEl = document.getElementById('inputText');
  const resultEl = document.getElementById('result');
  const text = inputEl.value;

  // Show result section once analysis is invoked
  resultEl.hidden = false;

  // Copy of the original text for highlighting
  let highlighted = text;
  // Count of detected words by category
  const categoryCount = {
    emergency: 0,
    fear: 0,
    greed: 0
  };

  // Lowercase version for detection
  const lower = text.toLowerCase();

  // Iterate through categories and words
  Object.keys(dictionary).forEach(category => {
    dictionary[category].forEach(word => {
      // Use word boundary only for words containing ASCII letters/numbers
      const hasAscii = /[a-zA-Z0-9]/.test(word);
      const escapedWord = escapeRegExp(word.toLowerCase());
      const pattern = hasAscii ? '\\b' + escapedWord + '\\b' : escapedWord;
      const regex = new RegExp(pattern, 'gi');

      if (regex.test(lower)) {
        // Increase category count
        categoryCount[category]++;
        // Highlight matches in the original text (XSS-safe)
        highlighted = highlighted.replace(regex, match => {
          // Escape HTML to prevent XSS
          const safeMatch = escapeHtml(match);
          const safeCategory = escapeHtml(category);
          return `<span class="highlight ${safeCategory}">${safeMatch}</span>`;
        });
      }
    });
  });

  // Calculate scores (max 10 per category, scaled to 100 for total)
  const emergencyScore = Math.min(categoryCount.emergency * 2, 10);
  const fearScore = Math.min(categoryCount.fear * 2, 10);
  const greedScore = Math.min(categoryCount.greed * 2, 10);
  const totalScore = Math.round((emergencyScore + fearScore + greedScore) / 30 * 100);

  // Determine risk level
  let riskLabel, riskClass, assessmentText;
  if (totalScore >= 70) {
    riskLabel = '高リスク';
    riskClass = 'high';
    assessmentText = 'このメッセージは詐欺の可能性が非常に高いです。絶対にリンクをクリックせず、送信元に直接確認してください。';
  } else if (totalScore >= 40) {
    riskLabel = '中リスク';
    riskClass = 'medium';
    assessmentText = 'このメッセージには注意が必要です。送信元の信頼性を慎重に確認してください。';
  } else if (totalScore >= 15) {
    riskLabel = '低リスク';
    riskClass = 'low';
    assessmentText = 'このメッセージは比較的安全ですが、念のため送信元を確認することをお勧めします。';
  } else {
    riskLabel = '極小リスク';
    riskClass = 'very-low';
    assessmentText = '感情的なトリガーワードはほとんど検出されませんでした。';
  }

  // Update UI
  document.getElementById('totalScore').textContent = totalScore;
  document.getElementById('riskBadge').textContent = riskLabel;
  document.getElementById('riskBadge').className = `assessment-badge ${riskClass}`;
  document.getElementById('assessmentText').textContent = assessmentText;

  // Update category scores
  document.getElementById('emergencyScore').textContent = emergencyScore;
  document.getElementById('fearScore').textContent = greedScore;
  document.getElementById('greedScore').textContent = greedScore;
  document.getElementById('emergencyBar').style.width = `${emergencyScore * 10}%`;
  document.getElementById('fearBar').style.width = `${fearScore * 10}%`;
  document.getElementById('greedBar').style.width = `${greedScore * 10}%`;

  // Update highlighted text
  document.getElementById('highlightedText').innerHTML = highlighted || '<em>テキストが入力されていません。</em>';

  // Create or update radar chart
  createRadarChart(emergencyScore, fearScore, greedScore);
}

/**
 * Create radar chart visualization
 */
function createRadarChart(emergencyScore, fearScore, greedScore) {
  const ctx = document.getElementById('radarChart');

  // Destroy existing chart if it exists
  if (radarChartInstance) {
    radarChartInstance.destroy();
  }

  radarChartInstance = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['緊急性', '恐怖', '欲望'],
      datasets: [
        {
          label: 'しきい値 (警戒ライン)',
          data: [6, 6, 6],
          backgroundColor: 'rgba(255, 99, 132, 0.1)',
          borderColor: 'rgba(255, 99, 132, 0.5)',
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 0
        },
        {
          label: '検出スコア',
          data: [emergencyScore, fearScore, greedScore],
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(54, 162, 235, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(54, 162, 235, 1)'
        }
      ]
    },
    options: {
      scales: {
        r: {
          beginAtZero: true,
          max: 10,
          ticks: {
            stepSize: 2,
            font: {
              size: 11
            }
          },
          pointLabels: {
            font: {
              size: 13,
              weight: 'bold'
            }
          }
        }
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font: {
              size: 11
            },
            padding: 10
          }
        }
      },
      maintainAspectRatio: true,
      responsive: true
    }
  });
}

/**
 * Load a sample message into the textarea.
 * @param {string} sampleKey - Key of the sample message to load
 */
function loadSample(sampleKey) {
  const inputEl = document.getElementById('inputText');
  const presetSelect = document.getElementById('presetSelect');
  if (sampleMessages[sampleKey]) {
    inputEl.value = sampleMessages[sampleKey];
    // Hide previous results when loading a new sample
    document.getElementById('result').hidden = true;
    // Reset select to default after loading
    setTimeout(() => {
      presetSelect.value = '';
    }, 100);
  }
}

/**
 * Clear the input textarea and hide results.
 */
function clearInput() {
  document.getElementById('inputText').value = '';
  document.getElementById('result').hidden = true;
}

/**
 * Escape HTML special characters to prevent XSS.
 * @param {string} text
 * @returns {string}
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Escape special regex characters in a string.
 * @param {string} string
 * @returns {string}
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}