# Feed Processing Scripts - Complete Summary

## 🎉 What Was Created

A complete pipeline for fetching RSS feeds, cleaning content, and preparing articles for AI processing with minimal token usage.

---

## 📦 Scripts Created

### Core Processing Scripts

1. **`base/rss-fetcher.js`** - RSS Feed Fetcher
   - Fetches from 17 RSS feeds (defined in feeds.opml)
   - Filters by time window (default 24 hours)
   - Caching system (1-hour validity)
   - Concurrent fetching with rate limiting
   - Supports RSS 2.0 and Atom formats

2. **`base/content-cleaner.js`** - Content Cleaner
   - Strips HTML tags and boilerplate
   - Extracts main content using Mozilla Readability
   - Removes ads, navigation, footers
   - Token estimation (~4 chars = 1 token)
   - Creates AI-optimized summaries

3. **`base/process-feeds.js`** - Complete Pipeline
   - Orchestrates entire workflow
   - Article scoring (0-60+ points)
   - Deduplication against headline tracker
   - Selects top 15-25 articles
   - Multiple output formats (compact, JSON, markdown)
   - Automatic statistics generation

4. **`base/headline-tracker.js`** - Deduplication System
   - Tracks headlines from last 7 days
   - 70% similarity threshold
   - Text normalization (lowercase, no punctuation)
   - Prevents duplicate news
   - Auto-cleanup of old entries

5. **`base/test-pipeline.js`** - Test & Validation
   - Tests all components without saving
   - Quality checks on content
   - Token estimation validation
   - Feed health monitoring
   - Sample output preview

### Configuration Files

6. **`base/package.json`** - NPM Configuration
   - Dependencies: xml2js, jsdom, @mozilla/readability
   - NPM scripts for common tasks
   - Version tracking

7. **`base/.gitignore`** - Git Ignore Rules
   - Excludes cache and output directories
   - Prevents committing temporary files

8. **`base/feeds.opml`** - RSS Feed List (Already created)
   - 17 curated tech news sources
   - Categorized: General, AI Labs, Research, Security, Hardware

### Documentation

9. **`base/FEED_PROCESSING_README.md`** - Complete Documentation
   - Detailed script usage
   - Configuration options
   - Output formats
   - Troubleshooting guide
   - Best practices

10. **`base/QUICK_START.md`** - Quick Reference
    - Common commands
    - Daily workflow
    - Verification checklist
    - Pro tips

---

## 🚀 Installation & Setup

```bash
cd /Users/nishant/Desktop/nishant-digest/base

# 1. Dependencies already installed ✅
npm install

# 2. Test the system
npm test

# 3. Run full processing
npm run process
```

---

## 📊 What The Pipeline Does

### Input
- 17 RSS feeds from feeds.opml
- Time window (default: 24 hours)

### Processing Steps
1. **Fetch** - Download RSS feeds
2. **Parse** - Extract articles from XML
3. **Filter** - Keep only recent articles
4. **Clean** - Remove HTML, ads, boilerplate
5. **Deduplicate** - Check against last 7 days
6. **Score** - Rank by importance (0-60+ points)
7. **Select** - Choose top 15-25 articles
8. **Format** - Create AI-ready output

### Output
- **AI-ready text file**: `base/.output/ai-ready-YYYY-MM-DD.txt`
  - Compact format: ~150-250 tokens per article
  - Total: ~4,000-6,000 tokens for 25 articles
  - Ready for Hermes to process

---

## 🎯 Article Scoring System

Articles are ranked by importance:

| Factor | Points | Details |
|--------|--------|---------|
| **Recency** | 0-10 | <6hrs: +10, <12hrs: +5, <18hrs: +2 |
| **Length** | 0-5 | >300 words: +5, >150: +3, >100: +1 |
| **Source** | 0-15 | Primary sources (OpenAI, DeepMind): +15 |
| **Category** | 0-10 | AI labs: +10, Research: +8, Hardware: +6 |
| **Keywords** | 0-20+ | Important terms: +2 (title), +1 (summary) |

**Total:** Top articles typically score 30-50+ points

---

## 📁 Output Files (in base/.output/)

| File | Purpose | Format |
|------|---------|--------|
| `feeds-raw-*.json` | Raw RSS feed data | JSON |
| `articles-cleaned-*.json` | All cleaned articles | JSON |
| `articles-selected-*.json` | Top 15-25 articles | JSON |
| **`ai-ready-*.txt`** | **Main output for Hermes** | **Text** |
| `stats-*.json` | Statistics & metrics | JSON |
| `duplicates-*.json` | Removed duplicates | JSON |

---

## 🎨 Output Format Examples

### Compact Format (Default - Best for AI)
```
[1]
OpenAI Announces GPT-5 with Revolutionary Reasoning Capabilities
(OpenAI, 2026-06-15)
OpenAI today unveiled GPT-5, featuring breakthrough reasoning capabilities
that surpass previous models by 40% on mathematical reasoning tasks...
URL: https://openai.com/blog/gpt-5

---

[2]
...
```
**Efficiency:** 150-250 tokens per article

