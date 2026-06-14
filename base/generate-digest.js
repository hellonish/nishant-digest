#!/usr/bin/env node

/**
 * Daily Digest Generator
 * Converts JSON data to beautiful, psychologically-optimized HTML
 * Usage: node generate-digest.js <input.json> <output.html>
 */

const fs = require('fs');
const path = require('path');

/**
 * Format date to human-readable format
 */
function formatDate(dateStr) {
  const date = new Date(dateStr);
  const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
  return date.toLocaleDateString('en-US', options);
}

/**
 * Generate curriculum progress bar HTML
 */
function generateCurriculumBar(curriculum) {
  if (!curriculum) return '';

  return `
    <div class="curriculum-bar">
      <span class="curriculum-label">Day ${curriculum.day} of ${curriculum.totalDays} · ${curriculum.track}</span>
      <div style="width: 100px; height: 6px; background: var(--border-light); border-radius: 3px; overflow: hidden;">
        <div class="curriculum-fill" style="width: ${curriculum.progressPercent}%;"></div>
      </div>
    </div>
  `;
}

/**
 * Generate callout box HTML
 */
function generateCallout(callout) {
  if (!callout) return '';

  const classMap = {
    'pgdr': 'pgdr-callout',
    'key-insight': 'key-insight',
    'connection': 'pgdr-callout'
  };

  return `
    <div class="${classMap[callout.type] || 'pgdr-callout'}">
      ${callout.content}
    </div>
  `;
}

/**
 * Generate source links HTML
 */
function generateSources(sources) {
  if (!sources || sources.length === 0) return '';

  const links = sources.map(s =>
    `<a href="${s.url}" target="_blank" rel="noopener">${s.label}</a>`
  ).join(' · ');

  return `<p class="source-link">${links}</p>`;
}

/**
 * Generate content item HTML based on type
 */
function generateContentItem(item) {
  let html = '';

  // Title
  html += `<h3>${item.title}</h3>\n`;

  // Subtitle (for papers)
  if (item.subtitle) {
    html += `<p class="item-subtitle" style="font-size: 0.89rem; color: var(--text-muted); margin-bottom: 12px;">${item.subtitle}</p>\n`;
  }

  // Body paragraphs
  item.body.forEach(paragraph => {
    html += `<p>${paragraph}</p>\n`;
  });

  // Key takeaway
  if (item.keyTakeaway) {
    html += `<p><strong>Key result:</strong> ${item.keyTakeaway}</p>\n`;
  }

  // Callout
  if (item.callout) {
    html += generateCallout(item.callout);
  }

  // Sources
  if (item.sources) {
    html += generateSources(item.sources);
  }

  // Add spacing between items
  html += `<div style="height: 28px;"></div>\n`;

  return html;
}

/**
 * Generate section HTML
 */
function generateSection(section) {
  let html = `
    <section id="${section.id}" class="section-card">
      <div class="section-header">
        <h2 class="section-title">${section.title}</h2>
        <span class="reading-time">${section.readingMinutes} min read</span>
      </div>
  `;

  // Curriculum bar (for math/ml sections)
  if (section.curriculum) {
    html += generateCurriculumBar(section.curriculum);
  }

  html += `<div class="section-body">\n`;

  // Content items
  section.content.forEach(item => {
    html += generateContentItem(item);
  });

  html += `</div>\n</section>\n`;

  return html;
}

/**
 * Generate complete HTML document
 */
function generateHTML(data) {
  const dateFormatted = formatDate(data.date);
  const dateShort = data.date;

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${data.meta.topicTeaser}">
    <title>Daily Digest — ${dateFormatted}</title>

    <!-- Claude theme styles -->
    <link rel="stylesheet" href="../base/styles.css">

    <!-- MathJax for mathematical notation -->
    <script>
        MathJax = {
            tex: {
                inlineMath: [['\\\\(', '\\\\)'], ['$', '$']],
                displayMath: [['\\\\[', '\\\\]'], ['$$', '$$']],
                processEscapes: true
            },
            options: {
                enableMenu: false
            }
        };
    </script>
    <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js" async></script>
</head>
<body>
    <!-- Navigation -->
    <nav class="top-nav">
        <div class="nav-inner">
            <div class="nav-title">
                <a href="../index.html" class="nav-home-link">Nishant's Daily Digest</a>
            </div>
            <div class="nav-date">${dateFormatted}</div>
            <button class="hamburger" id="hamburgerBtn" aria-label="Toggle navigation">&#9776;</button>
        </div>
    </nav>

    <!-- Table of Contents Sidebar -->
    <aside class="toc-sidebar" id="tocSidebar">
        <div class="toc-header">Jump to</div>
        <ul class="toc-list">
${data.sections.map(s => `            <li><a href="#${s.id}">${s.title.split('—')[0].trim()}</a></li>`).join('\n')}
        </ul>
    </aside>

    <!-- Main Content -->
    <div class="page-wrapper">
        <main class="digest-content">
            <!-- Header -->
            <header class="digest-meta">
                <h1>Daily Research Digest</h1>
                <div class="meta-stats">
                    <span>📅 ${dateFormatted}</span>
                    <span>📄 ~${data.meta.wordCount.toLocaleString()} words</span>
                    <span>⏱ ~${data.meta.readingMinutes} min read</span>
                </div>
                <div class="topic-teaser">
                    ${data.meta.topicTeaser}
                </div>
            </header>

            <!-- Sections -->
${data.sections.map(section => generateSection(section)).join('\n')}

        </main>
    </div>

    <!-- Footer -->
    <footer class="digest-footer">
        <div class="footer-inner">
            <p>Generated on ${dateFormatted} by <a href="https://hermes-agent.nousresearch.com" target="_blank" rel="noopener">Hermes Agent</a></p>
            <p><a href="https://github.com/daddyankee/nishant-digest" target="_blank" rel="noopener">Source on GitHub</a></p>
        </div>
    </footer>

    <!-- Mobile TOC Toggle -->
    <script>
        const hamburger = document.getElementById('hamburgerBtn');
        const toc = document.getElementById('tocSidebar');

        if (hamburger && toc) {
            hamburger.addEventListener('click', function() {
                toc.classList.toggle('toc-open');
            });

            // Close TOC when clicking a link on mobile
            const tocLinks = toc.querySelectorAll('a');
            tocLinks.forEach(link => {
                link.addEventListener('click', () => {
                    if (window.innerWidth <= 1400) {
                        toc.classList.remove('toc-open');
                    }
                });
            });
        }
    </script>
</body>
</html>`;
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: node generate-digest.js <input.json> <output.html>');
    process.exit(1);
  }

  const inputPath = args[0];
  const outputPath = args[1];

  try {
    // Read JSON data
    const jsonData = fs.readFileSync(inputPath, 'utf8');
    const data = JSON.parse(jsonData);

    // Generate HTML
    const html = generateHTML(data);

    // Write output
    fs.writeFileSync(outputPath, html, 'utf8');

    console.log(`✅ Successfully generated ${outputPath}`);
    console.log(`   Date: ${data.date}`);
    console.log(`   Sections: ${data.sections.length}`);
    console.log(`   Reading time: ${data.meta.readingMinutes} minutes`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { generateHTML };
