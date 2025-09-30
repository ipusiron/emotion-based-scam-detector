# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Emotion-Based Scam Detector** is a client-side browser tool that analyzes text (emails, chat messages) for emotionally charged language commonly used in phishing and scam messages. It detects keywords related to three emotional triggers:

- **Emergency** (緊急性): Urgent language like "urgent", "immediately", "asap", "至急"
- **Fear** (恐怖): Fear-inducing terms like "penalty", "police", "lawsuit", "罰金"
- **Greed** (欲望): Enticing phrases like "reward", "free", "prize", "報酬"

The tool highlights detected words with color-coded spans and assigns a risk level (Low/Medium/High) based on the number of matches.

## Architecture

This is a simple static web application with no server-side processing:

- **index.html**: Page structure with textarea input, analyze button, and results display area
- **style.css**: Styling including category-specific highlight colors (yellow for emergency, red for fear, green for greed)
- **script.js**: Core analysis logic that:
  1. Fetches `dictionary.json` on page load
  2. Analyzes text using regex patterns with word boundaries (`\b`)
  3. Highlights matches with `<span class="highlight {category}">`
  4. Calculates risk score: Low (0 matches), Medium (1-3 matches), High (>3 matches)
- **dictionary.json**: Keyword dictionary organized by category (emergency/fear/greed) with both English and Japanese terms

## Development

### Running locally
```bash
# Open directly in browser
start index.html

# Or use a local server
python -m http.server 8000
# Then visit http://localhost:8000
```

### Testing
No automated test suite. Manual testing by:
1. Pasting sample scam/phishing messages into the textarea
2. Verifying correct highlighting and risk level calculation

### Modifying detection keywords
Edit `dictionary.json` to add/remove keywords. Changes are loaded on page refresh. The structure is:
```json
{
  "category_name": ["keyword1", "keyword2", ...]
}
```

To add new categories, update both `dictionary.json` and the legend in `index.html`.

## Key Implementation Details

- **Case-insensitive matching**: Uses lowercase text copy for detection (`text.toLowerCase()`)
- **Word boundary matching**: Regex uses `\b` to avoid partial matches
- **Risk scoring**: Simple count-based (script.js:61-65)
- **Privacy**: All processing happens in-browser; no data is sent externally
- **Offline capable**: Once loaded, works without internet (static files only)

## Deployment

Designed for static hosting (GitHub Pages, Netlify). The demo is hosted at:
https://ipusiron.github.io/emotion-based-scam-detector/

Part of the "生成AIで作るセキュリティツール100" (100 Security Tools with Generative AI) project.