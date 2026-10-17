import type { collections } from '../data/collections';
export interface GradientVariation {
  id: string;
  name: string;
  colors: string[];
  mode: 'light' | 'dark';
  src: string;
  thumbnail: string;
  backgroundSrc?: string;
  css: string;
  cssKind: 'native' | 'asset';
  sourceKind?: 'original-raster' | 'recoloured-raster';
  sourceWidth?: number;
  sourceHeight?: number;
  tags: string[];
}

export interface GradientTemplate {
  id: string;
  slug: string;
  name: string;
  stylesheet: string;
  category: (typeof collections)[number]['id'];
  tags: string[];
  variations: GradientVariation[];
}
