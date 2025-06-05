import puppeteer from 'puppeteer';
import { Listing } from '../types/Listing';

// Scrape Facebook Marketplace for listings matching a keyword
async function searchListings(keyword: string): Promise<Listing[]> {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  const url = `https://www.facebook.com/marketplace/search/?query=${encodeURIComponent(keyword)}`;
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  const items: Listing[] = await page.evaluate(() => {
    const results: Listing[] = [] as any;
    const cards = document.querySelectorAll('[role="article"]');
    cards.forEach(card => {
      const title = (card.querySelector('span') as HTMLElement)?.innerText || '';
      const priceText = (card.querySelector('span[dir]') as HTMLElement)?.innerText || '';
      const price = parseFloat(priceText.replace(/[^0-9\.]/g, '')) || 0;
      const imageUrl = (card.querySelector('img') as HTMLImageElement)?.src || '';
      const link = (card.querySelector('a') as HTMLAnchorElement)?.href || '';
      if (title && imageUrl && link) {
        results.push({ title, price, imageUrl, link, source: 'facebook' });
      }
    });
    return results;
  });

  await browser.close();
  return items;
}

export { searchListings };
