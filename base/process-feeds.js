#!/usr/bin/env node

/**
 * Feed Processor - Complete pipeline from RSS to AI-ready articles
 * Orchestrates fetching, cleaning, deduplication, and formatting
 *
 * Usage: node process-feeds.js [--hours=24] [--fetch-full] [--max-articles=25]
 */

const fs = require('fs');
const path = require('path');
const { fetchAllFeeds } = require('./rss-fetcher');
const { processFeeds } = require('./content-cleaner');
const { isDuplicate, addHeadline, cleanup } = require('./headline-tracker');

const OUTPUT_DIR = path.join(__dirname, '.output');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

/**
 * Score article for importance/impact
 */
function scoreArticle(article) {
  let score = 0;

  // Recency (newer is better)
  const ageHours = (Date.now() - new Date(article.pubDate)) / 1000 / 60 / 60;
  if (ageHours < 6) score += 10;
  else if (ageHours < 12) score += 5;
  else if (ageHours < 18) score += 2;

  // Length (prefer substantial content)
  const wordCount = article.summary.split(/\s+/).length;
  if (wordCount > 300) score += 5;
  else if (wordCount > 150) score += 3;
  else if (wordCount > 100) score += 1;

  // Source reputation (primary sources preferred)
  const primarySources = [
    'OpenAI', 'Google DeepMind', 'Anthropic', 'Microsoft Research',
    'Hugging Face', 'BAIR', 'MIT Technology Review', 'IEEE Spectrum'
  ];

  if (primarySources.some(source => article.feedName.includes(source))) {
    score += 15;
  }

  // Category weighting
  const categoryWeights = {
    'AI labs (primary sources)': 10,
    'AI research / applied': 8,
    'Compute / hardware': 6,
    'Security': 5,
    'Industry analysis / policy': 5,
    'General / firehose': 3
  };

  score += categoryWeights[article.category] || 0;

  // Keywords (important topics)
  const importantKeywords = [
    'breakthrough', 'release', 'announce', 'launch', 'funding', 'acquisition',
    'model', 'GPT', 'Claude', 'Gemini', 'transformer', 'quantum', 'chip',
    'vulnerability', 'exploit', 'breakthrough', 'research', 'paper'
  ];

  const titleLower = article.title.toLowerCase();
  const summaryLower = article.summary.toLowerCase();

  importantKeywords.forEach(keyword => {
    if (titleLower.includes(keyword)) score += 2;
    if (summaryLower.includes(keyword)) score += 1;
  });

  return score;
}

/**
 * Deduplicate articles against headline tracker
 */
function deduplicateArticles(articles, date, threshold = 0.7) {
  const unique = [];
  const duplicates = [];

  console.log(`\nDeduplicating ${articles.length} articles...`);

  for (const article of articles) {
    const result = isDuplicate(article.title, threshold);

    if (result.isDuplicate) {
      duplicates.push({
        title: article.title,
        matchedWith: result.match.title,
        similarity: result.similarity
      });
    } else {
      unique.push(article);
    }
  }

  console.log(`  Unique: ${unique.length}`);
  console.log(`  Duplicates: ${duplicates.length}`);

  return { unique, duplicates };
}

/**
 * Select top N articles based on scoring
 */
function selectTopArticles(articles, maxCount = 25) {
  console.log(`\nScoring and ranking ${articles.length} articles...`);

  // Score all articles
  const scored = articles.map(article => ({
    ...article,
    score: scoreArticle(article)
  }));

  // Sort by score (highest first)
  scored.sort((a, b) => b.score - a.score);

  // Select top N
  const selected = scored.slice(0, maxCount);

  console.log(`  Selected top ${selected.length} articles`);
  console.log(`  Score range: ${selected[0]?.score} - ${selected[selected.length - 1]?.score}`);

  return selected;
}

/**
 * Format articles for AI consumption
 */
