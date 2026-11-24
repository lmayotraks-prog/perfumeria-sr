// src/lib/clientEncyclopedia.ts — Motor cliente para la Enciclopedia de 25,663 fragancias en exportación estática
import { withBasePath } from '@/lib/assetPath';
import { expandSearchTerms } from '@/lib/olfactoryDictionary';
import { Perfume } from '@/types';

interface RawCompactPerfume {
  id: string;
  name: string;
  brand: string;
  year?: number | null;
  concentration?: string;
  rating?: number;
  reviews?: number;
  family?: string;
  gender?: string;
  perfumers?: string[];
  notes?: Perfume['notes'];
  accords?: Perfume['accords'];
  liquidColor?: string;
  liquidColorAlt?: string;
  glowColor?: string;
  accentColor?: string;
  parfumoUrl?: string;
}

interface CatalogIndex {
  perfumes: Perfume[];
  byId: Map<string, Perfume>;
  brands: { name: string; count: number; letter: string }[];
  letterCounts: Record<string, number>;
  perfumers: { name: string; count: number }[];
}

const LAB_HOUSES = new Set([
  'firmenich',
  'givaudan',
  'iff (international flavors & fragrances)',
  'iff',
  'symrise',
  'mane',
  'takasago',
  'robertet',
  'drom',
]);

let cachedIndexPromise: Promise<CatalogIndex> | null = null;

function getBrandLetter(brand: string): string {
  const ch = brand
    .trim()
    .charAt(0)
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  return ch >= 'A' && ch <= 'Z' ? ch : '#';
}

function hydratePerfume(raw: RawCompactPerfume): Perfume {
  return {
    id: raw.id,
    name: raw.name,
    brand: raw.brand,
    year: typeof raw.year === 'number' ? raw.year : undefined,
    description: '',
    shortDesc: '',
    family: (raw.family || 'Floral') as Perfume['family'],
    subfamilies: [],
    gender: (raw.gender || 'unisex') as Perfume['gender'],
    concentration: (raw.concentration || 'EDP') as Perfume['concentration'],
    liquidColor: raw.liquidColor || '#c9a145',
    liquidColorAlt: raw.liquidColorAlt || '#f4d682',
    glowColor: raw.glowColor || 'rgba(201,161,69,0.45)',
    accentColor: raw.accentColor || '#c9a145',
    marbleVariant: 'obsidian',
    notes: Array.isArray(raw.notes) ? raw.notes : [],
    accords: Array.isArray(raw.accords) ? raw.accords : [],
    price: 0,
    priceML: 100,
    sizes: [50, 100],
    rating: typeof raw.rating === 'number' ? raw.rating : 0,
    reviews: typeof raw.reviews === 'number' ? raw.reviews : 0,
    tags: [],
    featured: false,
    newArrival: false,
    bestseller: false,
    inspiredBy: undefined,
    perfumers: Array.isArray(raw.perfumers) ? raw.perfumers : undefined,
    parfumoUrl: raw.parfumoUrl,
    season: [],
    occasion: [],
    sillage: 3,
    longevity: 3,
  };
}

async function loadIndex(): Promise<CatalogIndex> {
  if (cachedIndexPromise) return cachedIndexPromise;

  cachedIndexPromise = (async (): Promise<CatalogIndex> => {
    try {
      const res = await fetch(withBasePath('/data/encyclopedia.json'));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const parsed = (await res.json()) as { perfumes?: RawCompactPerfume[] };
      const rawList = Array.isArray(parsed.perfumes) ? parsed.perfumes : [];

      const perfumes: Perfume[] = [];
      const byId = new Map<string, Perfume>();
      const brandMap = new Map<string, number>();
      const perfumerMap = new Map<string, number>();

      for (const raw of rawList) {
        const p = hydratePerfume(raw);
        perfumes.push(p);
        byId.set(p.id, p);
        if (p.brand) brandMap.set(p.brand, (brandMap.get(p.brand) || 0) + 1);
        if (Array.isArray(p.perfumers)) {
          for (const nose of p.perfumers) {
            perfumerMap.set(nose, (perfumerMap.get(nose) || 0) + 1);
          }
        }
      }

      const letterCounts: Record<string, number> = {};
      const brands = Array.from(brandMap.entries())
        .map(([name, count]) => {
          const letter = getBrandLetter(name);
          letterCounts[letter] = (letterCounts[letter] || 0) + 1;
          return { name, count, letter };
        })
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

      const perfumers = Array.from(perfumerMap.entries())
        .filter(([name]) => !LAB_HOUSES.has(name.toLowerCase()))
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

      return { perfumes, byId, brands, letterCounts, perfumers };
    } catch (err) {
      cachedIndexPromise = null;
      console.error('Error cargando enciclopedia estática:', err);
      return { perfumes: [], byId: new Map(), brands: [], letterCounts: {}, perfumers: [] };
    }
  })();

  return cachedIndexPromise;
}

