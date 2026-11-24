// src/types/index.ts
import type { Perfume } from '@/data/perfumes';

export type { Perfume, OlfactoryNote, OlfactoryAccord, OlfactoryFamily, NoteCategory } from '@/data/perfumes';

export type AmbianceMode = 'lumiere' | 'nocturne';
export type DepartmentMode = 'dama' | 'caballero';
export type ViewerMode = 'real3d' | 'crystal3d' | 'film';
export type AppView = 'home' | 'catalog' | 'encyclopedia' | 'how-to-buy';

export interface QuoteBagItem {
  perfume: Perfume;
  sizeMl: 50 | 100;
  qty: number;
}

export interface FilterState {
  search: string;
  family: string | null;
  gender: string | null;
  brand: string | null;
  notes: string[];
  priceRange: [number, number];
  season: string | null;
  occasion: string | null;
  sortBy: 'featured' | 'rating' | 'name' | 'newest';
  showBestsellers: boolean;
  showNewArrivals: boolean;
}

export interface UIState {
  activePerfumeId: string;
  activeView: AppView;
  isViewerExpanded: boolean;
  isCatalogOpen: boolean;
  isPyramidOpen: boolean;
  isDrawerOpen: boolean;
  isBagOpen: boolean;
  activeSection: 'hero' | 'catalog' | 'about';
  department: DepartmentMode;
  ambiance: AmbianceMode;
  viewerMode: ViewerMode;
}
