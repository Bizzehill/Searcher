import express from 'express';
import asyncHandler from 'express-async-handler';
import { searchListings as ebaySearch } from '../services/ebayService';
import { searchListings as fbSearch } from '../services/fbScraper';
import { computeBestBuyAndSell } from '../services/priceCalculator';
import { Listing } from '../types/Listing';

const router = express.Router();

// GET /search?query=KEYWORD
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const query = (req.query.query as string) || '';
    if (!query) {
      return res.status(400).json({ error: 'query parameter is required' });
    }
    const [ebayItems, fbItems] = await Promise.all([
      ebaySearch(query),
      fbSearch(query)
    ]);
    const allItems: Listing[] = [...ebayItems, ...fbItems];
    const prices = allItems.map(i => i.price).filter(p => !isNaN(p));
    const { bestBuyPrice, suggestedSellPrice } = computeBestBuyAndSell(prices);
    return res.json({ items: allItems, bestBuyPrice, suggestedSellPrice });
  })
);

export default router;
