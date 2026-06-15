# Feed Processing Scripts - Documentation

Complete pipeline for fetching, cleaning, and preparing RSS feeds for AI processing with minimal token usage.

---

## 📁 Scripts Overview

### 1. **rss-fetcher.js** - RSS Feed Fetcher
Fetches and parses RSS/Atom feeds from OPML configuration.

**Features:**
- Parses OPML feed lists
- Supports both RSS 2.0 and Atom formats
- Filters by time window (default 24 hours)
- Caching to avoid redundant fetches (1-hour cache)
- Concurrent fetching with rate limiting

**Usage:**
```bash
node rss-fetcher.js [--hours=24] [--output=feeds.json] [--no-cache]

# Examples:
node rss-fetcher.js --hours=24 --output=feeds.json
node rss-fetcher.js --hours=48 --no-cache
```

**Output:** JSON file with raw feed data

---

### 2. **content-cleaner.js** - Article Content Cleaner
Extracts and cleans article content, removing HTML/ads/boilerplate.

**Features:**
- HTML stripping and entity decoding
- Mozilla Readability integration for main content extraction
- Optional full-article fetching from URLs
- Token estimation for AI processing
- AI-optimized summary generation

**Usage:**
```bash
node content-cleaner.js <input.json> <output.json> [--fetch-full] [--max-per-feed=10]

# Examples:
node content-cleaner.js feeds.json articles.json
node content-cleaner.js feeds.json articles.json --fetch-full
node content-cleaner.js feeds.json articles.json --max-per-feed=5
```

**Output:** JSON file with cleaned, AI-ready articles

---

### 3. **process-feeds.js** - Complete Pipeline Orchestrator
End-to-end pipeline: fetch → clean → deduplicate → score → format.

**Features:**
- Complete automated pipeline
- Article scoring/ranking by importance
- Deduplication against headline tracker
- Multiple output formats (compact, structured, markdown)
- Statistics generation
- Automatic headline tracker updates

**Usage:**
```bash
node process-feeds.js [options]

Options:
  --hours=24              Time window for articles (default: 24)
  --max-articles=25       Max articles to select (default: 25)
  --fetch-full           Fetch full article content from URLs
  --format=compact       Output format: compact|structured|markdown
  --no-tracker           Don't save to headline tracker

# Examples:
node process-feeds.js --hours=24 --max-articles=20
node process-feeds.js --hours=48 --format=markdown
node process-feeds.js --fetch-full --max-articles=15
```

**Outputs:**
- `base/.output/feeds-raw-YYYY-MM-DD.json` - Raw feed data
- `base/.output/articles-cleaned-YYYY-MM-DD.json` - Cleaned articles
- `base/.output/articles-selected-YYYY-MM-DD.json` - Top scored articles
- `base/.output/ai-ready-YYYY-MM-DD.txt` - AI-ready formatted text
- `base/.output/stats-YYYY-MM-DD.json` - Statistics
- `base/.output/duplicates-YYYY-MM-DD.json` - Duplicate tracking

---

### 4. **headline-tracker.js** - Deduplication System
Tracks headlines from last 7 days to prevent duplicates.

**Usage:**
```bash
node headline-tracker.js <command> [args]

Commands:
  add "Title" [date]       Add headline to tracker
  check "Title" [thresh]   Check if headline is duplicate
  cleanup                  Remove headlines older than 7 days
  list [days]             List recent headlines
  stats                   Show tracker statistics

# Examples:
node headline-tracker.js add "OpenAI Releases GPT-5" "2026-06-15"
node headline-tracker.js check "OpenAI launches GPT-5"
node headline-tracker.js cleanup
node headline-tracker.js list 7
```

---

### 5. **test-pipeline.js** - Test & Validation
Quick test to validate entire pipeline without saving.

**Usage:**
```bash
node test-pipeline.js
```

**Tests:**
- RSS feed fetching (6-hour window)
- Content cleaning and extraction
- Deduplication checks
- Token estimation
- Content quality validation
- Sample output preview

---

## 📦 Installation

### 1. Install Dependencies
```bash
cd base/
npm install
```

**Required packages:**
- `xml2js` - XML/RSS parsing
- `jsdom` - DOM manipulation
- `@mozilla/readability` - Content extraction

