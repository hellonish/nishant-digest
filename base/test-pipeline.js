#!/usr/bin/env node

/**
 * Test Pipeline - Validate feed processing without saving
 * Quick test to verify RSS feeds are working and content is being extracted
 *
 * Usage: node test-pipeline.js
 */

const { fetchAllFeeds } = require('./rss-fetcher');
const { processFeeds, estimateTokens } = require('./content-cleaner');
const { isDuplicate } = require('./headline-tracker');

async function testPipeline() {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Feed Processing Pipeline - TEST MODE`);
  console.log(`${'='.repeat(60)}\n`);

  try {
    // Test 1: Fetch feeds
    console.log('[TEST 1] Fetching RSS feeds (last 6 hours)...');
    const feedData = await fetchAllFeeds(6, true);

    const totalFeeds = feedData.length;
    const workingFeeds = feedData.filter(f => !f.error && f.items.length > 0).length;
    const totalArticles = feedData.reduce((sum, f) => sum + f.items.length, 0);

    console.log(`  ✅ Feeds fetched: ${totalFeeds}`);
    console.log(`  ✅ Working feeds: ${workingFeeds}`);
    console.log(`  ✅ Total articles: ${totalArticles}`);

    if (totalArticles === 0) {
      console.log(`\n⚠️  No articles found in last 6 hours. This is normal if feeds are quiet.`);
      console.log(`   Try increasing time window: node rss-fetcher.js --hours=24`);
      return;
    }

    // Test 2: Clean and extract
    console.log(`\n[TEST 2] Cleaning and extracting content...`);
    const articles = await processFeeds(feedData, {
      fetchFullContent: false,
      maxArticlesPerFeed: 3
    });

    console.log(`  ✅ Cleaned articles: ${articles.length}`);

    // Test 3: Deduplication check
    console.log(`\n[TEST 3] Testing deduplication...`);
    let uniqueCount = 0;
    let duplicateCount = 0;

    for (const article of articles.slice(0, 5)) {
      const result = isDuplicate(article.title);
      if (result.isDuplicate) {
        duplicateCount++;
        console.log(`  🔄 Duplicate: "${article.title}"`);
        console.log(`     Matches: "${result.match.title}" (${(result.similarity * 100).toFixed(1)}%)`);
      } else {
        uniqueCount++;
      }
    }

    console.log(`  ✅ Unique: ${uniqueCount} / ${Math.min(5, articles.length)}`);
    console.log(`  🔄 Duplicates: ${duplicateCount} / ${Math.min(5, articles.length)}`);

    // Test 4: Token estimation
    console.log(`\n[TEST 4] Token estimation...`);
    const sampleArticles = articles.slice(0, 10);
    const totalTokens = sampleArticles.reduce((sum, a) => sum + a.estimatedTokens, 0);
    const avgTokens = totalTokens / sampleArticles.length;

    console.log(`  ✅ Sample size: ${sampleArticles.length} articles`);
    console.log(`  ✅ Total tokens: ${totalTokens.toLocaleString()}`);
    console.log(`  ✅ Average tokens per article: ${avgTokens.toFixed(0)}`);
    console.log(`  ✅ Projected for 25 articles: ${(avgTokens * 25).toLocaleString()} tokens`);

    // Test 5: Content quality check
    console.log(`\n[TEST 5] Content quality check...`);
    const qualityIssues = [];

    sampleArticles.forEach((article, i) => {
      if (!article.title) qualityIssues.push(`Article ${i + 1}: Missing title`);
      if (!article.summary || article.summary.length < 50) {
        qualityIssues.push(`Article ${i + 1}: Summary too short (${article.summary?.length || 0} chars)`);
      }
      if (!article.link) qualityIssues.push(`Article ${i + 1}: Missing link`);
      if (!article.pubDate) qualityIssues.push(`Article ${i + 1}: Missing pubDate`);
    });

    if (qualityIssues.length === 0) {
      console.log(`  ✅ All quality checks passed!`);
    } else {
      console.log(`  ⚠️  Quality issues found:`);
      qualityIssues.forEach(issue => console.log(`     - ${issue}`));
    }

    // Sample output
    console.log(`\n[SAMPLE] First article (AI-ready format):\n`);
    if (sampleArticles.length > 0) {
      const sample = sampleArticles[0];
      console.log(`${'-'.repeat(60)}`);
      console.log(sample.aiSummary);
      console.log(`${'-'.repeat(60)}`);
      console.log(`Tokens: ${sample.estimatedTokens}`);
      console.log(`Category: ${sample.category}`);
    }

    // Summary
    console.log(`\n${'='.repeat(60)}`);
    console.log(`TEST SUMMARY`);
    console.log(`${'='.repeat(60)}`);
    console.log(`✅ RSS Feeds: ${workingFeeds} / ${totalFeeds} working`);
    console.log(`✅ Articles found: ${totalArticles}`);
    console.log(`✅ After cleaning: ${articles.length}`);
    console.log(`✅ Token efficiency: ~${avgTokens.toFixed(0)} tokens/article`);
    console.log(`✅ Quality issues: ${qualityIssues.length}`);

    // Feed breakdown
    console.log(`\n📊 Feed Breakdown:`);
    const feedStats = {};
    feedData.forEach(feed => {
      if (feed.items.length > 0) {
        feedStats[feed.feed] = feed.items.length;
      }
    });

    Object.entries(feedStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([name, count]) => {
        console.log(`   ${name}: ${count} articles`);
      });

    console.log(`\n✅ Test completed successfully!`);
    console.log(`\n💡 To run full pipeline:`);
    console.log(`   npm run process`);
    console.log(`   node process-feeds.js --hours=24 --max-articles=25\n`);

  } catch (error) {
    console.error(`\n❌ Test failed: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  testPipeline();
}

module.exports = { testPipeline };
