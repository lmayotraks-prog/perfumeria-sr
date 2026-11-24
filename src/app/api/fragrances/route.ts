// src/app/api/fragrances/route.ts — API Enciclopedia Olfativa Estilo Fragrantica.es (25,663 fragancias)
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { expandSearchTerms } from '@/lib/olfactoryDictionary';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface FragranceRecord {
  id: string;
  name: string;
  brand: string;
  year: number | null;
  concentration: string;
  rating: number;
  reviews: number;
  family: string;
  subfamilies: string[];
  gender: string;
  perfumers?: string[];
  description: string;
  shortDesc: string;
  notes: { name: string; intensity: number; category: 'salida' | 'corazon' | 'fondo' }[];
  accords: { name: string; percentage: number; color: string }[];
  liquidColor: string;
  liquidColorAlt: string;
  glowColor: string;
  accentColor: string;
  marbleVariant: 'dark' | 'bronze' | 'noir' | 'obsidian' | 'earth';
  price: number;
  priceML: number;
  sizes: number[];
  tags: string[];
  featured: boolean;
  newArrival: boolean;
  bestseller: boolean;
  inspiredBy: string | null;
  season: ('primavera' | 'verano' | 'otoño' | 'invierno')[];
  occasion: ('día' | 'noche' | 'trabajo' | 'especial' | 'casual')[];
  sillage: number;
  longevity: number;
  parfumoUrl?: string;
  sourceDataset?: string;
}

