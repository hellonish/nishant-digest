# Instructions for Hermes Agent
**Daily Digest Generation System - Updated 2026-06-15**

## Overview
Generate a daily digest with 4 distinct pages, each with optimized themes. Output JSON following the schema in `base/digest-schema.json`, then convert to HTML using `base/generate-digest.js`.

---

## New Structure (4 Pages)

### **Page 1: Tech News & Blogs** (Modern News Theme)
- 15-25 tech news articles from the last 24 hours
- Use RSS feeds from `base/feeds.opml`
- Modern newspaper layout (bpando.org-inspired)
- **Theme**: `modern-news`

### **Page 2: Physics Digest** (Vintage Scholar Theme)
- 1 topic from different physics branches (rotating)
- Branches: Quantum, Thermodynamics, Classical, Astronomical, Particle, etc.
- Academic textbook aesthetic
- **Theme**: `vintage-scholar`

### **Page 3: Math Digest** (Vintage Scholar Theme)
- Interesting math topics with visual/video resources
- Include YouTube videos from 3Blue1Brown, Numberphile, etc.
- Technical but engaging summaries
- **Theme**: `vintage-scholar`

### **Page 4: Random Topic** (Claude Theme)
- Rotating topics: AI, Math, Physics, ML, Business, Finance
- In-depth exploration of interesting subjects
- **Theme**: `claude`

---

## RSS Feed Management

### Feed Sources (base/feeds.opml)
```
General/Firehose:
- Hacker News (best)
- Ars Technica
- The Verge
- TechCrunch

Compute/Hardware:
- SemiAnalysis
- IEEE Spectrum

Security:
- Krebs on Security
- The Hacker News

Industry Analysis:
- Platformer
- MIT Technology Review

AI Labs (Primary):
- OpenAI
- Google DeepMind
- Hugging Face
- BAIR (Berkeley)
- Microsoft Research

AI Research/Applied:
- arXiv CS (LG+AI+CL+RO)
- Interconnects (Nathan Lambert)
- Latent Space
- Ahead of AI (Sebastian Raschka)
- Simon Willison
```

### Article Selection Criteria
1. **Recency**: Only articles published in last 24 hours
2. **Impact**: High-impact news only (major announcements, breakthroughs, significant developments)
3. **Diversity**: Cover multiple categories (industry, research, security, hardware)
4. **Quality**: Well-sourced, substantial content (not clickbait)
5. **Uniqueness**: Check against last week's headlines (use deduplication)

---

## Headline Deduplication System

### Before Adding Any Article
```bash
# Check if headline is duplicate
node base/headline-tracker.js check "Article Title"

# If unique (exit code 0), add to tracker
node base/headline-tracker.js add "Article Title" "2026-06-15"

# Cleanup old headlines daily
node base/headline-tracker.js cleanup
```

### Deduplication Rules
- Headlines from last 7 days are tracked
- Similarity threshold: 70% (configurable)
- Normalization: lowercase, remove punctuation, trim whitespace
- Check before including any tech news article
- Only add headlines after confirming they'll be in the digest

### Workflow Integration
```bash
# 1. Fetch RSS feeds
# 2. Extract articles from last 24 hours
# 3. For each article:
#    - Check: node base/headline-tracker.js check "Title"
#    - If unique → include in digest
#    - If duplicate → skip
# 4. After generating digest:
#    - Add all included headlines to tracker
# 5. Run cleanup
```

---

## Page 1: Tech News (15-25 Articles)

### Structure
```json
{
  "date": "2026-06-15",
  "theme": "modern-news",
  "meta": {
    "wordCount": 4000,
    "readingMinutes": 16,
    "topicTeaser": "Today's tech landscape: AI breakthroughs, security developments, and industry shifts.",
    "dayOfWeek": "Monday"
  },
  "sections": [
    {
      "id": "tech-news",
      "type": "slate",
      "theme": "modern-news",
      "title": "Tech News & Industry Updates",
      "readingMinutes": 16,
      "content": [
        {
          "type": "news",
          "title": "Specific Headline from RSS Feed",
          "subtitle": "Source Name · Published Time",
          "body": [
            "Summary paragraph 1 with key details",
            "Summary paragraph 2 with implications"
          ],
          "keyTakeaway": "Most important technical or business insight",
          "sources": [
            {"label": "Original Source", "url": "...", "type": "article"}
          ],
          "tags": ["AI", "Security", "Hardware"]
        }
      ]
    }
  ]
}
```

### Content Requirements
- **15-25 articles** per day
- **Strictly last 24 hours** only
- **No duplicates** from last 7 days
- **High impact** news only
- **Diverse sources** across all feed categories
- **Balanced coverage**: 40% AI/ML, 30% industry/policy, 20% security/hardware, 10% other

