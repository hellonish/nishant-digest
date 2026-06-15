# RSS Feed Processing System - Complete Guide

## 🎯 Overview

This system automatically fetches, cleans, and prepares 15-25 tech news articles daily for AI processing with minimal token usage.

**Key Features:**
- ✅ Fetches from 17 curated RSS feeds
- ✅ Filters to last 24 hours only
- ✅ Deduplicates against last 7 days
- ✅ Scores articles by importance (0-60+)
- ✅ Selects top 15-25 articles
- ✅ Token-optimized output (~4,500 tokens for 25 articles)
- ✅ Ready for Hermes Agent to process

---

## 🚀 Quick Start (3 Steps)

```bash
# 1. Navigate to base directory
cd /Users/nishant/Desktop/nishant-digest/base

# 2. Test the system
npm test

# 3. Run daily processing
./daily-feed-update.sh
```

**Output:** `base/.output/ai-ready-YYYY-MM-DD.txt`

---

## 📁 File Structure

```
nishant-digest/
├── base/
│   ├── feeds.opml                      # RSS feed configuration (17 sources)
│   ├── rss-fetcher.js                  # Fetch RSS feeds
│   ├── content-cleaner.js              # Clean article content
│   ├── process-feeds.js                # Complete pipeline
│   ├── headline-tracker.js             # Deduplication system
│   ├── headlines.json                  # Headline database (last 7 days)
│   ├── test-pipeline.js                # Test script
│   ├── daily-feed-update.sh            # Daily wrapper script
│   ├── package.json                    # NPM config
│   ├── .cache/                         # Feed cache (1 hour)
│   ├── .output/                        # Processing outputs
│   │   ├── ai-ready-YYYY-MM-DD.txt     ⭐ MAIN OUTPUT
│   │   ├── articles-selected-*.json
│   │   ├── stats-*.json
│   │   └── duplicates-*.json
│   ├── FEED_PROCESSING_README.md       # Complete documentation
│   └── QUICK_START.md                  # Quick reference
├── SCRIPTS_SUMMARY.md                  # System overview
└── RSS_PROCESSING_GUIDE.md             # This file
```

---

## 🔄 How It Works

### 1. RSS Feed Sources (feeds.opml)

**17 Curated Sources:**

| Category | Sources |
|----------|---------|
| **General** | Hacker News, Ars Technica, The Verge, TechCrunch |
| **AI Labs** | OpenAI, DeepMind, Hugging Face, BAIR, Microsoft Research |
| **Research** | arXiv, Interconnects, Latent Space, Ahead of AI, Simon Willison |
| **Hardware** | SemiAnalysis, IEEE Spectrum |
| **Security** | Krebs, The Hacker News |
| **Analysis** | Platformer, MIT Tech Review |

### 2. Processing Pipeline

```
RSS Feeds (17 sources)
    ↓
Fetch (rss-fetcher.js)
    ↓ Filters: Last 24 hours
Clean (content-cleaner.js)
    ↓ Removes: HTML, ads, boilerplate
Deduplicate (headline-tracker.js)
    ↓ Checks: Last 7 days, 70% similarity
Score (process-feeds.js)
    ↓ Ranks: 0-60+ points based on importance
Select Top 15-25
    ↓
Format for AI (compact text)
    ↓
Output: ai-ready-YYYY-MM-DD.txt
```

### 3. Article Scoring

**Multi-factor ranking (0-60+ points):**

- **Recency**: <6 hrs (+10), <12 hrs (+5), <18 hrs (+2)
- **Length**: >300 words (+5), >150 (+3), >100 (+1)
- **Source**: Primary sources like OpenAI, DeepMind (+15)
- **Category**: AI labs (+10), Research (+8), Hardware (+6)
- **Keywords**: "breakthrough", "release", "model", etc. (+2-20)

### 4. Deduplication

- Tracks headlines from last 7 days
- 70% similarity threshold (configurable)
- Normalizes text (lowercase, removes punctuation)
- Prevents duplicate news in digest

### 5. Token Optimization

**Compact format uses ~150-250 tokens per article:**

```
[1]
OpenAI Announces GPT-5 with Revolutionary Reasoning
(OpenAI, 2026-06-15)
Summary text here...
URL: https://openai.com/blog/gpt-5
```

**Result:** 25 articles ≈ 4,500 tokens (fits easily in context window!)

---

## 🎮 Usage

### Daily Processing (Recommended)

```bash
cd base/
./daily-feed-update.sh
```

