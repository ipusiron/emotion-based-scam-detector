# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Emotion-Based Scam Detector** is a client-side browser tool that analyzes text (emails, chat messages) for emotionally charged language commonly used in phishing and scam messages. It detects keywords related to three emotional triggers:

- **Emergency** (緊急性): Urgent language like "urgent", "immediately", "asap", "至急"
- **Fear** (恐怖): Fear-inducing terms like "penalty", "police", "lawsuit", "罰金"
- **Greed** (欲望): Enticing phrases like "reward", "free", "prize", "報酬"

The tool highlights detected words with color-coded spans, displays a radar chart visualization, and assigns a risk level (極小/低/中/高) based on calculated scores.

## Architecture

This is a static web application with no server-side processing:

- **index.html**: Page structure with textarea input, preset selector, analyze button, results display (radar chart, progress bars, highlighted text), and accordion-based safety tips
- **style.css**: Styling including category-specific highlight colors (yellow for emergency, red for fear, green for greed)
- **script.js**: Core analysis logic including:
  - Fetching `data/dictionary.json` on page load
  - Text analysis using regex patterns (word boundaries for ASCII, direct match for Japanese)
  - Score calculation: each category 0-10 (count × 2, capped at 10), total 0-100
  - Chart.js radar chart visualization
  - 9 preset sample messages (Japanese/English phishing, delivery, tax, investment, lottery, job, romance scams)
- **data/dictionary.json**: Keyword dictionary (169 words) organized by category with both English and Japanese terms

## Development

### Running locally
```bash
# Open directly in browser
start index.html

# Or use a local server (required for fetch to work in some browsers)
python -m http.server 8000
# Then visit http://localhost:8000
```

### Modifying detection keywords
Edit `data/dictionary.json` to add/remove keywords. Changes are loaded on page refresh. Structure:
```json
{
  "emergency": ["keyword1", ...],
  "fear": ["keyword1", ...],
  "greed": ["keyword1", ...]
}
```

**Note**: Adding new categories requires updates to both `script.js` (categoryCount object, radar chart labels) and `index.html` (legend, progress bars).

## Key Implementation Details

- **Risk scoring** (script.js:232-255): Category scores = min(count × 2, 10), total = (sum / 30) × 100
  - 極小リスク: < 15
  - 低リスク: 15-39
  - 中リスク: 40-69
  - 高リスク: ≥ 70
- **Word boundary handling** (script.js:212-215): Uses `\b` regex boundaries only for words containing ASCII characters; Japanese words match directly
- **XSS prevention**: `escapeHtml()` function sanitizes user input before DOM insertion
- **Security headers**: CSP, X-Frame-Options, X-Content-Type-Options, SRI for Chart.js CDN

## Deployment

Designed for static hosting (GitHub Pages, Netlify). Demo: https://ipusiron.github.io/emotion-based-scam-detector/

Part of the "生成AIで作るセキュリティツール100" (100 Security Tools with Generative AI) project.