function formatForAI(articles, options = {}) {
  const { format = 'compact', includeMetadata = true } = options;

  if (format === 'compact') {
    // Ultra-compact format for minimal tokens
    return articles.map((article, index) => {
      const parts = [
        `[${index + 1}]`,
        `${article.title}`,
        `(${article.feedName}, ${new Date(article.pubDate).toISOString().split('T')[0]})`,
        article.summary,
        `URL: ${article.link}`
      ];

      return parts.join('\n');
    }).join('\n\n---\n\n');
  } else if (format === 'structured') {
    // Structured JSON format
    return JSON.stringify(articles.map(article => ({
      title: article.title,
      date: article.pubDate,
      source: article.feedName,
      category: article.category,
      summary: article.summary,
      link: article.link,
      author: article.author,
      score: article.score
    })), null, 2);
  } else if (format === 'markdown') {
    // Markdown format for readability
    return articles.map((article, index) => {
      return `## ${index + 1}. ${article.title}

**Source:** ${article.feedName} | **Date:** ${new Date(article.pubDate).toLocaleDateString()} | **Category:** ${article.category}

${article.summary}

**Link:** ${article.link}
**Score:** ${article.score}`;
    }).join('\n\n---\n\n');
  }

  return articles;
}

/**
 * Generate statistics report
 */
function generateStats(articles, duplicates) {
  const stats = {
    total: articles.length,
    duplicates: duplicates.length,
    byCategory: {},
    bySource: {},
    byDate: {},
    totalTokens: articles.reduce((sum, a) => sum + (a.estimatedTokens || 0), 0),
    avgScore: articles.reduce((sum, a) => sum + (a.score || 0), 0) / articles.length,
    scoreRange: {
      min: Math.min(...articles.map(a => a.score || 0)),
      max: Math.max(...articles.map(a => a.score || 0))
    }
  };

  // Group by category
  articles.forEach(article => {
    stats.byCategory[article.category] = (stats.byCategory[article.category] || 0) + 1;
    stats.bySource[article.feedName] = (stats.bySource[article.feedName] || 0) + 1;

    const date = new Date(article.pubDate).toISOString().split('T')[0];
    stats.byDate[date] = (stats.byDate[date] || 0) + 1;
  });

  return stats;
}

/**
 * Save articles to headline tracker
 */
function saveToTracker(articles, date) {
  console.log(`\nAdding ${articles.length} articles to headline tracker...`);

  let added = 0;
  articles.forEach(article => {
    const result = addHeadline(article.title, date);
    if (result.added) added++;
  });

  console.log(`  Added: ${added}`);
  console.log(`  Already existed: ${articles.length - added}`);

  // Cleanup old headlines
  const cleanupResult = cleanup();
  console.log(`  Cleaned up ${cleanupResult.removed} old headlines`);
}

/**
 * Main processing pipeline
 */
