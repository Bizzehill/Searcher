import { Browse } from '@ebay/marketplace-node';
import { Listing } from '../types/Listing';

// Search eBay listings via official API
async function searchListings(keyword: string): Promise<Listing[]> {
  const client = new Browse({
    appId: process.env.EBAY_APP_ID || ''
  });
  try {
    const response = await client.search({ q: keyword, limit: 20 });
    if (!response?.itemSummaries) return [];
    return response.itemSummaries.map((item: any) => ({
      title: item.title,
      price: parseFloat(item.price?.value) || 0,
      imageUrl: item.image?.imageUrl || '',
      link: item.itemWebUrl,
      source: 'ebay'
    }));
  } catch (err) {
    console.error('eBay search error', err);
    return [];
  }
}

export { searchListings };
