# Quick Start Guide - Feed Processing Scripts

## 🚀 Instant Setup (First Time)

```bash
cd /Users/nishant/Desktop/nishant-digest/base

# 1. Install dependencies (already done!)
npm install

# 2. Test the system
npm test

# 3. Run full processing
npm run process
```

---

## 📋 Common Commands

### Test Everything
```bash
npm test
```
**What it does:** Tests RSS fetching, cleaning, and deduplication without saving anything

---

### Process Feeds (Default: 24 hours, 25 articles)
```bash
npm run process
```
**Output:** `base/.output/ai-ready-YYYY-MM-DD.txt`

---

### Process with Custom Settings
```bash
# Last 48 hours, max 20 articles
node process-feeds.js --hours=48 --max-articles=20

# Markdown format instead of compact
node process-feeds.js --format=markdown

# Fetch full article content (slower but more complete)
node process-feeds.js --fetch-full
```

---

### Check Headline Deduplication
```bash
# Check if a headline is duplicate
node headline-tracker.js check "OpenAI Releases GPT-5"

# List all tracked headlines (last 7 days)
node headline-tracker.js list

# Show statistics
node headline-tracker.js stats

# Cleanup old headlines
node headline-tracker.js cleanup
```

---

### Fetch RSS Feeds Only
```bash
# Default: 24 hours
npm run fetch

# Custom time window
node rss-fetcher.js --hours=48 --output=my-feeds.json
```

---

## 📊 Understanding Outputs

After running `npm run process`, check these files:

```bash
cd .output/

# 1. AI-Ready Text (USE THIS FOR HERMES!)
cat ai-ready-$(date +%Y-%m-%d).txt

# 2. Statistics
cat stats-$(date +%Y-%m-%d).json

# 3. Selected Articles (Full JSON)
cat articles-selected-$(date +%Y-%m-%d).json

# 4. Duplicates Report
cat duplicates-$(date +%Y-%m-%d).json
```

---

## 🎯 Daily Workflow for Hermes Agent

### Morning Routine (6:00 AM)

```bash
#!/bin/bash
cd /Users/nishant/Desktop/nishant-digest/base

# Step 1: Process feeds (15-25 tech news articles)
node process-feeds.js --hours=24 --max-articles=25 --format=compact

# Step 2: Read the AI-ready file
TODAY=$(date +%Y-%m-%d)
AI_READY_FILE=".output/ai-ready-${TODAY}.txt"

# Step 3: Use this file as input for digest generation
# (Hermes reads this file and selects articles for the digest)

# Step 4: After generating digest, headlines are already tracked
# (process-feeds.js automatically adds them to headline-tracker)
```

### The AI-ready file looks like this:
```
[1]
OpenAI Announces GPT-5 with Breakthrough Reasoning
(OpenAI, 2026-06-15)
OpenAI today unveiled GPT-5, featuring unprecedented reasoning capabilities...
URL: https://openai.com/blog/gpt-5

---

[2]
DeepMind Achieves Protein Folding Accuracy Breakthrough
(Google DeepMind, 2026-06-15)
AlphaFold 4 demonstrates 99.7% accuracy on CASP16 benchmark...
URL: https://deepmind.google/blog/alphafold-4
```

**Total tokens:** ~4,000-6,000 for 25 articles (very efficient!)

---

## 🔍 Verification Checklist

After running the pipeline, verify:

### ✅ Check Article Count
```bash
jq '.totalArticles' .output/stats-$(date +%Y-%m-%d).json
# Should show 15-25
```

### ✅ Check Token Count
```bash
jq '.totalTokens' .output/stats-$(date +%Y-%m-%d).json
# Should be 3,000-8,000
```

### ✅ Check Duplicates
```bash
cat .output/duplicates-$(date +%Y-%m-%d).json | grep title
# Should show duplicates that were filtered out
```

### ✅ Check Category Distribution
```bash
jq '.byCategory' .output/stats-$(date +%Y-%m-%d).json
# Should show balanced distribution across categories
```

---

## 🛠️ Troubleshooting

### Problem: No articles found
**Solution:**
```bash
# Try wider time window
node process-feeds.js --hours=48

# Check RSS feeds directly
node rss-fetcher.js --hours=24
```

### Problem: Too many duplicates
**Solution:**
```bash
# Clear headline tracker
rm headlines.json
echo '{"headlines":[]}' > headlines.json
```

### Problem: Token count too high
**Solution:**
```bash
# Reduce article count
node process-feeds.js --max-articles=15
```

### Problem: Fetch errors
**Solution:**
```bash
# Clear cache and retry
rm -rf .cache/
node process-feeds.js
```

---

## 📈 Output Format Comparison

### Compact (Default) - Best for AI
```
[1] OpenAI Releases GPT-5 (OpenAI, 2026-06-15)
OpenAI unveiled...
URL: https://...
```
**Tokens per article:** ~150-250

### Structured (JSON)
```json
{"title": "...", "date": "...", "summary": "..."}
```
**Tokens per article:** ~200-300

### Markdown
```markdown
## 1. OpenAI Releases GPT-5
**Source:** OpenAI | **Date:** 6/15/2026
...
```
**Tokens per article:** ~250-350

---

## 🎛️ Configuration Options

### Time Windows
- `--hours=6` - Last 6 hours (breaking news)
- `--hours=24` - Last 24 hours (default, daily digest)
- `--hours=48` - Last 2 days (weekend catch-up)

### Article Selection
- `--max-articles=15` - Minimum viable digest
- `--max-articles=25` - Standard digest (default)
- `--max-articles=50` - Comprehensive digest

### Output Formats
- `--format=compact` - Minimal tokens (default)
- `--format=structured` - JSON for programmatic use
- `--format=markdown` - Human-readable

### Content Fetching
- (default) - Use RSS description only (fast)
- `--fetch-full` - Fetch full article from URL (slow but complete)

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `feeds.opml` | RSS feed configuration (17 sources) |
| `headlines.json` | Deduplication database (last 7 days) |
| `.cache/*.json` | Feed cache (1 hour validity) |
| `.output/ai-ready-*.txt` | **MAIN OUTPUT FOR HERMES** |
| `.output/stats-*.json` | Statistics and quality metrics |

---

## 💡 Pro Tips

1. **Run test mode first** every time you update feeds.opml
2. **Check statistics** to ensure balanced category coverage
3. **Monitor duplicates** - too many = adjust threshold, too few = increase threshold
4. **Cache is your friend** - speeds up development/testing
5. **Compact format** uses 40% fewer tokens than markdown
6. **Primary sources score highest** - prioritizes official announcements

---

## 🚨 Common Mistakes

❌ **Don't** run without testing first
✅ **Do** run `npm test` before full processing

❌ **Don't** ignore duplicate warnings
✅ **Do** review `duplicates-*.json` regularly

❌ **Don't** use `--fetch-full` for all articles (slow!)
✅ **Do** use RSS summaries for most, fetch-full only when needed

❌ **Don't** delete `headlines.json` frequently
✅ **Do** let it track last 7 days for proper deduplication

---

## 🎯 Success Metrics

After running the pipeline, you should see:

- ✅ **15-25 articles** selected
- ✅ **4,000-6,000 tokens** total (compact format)
- ✅ **5-15 duplicates** removed
- ✅ **Balanced categories** (not all from one source)
- ✅ **Recent articles** (90%+ from last 24 hours)
- ✅ **High average score** (25+ indicates quality selection)

---

**Ready to process!** 🚀

```bash
npm test && npm run process
```
