#!/bin/bash

###############################################################################
# Daily Feed Update Script
#
# This script is designed to be run by Hermes Agent every morning at 6:00 AM
# It fetches, cleans, and prepares 15-25 tech news articles for the digest
#
# Usage:
#   ./daily-feed-update.sh [hours] [max_articles]
#
# Examples:
#   ./daily-feed-update.sh           # Default: 24 hours, 25 articles
#   ./daily-feed-update.sh 48 20     # Last 48 hours, max 20 articles
###############################################################################

set -e  # Exit on error

# Configuration
HOURS=${1:-24}
MAX_ARTICLES=${2:-25}
BASE_DIR="$(cd "$(dirname "$0")" && pwd)"
OUTPUT_DIR="${BASE_DIR}/.output"
TODAY=$(date +%Y-%m-%d)

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Daily Feed Update - ${TODAY}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Change to base directory
cd "${BASE_DIR}"

# Step 2: Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  Dependencies not installed. Running npm install...${NC}"
    npm install
    echo ""
fi

# Step 3: Run the processing pipeline
echo -e "${BLUE}📡 Processing RSS feeds...${NC}"
echo "   Time window: Last ${HOURS} hours"
echo "   Max articles: ${MAX_ARTICLES}"
echo ""

node process-feeds.js \
    --hours=${HOURS} \
    --max-articles=${MAX_ARTICLES} \
    --format=compact

EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
    echo ""
    echo -e "${RED}❌ Processing failed with exit code ${EXIT_CODE}${NC}"
    exit $EXIT_CODE
fi

# Step 4: Verify outputs
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Processing Complete${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check for output files
AI_READY="${OUTPUT_DIR}/ai-ready-${TODAY}.txt"
STATS="${OUTPUT_DIR}/stats-${TODAY}.json"
SELECTED="${OUTPUT_DIR}/articles-selected-${TODAY}.json"

if [ -f "${AI_READY}" ]; then
    echo -e "${GREEN}✓${NC} AI-ready file created: ${AI_READY}"

    # Show file size and line count
    SIZE=$(wc -c < "${AI_READY}" | tr -d ' ')
    LINES=$(wc -l < "${AI_READY}" | tr -d ' ')
    echo "   Size: ${SIZE} bytes, ${LINES} lines"
else
    echo -e "${RED}✗${NC} AI-ready file not found: ${AI_READY}"
    exit 1
fi

if [ -f "${STATS}" ]; then
    echo -e "${GREEN}✓${NC} Statistics file created: ${STATS}"

    # Extract key statistics
    if command -v jq &> /dev/null; then
        TOTAL=$(jq -r '.total' "${STATS}")
        TOKENS=$(jq -r '.totalTokens' "${STATS}")
        AVG_SCORE=$(jq -r '.avgScore' "${STATS}")

        echo "   Articles: ${TOTAL}"
        echo "   Tokens: ${TOKENS}"
        echo "   Avg Score: ${AVG_SCORE}"
    fi
else
    echo -e "${YELLOW}⚠️${NC}  Statistics file not found: ${STATS}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📄 Output Files${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

ls -lh "${OUTPUT_DIR}"/*-${TODAY}.* 2>/dev/null || echo "No output files found"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎯 Ready for Hermes Agent${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next step: Read articles from ${AI_READY}"
echo ""
echo "Example usage in Hermes:"
echo "  cat ${AI_READY}"
echo ""

exit 0