interface CatalogIndex {
  perfumes: FragranceRecord[];
  byId: Map<string, FragranceRecord>;
  brands: { name: string; count: number; letter: string }[];
  letterCounts: Record<string, number>;
  perfumers: { name: string; count: number }[];
  accords: { name: string; count: number }[];
  notes: { name: string; count: number }[];
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

let cachedIndex: CatalogIndex | null = null;

function getBrandLetter(brand: string): string {
  const ch = brand
    .trim()
    .charAt(0)
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  return ch >= 'A' && ch <= 'Z' ? ch : '#';
}

function getCatalogIndex(): CatalogIndex {
  if (cachedIndex) return cachedIndex;

  try {
    const candidatePaths = [
      path.join(process.cwd(), 'src', 'data', 'parfumo-catalog.json'),
      path.join(process.cwd(), 'sr-essences-web', 'src', 'data', 'parfumo-catalog.json'),
      path.resolve(__dirname, '..', '..', '..', 'data', 'parfumo-catalog.json'),
    ];
    const filePath = candidatePaths.find((p) => fs.existsSync(p));
    if (!filePath) {
      console.error('No se encontró parfumo-catalog.json en:', candidatePaths);
      return {
        perfumes: [],
        byId: new Map(),
        brands: [],
        letterCounts: {},
        perfumers: [],
        accords: [],
        notes: [],
      };
    }

    const fileData = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(fileData);
    const perfumes = (parsed.perfumes || []) as FragranceRecord[];

    const byId = new Map<string, FragranceRecord>();
    const brandMap = new Map<string, number>();
    const perfumerMap = new Map<string, number>();
    const accordMap = new Map<string, number>();
    const noteMap = new Map<string, number>();

    for (const p of perfumes) {
      byId.set(p.id, p);
      if (p.brand) brandMap.set(p.brand, (brandMap.get(p.brand) || 0) + 1);

      if (Array.isArray(p.perfumers)) {
        for (const nose of p.perfumers) {
          perfumerMap.set(nose, (perfumerMap.get(nose) || 0) + 1);
        }
      }
      if (Array.isArray(p.accords)) {
        for (const acc of p.accords) {
          accordMap.set(acc.name, (accordMap.get(acc.name) || 0) + 1);
        }
      }
      if (Array.isArray(p.notes)) {
        for (const n of p.notes) {
          noteMap.set(n.name, (noteMap.get(n.name) || 0) + 1);
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

    const accords = Array.from(accordMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const notes = Array.from(noteMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    cachedIndex = {
      perfumes,
      byId,
      brands,
      letterCounts,
      perfumers,
      accords,
      notes,
    };
    return cachedIndex;
  } catch (err) {
    console.error('Error cargando catálogo:', err);
    return {
      perfumes: [],
      byId: new Map(),
      brands: [],
      letterCounts: {},
      perfumers: [],
      accords: [],
      notes: [],
    };
  }
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

function findSimilarPerfumes(
  index: CatalogIndex,
  targetId: string,
  fallbackAccords: string[],
  fallbackNotes: string[],
  fallbackFamily: string
): FragranceRecord[] {
  const target = index.byId.get(targetId);
  const targetAccords = expandToLowerSet(target ? target.accords.map((a) => a.name) : fallbackAccords);
  const targetNotes = expandToLowerSet(target ? target.notes.map((n) => n.name) : fallbackNotes);
  const targetFamily = (target?.family || fallbackFamily).toLowerCase();

  if (targetAccords.size === 0 && targetNotes.size === 0) return [];

  const scored: { item: FragranceRecord; score: number }[] = [];

  for (const candidate of index.perfumes) {
    if (candidate.id === targetId) continue;

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

  return scored.slice(0, 6).map((s) => s.item);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('mode');
  const index = getCatalogIndex();

  // 1. Metadata & Directorio (Diseñadores A-Z + Narices + Estadísticas reales)
  if (mode === 'meta') {
    const letter = (searchParams.get('letter') || '').trim().toUpperCase();
    const metaQuery = (searchParams.get('q') || '').trim().toLowerCase();

    let letterBrands = index.brands;
    if (letter) {
      letterBrands = letterBrands.filter((b) => b.letter === letter);
    }
    if (metaQuery) {
      letterBrands = index.brands.filter((b) => b.name.toLowerCase().includes(metaQuery));
    }

    let perfumerList = index.perfumers;
    if (metaQuery) {
      perfumerList = perfumerList.filter((p) => p.name.toLowerCase().includes(metaQuery));
    }

    return NextResponse.json({
      totalCatalog: index.perfumes.length,
      totalBrands: index.brands.length,
      totalPerfumers: index.perfumers.length,
      letterCounts: index.letterCounts,
      topBrands: index.brands.slice(0, 24),
      letterBrands: letterBrands.slice(0, 60),
      topPerfumers: perfumerList.slice(0, 36),
      topAccords: index.accords.slice(0, 20),
      topNotes: index.notes.slice(0, 40),
    });
  }

  // 2. Fragancias Similares ("Perfil Olfativo Compartido" estilo Fragrantica)
  const similarTo = searchParams.get('similarTo');
  if (similarTo) {
    const fallbackAccords = (searchParams.get('accords') || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const fallbackNotes = (searchParams.get('notes') || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const fallbackFamily = searchParams.get('family') || '';

    const items = findSimilarPerfumes(index, similarTo, fallbackAccords, fallbackNotes, fallbackFamily);
    return NextResponse.json({ items });
  }

  // 3. Búsqueda y Filtros Avanzados de Enciclopedia
  if (index.perfumes.length === 0) {
    return NextResponse.json({ total: 0, page: 1, limit: 16, pages: 0, items: [] });
  }

  const search = (searchParams.get('search') || '').trim().toLowerCase();
  const family = searchParams.get('family');
  const brand = (searchParams.get('brand') || '').trim().toLowerCase();
  const perfumer = (searchParams.get('perfumer') || '').trim().toLowerCase();
  const concentration = (searchParams.get('concentration') || '').trim().toUpperCase();
  const decade = (searchParams.get('decade') || '').trim();
  const accordsParam = (searchParams.get('accords') || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const includeNotes = (searchParams.get('includeNotes') || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const excludeNotes = (searchParams.get('excludeNotes') || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(60, Math.max(1, parseInt(searchParams.get('limit') || '16', 10)));
  const sortBy = searchParams.get('sortBy') || 'rating';

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

  return NextResponse.json({
    total,
    page,
    limit,
    pages,
    items,
  });
}
