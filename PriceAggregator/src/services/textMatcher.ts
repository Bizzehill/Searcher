import { Configuration, OpenAIApi } from 'openai';
import { Listing } from '../types/Listing';

const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));

// Get embedding for a description text
async function getDescriptionEmbedding(text: string): Promise<number[]> {
  const resp = await openai.createEmbedding({ model: 'text-embedding-ada-002', input: text });
  return resp.data.data[0].embedding as number[];
}

// Cosine similarity for text embeddings
function cosineSimilarityText(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Match listings by description similarity
async function matchByText(
  queryText: string,
  candidates: Listing[]
): Promise<Array<{ listing: Listing; score: number }>> {
  const queryEmbed = await getDescriptionEmbedding(queryText);
  const results: Array<{ listing: Listing; score: number }> = [];
  for (const candidate of candidates) {
    const candEmbed = await getDescriptionEmbedding(candidate.title + ' ' + (candidate.description || ''));
    candidate.textEmbedding = candEmbed;
    const score = cosineSimilarityText(queryEmbed, candEmbed);
    results.push({ listing: candidate, score });
  }
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, 5);
}

export { getDescriptionEmbedding, matchByText };
