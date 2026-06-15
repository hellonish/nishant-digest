#!/usr/bin/env node

/**
 * Content Cleaner - Extract and clean article content
 * Removes HTML, ads, boilerplate, keeping only essential information
 * Optimized for minimal token usage by AI
 *
 * Usage: node content-cleaner.js <input.json> <output.json>
 */

const fs = require('fs');
const https = require('https');
const http = require('http');
const { JSDOM } = require('jsdom');
const { Readability } = require('@mozilla/readability');

/**
 * Strip HTML tags and decode entities
 */
function stripHTML(html) {
  if (!html) return '';

  // Remove script and style tags completely
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // Remove all HTML tags
  html = html.replace(/<[^>]+>/g, ' ');

  // Decode common HTML entities
  const entities = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' ',
    '&mdash;': '—',
    '&ndash;': '–',
    '&hellip;': '...',
    '&rsquo;': "'",
    '&lsquo;': "'",
    '&rdquo;': '"',
    '&ldquo;': '"'
  };

  Object.keys(entities).forEach(entity => {
    html = html.replace(new RegExp(entity, 'g'), entities[entity]);
  });

  // Remove excess whitespace
  html = html.replace(/\s+/g, ' ').trim();

  return html;
}

/**
 * Extract main content from HTML using Readability
 */
function extractMainContent(html, url) {
  try {
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (article) {
      return {
        title: article.title,
        content: stripHTML(article.textContent),
        excerpt: article.excerpt ? stripHTML(article.excerpt) : '',
        length: article.length
      };
    }
  } catch (error) {
    // Fallback to basic extraction
  }

  return null;
}

/**
 * Fetch full article content from URL
 */
function fetchArticle(url, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const timeoutId = setTimeout(() => {
      reject(new Error(`Timeout fetching ${url}`));
    }, timeout);

    protocol.get(url, (res) => {
      // Handle redirects
      if (res.statusCode === 301 || res.statusCode === 302) {
        clearTimeout(timeoutId);
        return fetchArticle(res.headers.location, timeout)
          .then(resolve)
          .catch(reject);
      }

      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        clearTimeout(timeoutId);
        if (res.statusCode === 200) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    }).on('error', (err) => {
      clearTimeout(timeoutId);
      reject(err);
    });
  });
}

/**
 * Clean and extract article content
 */
async function cleanArticle(article, fetchFullContent = false) {
  const cleaned = {
    title: stripHTML(article.title),
    link: article.link,
    pubDate: article.pubDate,
    author: article.author || '',
    source: article.source || '',
    guid: article.guid
  };

  // Try to extract from content field first
  if (article.content && article.content.length > article.description?.length) {
    const extracted = extractMainContent(article.content, article.link);
    if (extracted) {
      cleaned.summary = truncateText(extracted.content, 500);
      cleaned.fullText = extracted.content;
      cleaned.extractedLength = extracted.length;
      return cleaned;
    }
  }

  // Use description as fallback
  cleaned.summary = truncateText(stripHTML(article.description), 500);

  // Optionally fetch full content
  if (fetchFullContent && article.link) {
    try {
      const html = await fetchArticle(article.link);
      const extracted = extractMainContent(html, article.link);

      if (extracted && extracted.content.length > cleaned.summary.length) {
        cleaned.fullText = extracted.content;
        cleaned.extractedLength = extracted.length;
        cleaned.summary = truncateText(extracted.content, 500);
      }
    } catch (error) {
      // Keep summary only
      cleaned.fetchError = error.message;
    }
  }

  return cleaned;
}

/**
 * Truncate text intelligently at sentence boundary
 */
function truncateText(text, maxLength) {
  if (!text || text.length <= maxLength) return text;

  // Try to break at sentence
  const truncated = text.substring(0, maxLength);
  const lastPeriod = truncated.lastIndexOf('. ');
  const lastQuestion = truncated.lastIndexOf('? ');
  const lastExclamation = truncated.lastIndexOf('! ');

  const breakPoint = Math.max(lastPeriod, lastQuestion, lastExclamation);

  if (breakPoint > maxLength * 0.7) {
    return truncated.substring(0, breakPoint + 1).trim();
  }

  // Break at last space
  const lastSpace = truncated.lastIndexOf(' ');
  return truncated.substring(0, lastSpace).trim() + '...';
}