### 2. Verify Setup
```bash
npm test
# or
node test-pipeline.js
```

---

## 🚀 Quick Start

### Basic Workflow

```bash
# 1. Test the pipeline first
npm test

# 2. Run full processing
npm run process

# 3. Check outputs
ls -lh .output/
cat .output/ai-ready-$(date +%Y-%m-%d).txt
```

### NPM Scripts

```bash
# Fetch only
npm run fetch

# Clean only (requires feeds.json)
npm run clean

# Full pipeline
npm run process

# Full pipeline with article fetching
npm run process-full

# Test mode
npm test
```

---

## 📊 Output Formats

### 1. Compact Format (Default)
**Best for: AI processing with minimal tokens**

```
[1]
OpenAI Announces GPT-5 with Revolutionary Reasoning Capabilities
(OpenAI, 2026-06-15)
OpenAI today unveiled GPT-5, featuring breakthrough reasoning capabilities...
URL: https://openai.com/blog/gpt-5

---

[2]
...
```

**Token efficiency:** ~150-250 tokens per article

### 2. Structured Format
**Best for: Programmatic processing**

```json
[
  {
    "title": "OpenAI Announces GPT-5...",
    "date": "2026-06-15T10:00:00Z",
    "source": "OpenAI",
    "category": "AI labs (primary sources)",
    "summary": "OpenAI today unveiled...",
    "link": "https://...",
    "author": "Sam Altman",
    "score": 45
  }
]
```

### 3. Markdown Format
**Best for: Human reading**

```markdown
## 1. OpenAI Announces GPT-5 with Revolutionary Reasoning Capabilities

**Source:** OpenAI | **Date:** 6/15/2026 | **Category:** AI labs

OpenAI today unveiled GPT-5, featuring breakthrough reasoning...

**Link:** https://openai.com/blog/gpt-5
**Score:** 45
```

---

## 🎯 Article Scoring System

Articles are scored based on:

### Recency (0-10 points)
- < 6 hours: +10
- < 12 hours: +5
- < 18 hours: +2

### Content Length (0-5 points)
- > 300 words: +5
- > 150 words: +3
- > 100 words: +1

### Source Reputation (0-15 points)
- Primary sources (OpenAI, DeepMind, etc.): +15
- Other sources: 0

### Category Weighting (0-10 points)
- AI labs: +10
- AI research: +8
- Compute/Hardware: +6
- Security: +5
- Industry analysis: +5
- General: +3

### Keywords (0-20+ points)
Important terms: breakthrough, release, announce, funding, model, etc.
- In title: +2 per keyword
- In summary: +1 per keyword

**Total score range:** 0-60+

---

## 🔧 Configuration

### Time Window
Control how far back to fetch articles:
```bash
--hours=24   # Last 24 hours (default)
--hours=48   # Last 2 days
--hours=6    # Last 6 hours
```

### Article Limits
Control number of articles:
```bash
--max-articles=25    # Select top 25 (default)
--max-articles=15    # Select top 15
--max-per-feed=10    # Max 10 per feed during cleaning
```

### Deduplication
Adjust similarity threshold:
```javascript
// In headline-tracker.js
const threshold = 0.7; // 70% similarity = duplicate

// In process-feeds.js
deduplicationThreshold: 0.7 // Adjustable
```

### Caching
RSS fetcher caches for 1 hour:
```bash
--no-cache   # Force fresh fetch
```

Cache location: `base/.cache/`

---

## 📈 Statistics Output

**Example stats.json:**
```json
{
  "total": 25,
  "duplicates": 12,
  "byCategory": {
    "AI labs (primary sources)": 8,
    "AI research / applied": 7,
    "General / firehose": 5,
    "Security": 3,
    "Compute / hardware": 2
  },
  "bySource": {
    "OpenAI": 3,
    "Hacker News (best)": 8,
    "TechCrunch": 5,
    ...
  },
  "totalTokens": 4250,
  "avgScore": 28.5,
  "scoreRange": {
    "min": 12,
    "max": 48
  }
}
```

---

## 🛠️ Troubleshooting

