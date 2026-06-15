#!/usr/bin/env node

/**
 * Headline Deduplication Tracker
 *
 * This utility helps Hermes Agent track headlines from the last 7 days
 * to avoid publishing duplicate news articles.
 *
 * Usage:
 *   node headline-tracker.js add "Article Title" "2026-06-15"
 *   node headline-tracker.js check "Article Title"
 *   node headline-tracker.js cleanup
 */

const fs = require('fs');
const path = require('path');

const TRACKER_FILE = path.join(__dirname, 'headlines.json');
const MAX_DAYS = 7;

// Initialize tracker file if it doesn't exist
function initTracker() {
  if (!fs.existsSync(TRACKER_FILE)) {
    fs.writeFileSync(TRACKER_FILE, JSON.stringify({ headlines: [] }, null, 2));
  }
}

// Load headlines from tracker file
function loadHeadlines() {
  initTracker();
  const data = fs.readFileSync(TRACKER_FILE, 'utf8');
  return JSON.parse(data);
}

// Save headlines to tracker file
function saveHeadlines(data) {
  fs.writeFileSync(TRACKER_FILE, JSON.stringify(data, null, 2));
}

// Normalize headline for comparison (remove punctuation, lowercase, trim)
function normalizeHeadline(headline) {
  return headline
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Calculate similarity between two headlines (simple word overlap)
function calculateSimilarity(headline1, headline2) {
  const words1 = new Set(normalizeHeadline(headline1).split(' '));
  const words2 = new Set(normalizeHeadline(headline2).split(' '));

  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

// Check if headline is a duplicate or too similar
function isDuplicate(newHeadline, threshold = 0.7) {
  const data = loadHeadlines();
  const normalizedNew = normalizeHeadline(newHeadline);

  for (const entry of data.headlines) {
    const normalizedExisting = normalizeHeadline(entry.title);

    // Exact match
    if (normalizedNew === normalizedExisting) {
      return { isDuplicate: true, match: entry, similarity: 1.0 };
    }

    // Similar match
    const similarity = calculateSimilarity(newHeadline, entry.title);
    if (similarity >= threshold) {
      return { isDuplicate: true, match: entry, similarity };
    }
  }

  return { isDuplicate: false };
}

// Add a new headline to tracker
function addHeadline(title, date) {
  const data = loadHeadlines();

  // Check if already exists
  const existing = data.headlines.find(h =>
    normalizeHeadline(h.title) === normalizeHeadline(title)
  );

  if (!existing) {
    data.headlines.push({
      title,
      date,
      addedAt: new Date().toISOString()
    });
    saveHeadlines(data);
    return { added: true, title };
  }

  return { added: false, reason: 'Already exists' };
}

// Clean up old headlines (older than MAX_DAYS)
function cleanup() {
  const data = loadHeadlines();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - MAX_DAYS);

  const originalCount = data.headlines.length;

  data.headlines = data.headlines.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= cutoffDate;
  });

  const removedCount = originalCount - data.headlines.length;
  saveHeadlines(data);

  return { removed: removedCount, remaining: data.headlines.length };
}

// Get all headlines from the last N days
function getRecentHeadlines(days = MAX_DAYS) {
  const data = loadHeadlines();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return data.headlines.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= cutoffDate;
  });
}

// CLI Interface
function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'add': {
      const title = args[1];
      const date = args[2] || new Date().toISOString().split('T')[0];

      if (!title) {
        console.error('Usage: headline-tracker.js add "Article Title" [date]');
        process.exit(1);
      }

      const result = addHeadline(title, date);
      console.log(JSON.stringify(result, null, 2));
      break;
    }

    case 'check': {
      const title = args[1];
      const threshold = parseFloat(args[2]) || 0.7;

      if (!title) {
        console.error('Usage: headline-tracker.js check "Article Title" [similarity_threshold]');
        process.exit(1);
      }

      const result = isDuplicate(title, threshold);
      console.log(JSON.stringify(result, null, 2));
      process.exit(result.isDuplicate ? 1 : 0);
      break;
    }

    case 'cleanup': {
      const result = cleanup();
      console.log(JSON.stringify(result, null, 2));
      break;
    }

    case 'list': {
      const days = parseInt(args[1]) || MAX_DAYS;
      const headlines = getRecentHeadlines(days);
      console.log(JSON.stringify(headlines, null, 2));
      break;
    }

    case 'stats': {
      const data = loadHeadlines();
      const recent = getRecentHeadlines();
      console.log(JSON.stringify({
        total: data.headlines.length,
        last7Days: recent.length,
        oldestDate: data.headlines.length > 0 ? data.headlines[0].date : null,
        newestDate: data.headlines.length > 0 ? data.headlines[data.headlines.length - 1].date : null
      }, null, 2));
      break;
    }

    default:
      console.log(`
Headline Deduplication Tracker

Usage:
  node headline-tracker.js add "Article Title" [date]
    Add a new headline to the tracker

  node headline-tracker.js check "Article Title" [threshold]
    Check if a headline is a duplicate (default threshold: 0.7)
    Returns exit code 1 if duplicate, 0 if unique

  node headline-tracker.js cleanup
    Remove headlines older than ${MAX_DAYS} days

  node headline-tracker.js list [days]
    List all headlines from the last N days (default: ${MAX_DAYS})

  node headline-tracker.js stats
    Show tracker statistics

Examples:
  node headline-tracker.js add "OpenAI Releases GPT-5" "2026-06-15"
  node headline-tracker.js check "OpenAI launches GPT-5"
  node headline-tracker.js cleanup
      `);
      break;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  addHeadline,
  isDuplicate,
  cleanup,
  getRecentHeadlines,
  normalizeHeadline,
  calculateSimilarity
};
