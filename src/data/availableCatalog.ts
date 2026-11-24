// src/data/availableCatalog.ts — Catálogo Real Disponible de SR Essences (218 referencias importadas)
import availableRaw from './available-catalog.json';
import { Perfume } from './perfumes';
import { DepartmentMode } from '@/types';

export const AVAILABLE_PERFUMES: Perfume[] = ((availableRaw.perfumes || []) as Perfume[]).map(
  (p) => ({
    ...p,
    imageUrl: `/api/catalog-image/${p.id}`,
  })
);

export const DAMA_PERFUMES: Perfume[] = AVAILABLE_PERFUMES.filter((p) => p.gender === 'femenino');
export const CABALLERO_PERFUMES: Perfume[] = AVAILABLE_PERFUMES.filter((p) => p.gender === 'masculino');

export function getDepartmentPerfumes(dept: DepartmentMode): Perfume[] {
  return dept === 'dama' ? DAMA_PERFUMES : CABALLERO_PERFUMES;
}

const PRIORITY_DAMA = [
  'chanel-coco-mademoiselle',
  'carolina-herrera-good-girl',
  'dior-miss-dior',
  'ariana-grande-cloud',
  'lancome-la-vie-est-belle',
  'paco-rabanne-olympea',
  'jean-paul-gaultier-scandal',
  'valentino-donna-born-in-roma',
];

const PRIORITY_CABALLERO = [
  'creed-aventus',
  'dior-sauvage',
  'chanel-bleu-de-chanel',
  'lattafa-khamrah',
  'paco-rabanne-1-million',
  'giorgio-armani-acqua-di-gio-profumo',
  'versace-eros',
  'paco-rabanne-invictus',
];

export function getFeaturedByDepartment(dept: DepartmentMode, count = 6): Perfume[] {
  const list = getDepartmentPerfumes(dept);
  const priorityIds = dept === 'dama' ? PRIORITY_DAMA : PRIORITY_CABALLERO;
  const picked: Perfume[] = [];

  for (const id of priorityIds) {
    const found = list.find((p) => p.id === id);
    if (found) picked.push(found);
  }
  if (picked.length < count) {
    for (const p of list) {
      if (!picked.some((x) => x.id === p.id)) {
        picked.push(p);
        if (picked.length >= count) break;
      }
    }
  }
  return picked.slice(0, count);
}

export function getBrandsByDepartment(dept: DepartmentMode): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const p of getDepartmentPerfumes(dept)) {
    counts.set(p.brand, (counts.get(p.brand) || 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function getFamiliesByDepartment(dept: DepartmentMode): string[] {
  const set = new Set<string>();
  for (const p of getDepartmentPerfumes(dept)) {
    if (p.family) set.add(p.family);
  }
  return Array.from(set).sort();
}