### No articles found
```bash
# Try wider time window
node process-feeds.js --hours=48

# Check specific feeds
node rss-fetcher.js --hours=24
```

### Too many duplicates
```bash
# Clear headline tracker
rm headlines.json
echo '{"headlines":[]}' > headlines.json

# Or adjust threshold
# Edit process-feeds.js: deduplicationThreshold: 0.8
```

### Fetch errors
```bash
# Clear cache and retry
rm -rf .cache/
node process-feeds.js --no-cache
```

### Token count too high
```bash
# Reduce article count
node process-feeds.js --max-articles=15

# Or use more aggressive cleaning
# Edit content-cleaner.js: maxLength in truncateText()
```

---

## 🔄 Daily Workflow (For Hermes)

**Recommended cron schedule (6:00 AM daily):**

```bash
#!/bin/bash
cd /path/to/nishant-digest/base

# Run pipeline
node process-feeds.js \
  --hours=24 \
  --max-articles=25 \
  --format=compact

# Output will be in:
# .output/ai-ready-$(date +%Y-%m-%d).txt
```

**Integration with Hermes:**
1. Run pipeline to generate AI-ready text
2. Hermes reads `.output/ai-ready-YYYY-MM-DD.txt`
3. Hermes selects 15-25 highest quality articles
4. Hermes generates digest JSON
5. Hermes runs `generate-digest.js` to create HTML

---

## 📂 File Structure

```
base/
├── feeds.opml                    # RSS feed configuration
├── rss-fetcher.js               # Fetch RSS feeds
├── content-cleaner.js           # Clean article content
├── process-feeds.js             # Complete pipeline
├── headline-tracker.js          # Deduplication tracker
├── headlines.json               # Headline database
├── test-pipeline.js             # Test script
├── package.json                 # npm configuration
├── .gitignore                   # Git ignore rules
├── .cache/                      # Feed cache (git-ignored)
│   └── *.json
└── .output/                     # Processing outputs (git-ignored)
    ├── feeds-raw-*.json
    ├── articles-cleaned-*.json
    ├── articles-selected-*.json
    ├── ai-ready-*.txt
    ├── stats-*.json
    └── duplicates-*.json
```

---

## 💡 Tips & Best Practices

### 1. Token Optimization
- Use `--format=compact` for minimal tokens
- Limit to 15-20 articles if context window is tight
- Articles avg 150-250 tokens in compact format
- 25 articles ≈ 4,000-6,000 tokens

### 2. Content Quality
- Higher scored articles = better content
- Primary sources (OpenAI, DeepMind) score highest
- Recency matters - fetch frequently
- Run cleanup daily to remove old headlines

### 3. Performance
- Cache speeds up repeated fetches (1hr validity)
- Concurrent fetching (5 feeds at a time)
- Don't use `--fetch-full` unless necessary (slow)
- Test mode uses 6-hour window for speed

### 4. Monitoring
- Check `stats.json` for feed health
- Review `duplicates.json` for dedup effectiveness
- Monitor token counts in statistics
- Verify category distribution

---

## 🐛 Known Limitations

1. **RSS Feed Reliability**
   - Some feeds may be slow or unavailable
   - arXiv feed can be large (many papers daily)
   - Cache helps but not perfect

2. **Content Extraction**
   - Readability works best on standard article formats
   - Some sites block scrapers
   - Paywalled content returns limited text

3. **Token Estimation**
   - Rough approximation (4 chars = 1 token)
   - Actual tokens may vary by 10-20%
   - Good enough for planning

4. **Deduplication**
   - 70% threshold may miss near-duplicates
   - Or flag false positives if too aggressive
   - Adjust based on results

---

## 📞 Support

For issues or questions:
1. Run test mode: `npm test`
2. Check logs in console output
3. Review `.output/stats-*.json`
4. Examine individual output files

---

## 🔮 Future Enhancements

Potential improvements:
- [ ] Parallel full-article fetching
- [ ] ML-based article scoring
- [ ] Automatic category detection
- [ ] Summary quality scoring
- [ ] Multi-language support
- [ ] Image extraction
- [ ] Author reputation scoring
- [ ] Trend detection across articles

---

**Ready to process feeds!** 🚀

Start with: `npm test` then `npm run process`
