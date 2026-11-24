// src/lib/catalogImageFetcher.ts
// Obtiene y cachea localmente fotografías HD de frascos en línea mediante
// búsqueda verificada en tiendas Shopify especializadas en perfumería
// (y fallback opcional a Parfumo solo cuando el slug coincide), más fallback local seguro.
import fs from 'node:fs/promises';
import path from 'node:path';
import availableRaw from '@/data/available-catalog.json';
import { Perfume } from '@/types';

const PERFUMES: Perfume[] = (availableRaw.perfumes || []) as Perfume[];
const PERFUME_BY_ID = new Map<string, Perfume>(PERFUMES.map((p) => [p.id, p]));

const HD_CACHE_DIR = path.join(process.cwd(), 'public', 'images', 'catalog-hd');
const TMP_CACHE_DIR = '/tmp/catalog-hd';
const LOCAL_PUBLIC_DIR = path.join(process.cwd(), 'public');

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

const SHOPIFY_STORES = [
  'https://perfumeonline.ca',
  'https://www.aurafragrance.com',
  'https://www.tripletraders.com',
  'https://www.olfactoryfactoryllc.com',
] as const;

const BRAND_ALIASES: Record<string, string[]> = {
  dior: ['dior', 'christian dior'],
  'paco rabanne': ['paco rabanne', 'rabanne'],
  'yves saint laurent': ['yves saint laurent', 'ysl'],
  ysl: ['yves saint laurent', 'ysl'],
  'dolce gabbana': ['dolce gabbana', 'dolce and gabbana', 'dolcegabbana', 'd g', 'dg'],
  'giorgio armani': ['giorgio armani', 'armani'],
  'jean paul gaultier': ['jean paul gaultier', 'jpg', 'gaultier'],
  'carolina herrera': ['carolina herrera', 'ch'],
  'hugo boss': ['hugo boss', 'boss'],
  'ralph lauren': ['ralph lauren', 'polo'],
  'victorias secret': ['victorias secret', 'victoria secret'],
  'calvin klein': ['calvin klein', 'ck'],
  bvlgari: ['bvlgari', 'bulgari'],
  montblanc: ['montblanc', 'mont blanc'],
  'mercedes benz': ['mercedes benz', 'mercedes'],
  victorinox: ['victorinox', 'swiss army'],
  'salvatore ferragamo': ['salvatore ferragamo', 'ferragamo'],
  'tommy hilfiger': ['tommy hilfiger', 'hilfiger'],
  'al haramain': ['al haramain', 'haramain'],
  lattafa: ['lattafa', 'lattafa perfumes', 'lattafa pride'],
  orientica: ['orientica', 'orientica premium'],
  'jennifer lopez': ['jennifer lopez', 'jlo', 'j lo'],
  benetton: ['benetton', 'united colors of benetton'],
  ferrari: ['ferrari', 'scuderia ferrari'],
  lancome: ['lancome'],
};

const NAME_STOP_WORDS = new Set([
  'for',
  'of',
  'by',
  'in',
  'and',
  'et',
  'de',
  'di',
  'du',
  'des',
  'la',
  'le',
  'les',
  'the',
  'to',
  'on',
  'with',
  'pour',
]);

const NON_BOTTLE_WORDS = [
  'sample',
  'decant',
  'vial',
  'set',
  'coffret',
  'lotion',
  'deodorant',
  'deo',
  'mini',
  'miniature',
  'rollerball',
  'refill',
  'candle',
  'soap',
  'cream',
  'balm',
  'oil',
  'attar',
  'shampoo',
  'powder',
  'pouch',
  'duo',
  'trio',
  'discovery',
  'sampler',
  'kit',
  'bundle',
  'pack',
  'travel',
  'pocket',
  'purse',
  'atomizer',
  'aftershave',
];

const NON_BOTTLE_PHRASES = [
  'travel spray',
  'gift set',
  'shower gel',
  'after shave',
  'hair mist',
  'body mist',
  'body spray',
  'body lotion',
  'body wash',
  'body cream',
  'hand cream',
  'deodorant stick',
  'deodorant spray',
  'shaving balm',
  'bath gel',
  'mini set',
  'value set',
  'piece set',
  '2 pc',
  '3 pc',
  '4 pc',
];

