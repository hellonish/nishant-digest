#!/usr/bin/env node

/**
 * RSS Feed Fetcher
 * Fetches and parses RSS/Atom feeds from OPML file
 * Usage: node rss-fetcher.js [--hours=24] [--output=feeds.json]
 */

const fs = require('fs');
const https = require('https');
const http = require('http');
const { parseString } = require('xml2js');
const path = require('path');

const OPML_FILE = path.join(__dirname, 'feeds.opml');
const CACHE_DIR = path.join(__dirname, '.cache');

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR);
}

/**
 * Fetch URL content with timeout
 */
function fetchUrl(url, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const timeoutId = setTimeout(() => {
      reject(new Error(`Timeout fetching ${url}`));
    }, timeout);

    protocol.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        clearTimeout(timeoutId);
        if (res.statusCode === 200) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        }
      });
    }).on('error', (err) => {
      clearTimeout(timeoutId);
      reject(err);
    });
  });
}

/**
 * Parse OPML file to extract feed URLs
 */
function parseOPML(opmlContent) {
  return new Promise((resolve, reject) => {
    parseString(opmlContent, (err, result) => {
      if (err) return reject(err);

      const feeds = [];
      const body = result.opml?.body?.[0];

      if (!body) return resolve(feeds);

      // Parse outline structure
      const parseOutline = (outlines) => {
        if (!outlines) return;

        outlines.forEach(outline => {
          if (outline.$ && outline.$.xmlUrl) {
            feeds.push({
              title: outline.$.text || outline.$.title,
              xmlUrl: outline.$.xmlUrl,
              htmlUrl: outline.$.htmlUrl,
              category: outline.$.text || 'Uncategorized'
            });
          }
          if (outline.outline) {
            parseOutline(outline.outline);
          }
        });
      };

      parseOutline(body.outline);
      resolve(feeds);
    });
  });
}

/**
 * Parse RSS/Atom feed XML
 */
function parseFeed(xmlContent, feedUrl) {
  return new Promise((resolve, reject) => {
    parseString(xmlContent, { trim: true, normalize: true }, (err, result) => {
      if (err) return reject(err);

      const items = [];

      // RSS 2.0
      if (result.rss?.channel?.[0]?.item) {
        result.rss.channel[0].item.forEach(item => {
          items.push({
            title: item.title?.[0] || '',
            link: item.link?.[0] || '',
            description: item.description?.[0] || '',
            pubDate: item.pubDate?.[0] || item.published?.[0] || '',
            author: item.author?.[0] || item['dc:creator']?.[0] || '',
            content: item['content:encoded']?.[0] || item.description?.[0] || '',
            guid: item.guid?.[0]?._ || item.guid?.[0] || item.link?.[0] || '',
            source: feedUrl
          });
        });
      }
      // Atom
      else if (result.feed?.entry) {
        result.feed.entry.forEach(entry => {
          items.push({
            title: entry.title?.[0]?._ || entry.title?.[0] || '',
            link: entry.link?.[0]?.$?.href || '',
            description: entry.summary?.[0]?._ || entry.summary?.[0] || '',
            pubDate: entry.published?.[0] || entry.updated?.[0] || '',
            author: entry.author?.[0]?.name?.[0] || '',
            content: entry.content?.[0]?._ || entry.content?.[0] || entry.summary?.[0] || '',
            guid: entry.id?.[0] || entry.link?.[0]?.$?.href || '',
            source: feedUrl
          });
        });
      }

      resolve(items);
    });
  });
}

/**
 * Filter articles by recency (hours)
 */
function filterByRecency(items, hours) {
  const cutoffTime = new Date();
  cutoffTime.setHours(cutoffTime.getHours() - hours);

  return items.filter(item => {
    if (!item.pubDate) return false;

    const pubDate = new Date(item.pubDate);
    return pubDate >= cutoffTime && !isNaN(pubDate.getTime());
  });
}

/**
 * Fetch single feed with caching
 */
async function fetchFeed(feed, hours, useCache = true) {
  const cacheFile = path.join(CACHE_DIR, `${Buffer.from(feed.xmlUrl).toString('base64')}.json`);

  // Check cache (valid for 1 hour)
  if (useCache && fs.existsSync(cacheFile)) {
    const stats = fs.statSync(cacheFile);
    const cacheAge = (Date.now() - stats.mtimeMs) / 1000 / 60; // minutes

    if (cacheAge < 60) {
      console.log(`  [CACHE] ${feed.title}`);
      const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      return cached;
    }
  }

  try {
    console.log(`  [FETCH] ${feed.title}`);
    const xml = await fetchUrl(feed.xmlUrl);
    const items = await parseFeed(xml, feed.xmlUrl);
    const recent = filterByRecency(items, hours);

    const result = {
      feed: feed.title,
      url: feed.htmlUrl || feed.xmlUrl,
      category: feed.category,
      items: recent.map(item => ({
        title: item.title.trim(),
        link: item.link,
        description: item.description.trim(),
        pubDate: item.pubDate,
        author: item.author,
        content: item.content,
        guid: item.guid
      })),
      fetchedAt: new Date().toISOString()
    };

    // Save to cache
    fs.writeFileSync(cacheFile, JSON.stringify(result, null, 2));

    return result;
  } catch (error) {
    console.error(`  [ERROR] ${feed.title}: ${error.message}`);
    return {
      feed: feed.title,
      url: feed.htmlUrl || feed.xmlUrl,
      category: feed.category,
      items: [],
      error: error.message
    };
  }
}

/**
 * Fetch all feeds from OPML
 */
async function fetchAllFeeds(hours = 24, useCache = true) {
  console.log(`\nFetching feeds from ${OPML_FILE}...`);
  console.log(`Time window: last ${hours} hours\n`);

  // Read and parse OPML
  const opmlContent = fs.readFileSync(OPML_FILE, 'utf8');
  const feeds = await parseOPML(opmlContent);

  console.log(`Found ${feeds.length} feeds to fetch\n`);

  // Fetch all feeds (with concurrency limit)
  const results = [];
  const concurrency = 5;

  for (let i = 0; i < feeds.length; i += concurrency) {
    const batch = feeds.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(feed => fetchFeed(feed, hours, useCache))
    );
    results.push(...batchResults);
  }

  // Calculate statistics
  const totalItems = results.reduce((sum, r) => sum + r.items.length, 0);
  const errors = results.filter(r => r.error).length;

  console.log(`\n✅ Fetch complete:`);
  console.log(`   Feeds: ${results.length}`);
  console.log(`   Articles: ${totalItems}`);
  console.log(`   Errors: ${errors}`);

  return results;
}

/**
 * Main CLI
 */
async function main() {
  const args = process.argv.slice(2);
  let hours = 24;
  let outputFile = 'feeds.json';
  let useCache = true;

  // Parse arguments
  args.forEach(arg => {
    if (arg.startsWith('--hours=')) {
      hours = parseInt(arg.split('=')[1]);
    } else if (arg.startsWith('--output=')) {
      outputFile = arg.split('=')[1];
    } else if (arg === '--no-cache') {
      useCache = false;
    }
  });

  try {
    const results = await fetchAllFeeds(hours, useCache);

    // Write output
    const outputPath = path.isAbsolute(outputFile) ? outputFile : path.join(__dirname, outputFile);
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

    console.log(`\n📄 Output written to: ${outputPath}`);
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  fetchAllFeeds,
  parseOPML,
  parseFeed,
  filterByRecency
};
