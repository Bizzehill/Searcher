# PriceAggregator

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and provide your API keys:
   ```
   EBAY_APP_ID=your_ebay_app_id
   OPENAI_API_KEY=your_openai_api_key
   ```
   If running Puppeteer in a restricted environment (e.g. Docker), you may need
   to pass additional Chrome flags:
   ```
   PUPPETEER_ARGS="--no-sandbox --disable-setuid-sandbox"
   ```
3. Build and run:
   ```bash
   npx tsc
   node dist/server.js
   ```
   Or for development with ts-node:
   ```bash
   npx ts-node src/server.ts
   ```

## Endpoints
- `GET /search?query=KEYWORD` – aggregated listings with bestBuyPrice and suggestedSellPrice.
- `POST /match` – body `{ imageUrl, description }` returns top matches and computed prices.

## Notes
- Facebook scraping selectors may require updates if the DOM changes.
- eBay API calls may be rate-limited; add retries as needed.
- Loading the CLIP model can take a few seconds. Consider caching it for performance.
- If Chrome isn't auto-detected, set `PUPPETEER_EXECUTABLE_PATH` to the Chrome binary path.