function matchesTermList(haystack: string[], term: string): boolean {
  const candidates = expandSearchTerms(term);
  return candidates.some((c) => haystack.some((item) => item.includes(c)));
}

function expandToLowerSet(items: string[]): Set<string> {
  const out = new Set<string>();
  for (const item of items) {
    for (const expanded of expandSearchTerms(item)) {
      out.add(expanded);
    }
  }
  return out;
}

export async function queryEncyclopediaMeta(letter: string, q: string) {
  const index = await loadIndex();
  const normLetter = (letter || '').trim().toUpperCase();
  const metaQuery = (q || '').trim().toLowerCase();

  let letterBrands = index.brands;
  if (normLetter) {
    letterBrands = letterBrands.filter((b) => b.letter === normLetter);
  }
  if (metaQuery) {
    letterBrands = index.brands.filter((b) => b.name.toLowerCase().includes(metaQuery));
  }

  let perfumerList = index.perfumers;
  if (metaQuery) {
    perfumerList = perfumerList.filter((p) => p.name.toLowerCase().includes(metaQuery));
  }

  return {
    totalCatalog: index.perfumes.length,
    totalBrands: index.brands.length,
    totalPerfumers: index.perfumers.length,
    letterCounts: index.letterCounts,
    topBrands: index.brands.slice(0, 24),
    letterBrands: letterBrands.slice(0, 60),
    topPerfumers: perfumerList.slice(0, 36),
  };
}

export async function queryEncyclopediaSimilar(
  similarTo: string,
  fallbackAccords: string[],
  fallbackNotes: string[],
  fallbackFamily: string
): Promise<{ items: Perfume[] }> {
  const index = await loadIndex();
  const target = index.byId.get(similarTo);
  const targetAccords = expandToLowerSet(
    target ? target.accords.map((a) => a.name) : fallbackAccords
  );
  const targetNotes = expandToLowerSet(
    target ? target.notes.map((n) => n.name) : fallbackNotes
  );
  const targetFamily = (target?.family || fallbackFamily).toLowerCase();

  if (targetAccords.size === 0 && targetNotes.size === 0) return { items: [] };

  const scored: { item: Perfume; score: number }[] = [];
  for (const candidate of index.perfumes) {
    if (candidate.id === similarTo) continue;

    let score = 0;
    for (const acc of candidate.accords) {
      if (targetAccords.has(acc.name.toLowerCase())) score += 3;
    }
    for (const note of candidate.notes) {
      if (targetNotes.has(note.name.toLowerCase())) score += 2;
    }
    if (targetFamily && candidate.family.toLowerCase() === targetFamily) {
      score += 1;
    }
    if (score >= 4) {
      scored.push({ item: candidate, score });
    }
  }

  scored.sort(
    (a, b) =>
      b.score - a.score ||
      b.item.rating - a.item.rating ||
      b.item.reviews - a.item.reviews
  );

  return { items: scored.slice(0, 6).map((s) => s.item) };
}

export interface EncyclopediaSearchParams {
  page: number;
  limit: number;
  sortBy: string;
  search?: string;
  family?: string;
  brand?: string;
  perfumer?: string;
  concentration?: string;
  decade?: string;
  accords?: string[];
  includeNotes?: string[];
  excludeNotes?: string[];
}

