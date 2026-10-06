export interface GradientVariation {
  id: string;
  name: string;
  colors: string[];
  mode: 'light' | 'dark';
  src: string;
  css: string;
  cssKind: 'native' | 'asset';
  tags: string[];
}

export interface GradientTemplate {
  id: string;
  slug: string;
  name: string;
  category: 'smooth' | 'mesh' | 'glow' | 'vintage' | 'waves' | 'landing' | 'footer';
  tags: string[];
  variations: GradientVariation[];
}
