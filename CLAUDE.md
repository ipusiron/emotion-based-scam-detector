# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Emotion-Based Scam Detector is a client-side browser tool that analyzes text (emails, chat messages) for emotionally charged language commonly used in phishing and scam messages. It detects words in three categories:

- Emergency (緊急性): urgency that removes time to think — "urgent", "immediately", "至急", "24時間以内"
- Fear (恐怖): threatened loss — "penalty", "police", "罰金", "利用停止"
- Greed (欲望): promised gain — "reward", "free", "報酬", "当選"

The tool highlights detected words with color-coded spans, draws a radar chart, and assigns a risk level (極小/低/中/高).

There are no runtime dependencies. No CDN, no npm packages, no bundler. Everything the page loads comes from this repository.

## Architecture

Scripts are plain (non-module) so the page also works when opened with `file://`. Each file assigns one global.

| File | Global | Role |
|---|---|---|
| `index.html` | — | Page structure. Loads the scripts in order, `script.js` last |
| `style.css` | — | Colors as CSS variables in `:root`, overridden under `prefers-color-scheme: dark` |
| `script.js` | — | DOM wiring only: reads input, updates the view, no analysis logic |
| `js/scam-core.js` | `ScamCore` | Matching and scoring. Never touches the DOM |
| `js/radar.js` | `ScamRadar` | Radar chart. Vertex math is separate from drawing |
| `js/messages.js` | `ScamMessages` | Every user-facing string, keyed, in `ja` and `en`. `script.js` holds no Japanese literals |
| `js/dictionary.js` | `SCAM_DICTIONARY` | Built-in copy of the dictionary, used under `file://` |
| `js/principles.js` | `SCAM_PRINCIPLES` | Built-in copy of the tactic groups, used under `file://` |
| `js/samples.js` | `SCAM_SAMPLES` | The 14 preset messages as `{kind, text}`; `kind` is `scam` or `legit` |
| `data/dictionary.json` | — | The dictionary people edit. Fetched when served over HTTP |
| `data/principles.json` | — | 14 tactic groups, each mapped to a Cialdini principle. Fetched the same way |

### Interface language

`index.html` carries no visible text. Every string is pulled in at load time from `data-i18n`,
`data-i18n-placeholder`, `data-i18n-label` and `data-i18n-optgroup` attributes. The only exception
is `<noscript>`, which is written out in both languages because JavaScript cannot fill it.

The language is resolved as `?lang=` → the saved choice in `localStorage` → `navigator.language`,
falling back to Japanese. Switching re-applies the translations and re-renders the stored result,
so the numbers on screen do not change when the language does.

`test/i18n.test.js` asserts the `ja` and `en` key sets are identical, that no Japanese is left in
the English table (apart from the language button), that every `data-i18n` key exists, and that
`README.md` and `README.en.md` have the same heading structure.

### Tactic groups and persuasion principles

Every dictionary term belongs to exactly one group in `data/principles.json`, and every group
carries one of `ScamCore.PRINCIPLES` (Cialdini's six) or `'none'`. `validatePrinciples` rejects a
table that leaves a term out, assigns one twice, or uses an unknown principle, so the two files
cannot drift apart.

`analyze(text, dictionary, principles)` takes the table as an optional third argument. Without it
the result is byte-for-byte what the first two phases produced, which is how the older tests still
pass. With it, each span gains `group` and `principle`, and the result gains `groups` and
`principles` breakdowns.

`highlightHtml` renders a term as a `<button>` when its group is known and as a `<span>` otherwise,
so the page never grows tab stops that lead nowhere.

The current dictionary has no term for social proof. That gap is asserted in
`test/principles.test.js` on purpose: if someone adds such a term, the test fails and points at the
README passage that has to change with it.

### Legitimate samples

Five of the presets are legitimate notices. Analysing one shows a panel explaining that legitimate
messages use the same words; it disappears as soon as the text is edited. Two of them reach medium
risk and two score almost nothing, which is the point of including them.

### Dictionary loading

`script.js` fetches `data/dictionary.json` when the page is served over HTTP. Under `file://` it skips the fetch (it would only produce a console error) and uses `SCAM_DICTIONARY`, showing a notice. If neither validates, the analyze button is disabled — the tool never scores with an empty dictionary.

`test/dictionary.test.js` asserts the JSON and the built-in copy are identical. Edit both when adding words.

## Development

### Running locally

```bash
python -m http.server 8000
# then visit http://localhost:8000
```

Opening `index.html` directly also works, with the built-in dictionary.

### Tests

```bash
npm test
```

Node.js 22 or newer, no dependencies. `test/load.js` reads the plain scripts with `vm.runInThisContext`, so tests see the same globals the page does.

GitHub Actions runs `npm test` on push and pull request.

### Modifying detection keywords

Edit `data/dictionary.json` and `js/dictionary.js` together, then update the word counts in `README.md`, `README.en.md` and `test/dictionary.test.js`.

Adding a category also requires: a weight list of the same length in `TOTAL_WEIGHTS` (`js/scam-core.js`), the category in `CATEGORIES` (`script.js`), label and hint keys in both languages in `js/messages.js`, and the legend plus a score row in `index.html`. The radar adapts to the number of axes on its own.

## Key Implementation Details

### Matching (`js/scam-core.js`)

`buildEntries` sorts the dictionary longest-first with a deterministic tie-break. `findSpans` scans the text once, taking the longest match at each position and skipping past it, so spans never overlap and no position is counted twice.

Word boundaries are required only on the side where the dictionary word ends in an ASCII alphanumeric character. This is why `24時間以内` matches mid-sentence while `now` does not match inside `known`.

### Scoring

```
raw      = distinct words + 0.5 × (occurrences − distinct words)
category = min(10, round(raw × 2))          // 5 distinct words reach the cap
total    = round(10 × (0.6×s1 + 0.3×s2 + 0.1×s3))   // s sorted descending
```

Thresholds: 高リスク ≥ 70, 中リスク ≥ 40, 低リスク ≥ 15, otherwise 極小リスク.

The total weights the strongest emotions rather than averaging, because real scams lean on two emotions rather than three. `test/samples.test.js` pins the resulting score of each preset; those values also appear in `README.md`.

### Highlighting

`highlightHtml` escapes the whole text first, then wraps the matched ranges. Input markup can never reach the DOM as markup.

### Radar chart

`ScamRadar.points` returns the polygon vertices and `ScamRadar.viewBox` the viewBox for a given axis count; both are pure and tested. Colors come from CSS classes, so dark mode needs no JavaScript.

## Constraints

- Do not add dependencies, a CDN, a bundler, or ES module syntax (`file://` must keep working).
- Do not put user-facing strings in `script.js` or `index.html`; add them to `js/messages.js` in both languages and reference them with `data-i18n`.
- Do not let `README.md` and `README.en.md` drift apart in structure; `test/i18n.test.js` compares their headings.
- Do not add a term to `data/dictionary.json` without placing it in a group in `data/principles.json` (and both built-in copies); the tests fail otherwise.
- Do not write color literals outside the `:root` blocks in `style.css`; `test/contrast.test.js` enforces this and the 4.5:1 ratio in both themes.
- Do not add inline event handlers or `style` attributes; the CSP has no `'unsafe-inline'`.
- Keep the long-vowel notation (ブラウザー, サーバー, ディレクトリー) and no space between Japanese and alphanumerics; `test/format.test.js` checks this.

## Deployment

Static hosting (GitHub Pages, Netlify). Demo: https://ipusiron.github.io/emotion-based-scam-detector/

Part of the "生成AIで作るセキュリティツール100" (100 Security Tools with Generative AI) project.