### Writing Style for News
- **Headline**: Clear, specific, technical detail
- **Subtitle**: Source + timestamp
- **Body**: 2-3 paragraphs max
  - Paragraph 1: What happened, when, who
  - Paragraph 2: Technical details and implications
  - Paragraph 3 (optional): Context or analysis
- **Key Takeaway**: One-sentence highlight of most important point
- **Length**: 150-250 words per article

---

## Page 2: Physics Digest

### Topic Rotation (Daily)
- **Monday**: Quantum Mechanics
- **Tuesday**: Thermodynamics & Statistical Mechanics
- **Wednesday**: Classical Mechanics
- **Thursday**: Electromagnetism
- **Friday**: Astrophysics & Cosmology
- **Saturday**: Particle Physics
- **Sunday**: Special Topics (Relativity, Condensed Matter, etc.)

### Structure
```json
{
  "id": "physics",
  "type": "amber",
  "theme": "vintage-scholar",
  "title": "Physics — Quantum Entanglement",
  "readingMinutes": 8,
  "content": [
    {
      "type": "explanation",
      "title": "Understanding Quantum Entanglement",
      "body": [
        "Motivation: Why this phenomenon challenges classical intuition",
        "Historical context: EPR paradox and Bell's theorem",
        "Mathematical formulation: \\\\( |\\psi\\rangle = \\frac{1}{\\sqrt{2}}(|0\\rangle_A|1\\rangle_B - |1\\rangle_A|0\\rangle_B) \\\\)",
        "Physical interpretation and measurement",
        "Modern applications: quantum computing, cryptography",
        "Worked example with concrete calculations"
      ],
      "sources": [
        {"label": "Feynman Lectures Vol. III", "url": "...", "type": "article"},
        {"label": "Modern Quantum Mechanics - Sakurai", "url": "...", "type": "article"}
      ]
    }
  ]
}
```

### Requirements
- **One topic per day** from the assigned branch
- **Mathematical rigor** with LaTeX notation
- **Physical intuition** before formalism
- **Worked examples** with numbers
- **Historical context** when relevant
- **Modern applications**
- **Length**: 1000-1200 words

---

## Page 3: Math Digest (with Video Links)

### Content Sources
- **YouTube Channels**:
  - 3Blue1Brown
  - Numberphile
  - Mathologer
  - PBS Infinite Series
  - Numberphile2
  - Stand-up Maths
  - Reducible

### Structure with Video Links
```json
{
  "id": "math",
  "type": "amber",
  "theme": "vintage-scholar",
  "title": "Mathematics — Fourier Transforms",
  "readingMinutes": 10,
  "content": [
    {
      "type": "explanation",
      "title": "The Intuition Behind Fourier Transforms",
      "body": [
        "Hook: Why Fourier transforms are everywhere (audio, images, quantum mechanics)",
        "Core idea: Decomposing signals into frequency components",
        "Mathematical definition: \\\\( \\hat{f}(\\xi) = \\int_{-\\infty}^{\\infty} f(x) e^{-2\\pi i x \\xi} dx \\\\)",
        "Geometric intuition: rotating vectors and winding frequencies",
        "Practical applications and examples",
        "Connection to discrete Fourier transform (DFT) and FFT"
      ],
      "video": {
        "url": "https://www.youtube.com/watch?v=spUNpyF58BY",
        "title": "But what is the Fourier Transform? A visual introduction.",
        "channel": "3Blue1Brown",
        "duration": "20:45"
      },
      "sources": [
        {"label": "3Blue1Brown Video", "url": "...", "type": "video"},
        {"label": "Wikipedia - Fourier Transform", "url": "...", "type": "article"}
      ]
    }
  ]
}
```

