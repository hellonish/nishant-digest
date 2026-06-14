# Instructions for Hermes Agent
**Daily Digest Generation System**

## Overview
Generate a daily research digest optimized for learning, retention, and motivation. Output JSON following the schema in `base/digest-schema.json`, then convert to HTML using `base/generate-digest.js`.

---

## Psychological Design Principles

Your content must follow these evidence-based learning principles:

1. **Clarity over cleverness**: Simple, direct language. One idea per sentence for complex concepts.
2. **Context before details**: Explain WHY before HOW. Connect new info to existing knowledge.
3. **Progressive complexity**: High-level insight → technical detail → nuance. Reader can stop at any level.
4. **Active voice**: "Researchers developed X" not "X was developed"
5. **Concrete specifics**: Real numbers, mechanisms, names—not vague descriptions.

---

## Content Requirements

### **1. Industry News** (Blue section, ~5 min read)
- Major AI product launches, policy changes, company developments
- **Must include**: Specific technical details, business implications, concrete numbers
- **Sources**: TechCrunch, company blogs, press releases, The Verge
- **Example**: "Anthropic's Fable 5 uses safety routing—high-risk queries fall back to Claude Opus 4.8. Priced at $10/M input, $50/M output tokens."

### **2. Startup Signals** (Purple section, ~4 min read)
- Significant funding rounds ($100M+), novel business models
- **Must include**: Valuation, key technical differentiator, market thesis
- **Sources**: Crunchbase, PitchBook, TechCrunch
- **Example**: "Flourish raised $500M at $2.5B for brain-inspired Cortex AI—models cortical computation directly, contrarian bet vs transformer monoculture."

### **3. Research Review** (Teal section, ~5 min read)
- Recent papers (last 2-4 weeks) from arXiv, NeurIPS, ICML, CVPR, ACL, etc.
- **Must include**: Problem, technical approach, key quantitative result
- **Format**:
  ```
  Title
  Authors · Venue
  What problem? (1 sentence)
  How does it work? (1-2 sentences)
  Key result: [Specific numbers]
  arXiv link
  ```
- **Example**: "BitsMoE: 12.3× faster quantization, 27.83pp accuracy gain, 1.76× decoding speed vs GPTQ on Qwen3-30B"

### **4. Math & Physics** (Amber section, ~4 min read)
**Current**: Kernel Methods Track, Day 8 of 11

**Structure**:
1. Motivation (why care?)
2. Formal setup (definitions, notation with LaTeX: `\\(inline\\)` or `\\[display\\]`)
3. Key derivation (step-by-step)
4. Worked example (concrete numbers)
5. Preview next topic

**Requirements**:
- Build on previous day's content
- Balance rigor with intuition
- Include at least one worked numerical example
- Use consistent notation

### **5. ML Deep Dive** (Rose section, ~4 min read)
**Current**: Modern Deep Learning Theory, Day 8 of 11

**Structure**:
1. Classical understanding
2. Modern twist (how DL changes the story)
3. Formal definition
4. Key result or derivation
5. Practical implications

**Requirements**:
- Connect theory to practice
- Reference real papers that use the concept
- Explain failure modes
- Link to current research when possible

### **6. Today's Topic** (Green section, ~3 min read)
**Rotating themes**: AI Safety, Robotics, Healthcare AI, ML Systems, Scientific Computing, Vision/Multimodal, NLP

**Structure**:
1. Hook (why this topic now?)
2. Current landscape
3. Recent developments (this week)
4. Analysis (what does it mean?)
5. Open questions
6. Relevance to PGDR research (if applicable)

**Requirements**:
- Synthesize across industry news + research
- Identify trends and patterns
- Pose thought-provoking questions

---

## Writing Style Requirements

### ✅ DO:
- Lead with insight, then support it
- Use specific numbers and mechanisms
- Define technical terms inline: "kernel trick (implicit high-dim mapping)"
- Break complex ideas into 15-20 word sentences
- Use bold for emphasis: **Key result:**
- Create curiosity before satisfying it

### ❌ DON'T:
- Use vague qualifiers: "very", "quite", "somewhat"
- Write walls of text (max 4-5 sentences per paragraph)
- Hype or oversell: "AMAZING breakthrough"
- Assume knowledge without defining terms
- Use passive voice unless necessary

---

## Quality Checklist

Every content item must have:
- ✅ Clear value proposition (why this matters—first sentence)
- ✅ Progressive complexity (simple → detailed → nuanced)
- ✅ Concrete takeaways (specific numbers, mechanisms)
- ✅ Accurate technical content
- ✅ Credible sources with links

Every section must have:
- ✅ Strong opening (best item first)
- ✅ Logical flow (items build on each other)
- ✅ Balanced length (~600-800 words)

Digest overall must have:
- ✅ Engaging teaser (creates curiosity)
- ✅ Narrative coherence (themes connect)
- ✅ Total reading time: 16-20 minutes (~3500-4500 words)

---

## JSON Output Format