**Output:** `base/.output/ai-ready-YYYY-MM-DD.txt`

### Custom Processing

```bash
# Last 48 hours, max 20 articles
./daily-feed-update.sh 48 20

# Or use node directly:
node process-feeds.js --hours=48 --max-articles=20
```

### Test Mode (No Saving)

```bash
npm test
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

## 📊 Sample Output

### ai-ready-YYYY-MM-DD.txt (Main Output)

```
[1]
OpenAI Announces GPT-5 with Revolutionary Reasoning Capabilities
(OpenAI, 2026-06-15)
OpenAI today unveiled GPT-5, featuring breakthrough reasoning capabilities that surpass previous models by 40% on mathematical reasoning tasks. The model introduces a new "Chain-of-Thought" architecture that explicitly models step-by-step problem solving. Initial benchmarks show 95% accuracy on MATH dataset and 89% on competition-level problems. Pricing: $15/M input tokens, $75/M output tokens.
URL: https://openai.com/blog/gpt-5

---

[2]
Google DeepMind Achieves Protein Folding Accuracy Breakthrough
(Google DeepMind, 2026-06-15)
AlphaFold 4 demonstrates 99.7% accuracy on CASP16 benchmark, improving over AlphaFold 3 by 2.3 percentage points. The model now predicts protein complexes with ligands and post-translational modifications with near-experimental accuracy. Released as open source with weights and inference code available on GitHub.
URL: https://deepmind.google/blog/alphafold-4

---

[3]
...
```

### stats-YYYY-MM-DD.json

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
  "totalTokens": 4250,
  "avgScore": 28.5,
  "scoreRange": {
    "min": 12,
    "max": 48
  }
}
```

---

## 🔧 Configuration

### Time Window

```bash
./daily-feed-update.sh 24    # Last 24 hours (default)
./daily-feed-update.sh 48    # Last 48 hours
./daily-feed-update.sh 6     # Last 6 hours
```

### Article Count

```bash
./daily-feed-update.sh 24 15    # Max 15 articles
./daily-feed-update.sh 24 25    # Max 25 articles (default)
./daily-feed-update.sh 24 50    # Max 50 articles
```

### Output Format

```bash
# Compact (default, best for AI)
node process-feeds.js --format=compact

# Structured JSON
node process-feeds.js --format=structured

# Markdown (human-readable)
node process-feeds.js --format=markdown
```

---

## 🤖 Integration with Hermes Agent

### Daily Cron Job (6:00 AM)

```bash
#!/bin/bash
# Run at 6:00 AM daily

cd /Users/nishant/Desktop/nishant-digest/base

# Step 1: Process feeds
./daily-feed-update.sh 24 25

# Step 2: Hermes reads the output
TODAY=$(date +%Y-%m-%d)
AI_FILE=".output/ai-ready-${TODAY}.txt"

# Step 3: Hermes generates digest JSON with tech news section
# (Articles are already cleaned, deduplicated, and scored)

# Step 4: Generate HTML
# node generate-digest.js digest-${TODAY}.json ${TODAY}/index.html

# Step 5: Commit and push
# git add . && git commit -m "Daily digest ${TODAY}" && git push
```

### What Hermes Receives

**Input file:** `base/.output/ai-ready-YYYY-MM-DD.txt`

**Contains:**
- 15-25 high-quality tech articles
- Clean text (no HTML)
- Already deduplicated (no repeats from last 7 days)
- Sorted by importance score
- Token-optimized format (~4,500 tokens total)

**Hermes Task:**
1. Read the ai-ready file
2. Select 15-25 articles to include in tech news section
3. Generate digest JSON with `theme: "modern-news"`
4. Create HTML with `generate-digest.js`

---

## 📈 Success Metrics

After running `./daily-feed-update.sh`:

```
✅ RSS Feeds: 15-17 / 17 working
✅ Articles found: 80-150
✅ Duplicates removed: 5-20
✅ Articles selected: 15-25
✅ Tokens: 4,000-6,000
✅ Average score: 25-35
✅ Category distribution: Balanced across all sources
```

---

## 🛠️ Troubleshooting

| Problem | Solution |
|---------|----------|
| **No articles found** | Try wider window: `./daily-feed-update.sh 48` |
| **Too many duplicates** | Clear tracker: `rm headlines.json && echo '{"headlines":[]}' > headlines.json` |
| **High token count** | Reduce articles: `./daily-feed-update.sh 24 15` |
| **Fetch errors** | Clear cache: `rm -rf .cache/` |
| **Missing dependencies** | Run: `npm install` |

