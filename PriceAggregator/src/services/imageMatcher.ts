import * as tf from '@tensorflow/tfjs-node';
import * as clip from '@tensorflow-models/clip';
import fetch from 'node-fetch';
import { Listing } from '../types/Listing';

// Load the CLIP model
async function loadClipModel(): Promise<clip.ClipModel> {
  return await clip.load();
}

// Get an embedding for an image URL
async function getImageEmbedding(model: clip.ClipModel, imageUrl: string): Promise<Float32Array> {
  const res = await fetch(imageUrl);
  const buffer = await res.buffer();
  const img = tf.node.decodeImage(buffer, 3) as tf.Tensor3D;
  const input = tf.expandDims(img, 0);
  const embedding = await model.embedImage(input);
  const arr = (await embedding.array()) as number[][];
  return new Float32Array(arr[0]);
}

// Compute cosine similarity between two embeddings
function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Match listings by image similarity
async function matchByImage(
  model: clip.ClipModel,
  queryImageUrl: string,
  candidates: Listing[]
): Promise<Array<{ listing: Listing; score: number }>> {
  const queryEmbed = await getImageEmbedding(model, queryImageUrl);
  const results: Array<{ listing: Listing; score: number }> = [];
  for (const candidate of candidates) {
    const candEmbed = await getImageEmbedding(model, candidate.imageUrl);
    candidate.imageEmbedding = candEmbed;
    const score = cosineSimilarity(queryEmbed, candEmbed);
    results.push({ listing: candidate, score });
  }
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, 5);
}

export { loadClipModel, getImageEmbedding, matchByImage };
