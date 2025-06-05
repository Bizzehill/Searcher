export interface Listing {
  title: string;
  description?: string;
  price: number;
  imageUrl: string;
  link: string;
  source: 'ebay' | 'facebook';
  imageEmbedding?: Float32Array;
  textEmbedding?: number[];
}