```json
{
  "date": "2026-06-14",
  "meta": {
    "wordCount": 3800,
    "readingMinutes": 18,
    "topicTeaser": "1-2 engaging sentences highlighting most interesting content. Creates curiosity.",
    "dayOfWeek": "Sunday"
  },
  "sections": [
    {
      "id": "industry",
      "type": "blue",
      "title": "Industry News",
      "readingMinutes": 5,
      "content": [
        {
          "type": "news",
          "title": "Specific, Clear Headline with Technical Detail",
          "body": [
            "First paragraph: What happened, when, who. Include concrete numbers.",
            "Second paragraph: Technical mechanism and business implications."
          ],
          "keyTakeaway": "Highlighted technical detail: 12× speedup on benchmark X.",
          "sources": [
            {"label": "TechCrunch", "url": "https://..."},
            {"label": "Company Blog", "url": "https://..."}
          ]
        }
      ]
    },
    {
      "id": "startups",
      "type": "purple",
      "title": "Startup Signals",
      "readingMinutes": 4,
      "content": [...]
    },
    {
      "id": "research",
      "type": "teal",
      "title": "Research Review",
      "readingMinutes": 5,
      "content": [
        {
          "type": "paper",
          "title": "Paper Title",
          "subtitle": "Authors: X, Y, Z · Venue: CVPR 2026",
          "body": [
            "Problem statement: What's being solved?",
            "Technical approach: How does it work?",
            "Empirical results with specific numbers."
          ],
          "keyTakeaway": "27.83pp accuracy improvement over GPTQ baseline.",
          "sources": [
            {"label": "arXiv:2606.00079", "url": "https://arxiv.org/abs/2606.00079"}
          ],
          "tags": ["CVPR 2026"]
        }
      ]
    },
    {
      "id": "math",
      "type": "amber",
      "title": "Math & Physics — Topic Name",
      "readingMinutes": 4,
      "curriculum": {
        "day": 8,
        "totalDays": 11,
        "track": "Kernel Methods Track",
        "progressPercent": 73
      },
      "content": [
        {
          "type": "explanation",
          "title": "Section Title",
          "body": [
            "Motivation paragraph",
            "Formal setup: \\\\( inline math \\\\) or \\\\[ display math \\\\]",
            "Derivation with steps",
            "Worked example with concrete numbers"
          ]
        }
      ]
    },
    {
      "id": "ml",
      "type": "rose",
      "title": "ML Deep Dive — Concept Name",
      "readingMinutes": 4,
      "curriculum": {
        "day": 8,
        "totalDays": 11,
        "track": "Modern Deep Learning Theory",
        "progressPercent": 73
      },
      "content": [...]
    },
    {
      "id": "topic",
      "type": "green",
      "title": "Today's Topic — Theme Name",
      "readingMinutes": 3,
      "content": [
        {
          "type": "topic-analysis",
          "title": "Specific Angle on Theme",
          "body": [
            "Hook: Why this matters now",
            "Current landscape and recent developments",
            "Analysis and synthesis",
            "Open questions and implications"
          ],
          "sources": [...]
        }
      ]
    }
  ]
}
```

---

## Generation Workflow

1. **Gather content** (6:00-6:15 AM EST)
   - Industry: TechCrunch, company blogs, press releases
   - Startups: Crunchbase, funding announcements
   - Research: arXiv latest (cs.LG, cs.AI, cs.CV, cs.CL)
   - Math/ML: Continue curriculum sequence

2. **Select & synthesize** (6:15-6:45 AM EST)
   - Choose 3-5 best items per section
   - Prioritize: novel > important > interesting
   - Ensure diversity (don't focus on one topic)

3. **Generate JSON** (6:45-6:55 AM EST)
   - Follow schema exactly
   - Validate against quality checklist
   - Ensure teaser is engaging

4. **Convert to HTML** (6:55-7:00 AM EST)
   ```bash
   cd /path/to/nishant-digest
   mkdir -p YYYY-MM-DD
   node base/generate-digest.js digest-data.json YYYY-MM-DD/index.html
   git add .
   git commit -m "Daily digest YYYY-MM-DD: [brief summary]"
   git push origin main
   ```

---

## Current Curriculum Status

**Math & Physics**: Day 8 of 11 — Kernel Methods Track
- Day 9 topic: [Next in sequence]

**ML Deep Dive**: Day 8 of 11 — Modern Deep Learning Theory
- Day 9 topic: [Next in sequence]

Update `progressPercent` as: `(day / totalDays) * 100`

---

## Success Criteria

Nishant should finish reading feeling:
- **Informed** about current AI developments
- **Educated** on foundational concepts
- **Motivated** to continue learning daily
- **Confident** the time was well-spent

The digest should:
- Teach something new in every section
- Feel achievable to read (not overwhelming)
- Build momentum (reader wants to continue)
- Create connections between ideas

---

## Full Documentation

- **Complete schema**: `base/digest-schema.json`
- **Detailed prompt**: `base/hermes-prompt-template.md`
- **Generator script**: `base/generate-digest.js`
- **Enhanced styles**: `base/styles-enhanced.css`