export async function queryEncyclopediaSearch(params: EncyclopediaSearchParams) {
  const index = await loadIndex();
  if (index.perfumes.length === 0) {
    return { total: 0, page: 1, limit: params.limit, pages: 0, items: [] as Perfume[] };
  }

  const search = (params.search || '').trim().toLowerCase();
  const family = params.family;
  const brand = (params.brand || '').trim().toLowerCase();
  const perfumer = (params.perfumer || '').trim().toLowerCase();
  const concentration = (params.concentration || '').trim().toUpperCase();
  const decade = (params.decade || '').trim();
  const accordsParam = (params.accords || []).filter(Boolean);
  const includeNotes = (params.includeNotes || []).filter(Boolean);
  const excludeNotes = (params.excludeNotes || []).filter(Boolean);
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(60, Math.max(1, params.limit || 16));
  const sortBy = params.sortBy || 'rating';

  const searchTerms = search ? expandSearchTerms(search) : [];

  const filtered = index.perfumes.filter((p) => {
    if (family && family !== 'Todas' && p.family.toLowerCase() !== family.toLowerCase()) {
      return false;
    }
    if (brand && !p.brand.toLowerCase().includes(brand)) {
      return false;
    }
    if (perfumer) {
      const noses = (p.perfumers || []).map((n) => n.toLowerCase());
      if (!noses.some((n) => n.includes(perfumer))) return false;
    }
    if (concentration && concentration !== 'TODAS' && p.concentration.toUpperCase() !== concentration) {
      return false;
    }
    if (decade && decade !== 'todas') {
      if (!p.year) return false;
      if (decade === '2020' && p.year < 2020) return false;
      if (decade === '2010' && (p.year < 2010 || p.year > 2019)) return false;
      if (decade === '2000' && (p.year < 2000 || p.year > 2009)) return false;
      if (decade === '1990' && (p.year < 1990 || p.year > 1999)) return false;
      if (decade === 'classic' && p.year >= 1990) return false;
    }

    const noteNames = p.notes.map((n) => n.name.toLowerCase());
    const accordNames = p.accords.map((a) => a.name.toLowerCase());

    if (accordsParam.length > 0) {
      for (const reqAccord of accordsParam) {
        if (!matchesTermList(accordNames, reqAccord)) return false;
      }
    }
    if (includeNotes.length > 0) {
      for (const reqNote of includeNotes) {
        if (!matchesTermList(noteNames, reqNote)) return false;
      }
    }
    if (excludeNotes.length > 0) {
      for (const exNote of excludeNotes) {
        if (matchesTermList(noteNames, exNote)) return false;
      }
    }

    if (searchTerms.length > 0) {
      const nameL = p.name.toLowerCase();
      const brandL = p.brand.toLowerCase();
      const familyL = p.family.toLowerCase();
      const nosesL = (p.perfumers || []).map((n) => n.toLowerCase());

      const hit = searchTerms.some(
        (term) =>
          nameL.includes(term) ||
          brandL.includes(term) ||
          familyL.includes(term) ||
          nosesL.some((n) => n.includes(term)) ||
          noteNames.some((n) => n.includes(term)) ||
          accordNames.some((a) => a.includes(term))
      );
      if (!hit) return false;
    }

    return true;
  });

  if (sortBy === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
  } else if (sortBy === 'reviews') {
    filtered.sort((a, b) => b.reviews - a.reviews || b.rating - a.rating);
  } else if (sortBy === 'year') {
    filtered.sort((a, b) => (b.year || 0) - (a.year || 0) || b.reviews - a.reviews);
  } else if (sortBy === 'year_asc') {
    filtered.sort((a, b) => (a.year || 9999) - (b.year || 9999) || b.reviews - a.reviews);
  } else if (sortBy === 'name') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  const total = filtered.length;
  const pages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const items = filtered.slice(startIndex, startIndex + limit);

  return { total, page, limit, pages, items };
}