const FLANKER_MODIFIERS = [
  'blush',
  'elixir',
  'intense',
  'absolu',
  'absolue',
  'absolut',
  'parfum',
  'extrait',
  'extreme',
  'noir',
  'black',
  'gold',
  'rouge',
  'aqua',
  'sport',
  'light',
  'supreme',
  'legere',
  'very',
  'glam',
  'oud',
  'royal',
  'lucky',
  'prive',
  'privee',
  'victory',
  'platinum',
  'cobalt',
  'hero',
  'heroes',
  'cologne',
  'night',
  'unlimited',
  'infinite',
  'flame',
  'energy',
  'qahwa',
  'bourbon',
  'rebel',
  'dive',
  'profondo',
  'profumo',
  'legend',
  'spirit',
  'blue',
  'bleu',
  'red',
  'pink',
  'silver',
  'white',
  'blanc',
  'vert',
  'green',
  'jaune',
  'yellow',
  'rose',
  'coral',
  'amethyst',
  'amethyste',
  'sublime',
  'pearl',
  'bubble',
  'sparkling',
  'magnetic',
  'energized',
  'fantastic',
  'extraordinaire',
  'misteriosa',
  'florale',
  'floral',
  'ultra',
  'sexy',
  'vip',
  'pure',
  'lady',
  'boy',
  'girl',
  'only',
  'intenso',
  'fraiche',
  'midnight',
  'velvet',
  'iced',
  'ice',
  'freeze',
  'limited',
  'collector',
  'summer',
  'winter',
  'intensement',
  'tattoo',
  'terrible',
  'rush',
  'grey',
  'gray',
  'sensuelle',
  'forever',
  'exces',
  'saffron',
  'oui',
  'absolutely',
  'pin',
  'so',
];

const TOKEN_EQUIVALENTS: Record<string, string[]> = {
  blanc: ['white'],
  white: ['blanc'],
  noir: ['black'],
  black: ['noir'],
  rouge: ['red'],
  red: ['rouge'],
  bleu: ['blue'],
  blue: ['bleu'],
  vert: ['green'],
  green: ['vert'],
  jaune: ['yellow'],
  yellow: ['jaune'],
  grey: ['gray'],
  gray: ['grey'],
  amethyst: ['amethyste'],
  amethyste: ['amethyst'],
  floral: ['florale'],
  florale: ['floral'],
  prive: ['privee'],
  privee: ['prive'],
  absolu: ['absolue', 'absolut'],
  absolue: ['absolu', 'absolut'],
  absolut: ['absolu', 'absolue'],
  hero: ['heroes'],
  heroes: ['hero'],
  man: ['men', 'mens', 'homme', 'him', 'lui', 'uomo', 'masculine'],
  men: ['man', 'mens', 'homme', 'him', 'lui', 'uomo', 'masculine'],
  homme: ['man', 'men', 'mens', 'him', 'lui', 'uomo', 'masculine'],
  him: ['man', 'men', 'mens', 'homme', 'lui', 'uomo', 'masculine'],
  lui: ['man', 'men', 'mens', 'homme', 'him', 'uomo', 'masculine'],
  uomo: ['man', 'men', 'mens', 'homme', 'him', 'lui', 'masculine'],
  woman: ['women', 'womens', 'femme', 'her', 'elle', 'donna', 'feminine'],
  women: ['woman', 'womens', 'femme', 'her', 'elle', 'donna', 'feminine'],
  femme: ['woman', 'women', 'womens', 'her', 'elle', 'donna', 'feminine'],
  her: ['woman', 'women', 'womens', 'femme', 'elle', 'donna', 'feminine'],
  elle: ['woman', 'women', 'womens', 'femme', 'her', 'donna', 'feminine'],
  donna: ['woman', 'women', 'womens', 'femme', 'her', 'elle', 'feminine'],
};

const BOILERPLATE_TITLE_WORDS = new Set([
  'eau',
  'de',
  'parfum',
  'toilette',
  'cologne',
  'edp',
  'edt',
  'edc',
  'spray',
  'sp',
  'vapo',
  'vaporisateur',
  'natural',
  'for',
  'men',
  'mens',
  'women',
  'womens',
  'man',
  'woman',
  'him',
  'her',
  'unisex',
  'pour',
  'homme',
  'femme',
  'lui',
  'elle',
  'uomo',
  'donna',
  'by',
  'ml',
  'oz',
  'fl',
  'new',
  'box',
  'nib',
  'sealed',
  'authentic',
  'original',
  'perfume',
  'fragrance',
  'refillable',
  'm',
  'w',
  'u',
]);

const MIN_ACCEPT_SCORE = 55;