### Topic Selection Strategy
1. **Search YouTube** for interesting math videos from approved channels
2. **Watch/Review** the video to understand the topic
3. **Write summary** that:
   - Complements the video (doesn't replace it)
   - Adds mathematical rigor
   - Provides worked examples
   - Creates curiosity to watch the video
4. **Include video metadata**: title, channel, duration, URL

### Requirements
- **One topic per day**
- **Must include YouTube video link** from approved channels
- **Technical but accessible** writing
- **Mathematical notation** with LaTeX
- **Worked examples** with step-by-step derivations
- **Visual descriptions** referencing video content
- **Length**: 1200-1500 words

### Video Integration Format
```json
"video": {
  "url": "https://www.youtube.com/watch?v=xxxxx",
  "title": "Full video title from YouTube",
  "channel": "3Blue1Brown",
  "duration": "15:42"
}
```

---

## Page 4: Random Interesting Topic

### Topic Rotation
- **Week 1**: Advanced AI/ML techniques
- **Week 2**: Mathematical concepts and proofs
- **Week 3**: Physics phenomena and theories
- **Week 4**: Business strategy and finance
- **Repeat**: Cycle through topics

### Structure
```json
{
  "id": "random-topic",
  "type": "green",
  "theme": "claude",
  "title": "Deep Dive — Transformer Architecture Evolution",
  "readingMinutes": 12,
  "content": [
    {
      "type": "topic-analysis",
      "title": "From Attention Is All You Need to Modern Variants",
      "body": [
        "Hook: Why transformers revolutionized deep learning",
        "Historical progression: 2017 to present",
        "Technical deep dive into key innovations",
        "Comparative analysis of variants",
        "Current state of the art",
        "Future directions and open problems"
      ],
      "sources": [...]
    }
  ]
}
```

### Requirements
- **One comprehensive topic** per day
- **In-depth analysis** (not surface level)
- **Multiple perspectives** and sources
- **Technical depth** appropriate to topic
- **Synthesis across sources**
- **Length**: 1500-2000 words

---

## Theme Selection Guide

### Modern News Theme (`modern-news`)
- **Use for**: Tech News page
- **Characteristics**:
  - High contrast, clean typography
  - Grid layout for articles
  - Newspaper/magazine aesthetic
  - Fast scanning, easy navigation
  - Inspired by bpando.org

### Vintage Scholar Theme (`vintage-scholar`)
- **Use for**: Physics and Math pages
- **Characteristics**:
  - Classic textbook aesthetic
  - Serif fonts, warm colors
  - Academic, scholarly feel
  - Optimized for deep reading
  - Mathematical notation emphasis

### Claude Theme (`claude`)
- **Use for**: Random Topic page, or as default
- **Characteristics**:
  - Warm, approachable design
  - Excellent readability
  - Balanced for long-form content
  - Orange accents, cream backgrounds

---

## JSON Schema Updates

### New Fields

#### Root Level
```json
{
  "theme": "modern-news" | "vintage-scholar" | "claude"
}
```

#### Section Level
```json
{
  "id": "tech-news" | "physics" | "math" | "random-topic" | "industry" | ...,
  "theme": "modern-news" | "vintage-scholar" | "claude" // optional override
}
```

#### Content Item Level
```json
{
  "video": {
    "url": "https://youtube.com/...",
    "title": "Video Title",
    "channel": "Channel Name",
    "duration": "MM:SS"
  },
  "sources": [
    {
      "label": "Source Name",
      "url": "https://...",
      "type": "article" | "video" | "paper" | "blog"
    }
  ]
}
```

---

## Generation Workflow (Updated)

### Daily Schedule (6:00-7:00 AM EST)

**6:00-6:20 AM: RSS Feed Processing**
```bash
# 1. Fetch all RSS feeds from base/feeds.opml
# 2. Filter articles from last 24 hours
# 3. Check each against headline tracker:
for article in articles:
  if node base/headline-tracker.js check "$article_title" (exit 0):
    include_article(article)

# 4. Select 15-25 highest impact articles
# 5. Add to JSON structure with theme="modern-news"
```

**6:20-6:30 AM: Physics Content**
```bash
# 1. Determine today's physics branch (day of week)
# 2. Select topic within that branch
# 3. Write comprehensive explanation
# 4. Add theme="vintage-scholar"
```

**6:30-6:45 AM: Math Content with Video**
```bash
# 1. Search YouTube channels for interesting math topic
# 2. Review video content
# 3. Write complementary explanation
# 4. Add video metadata to JSON
# 5. Add theme="vintage-scholar"
```

**6:45-6:52 AM: Random Topic**
```bash
# 1. Select topic based on week rotation
# 2. Write in-depth analysis
# 3. Add theme="claude"
```

**6:52-6:55 AM: Validation & Cleanup**
```bash
# 1. Validate JSON against schema
# 2. Check word counts and reading times
# 3. Verify all URLs are valid
# 4. Run headline tracker cleanup
node base/headline-tracker.js cleanup
```

**6:55-7:00 AM: Generate & Commit**
```bash
cd /path/to/nishant-digest
mkdir -p YYYY-MM-DD
node base/generate-digest.js digest-data.json YYYY-MM-DD/index.html

# Add all headlines to tracker
for headline in included_headlines:
  node base/headline-tracker.js add "$headline" "YYYY-MM-DD"

git add .
git commit -m "Daily digest YYYY-MM-DD: [summary]"
git push origin main
```

---

## Quality Checklist (Updated)

### Tech News Section
- ✅ 15-25 articles included
- ✅ All from last 24 hours
- ✅ No duplicates vs. last 7 days (verified with tracker)
- ✅ Diverse sources (all feed categories represented)
- ✅ High impact only (major announcements, breakthroughs)
- ✅ Clear headlines with technical details
- ✅ All source links valid
- ✅ Theme set to `modern-news`

### Physics Section
- ✅ Matches day-of-week rotation
- ✅ Mathematical rigor with LaTeX
- ✅ Physical intuition provided
- ✅ Worked example included
- ✅ Modern applications mentioned
- ✅ 1000-1200 words
- ✅ Theme set to `vintage-scholar`

### Math Section
- ✅ YouTube video link included
- ✅ Video from approved channel
- ✅ Video metadata complete (title, channel, duration)
- ✅ Summary complements video
- ✅ Mathematical notation with LaTeX
- ✅ Worked examples included
- ✅ 1200-1500 words
- ✅ Theme set to `vintage-scholar`

### Random Topic Section
- ✅ Matches week rotation
- ✅ In-depth analysis (not superficial)
- ✅ Multiple perspectives/sources
- ✅ Technical depth appropriate
- ✅ 1500-2000 words
- ✅ Theme set to `claude`

---

## Writing Style Requirements

### ✅ DO:
- Lead with insight, then support it
- Use specific numbers and mechanisms
- Define technical terms inline: "transformer (attention-based architecture)"
- Break complex ideas into 15-20 word sentences
- Use bold for emphasis: **Key result:**
- Create curiosity before satisfying it
- Include concrete examples with numbers
- Link to primary sources

### ❌ DON'T:
- Use vague qualifiers: "very", "quite", "somewhat"
- Write walls of text (max 4-5 sentences per paragraph)
- Hype or oversell: "AMAZING breakthrough"
- Assume knowledge without defining terms
- Use passive voice unless necessary
- Include articles older than 24 hours
- Duplicate headlines from last week
- Skip video links for math content

---

## Success Criteria

Nishant should finish reading feeling:
- **Informed** about today's tech developments (15-25 high-quality news items)
- **Educated** on physics and math concepts (with visual resources)
- **Inspired** to explore topics deeper (via YouTube videos)
- **Engaged** with diverse, high-quality content

The digest should:
- Cover all major tech news from last 24 hours
- Never repeat headlines from last week
- Include beautiful, topic-appropriate themes
- Provide both breadth (news) and depth (physics, math, random topic)
- Link to high-quality video resources for visual learning
- Feel like a premium, curated learning experience

---

## File Locations

- **Schema**: `base/digest-schema.json`
- **Generator**: `base/generate-digest.js`
- **RSS Feeds**: `base/feeds.opml`
- **Headline Tracker**: `base/headline-tracker.js`
- **Headlines DB**: `base/headlines.json`
- **Themes**:
  - Claude: `base/styles.css`
  - Modern News: `base/styles-modern-news.css`
  - Vintage Scholar: `base/styles-vintage-scholar.css`

---

## Example Daily Digest Structure

```json
{
  "date": "2026-06-15",
  "theme": "modern-news",
  "meta": {
    "wordCount": 5500,
    "readingMinutes": 22,
    "topicTeaser": "OpenAI's new multimodal breakthrough, quantum computing advances, and the mathematics of chaos theory.",
    "dayOfWeek": "Monday"
  },
  "sections": [
    {
      "id": "tech-news",
      "type": "slate",
      "theme": "modern-news",
      "title": "Tech News — June 15, 2026",
      "readingMinutes": 12,
      "content": [
        // 15-25 news articles from RSS feeds (last 24hrs, deduplicated)
      ]
    },
    {
      "id": "physics",
      "type": "amber",
      "theme": "vintage-scholar",
      "title": "Physics — Quantum Entanglement",
      "readingMinutes": 5,
      "content": [
        // One comprehensive physics topic
      ]
    },
    {
      "id": "math",
      "type": "amber",
      "theme": "vintage-scholar",
      "title": "Mathematics — Fourier Analysis",
      "readingMinutes": 6,
      "content": [
        // One math topic with YouTube video link
      ]
    },
    {
      "id": "random-topic",
      "type": "green",
      "theme": "claude",
      "title": "Deep Dive — Attention Mechanisms",
      "readingMinutes": 8,
      "content": [
        // One in-depth exploration
      ]
    }
  ]
}
```

---

## Remember

- **Recency**: Tech news must be from last 24 hours
- **Uniqueness**: Always check headline deduplication
- **Quality**: High-impact news only, not every article
- **Themes**: Match content type to appropriate visual theme
- **Videos**: Always include for math content
- **Depth**: Physics, math, and random topics should be comprehensive
- **Sources**: Always link to original sources
- **Validation**: Check against schema before generating HTML

Generate digestible, high-quality content that makes learning effortless and enjoyable.
