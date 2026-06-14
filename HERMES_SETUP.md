# Hermes Agent Configuration Guide

Quick guide to configure Hermes Agent to generate your daily digest.

---

## 📋 What You Need to Give Hermes

### **1. Core Instructions**
Copy the entire content of `base/HERMES_INSTRUCTIONS.md` to Hermes Agent.

### **2. Data Schema**
Provide `base/digest-schema.json` so Hermes knows the exact JSON structure to output.

### **3. Example Reference**
Show Hermes the `base/example-digest.json` as a working example.

---

## 🤖 Configure Hermes Agent

### **Step 1: Load Instructions**
```
Hey Hermes, from now on you are my daily digest curator.

Read and follow these instructions:
[PASTE ENTIRE CONTENTS OF base/HERMES_INSTRUCTIONS.md HERE]
```

### **Step 2: Show Schema**
```
Here's the JSON schema you must follow:
[PASTE ENTIRE CONTENTS OF base/digest-schema.json HERE]
```

### **Step 3: Show Example**
```
Here's an example of a properly formatted digest:
[PASTE ENTIRE CONTENTS OF base/example-digest.json HERE]
```

---

## ⚙️ Daily Workflow for Hermes

**What Hermes Should Do Every Morning (6:00-7:00 AM EST):**

```bash
# 1. Generate JSON digest
# Hermes creates: YYYY-MM-DD-digest.json

# 2. Convert to HTML
cd /path/to/nishant-digest
mkdir -p YYYY-MM-DD
node base/generate-digest.js YYYY-MM-DD-digest.json YYYY-MM-DD/index.html

# 3. Commit and push
git add .
git commit -m "Daily digest YYYY-MM-DD: [brief summary]

🤖 Generated with Hermes Agent

Co-Authored-By: Hermes <noreply@nousresearch.com>"
git push origin main
```

---

## 📝 Key Points for Hermes

### **Content Requirements:**
- **6 sections**: Industry, Startups, Research, Math, ML, Topic
- **Total reading time**: 16-20 minutes (~3500-4500 words)
- **Writing style**: Clear, direct, engaging
- **No color coding**: Clean Claude theme, no section colors

### **Quality Standards:**
✅ **Every item must have:**
- Clear value proposition (why this matters)
- Specific details (numbers, mechanisms)
- Technical accuracy
- Credible sources with links

✅ **Writing principles:**
- Clarity over cleverness
- Context before details (WHY before HOW)
- Progressive complexity (simple → detailed → nuanced)
- Active voice, concrete specifics

❌ **Avoid:**
- Vague qualifiers ("very", "quite")
- Hype or overselling
- Jargon without definitions
- Walls of text (max 4-5 sentences per paragraph)

---

## 🎨 Design Theme

**Claude/Anthropic-inspired:**
- Clean, minimal aesthetic
- Warm cream/paper background in light mode
- Rich, warm dark mode (#1a1611 background)
- System fonts (no custom fonts needed)
- Subtle orange accent (#c4622d)
- No section color coding
- Sidebar TOC navigation

---

## 🔍 Test Before Going Live

**Test the generator:**
```bash
# Use the example digest
node base/generate-digest.js base/example-digest.json test-output.html

# Open in browser
open test-output.html
```

**Expected result:**
- Clean, professional Claude-like design
- Sidebar navigation on left
- No colored section boxes
- Readable in both light and dark mode

---

## 📊 Curriculum Tracking

**Current Status:**
- **Math & Physics**: Day 8 of 11 — Kernel Methods Track
- **ML Deep Dive**: Day 8 of 11 — Modern Deep Learning Theory

**For Hermes:**
- Update `progressPercent` as: `(day / totalDays) * 100`
- Continue sequences until complete (Day 11)
- Then plan next 11-day track

---

## ✅ Success Checklist

After Hermes generates each digest, verify:

- [ ] JSON validates against schema
- [ ] All 6 sections present
- [ ] Total word count: 3500-4500
- [ ] Sources included for all items
- [ ] Math sections use LaTeX notation
- [ ] Curriculum progress updated
- [ ] Topic teaser is engaging
- [ ] HTML generates without errors
- [ ] Links work correctly
- [ ] Git commit created and pushed

---

## 🆘 Troubleshooting

**If Hermes generates invalid JSON:**
→ Point it back to `base/digest-schema.json` and `base/example-digest.json`

**If HTML doesn't render correctly:**
→ Check the generator ran without errors: `node base/generate-digest.js input.json output.html`

**If styles look broken:**
→ Ensure `base/styles.css` exists and digest references `../base/styles.css`

**If MathJax doesn't render:**
→ Verify LaTeX uses `\\(` for inline and `\\[` for display math

---

## 📁 File Structure

```
nishant-digest/
├── base/
│   ├── styles.css                  ← Claude theme CSS
│   ├── digest-schema.json          ← JSON structure spec
│   ├── generate-digest.js          ← HTML generator
│   ├── HERMES_INSTRUCTIONS.md      ← Main instructions
│   ├── hermes-prompt-template.md   ← Detailed guide
│   └── example-digest.json         ← Working example
├── YYYY-MM-DD/
│   └── index.html                  ← Daily digest
├── index.html                      ← Landing page
└── README.md
```

---

## 🚀 Quick Start Command

**Give this to Hermes as a single prompt:**

```
You are my daily digest curator. Every morning at 6 AM EST:

1. Generate a JSON digest following base/HERMES_INSTRUCTIONS.md
2. Validate against base/digest-schema.json
3. Run: node base/generate-digest.js [date]-digest.json [date]/index.html
4. Commit: git add . && git commit -m "Daily digest [date]" && git push

Content: 6 sections (Industry, Startups, Research, Math, ML, Topic)
Style: Clean, clear, engaging - Claude theme, no color coding
Quality: Clarity over cleverness, context before details, specific > vague

See base/example-digest.json for reference format.
```

---

**That's it! Hermes is now configured to generate your daily digest. 🎉**