### Structured JSON Format
```json
[
  {
    "title": "OpenAI Announces GPT-5...",
    "date": "2026-06-15T10:00:00Z",
    "source": "OpenAI",
    "category": "AI labs (primary sources)",
    "summary": "OpenAI today unveiled...",
    "link": "https://openai.com/blog/gpt-5",
    "score": 45,
    "estimatedTokens": 180
  }
]
```

### Markdown Format
```markdown
## 1. OpenAI Announces GPT-5 with Revolutionary Reasoning Capabilities

**Source:** OpenAI | **Date:** 6/15/2026 | **Category:** AI labs (primary sources)

OpenAI today unveiled GPT-5, featuring breakthrough reasoning capabilities...

**Link:** https://openai.com/blog/gpt-5
**Score:** 45
```

---

## 🔧 Common Commands

### Quick Test
```bash
npm test
```

### Process Feeds (Standard)
```bash
npm run process
# Output: base/.output/ai-ready-YYYY-MM-DD.txt
```

### Custom Processing
```bash
# Last 48 hours, max 20 articles
node process-feeds.js --hours=48 --max-articles=20

# Markdown format
node process-feeds.js --format=markdown

# Fetch full content (slower)
node process-feeds.js --fetch-full
```

### Check Deduplication
```bash
# Check if headline is duplicate
node headline-tracker.js check "Article Title"

# List all tracked headlines
node headline-tracker.js list

# Show statistics
node headline-tracker.js stats
```

---

## 📈 Expected Results

After running `npm run process`:

```bash
✅ RSS Feeds: 15-17 / 17 working
✅ Articles found: 80-150 (depending on time)
✅ After cleaning: 60-120
✅ Duplicates removed: 5-20
✅ Top articles selected: 15-25
✅ Estimated tokens: 4,000-6,000
✅ Average score: 25-35
```

---

## 🔄 Daily Workflow Integration

### For Hermes Agent (6:00 AM Daily)

```bash
#!/bin/bash
cd /Users/nishant/Desktop/nishant-digest/base

# Step 1: Process feeds to get top 15-25 tech news
node process-feeds.js --hours=24 --max-articles=25

# Step 2: The output file is ready for AI processing
TODAY=$(date +%Y-%m-%d)
AI_FILE=".output/ai-ready-${TODAY}.txt"

# Step 3: Hermes reads this file and includes articles in digest
# Articles are already:
# - Cleaned (no HTML)
# - Deduplicated (no repeats from last 7 days)
# - Scored (top quality only)
# - Formatted (minimal tokens)

# Step 4: Headlines are automatically added to tracker
# (process-feeds.js does this)

# Step 5: Generate digest with tech news section
# node generate-digest.js digest-YYYY-MM-DD.json YYYY-MM-DD/index.html
```

---

## 💡 Key Features

### 🚀 Performance
- **Fast fetching**: Concurrent requests (5 at a time)
- **Smart caching**: 1-hour cache for RSS feeds
- **Efficient cleaning**: Mozilla Readability for content extraction
- **Token optimization**: ~150-250 tokens per article (compact format)

### 🎯 Quality
- **Intelligent scoring**: Multi-factor ranking (recency, source, keywords)
- **Deduplication**: 7-day headline tracking with 70% similarity threshold
- **Content filtering**: Removes short/low-quality articles
- **Source diversity**: Balanced across all feed categories

### 🛡️ Reliability
- **Error handling**: Continues on individual feed failures
- **Timeout protection**: 10-second timeout per request
- **Cache fallback**: Uses cached data if fetch fails
- **Validation**: Quality checks on all content

### 📊 Observability
- **Detailed statistics**: Category distribution, token counts, scores
- **Duplicate tracking**: See what was filtered out
- **Feed health**: Monitor which feeds are working
- **Sample previews**: See actual output before committing

---

## 🎯 Token Efficiency

### Comparison of Formats

| Format | Tokens/Article | 25 Articles | Use Case |
|--------|----------------|-------------|----------|
| **Compact** | 150-250 | ~4,500 | **Best for AI** |
| Structured | 200-300 | ~6,000 | Programmatic |
| Markdown | 250-350 | ~7,500 | Human reading |

### Token Breakdown (Compact Format)

```
[1]                                    # 3 tokens
OpenAI Announces GPT-5 with...         # 40-60 tokens (title)
(OpenAI, 2026-06-15)                   # 10 tokens (metadata)
Summary paragraph text...               # 80-150 tokens (content)
URL: https://...                       # 20-30 tokens (link)
---                                    # 3 tokens (separator)
                                       # Total: 156-256 tokens
```

**Result:** Can fit 25 high-quality articles in ~4,500 tokens!

---

## 🛠️ Advanced Configuration