async function processPipeline(options = {}) {
  const {
    hours = 24,
    maxArticles = 25,
    fetchFullContent = false,
    deduplicationThreshold = 0.7,
    outputFormat = 'compact',
    saveToHeadlineTracker = true
  } = options;

  const date = new Date().toISOString().split('T')[0];
  const timestamp = new Date().toISOString();

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Feed Processing Pipeline - ${timestamp}`);
  console.log(`${'='.repeat(60)}`);

  // Step 1: Fetch RSS feeds
  console.log(`\n[STEP 1] Fetching RSS feeds (last ${hours} hours)...`);
  const feedData = await fetchAllFeeds(hours);

  // Step 2: Clean and extract content
  console.log(`\n[STEP 2] Cleaning and extracting content...`);
  const cleanedArticles = await processFeeds(feedData, {
    fetchFullContent,
    maxArticlesPerFeed: 20
  });

  if (cleanedArticles.length === 0) {
    console.log('\n⚠️  No articles found. Exiting.');
    return;
  }

  // Step 3: Deduplicate
  console.log(`\n[STEP 3] Deduplicating articles...`);
  const { unique, duplicates } = deduplicateArticles(cleanedArticles, date, deduplicationThreshold);

  // Step 4: Score and select top articles
  console.log(`\n[STEP 4] Scoring and selecting top ${maxArticles} articles...`);
  const topArticles = selectTopArticles(unique, maxArticles);

  // Step 5: Generate statistics
  const stats = generateStats(topArticles, duplicates);

  // Step 6: Save to headline tracker
  if (saveToHeadlineTracker) {
    console.log(`\n[STEP 5] Saving to headline tracker...`);
    saveToTracker(topArticles, date);
  }

  // Step 7: Format for AI
  console.log(`\n[STEP 6] Formatting for AI (${outputFormat})...`);
  const aiFormatted = formatForAI(topArticles, { format: outputFormat });

  // Save outputs
  const outputs = {
    raw: path.join(OUTPUT_DIR, `feeds-raw-${date}.json`),
    cleaned: path.join(OUTPUT_DIR, `articles-cleaned-${date}.json`),
    selected: path.join(OUTPUT_DIR, `articles-selected-${date}.json`),
    aiFormat: path.join(OUTPUT_DIR, `ai-ready-${date}.txt`),
    stats: path.join(OUTPUT_DIR, `stats-${date}.json`),
    duplicates: path.join(OUTPUT_DIR, `duplicates-${date}.json`)
  };

  fs.writeFileSync(outputs.raw, JSON.stringify(feedData, null, 2));
  fs.writeFileSync(outputs.cleaned, JSON.stringify(cleanedArticles, null, 2));
  fs.writeFileSync(outputs.selected, JSON.stringify(topArticles, null, 2));
  fs.writeFileSync(outputs.aiFormat, aiFormatted);
  fs.writeFileSync(outputs.stats, JSON.stringify(stats, null, 2));
  fs.writeFileSync(outputs.duplicates, JSON.stringify(duplicates, null, 2));

  // Print summary
  console.log(`\n${'='.repeat(60)}`);
  console.log(`PROCESSING COMPLETE`);
  console.log(`${'='.repeat(60)}`);
  console.log(`\n📊 Statistics:`);
  console.log(`   Total articles fetched: ${cleanedArticles.length}`);
  console.log(`   Unique articles: ${unique.length}`);
  console.log(`   Duplicates removed: ${duplicates.length}`);
  console.log(`   Top articles selected: ${topArticles.length}`);
  console.log(`   Estimated tokens: ${stats.totalTokens.toLocaleString()}`);
  console.log(`   Average score: ${stats.avgScore.toFixed(2)}`);
  console.log(`\n📁 Output files:`);
  Object.entries(outputs).forEach(([key, path]) => {
    console.log(`   ${key}: ${path}`);
  });

  console.log(`\n✅ Ready for AI processing!`);
  console.log(`   Use: ${outputs.aiFormat}`);

  return {
    articles: topArticles,
    stats,
    outputs
  };
}

/**
 * Main CLI
 */
async function main() {
  const args = process.argv.slice(2);

  const options = {
    hours: 24,
    maxArticles: 25,
    fetchFullContent: false,
    outputFormat: 'compact'
  };

  // Parse arguments
  args.forEach(arg => {
    if (arg.startsWith('--hours=')) {
      options.hours = parseInt(arg.split('=')[1]);
    } else if (arg.startsWith('--max-articles=')) {
      options.maxArticles = parseInt(arg.split('=')[1]);
    } else if (arg.startsWith('--format=')) {
      options.outputFormat = arg.split('=')[1];
    } else if (arg === '--fetch-full') {
      options.fetchFullContent = true;
    } else if (arg === '--no-tracker') {
      options.saveToHeadlineTracker = false;
    }
  });

  try {
    await processPipeline(options);
  } catch (error) {
    console.error(`\n❌ Pipeline error: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  processPipeline,
  scoreArticle,
  deduplicateArticles,
  selectTopArticles,
  formatForAI,
  generateStats
};