---

## 📚 Documentation

- **`base/FEED_PROCESSING_README.md`** - Complete technical documentation
- **`base/QUICK_START.md`** - Quick reference commands
- **`SCRIPTS_SUMMARY.md`** - System overview and architecture
- **`RSS_PROCESSING_GUIDE.md`** - This file

---

## 💡 Pro Tips

1. **Run test mode first** - Always test before processing: `npm test`
2. **Check statistics** - Review `stats-*.json` for quality metrics
3. **Monitor duplicates** - Check `duplicates-*.json` for dedup effectiveness
4. **Use caching** - Speeds up development (auto-enabled, 1 hour validity)
5. **Compact format** - Uses 40% fewer tokens than markdown
6. **Primary sources** - Score highest (OpenAI, DeepMind, etc.)
7. **Daily cleanup** - Headline tracker auto-cleans old entries

---

## 🎯 Expected Results

### Normal Day (Active News Cycle)

```
Feeds working: 16-17 / 17
Articles found: 100-150
After cleaning: 80-120
Duplicates: 5-15
Selected: 25
Tokens: 5,000-6,000
Avg score: 28-35
```

### Quiet Day (Weekend/Holiday)

```
Feeds working: 15-17 / 17
Articles found: 30-60
After cleaning: 25-50
Duplicates: 2-8
Selected: 15-20
Tokens: 3,000-4,500
Avg score: 22-28
```

---

## 🔮 Advanced Features

### Add Custom RSS Feed

Edit `base/feeds.opml`:

```xml
<outline text="Custom Category" title="Custom Category">
  <outline type="rss"
           text="New Feed"
           title="New Feed"
           xmlUrl="https://example.com/feed.xml"
           htmlUrl="https://example.com"/>
</outline>
```

### Adjust Scoring Algorithm

Edit `base/process-feeds.js`, function `scoreArticle()`:

```javascript
// Increase weight for specific keywords
if (titleLower.includes('quantum')) score += 10;

// Boost specific sources
if (article.feedName === 'arXiv') score += 5;
```

### Change Deduplication Threshold

Edit `base/process-feeds.js`:

```javascript
deduplicationThreshold: 0.8  // Stricter (fewer false positives)
// or
deduplicationThreshold: 0.6  // Lenient (more false positives)
```

---

## 🎓 How to Read the Output

### ai-ready-YYYY-MM-DD.txt Structure

```
[Article Number]
Article Title
(Source, Date)
Summary paragraph...
URL: https://...

---  (separator)
```

### Token Breakdown

```
[1]                              3 tokens
OpenAI Announces GPT-5...       50 tokens (title)
(OpenAI, 2026-06-15)           10 tokens (metadata)
Summary text...                120 tokens (content)
URL: https://...                25 tokens (link)
---                              3 tokens (separator)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total per article:             ~210 tokens
```

**25 articles × 210 tokens ≈ 5,250 tokens**

---

## ✅ Validation Checklist

Before using output:

- ✅ Check article count: 15-25
- ✅ Check token estimate: 4,000-6,000
- ✅ Verify recency: Most from last 24 hours
- ✅ Review duplicates: 5-20 removed
- ✅ Check category balance: Not all from one source
- ✅ Validate links: All URLs present
- ✅ Score quality: Average 25+

---

## 🚨 Important Notes

1. **First Run**: Takes longer (no cache), subsequent runs are faster
2. **Deduplication**: Tracks headlines for 7 days, auto-cleanup daily
3. **Caching**: RSS feeds cached for 1 hour, use `--no-cache` to force refresh
4. **Token Estimation**: Approximate (±10-20%), good enough for planning
5. **Fetch Errors**: Some feeds may timeout, system continues processing others
6. **Content Quality**: Paywalled articles may have limited content

---

## 🎉 You're All Set!

### To get started:

```bash
cd /Users/nishant/Desktop/nishant-digest/base
npm test
./daily-feed-update.sh
cat .output/ai-ready-$(date +%Y-%m-%d).txt
```

### For daily automation:

Add to crontab:
```cron
0 6 * * * cd /Users/nishant/Desktop/nishant-digest/base && ./daily-feed-update.sh >> logs/feed-processing.log 2>&1
```

---

**Questions?** Check the documentation in `base/FEED_PROCESSING_README.md`

**Ready to process feeds!** 🚀