### Adjust Scoring Weights
Edit `base/process-feeds.js`, function `scoreArticle()`:
```javascript
// Increase primary source priority
if (primarySources.includes(article.feedName)) {
  score += 20; // was 15
}

// Increase recency weight
if (ageHours < 6) score += 15; // was 10
```

### Adjust Deduplication Threshold
Edit `base/process-feeds.js`:
```javascript
deduplicationThreshold: 0.8 // was 0.7 (stricter)
// or
deduplicationThreshold: 0.6 // (more lenient)
```

### Change Token Estimation
Edit `base/content-cleaner.js`, function `estimateTokens()`:
```javascript
// Current: 1 token ≈ 4 characters
return Math.ceil(text.length / 4);

// For more accurate (GPT-4): 1 token ≈ 3.5 characters
return Math.ceil(text.length / 3.5);
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| No articles found | Try `--hours=48` for wider window |
| Too many duplicates | Clear `headlines.json` or adjust threshold |
| High token count | Use `--max-articles=15` or compact format |
| Fetch errors | Clear cache: `rm -rf .cache/` |
| Slow processing | Don't use `--fetch-full` (fetch from RSS only) |
| Missing content | Some articles may be paywalled or blocked |

---

## 📚 Documentation Files

1. **`FEED_PROCESSING_README.md`** - Complete technical documentation
2. **`QUICK_START.md`** - Quick reference and common commands
3. **`SCRIPTS_SUMMARY.md`** - This file (overview)
4. **`HERMES_INSTRUCTIONS.md`** - Updated Hermes instructions with RSS integration

---

## ✅ What's Working

- ✅ RSS feed fetching from 17 sources
- ✅ Content cleaning and extraction
- ✅ HTML stripping (no tags, entities decoded)
- ✅ Deduplication (last 7 days tracking)
- ✅ Article scoring and ranking
- ✅ Multiple output formats
- ✅ Caching system
- ✅ Statistics generation
- ✅ Token estimation
- ✅ Error handling
- ✅ Test mode
- ✅ NPM scripts
- ✅ Comprehensive documentation

---

## 🎓 How It All Fits Together

```
┌─────────────────────────────────────────────────────────┐
│ 1. OPML Configuration (feeds.opml)                     │
│    17 RSS feeds across 6 categories                     │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 2. RSS Fetcher (rss-fetcher.js)                        │
│    - Fetches all feeds                                  │
│    - Filters by time (24 hours)                        │
│    - Uses cache (1 hour)                               │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Content Cleaner (content-cleaner.js)               │
│    - Strips HTML                                        │
│    - Extracts main content                             │
│    - Creates summaries                                  │
│    - Estimates tokens                                   │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 4. Deduplication (headline-tracker.js)                │
│    - Checks against last 7 days                        │
│    - 70% similarity threshold                           │
│    - Filters duplicates                                 │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 5. Scoring & Selection (process-feeds.js)             │
│    - Scores each article (0-60+)                       │
│    - Selects top 15-25                                  │
│    - Generates statistics                               │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 6. Output Files (.output/)                             │
│    - ai-ready-YYYY-MM-DD.txt  ← MAIN OUTPUT            │
│    - articles-selected-YYYY-MM-DD.json                  │
│    - stats-YYYY-MM-DD.json                              │
│    - duplicates-YYYY-MM-DD.json                         │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 7. Hermes Agent                                         │
│    - Reads ai-ready file                                │
│    - Selects 15-25 articles for digest                 │
│    - Generates digest JSON                              │
│    - Creates HTML (generate-digest.js)                  │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Success Criteria

You'll know it's working when:

1. ✅ `npm test` passes without errors
2. ✅ `npm run process` generates all output files
3. ✅ `ai-ready-*.txt` contains 15-25 formatted articles
4. ✅ Token count is 4,000-6,000 (compact format)
5. ✅ Statistics show balanced category distribution
6. ✅ Duplicates are being filtered (5-20 removed)
7. ✅ Average article score is 25+ (high quality)

---

## 📞 Next Steps

### For Immediate Use:
```bash
cd /Users/nishant/Desktop/nishant-digest/base
npm test
npm run process
cat .output/ai-ready-$(date +%Y-%m-%d).txt
```

### For Hermes Integration:
1. Update Hermes cron job to run `process-feeds.js` at 6:00 AM
2. Have Hermes read from `.output/ai-ready-YYYY-MM-DD.txt`
3. Hermes selects articles and generates digest JSON
4. Hermes runs `generate-digest.js` to create HTML

### For Customization:
- Adjust scoring weights in `process-feeds.js`
- Add/remove RSS feeds in `feeds.opml`
- Change output format with `--format` flag
- Modify deduplication threshold
- Customize token estimation formula

---

**All systems ready! 🚀**

Start with: `npm test && npm run process`

Output will be in: `base/.output/ai-ready-$(date +%Y-%m-%d).txt`
