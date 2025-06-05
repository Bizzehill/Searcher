import express from 'express';
import asyncHandler from 'express-async-handler';
import { searchListings as ebaySearch } from '../services/ebayService';
import { searchListings as fbSearch } from '../services/fbScraper';
import { loadClipModel, matchByImage } from '../services/imageMatcher';
import { matchByText } from '../services/textMatcher';
import { computeBestBuyAndSell } from '../services/priceCalculator';
import { Listing } from '../types/Listing';

const router = express.Router();

// POST /match
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { imageUrl, description } = req.body;
    if (!imageUrl || !description) {
      return res.status(400).json({ error: 'Both imageUrl and description are required' });
    }
    const [ebayItems, fbItems] = await Promise.all([
      ebaySearch(description),
      fbSearch(description)
    ]);
    const candidates: Listing[] = [...ebayItems, ...fbItems];

    const model = await loadClipModel();
    const imageMatches = await matchByImage(model, imageUrl, candidates);
    const textMatches = await matchByText(description, candidates);

    const map = new Map<string, { listing: Listing; imageScore?: number; textScore?: number }>();
    for (const { listing, score } of imageMatches) {
      map.set(listing.link, { listing, imageScore: score });
    }
    for (const { listing, score } of textMatches) {
      const existing = map.get(listing.link);
      if (existing) existing.textScore = score; else map.set(listing.link, { listing, textScore: score });
    }
    const merged: Array<{ listing: Listing; combinedScore: number }> = [];
    for (const { listing, imageScore = 0, textScore = 0 } of map.values()) {
      merged.push({ listing, combinedScore: (imageScore + textScore) / 2 });
    }
    merged.sort((a, b) => b.combinedScore - a.combinedScore);
    const top = merged.slice(0, 5);

    const prices = top.map(r => r.listing.price);
    const { bestBuyPrice, suggestedSellPrice } = computeBestBuyAndSell(prices);

    return res.json({
      matchedItems: top.map(r => ({
        title: r.listing.title,
        price: r.listing.price,
        imageUrl: r.listing.imageUrl,
        link: r.listing.link,
        similarityScore: r.combinedScore,
        source: r.listing.source
      })),
      bestBuyPrice,
      suggestedSellPrice
    });
  })
);

export default router;
