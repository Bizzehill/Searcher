import express from 'express';
import asyncHandler from 'express-async-handler';
import { searchListings as ebaySearch } from '../services/ebayService';
import { searchListings as fbSearch } from '../services/fbScraper';
import { computeBestBuyAndSell } from '../services/priceCalculator';
import { Listing } from '../types/Listing';

// Router handling search operations
const searchRouter = express.Router();

// GET /search?query=KEYWORD
searchRouter.get(
  '/',
  asyncHandler(async (req: express.Request, res: express.Response) => {
    // Extract query string and validate
    const query = (req.query.query as string) || '';
    if (!query) {
      return res.status(400).json({ error: 'query parameter is required' });
    }
    // Fetch from eBay and Facebook concurrently
    const [ebayItems, fbItems] = await Promise.all([
      ebaySearch(query),
      fbSearch(query)
    ]);

    // Combine listings from both sources
    const allItems: Listing[] = [...ebayItems, ...fbItems];
    const prices = allItems.map(i => i.price).filter(p => !isNaN(p));

    // Compute recommended prices
    const { bestBuyPrice, suggestedSellPrice } = computeBestBuyAndSell(prices);

    // Return JSON response
    return res.json({ items: allItems, bestBuyPrice, suggestedSellPrice });
  })
);

// Named export for server.ts
export { searchRouter };
