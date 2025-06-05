// Compute best buy (min) and suggested sell (75th percentile)
function computeBestBuyAndSell(prices: number[]): { bestBuyPrice: number; suggestedSellPrice: number } {
  if (!prices || prices.length === 0) {
    return { bestBuyPrice: 0, suggestedSellPrice: 0 };
  }
  const bestBuyPrice = Math.min(...prices);
  const sorted = prices.slice().sort((a, b) => a - b);
  const idx = Math.floor(0.75 * (sorted.length - 1));
  const suggestedSellPrice = sorted[idx];
  return { bestBuyPrice, suggestedSellPrice };
}

export { computeBestBuyAndSell };