/**
 * Calculate token estimate (rough approximation)
 */
function estimateTokens(text) {
  // Rough estimate: 1 token ≈ 4 characters for English
  return Math.ceil(text.length / 4);
}

/**
 * Create AI-optimized summary
 */
function createAISummary(article) {
  const parts = [];

  // Essential metadata (compact format)
  parts.push(`[${new Date(article.pubDate).toISOString().split('T')[0]}]`);
  parts.push(article.title);

  if (article.author) {
    parts.push(`by ${article.author}`);
  }

  // Content summary
  parts.push('\n' + article.summary);

  // Link
  parts.push(`\nURL: ${article.link}`);

  const summary = parts.join(' ');

  return {
    text: summary,
    tokens: estimateTokens(summary),
    metadata: {
      title: article.title,
      date: article.pubDate,
      author: article.author,
      link: article.link,
      source: article.source
    }
  };
}

/**
 * Process all articles from feed data
 */
async function processFeeds(feedData, options = {}) {
  const {
    fetchFullContent = false,
    maxArticlesPerFeed = 10,
    minArticleLength = 100
  } = options;

  console.log(`\nProcessing ${feedData.length} feeds...`);

  const allArticles = [];
  let totalProcessed = 0;
  let totalSkipped = 0;

  for (const feed of feedData) {
    if (!feed.items || feed.items.length === 0) continue;

    console.log(`\n  [${feed.feed}] ${feed.items.length} articles`);

    const articles = feed.items.slice(0, maxArticlesPerFeed);

    for (const article of articles) {
      try {
        const cleaned = await cleanArticle(article, fetchFullContent);

        // Skip if too short
        if (cleaned.summary.length < minArticleLength) {
          totalSkipped++;
          continue;
        }

        // Create AI-optimized version
        const aiSummary = createAISummary(cleaned);

        allArticles.push({
          ...cleaned,
          feedName: feed.feed,
          category: feed.category,
          aiSummary: aiSummary.text,
          estimatedTokens: aiSummary.tokens
        });

        totalProcessed++;
        process.stdout.write('.');

      } catch (error) {
        console.error(`\n    Error processing article: ${error.message}`);
        totalSkipped++;
      }
    }
  }

  console.log(`\n\n✅ Processing complete:`);
  console.log(`   Processed: ${totalProcessed}`);
  console.log(`   Skipped: ${totalSkipped}`);
  console.log(`   Total tokens (estimated): ${allArticles.reduce((sum, a) => sum + a.estimatedTokens, 0).toLocaleString()}`);

  return allArticles;
}

/**
 * Main CLI
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: node content-cleaner.js <input.json> <output.json> [--fetch-full] [--max-per-feed=10]');
    process.exit(1);
  }

  const inputFile = args[0];
  const outputFile = args[1];
  const fetchFullContent = args.includes('--fetch-full');
  const maxArticlesPerFeed = parseInt(args.find(a => a.startsWith('--max-per-feed='))?.split('=')[1] || '10');

  try {
    // Read input
    const feedData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

    // Process articles
    const articles = await processFeeds(feedData, {
      fetchFullContent,
      maxArticlesPerFeed
    });

    // Sort by date (newest first)
    articles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    // Write output
    const output = {
      generatedAt: new Date().toISOString(),
      totalArticles: articles.length,
      totalTokens: articles.reduce((sum, a) => sum + a.estimatedTokens, 0),
      articles
    };

    fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));

    console.log(`\n📄 Output written to: ${outputFile}`);
    console.log(`   Articles: ${articles.length}`);
    console.log(`   Estimated tokens: ${output.totalTokens.toLocaleString()}`);

  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  cleanArticle,
  stripHTML,
  extractMainContent,
  createAISummary,
  processFeeds,
  estimateTokens
};