export interface ResolvedCatalogImage {
  buffer: Buffer;
  contentType: string;
  source: 'cache-hd' | 'online-hd' | 'local-fallback';
}

interface ShopifySuggestProduct {
  title?: string;
  vendor?: string;
  image?: string | null;
  featured_image?: { url?: string | null } | string | null;
}

interface ScoredCandidate {
  imageUrl: string;
  referer: string;
  score: number;
  title: string;
}

const inFlight = new Map<string, Promise<ResolvedCatalogImage | null>>();
const failedUntil = new Map<string, number>();
const NEGATIVE_CACHE_TTL_MS = 5 * 60 * 1000;

function normalizeText(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['’`´]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function tokenize(input: string): string[] {
  const norm = normalizeText(input);
  return norm ? norm.split(/\s+/) : [];
}

function containsWholePhrase(normalizedHaystack: string, normalizedPhrase: string): boolean {
  if (!normalizedHaystack || !normalizedPhrase) return false;
  return ` ${normalizedHaystack} `.includes(` ${normalizedPhrase} `);
}

function getBrandAliases(brand: string): string[] {
  const normBrand = normalizeText(brand);
  const aliases = BRAND_ALIASES[normBrand] || [normBrand];
  return Array.from(new Set([normBrand, ...aliases].filter(Boolean)));
}

function matchesBrand(brand: string, vendor: string, title: string): { matched: boolean; inVendor: boolean; inTitle: boolean } {
  const aliases = getBrandAliases(brand);
  const normVendor = normalizeText(vendor);
  const normTitle = normalizeText(title);

  const inVendor = aliases.some((a) => containsWholePhrase(normVendor, a));
  const inTitle = aliases.some((a) => containsWholePhrase(normTitle, a));
  return { matched: inVendor || inTitle, inVendor, inTitle };
}

function stripConcentrationsForFlankerCheck(normalizedTitle: string): string {
  return normalizedTitle
    .replace(/\beau de parfum\b/g, ' ')
    .replace(/\beau de toilette\b/g, ' ')
    .replace(/\beau de cologne\b/g, ' ')
    .replace(/\bextrait de parfum\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildTokenMatchSet(tokens: string[]): Set<string> {
  const set = new Set<string>(tokens);
  for (let i = 0; i < tokens.length - 1; i++) {
    set.add(tokens[i] + tokens[i + 1]);
  }
  return set;
}

function getDistinctiveNameTokens(perfume: Perfume): string[] {
  const cleanedName = perfume.name.replace(/\(\s*\d{4}\s*\)/g, ' ');
  const allTokens = tokenize(cleanedName);
  const directBrandTokenSet = new Set(tokenize(perfume.brand));

  const nonStop = allTokens.filter((t) => !NAME_STOP_WORDS.has(t));
  const withoutBrand = nonStop.filter((t) => !directBrandTokenSet.has(t));

  const chosen = withoutBrand.length > 0 ? withoutBrand : nonStop.length > 0 ? nonStop : allTokens;
  return Array.from(new Set(chosen));
}

function matchesTokenInTitle(
  token: string,
  normTitle: string,
  titleTokenSet: Set<string>,
  strippedTitleTokenSet: Set<string>,
  nameHasConcentrationPhrase: boolean
): boolean {
  if (token === 'eau' && !nameHasConcentrationPhrase) {
    return strippedTitleTokenSet.has('eau');
  }
  if (token === 'edp') {
    return titleTokenSet.has('edp') || containsWholePhrase(normTitle, 'eau de parfum');
  }
  if (token === 'edt') {
    return titleTokenSet.has('edt') || containsWholePhrase(normTitle, 'eau de toilette');
  }
  if (token === 'edc') {
    return titleTokenSet.has('edc') || containsWholePhrase(normTitle, 'eau de cologne');
  }
  if (titleTokenSet.has(token)) return true;
  const equivs = TOKEN_EQUIVALENTS[token] || [];
  return equivs.some((eq) => titleTokenSet.has(eq));
}

function scoreProductTitle(
  perfume: Perfume,
  candidateTitle: string,
  candidateVendor: string,
  requireBrand = true
): number {
  const brandCheck = requireBrand
    ? matchesBrand(perfume.brand, candidateVendor, candidateTitle)
    : { matched: true, inVendor: false, inTitle: false };
  if (!brandCheck.matched) return -Infinity;

  const normTitle = normalizeText(candidateTitle);
  const normName = normalizeText(perfume.name);
  if (!normTitle || !normName) return -Infinity;

  const titleTokens = tokenize(candidateTitle);
  const titleTokenSet = buildTokenMatchSet(titleTokens);
  const nameTokens = tokenize(perfume.name);
  const nameTokenSet = buildTokenMatchSet(nameTokens);

  // Penalización fuerte a muestras, sets, lociones, etc. (salvo que el nombre del perfume los incluya)
  let nonBottlePenalty = 0;
  for (const phrase of NON_BOTTLE_PHRASES) {
    if (containsWholePhrase(normTitle, phrase) && !containsWholePhrase(normName, phrase)) {
      nonBottlePenalty += 90;
    }
  }
  for (const word of NON_BOTTLE_WORDS) {
    if (titleTokenSet.has(word) && !nameTokenSet.has(word)) {
      nonBottlePenalty += 85;
    }
  }
  if (nonBottlePenalty > 0) return -Infinity;

  const strippedForFlankers = stripConcentrationsForFlankerCheck(normTitle);
  const strippedTitleTokens = tokenize(strippedForFlankers);
  const strippedTitleTokenSet = buildTokenMatchSet(strippedTitleTokens);
  const nameHasConcentrationPhrase =
    containsWholePhrase(normName, 'eau de parfum') ||
    containsWholePhrase(normName, 'eau de toilette') ||
    containsWholePhrase(normName, 'eau de cologne');

  // Coincidencia estricta de tokens distintivos del nombre
  const distinctive = getDistinctiveNameTokens(perfume);
  if (distinctive.length === 0) return -Infinity;

  let matchedCount = 0;
  for (let i = 0; i < distinctive.length; i++) {
    const token = distinctive[i];
    const nextToken = distinctive[i + 1];
    if (
      matchesTokenInTitle(token, normTitle, titleTokenSet, strippedTitleTokenSet, nameHasConcentrationPhrase) ||
      (nextToken && titleTokenSet.has(token + nextToken))
    ) {
      matchedCount++;
    } else if (i > 0 && titleTokenSet.has(distinctive[i - 1] + token)) {
      matchedCount++;
    }
  }

  const matchRatio = matchedCount / distinctive.length;
  const minRequiredRatio = distinctive.length <= 2 ? 1 : 0.65;
  if (matchRatio < minRequiredRatio) return -Infinity;

  let score = matchRatio * 70;
  if (matchRatio === 1) score += 15;
  if (brandCheck.inVendor) score += 10;
  if (brandCheck.inTitle) score += 5;

  // Verificación bidireccional de flankers:
  // 1) Si el título tiene un flanker que NO está en el nombre del perfume -> penalizar fuerte (-75)
  // 2) Si el nombre del perfume exige un flanker que NO está en el título -> rechazar (-Infinity)
  const flankerCandidateTokens = new Set(strippedTitleTokens);
  for (const alias of getBrandAliases(perfume.brand)) {
    for (const bt of tokenize(alias)) {
      flankerCandidateTokens.delete(bt);
    }
  }

  const nameFlankerTokens = new Set(tokenize(stripConcentrationsForFlankerCheck(normName)));
  for (const mod of FLANKER_MODIFIERS) {
    const inName = nameFlankerTokens.has(mod);
    const equivs = TOKEN_EQUIVALENTS[mod] || [];
    const inTitle =
      flankerCandidateTokens.has(mod) || equivs.some((eq) => flankerCandidateTokens.has(eq));

    if (inName && !inTitle) {
      return -Infinity;
    }
    if (inTitle && !inName) {
      if (equivs.some((eq) => nameFlankerTokens.has(eq))) continue;
      score -= 75;
    }
  }

  // Penalización por género opuesto explícito (salvo títulos unisex o que mencionen ambos)
  const isUnisexTitle = titleTokenSet.has('unisex');
  const hasFemaleCue =
    titleTokenSet.has('women') ||
    titleTokenSet.has('womens') ||
    titleTokenSet.has('woman') ||
    titleTokenSet.has('femme') ||
    titleTokenSet.has('elle') ||
    titleTokenSet.has('donna') ||
    containsWholePhrase(normTitle, 'for her');
  const hasMaleCue =
    titleTokenSet.has('men') ||
    titleTokenSet.has('mens') ||
    titleTokenSet.has('man') ||
    titleTokenSet.has('homme') ||
    titleTokenSet.has('lui') ||
    titleTokenSet.has('uomo') ||
    containsWholePhrase(normTitle, 'for him');

  if (!isUnisexTitle) {
    if (perfume.gender === 'masculino' && hasFemaleCue && !hasMaleCue) {
      const nameHasFemale =
        nameTokenSet.has('women') ||
        nameTokenSet.has('woman') ||
        nameTokenSet.has('femme') ||
        nameTokenSet.has('her') ||
        nameTokenSet.has('elle');
      if (!nameHasFemale) score -= 75;
    } else if (perfume.gender === 'femenino' && hasMaleCue && !hasFemaleCue) {
      const nameHasMale =
        nameTokenSet.has('men') ||
        nameTokenSet.has('man') ||
        nameTokenSet.has('homme') ||
        nameTokenSet.has('him') ||
        nameTokenSet.has('lui');
      if (!nameHasMale) score -= 75;
    }
  }

  // Preferir frascos de presentación comercial estándar (evitar testers si hay versión regular)
  if (titleTokenSet.has('tester') && !nameTokenSet.has('tester')) score -= 18;
  if (titleTokenSet.has('unboxed') && !nameTokenSet.has('unboxed')) score -= 15;

  if (/\b(50|75|90|100|120|125|150)\s*ml\b|\b(1\.7|2\.5|3\.0|3\.3|3\.4|4\.2)\s*oz\b/i.test(candidateTitle)) {
    score += 8;
  }
  if (
    containsWholePhrase(normTitle, 'eau de parfum') ||
    containsWholePhrase(normTitle, 'eau de toilette') ||
    titleTokenSet.has('edp') ||
    titleTokenSet.has('edt')
  ) {
    score += 6;
  }
  if (titleTokenSet.has('spray')) {
    score += 4;
  }

  // Penalización por tokens extraños en el título (excluyendo tamaños y años)
  const brandTokenSet = new Set(getBrandAliases(perfume.brand).flatMap((a) => tokenize(a)));
  const expandedNameTokens = new Set<string>(nameTokenSet);
  for (const nt of nameTokens) {
    for (const eq of TOKEN_EQUIVALENTS[nt] || []) {
      expandedNameTokens.add(eq);
    }
  }
  const titleWithoutSizes = candidateTitle
    .replace(/\b\d+(?:\.\d+)?\s*(?:ml|fl\.?\s*oz|oz)\b/gi, ' ')
    .replace(/\b(?:19|20)\d{2}\b/g, ' ');
  const extraCheckTokens = tokenize(titleWithoutSizes);

  let extraTokens = 0;
  let extraNumericTokens = 0;
  for (const t of extraCheckTokens) {
    if (
      BOILERPLATE_TITLE_WORDS.has(t) ||
      expandedNameTokens.has(t) ||
      brandTokenSet.has(t)
    ) {
      continue;
    }
    if (/^\d+$/.test(t)) {
      extraNumericTokens++;
    } else {
      extraTokens++;
    }
  }

  // Si es una fragancia epónima (todos los tokens distintivos son genéricos/género/concentración),
  // cualquier palabra extra indica otra línea distinta de la misma marca.
  const isEponymous = distinctive.every((t) => BOILERPLATE_TITLE_WORDS.has(t));
  if (isEponymous && (extraTokens > 0 || extraNumericTokens > 0)) {
    return -Infinity;
  }

  score -= extraTokens * 22;
  score -= extraNumericTokens * 70;

  return score;
}

function normalizeShopifyImageUrl(rawUrl: string): string | null {
  let trimmed = rawUrl.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('//')) {
    trimmed = `https:${trimmed}`;
  }
  if (!/^https?:\/\//i.test(trimmed)) return null;

  try {
    const parsed = new URL(trimmed);
    const isShopify =
      parsed.hostname.includes('shopify.com') || parsed.pathname.includes('/cdn/shop/');
    if (isShopify) {
      parsed.pathname = parsed.pathname.replace(
        /(?:_(?:pico|icon|thumb|small|compact|medium|large|grande|\d*x\d*))(?:_crop_[a-z]+)?(?:@\dx)?(\.(?:jpe?g|png|webp))$/i,
        '$1'
      );
      const currentWidth = Number(parsed.searchParams.get('width') || '0');
      if (!currentWidth || currentWidth < 800) {
        parsed.searchParams.set('width', '800');
      }
      const currentHeight = Number(parsed.searchParams.get('height') || '0');
      if (currentHeight > 0 && currentHeight < 800) {
        parsed.searchParams.delete('height');
      }
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

function extractProductImageUrl(product: ShopifySuggestProduct): string | null {
  const raw =
    (typeof product.featured_image === 'object' && product.featured_image?.url) ||
    (typeof product.featured_image === 'string' ? product.featured_image : '') ||
    product.image ||
    '';
  return normalizeShopifyImageUrl(raw);
}

function buildSearchQueries(perfume: Perfume): string[] {
  const stripAccents = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const cleanName = stripAccents(perfume.name)
    .replace(/\(\s*\d{4}\s*\)/g, '')
    .replace(/[°®™]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  const cleanBrand = stripAccents(perfume.brand).trim();
  const normName = normalizeText(cleanName);
  const normBrand = normalizeText(cleanBrand);

  const primary = normName.startsWith(normBrand) ? cleanName : `${cleanBrand} ${cleanName}`;
  const queries = [primary];
  if (/\bedp\b/i.test(primary)) {
    queries.push(primary.replace(/\bedp\b/gi, 'Eau de Parfum').replace(/\s+/g, ' ').trim());
  }
  if (cleanName !== primary) {
    queries.push(cleanName);
  }
  return Array.from(new Set(queries.filter(Boolean)));
}

function isParfumoUrlMatchingPerfume(parfumoUrl: string, perfume: Perfume): boolean {
  if (!parfumoUrl || !parfumoUrl.startsWith('https://www.parfumo.')) return false;
  try {
    const parsed = new URL(parfumoUrl);
    const segments = parsed.pathname.split('/').filter(Boolean);
    if (segments.length < 3 || segments[0].toLowerCase() !== 'perfumes') return false;
    const slugTitle = decodeURIComponent(segments[segments.length - 1]).replace(/[_-]+/g, ' ');
    const brandSlug = decodeURIComponent(segments[1]).replace(/[_-]+/g, ' ');
    const score = scoreProductTitle(perfume, slugTitle, brandSlug, true);
    return score >= MIN_ACCEPT_SCORE;
  } catch {
    return false;
  }
}

function detectImageType(buf: Buffer): { ext: 'jpg' | 'png' | 'webp'; contentType: string } | null {
  if (buf.length < 16) return null;
  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return { ext: 'jpg', contentType: 'image/jpeg' };
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    return { ext: 'png', contentType: 'image/png' };
  }
  // WebP: RIFF....WEBP
  if (
    buf.toString('ascii', 0, 4) === 'RIFF' &&
    buf.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return { ext: 'webp', contentType: 'image/webp' };
  }
  return null;
}

function readImageDimensions(
  buf: Buffer,
  ext: 'jpg' | 'png' | 'webp'
): { width: number; height: number } | null {
  try {
    if (ext === 'png' && buf.length >= 24) {
      return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
    }
    if (ext === 'jpg') {
      let i = 2;
      while (i + 7 < buf.length) {
        if (buf[i] !== 0xff) {
          i++;
          continue;
        }
        while (i < buf.length && buf[i] === 0xff) i++;
        if (i >= buf.length) break;
        const marker = buf[i];
        if (marker === 0xd8 || marker === 0xd9 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
          i++;
          continue;
        }
        if (i + 2 >= buf.length) break;
        const len = buf.readUInt16BE(i + 1);
        if (len < 2) break;
        if (
          (marker >= 0xc0 && marker <= 0xc3) ||
          (marker >= 0xc5 && marker <= 0xc7) ||
          (marker >= 0xc9 && marker <= 0xcb) ||
          (marker >= 0xcd && marker <= 0xcf)
        ) {
          if (i + 8 <= buf.length) {
            return {
              height: buf.readUInt16BE(i + 4),
              width: buf.readUInt16BE(i + 6),
            };
          }
          break;
        }
        i += 1 + len;
      }
    }
    if (ext === 'webp' && buf.length >= 30) {
      const chunk = buf.toString('ascii', 12, 16);
      if (chunk === 'VP8X' && buf.length >= 30) {
        const w = 1 + (buf[24] | (buf[25] << 8) | (buf[26] << 16));
        const h = 1 + (buf[27] | (buf[28] << 8) | (buf[29] << 16));
        return { width: w, height: h };
      }
      if (chunk === 'VP8 ' && buf.length >= 30) {
        return {
          width: buf.readUInt16LE(26) & 0x3fff,
          height: buf.readUInt16LE(28) & 0x3fff,
        };
      }
      if (chunk === 'VP8L' && buf.length >= 25) {
        const b0 = buf[21];
        const b1 = buf[22];
        const b2 = buf[23];
        const b3 = buf[24];
        const w = 1 + (((b1 & 0x3f) << 8) | b0);
        const h = 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6));
        return { width: w, height: h };
      }
    }
  } catch {
    return null;
  }
  return null;
}

async function fetchWithTimeout(
  url: string,
  timeoutMs = 7000,
  extraHeaders: Record<string, string> = {}
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/json,text/html,image/avif,image/webp,image/png,image/jpeg,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,es;q=0.8',
        ...extraHeaders,
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

async function downloadAndValidateImage(
  url: string,
  referer?: string
): Promise<{ buffer: Buffer; ext: 'jpg' | 'png' | 'webp'; contentType: string } | null> {
  try {
    const res = await fetchWithTimeout(
      url,
      5500,
      referer
        ? { Referer: referer, Accept: 'image/webp,image/png,image/jpeg,*/*;q=0.8' }
        : { Accept: 'image/webp,image/png,image/jpeg,*/*;q=0.8' }
    );
    if (!res.ok) return null;

    const ab = await res.arrayBuffer();
    const buffer = Buffer.from(ab);
    if (buffer.length < 10_000 || buffer.length > 8_000_000) return null;

    const detected = detectImageType(buffer);
    if (!detected) return null;

    const dims = readImageDimensions(buffer, detected.ext);
    if (dims) {
      if (dims.width < 300 || dims.height < 300) return null;
      const ratio = dims.width / dims.height;
      if (ratio < 0.42 || ratio > 1.85) return null;
    }

    return { buffer, ext: detected.ext, contentType: detected.contentType };
  } catch {
    return null;
  }
}

async function queryShopifyStore(
  storeOrigin: string,
  query: string,
  perfume: Perfume
): Promise<ScoredCandidate[]> {
  try {
    const url = `${storeOrigin}/search/suggest.json?q=${encodeURIComponent(
      query
    )}&resources[type]=product&resources[limit]=8`;
    const res = await fetchWithTimeout(url, 5500, { Accept: 'application/json' });
    if (!res.ok) return [];

    const data = (await res.json()) as {
      resources?: { results?: { products?: ShopifySuggestProduct[] } };
    };
    const products = data?.resources?.results?.products;
    if (!Array.isArray(products) || products.length === 0) return [];

    const scored: ScoredCandidate[] = [];
    for (const product of products) {
      const title = typeof product.title === 'string' ? product.title : '';
      const vendor = typeof product.vendor === 'string' ? product.vendor : '';
      const imageUrl = extractProductImageUrl(product);
      if (!title || !imageUrl) continue;

      const score = scoreProductTitle(perfume, title, vendor, true);
      if (score >= MIN_ACCEPT_SCORE) {
        scored.push({ imageUrl, referer: `${storeOrigin}/`, score, title });
      }
    }
    return scored;
  } catch {
    return [];
  }
}

async function fetchFromShopifyStores(
  perfume: Perfume
): Promise<{ buffer: Buffer; ext: 'jpg' | 'png' | 'webp'; contentType: string } | null> {
  const queries = buildSearchQueries(perfume);
  const triedUrls = new Set<string>();

  for (const query of queries) {
    const settled = await Promise.allSettled(
      SHOPIFY_STORES.map((store) => queryShopifyStore(store, query, perfume))
    );

    const candidates: ScoredCandidate[] = [];
    for (const result of settled) {
      if (result.status === 'fulfilled') {
        candidates.push(...result.value);
      }
    }

    candidates.sort((a, b) => b.score - a.score);

    for (const candidate of candidates) {
      if (triedUrls.has(candidate.imageUrl)) continue;
      triedUrls.add(candidate.imageUrl);
      const downloaded = await downloadAndValidateImage(candidate.imageUrl, candidate.referer);
      if (downloaded) return downloaded;
    }
  }

  return null;
}

async function fetchFromParfumo(
  perfume: Perfume
): Promise<{ buffer: Buffer; ext: 'jpg' | 'png' | 'webp'; contentType: string } | null> {
  const parfumoUrl = perfume.parfumoUrl;
  if (!parfumoUrl || !isParfumoUrlMatchingPerfume(parfumoUrl, perfume)) return null;
  try {
    const res = await fetchWithTimeout(parfumoUrl, 5000);
    if (!res.ok) return null;
    const html = await res.text();
    const ogMatch =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i) ||
      html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
    if (!ogMatch?.[1]) return null;
    const imgUrl = ogMatch[1].replace(/&amp;/g, '&');
    const lower = imgUrl.toLowerCase();
    if (
      !lower.includes('media.parfumo') ||
      lower.includes('placeholder') ||
      lower.includes('logo') ||
      lower.includes('default') ||
      lower.includes('avatar')
    ) {
      return null;
    }
    return await downloadAndValidateImage(imgUrl, parfumoUrl);
  } catch {
    return null;
  }
}

async function readCachedHdImage(id: string): Promise<ResolvedCatalogImage | null> {
  const candidates: Array<{ ext: 'webp' | 'jpg' | 'png'; contentType: string }> = [
    { ext: 'webp', contentType: 'image/webp' },
    { ext: 'jpg', contentType: 'image/jpeg' },
    { ext: 'png', contentType: 'image/png' },
  ];
  for (const dir of [HD_CACHE_DIR, TMP_CACHE_DIR]) {
    for (const c of candidates) {
      const filePath = path.join(dir, `${id}.${c.ext}`);
      try {
        const stat = await fs.stat(filePath);
        if (stat.size >= 8_000) {
          const buffer = await fs.readFile(filePath);
          return { buffer, contentType: c.contentType, source: 'cache-hd' };
        }
      } catch {
        // No existe en caché aún
      }
    }
  }
  return null;
}

async function saveHdCache(id: string, ext: 'jpg' | 'png' | 'webp', buffer: Buffer): Promise<void> {
  for (const dir of [HD_CACHE_DIR, TMP_CACHE_DIR]) {
    try {
      await fs.mkdir(dir, { recursive: true });
      const finalPath = path.join(dir, `${id}.${ext}`);
      const tmpPath = `${finalPath}.${process.pid}.${Date.now()}.tmp`;
      await fs.writeFile(tmpPath, buffer);
      await fs.rename(tmpPath, finalPath);
      return;
    } catch {
      // En sistemas de archivos solo lectura (ej. Vercel) intenta /tmp o continúa en memoria
    }
  }
}

async function readLocalFallback(perfume: Perfume): Promise<ResolvedCatalogImage | null> {
  const relPath = perfume.imageUrl?.replace(/^\/+/, '');
  if (!relPath) return null;
  const fullPath = path.join(LOCAL_PUBLIC_DIR, relPath);
  try {
    const buffer = await fs.readFile(fullPath);
    const detected = detectImageType(buffer);
    return {
      buffer,
      contentType: detected?.contentType || 'image/png',
      source: 'local-fallback',
    };
  } catch {
    return null;
  }
}

export async function resolveCatalogImage(id: string): Promise<ResolvedCatalogImage | null> {
  const perfume = PERFUME_BY_ID.get(id);
  if (!perfume) return null;

  // 1. Caché local HD instantáneo
  const cached = await readCachedHdImage(id);
  if (cached) {
    failedUntil.delete(id);
    return cached;
  }

  // 1b. Caché negativo breve si la descarga en línea falló recientemente (evita bloqueos repetidos offline)
  const retryAfter = failedUntil.get(id);
  if (retryAfter && Date.now() < retryAfter) {
    return await readLocalFallback(perfume);
  }

  // 2. Deduplicar peticiones concurrentes para el mismo perfume
  const existing = inFlight.get(id);
  if (existing) return existing;

  const task = (async (): Promise<ResolvedCatalogImage | null> => {
    try {
      // 2a. Búsqueda verificada en tiendas Shopify de perfumería
      let online = await fetchFromShopifyStores(perfume);

      // 2b. Fallback a Parfumo solo si el slug coincide estrictamente con el perfume
      if (!online && perfume.parfumoUrl) {
        online = await fetchFromParfumo(perfume);
      }

      if (online) {
        failedUntil.delete(id);
        await saveHdCache(id, online.ext, online.buffer);
        return {
          buffer: online.buffer,
          contentType: online.contentType,
          source: 'online-hd',
        };
      }

      // 3. Fallback elegante al archivo local existente + enfriamiento de reintento
      failedUntil.set(id, Date.now() + NEGATIVE_CACHE_TTL_MS);
      return await readLocalFallback(perfume);
    } finally {
      inFlight.delete(id);
    }
  })();

  inFlight.set(id, task);
  return task;
}

export function isKnownCatalogPerfumeId(id: string): boolean {
  return PERFUME_BY_ID.has(id);
}
