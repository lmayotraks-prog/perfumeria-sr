// scripts/fetch-hd-catalog-images.mjs
// Pre-descarga en paralelo fotografías HD verificadas de frascos para las referencias del catálogo
// consultando tiendas Shopify especializadas en perfumería (y Parfumo solo si el slug coincide),
// con detección de duplicados por SHA-256, guardándolas en public/images/catalog-hd/{id}.{ext}
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');
const CATALOG_PATH = path.join(ROOT, 'src', 'data', 'available-catalog.json');
const HD_DIR = path.join(ROOT, 'public', 'images', 'catalog-hd');

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

export const SHOPIFY_STORES = [
  'https://perfumeonline.ca',
  'https://www.aurafragrance.com',
  'https://www.tripletraders.com',
  'https://www.olfactoryfactoryllc.com',
];

const BRAND_ALIASES = {
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

const TOKEN_EQUIVALENTS = {
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

export const MIN_ACCEPT_SCORE = 55;

export function normalizeText(input) {
  return String(input || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['’`´]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function tokenize(input) {
  const norm = normalizeText(input);
  return norm ? norm.split(/\s+/) : [];
}

function containsWholePhrase(normalizedHaystack, normalizedPhrase) {
  if (!normalizedHaystack || !normalizedPhrase) return false;
  return ` ${normalizedHaystack} `.includes(` ${normalizedPhrase} `);
}

function getBrandAliases(brand) {
  const normBrand = normalizeText(brand);
  const aliases = BRAND_ALIASES[normBrand] || [normBrand];
  return Array.from(new Set([normBrand, ...aliases].filter(Boolean)));
}

function matchesBrand(brand, vendor, title) {
  const aliases = getBrandAliases(brand);
  const normVendor = normalizeText(vendor);
  const normTitle = normalizeText(title);

  const inVendor = aliases.some((a) => containsWholePhrase(normVendor, a));
  const inTitle = aliases.some((a) => containsWholePhrase(normTitle, a));
  return { matched: inVendor || inTitle, inVendor, inTitle };
}

function stripConcentrationsForFlankerCheck(normalizedTitle) {
  return normalizedTitle
    .replace(/\beau de parfum\b/g, ' ')
    .replace(/\beau de toilette\b/g, ' ')
    .replace(/\beau de cologne\b/g, ' ')
    .replace(/\bextrait de parfum\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildTokenMatchSet(tokens) {
  const set = new Set(tokens);
  for (let i = 0; i < tokens.length - 1; i++) {
    set.add(tokens[i] + tokens[i + 1]);
  }
  return set;
}

function getDistinctiveNameTokens(perfume) {
  const cleanedName = String(perfume.name || '').replace(/\(\s*\d{4}\s*\)/g, ' ');
  const allTokens = tokenize(cleanedName);
  const directBrandTokenSet = new Set(tokenize(perfume.brand));

  const nonStop = allTokens.filter((t) => !NAME_STOP_WORDS.has(t));
  const withoutBrand = nonStop.filter((t) => !directBrandTokenSet.has(t));

  const chosen = withoutBrand.length > 0 ? withoutBrand : nonStop.length > 0 ? nonStop : allTokens;
  return Array.from(new Set(chosen));
}

function matchesTokenInTitle(
  token,
  normTitle,
  titleTokenSet,
  strippedTitleTokenSet,
  nameHasConcentrationPhrase
) {
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

export function scoreProductTitle(perfume, candidateTitle, candidateVendor, requireBrand = true) {
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

  const brandTokenSet = new Set(getBrandAliases(perfume.brand).flatMap((a) => tokenize(a)));
  const expandedNameTokens = new Set(nameTokenSet);
  for (const nt of nameTokens) {
    for (const eq of TOKEN_EQUIVALENTS[nt] || []) {
      expandedNameTokens.add(eq);
    }
  }
  const titleWithoutSizes = String(candidateTitle || '')
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

  const isEponymous = distinctive.every((t) => BOILERPLATE_TITLE_WORDS.has(t));
  if (isEponymous && (extraTokens > 0 || extraNumericTokens > 0)) {
    return -Infinity;
  }

  score -= extraTokens * 22;
  score -= extraNumericTokens * 70;

  return score;
}

export function normalizeShopifyImageUrl(rawUrl) {
  let trimmed = String(rawUrl || '').trim();
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

function extractProductImageUrl(product) {
  const raw =
    (product?.featured_image && typeof product.featured_image === 'object'
      ? product.featured_image.url
      : '') ||
    (typeof product?.featured_image === 'string' ? product.featured_image : '') ||
    product?.image ||
    '';
  return normalizeShopifyImageUrl(raw);
}

export function buildSearchQueries(perfume) {
  const stripAccents = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
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

export function isParfumoUrlMatchingPerfume(parfumoUrl, perfume) {
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

function detectImageType(buf) {
  if (buf.length < 16) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg';
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'png';
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'webp';
  return null;
}

function readDimensions(buf, ext) {
  try {
    if (ext === 'png' && buf.length >= 24) {
      return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
    }
    if (ext === 'jpg') {
      let i = 2;
      while (i + 7 < buf.length) {
        if (buf[i] !== 0xff) { i++; continue; }
        while (i < buf.length && buf[i] === 0xff) i++;
        if (i >= buf.length) break;
        const marker = buf[i];
        if (marker === 0xd8 || marker === 0xd9 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
          i++; continue;
        }
        if (i + 2 >= buf.length) break;
        const len = buf.readUInt16BE(i + 1);
        if (len < 2) break;
        if ((marker >= 0xc0 && marker <= 0xc3) || (marker >= 0xc5 && marker <= 0xc7) || (marker >= 0xc9 && marker <= 0xcb) || (marker >= 0xcd && marker <= 0xcf)) {
          if (i + 8 <= buf.length) return { height: buf.readUInt16BE(i + 4), width: buf.readUInt16BE(i + 6) };
          break;
        }
        i += 1 + len;
      }
    }
    if (ext === 'webp' && buf.length >= 30) {
      const chunk = buf.toString('ascii', 12, 16);
      if (chunk === 'VP8X' && buf.length >= 30) {
        return {
          width: 1 + (buf[24] | (buf[25] << 8) | (buf[26] << 16)),
          height: 1 + (buf[27] | (buf[28] << 8) | (buf[29] << 16)),
        };
      }
      if (chunk === 'VP8 ' && buf.length >= 30) {
        return {
          width: buf.readUInt16LE(26) & 0x3fff,
          height: buf.readUInt16LE(28) & 0x3fff,
        };
      }
      if (chunk === 'VP8L' && buf.length >= 25) {
        const b0 = buf[21], b1 = buf[22], b2 = buf[23], b3 = buf[24];
        return {
          width: 1 + (((b1 & 0x3f) << 8) | b0),
          height: 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6)),
        };
      }
    }
  } catch {
    return null;
  }
  return null;
}

async function fetchWithTimeout(url, timeoutMs = 8000, headers = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': USER_AGENT,
        'Accept-Language': 'en-US,en;q=0.9,es;q=0.8',
        ...headers,
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

async function downloadValidImage(url, referer) {
  try {
    const res = await fetchWithTimeout(
      url,
      7000,
      referer
        ? { Referer: referer, Accept: 'image/webp,image/png,image/jpeg,*/*;q=0.8' }
        : { Accept: 'image/webp,image/png,image/jpeg,*/*;q=0.8' }
    );
    if (!res.ok) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length < 10_000 || buffer.length > 8_000_000) return null;
    const ext = detectImageType(buffer);
    if (!ext) return null;
    const dims = readDimensions(buffer, ext);
    if (dims) {
      if (dims.width < 300 || dims.height < 300) return null;
      const ratio = dims.width / dims.height;
      if (ratio < 0.42 || ratio > 1.85) return null;
    }
    return { buffer, ext };
  } catch {
    return null;
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function queryShopifyStore(storeOrigin, query, perfume) {
  try {
    const url = `${storeOrigin}/search/suggest.json?q=${encodeURIComponent(
      query
    )}&resources[type]=product&resources[limit]=8`;
    let res = await fetchWithTimeout(url, 7000, { Accept: 'application/json' });
    if (res.status === 429) {
      await sleep(2500);
      res = await fetchWithTimeout(url, 7000, { Accept: 'application/json' });
    }
    if (!res.ok) return [];
    const data = await res.json();
    const products = data?.resources?.results?.products;
    if (!Array.isArray(products) || products.length === 0) return [];

    const scored = [];
    for (const product of products) {
      const title = typeof product?.title === 'string' ? product.title : '';
      const vendor = typeof product?.vendor === 'string' ? product.vendor : '';
      const imageUrl = extractProductImageUrl(product);
      if (!title || !imageUrl) continue;

      const score = scoreProductTitle(perfume, title, vendor, true);
      if (score >= MIN_ACCEPT_SCORE) {
        scored.push({
          imageUrl,
          referer: `${storeOrigin}/`,
          score,
          title,
          source: new URL(storeOrigin).hostname,
        });
      }
    }
    return scored;
  } catch {
    return [];
  }
}

async function fetchParfumoImageUrl(perfume) {
  const parfumoUrl = perfume.parfumoUrl;
  if (!parfumoUrl || !isParfumoUrlMatchingPerfume(parfumoUrl, perfume)) return null;
  try {
    const res = await fetchWithTimeout(parfumoUrl, 7500);
    if (!res.ok) return null;
    const html = await res.text();
    const m =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i) ||
      html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
    if (!m?.[1]) return null;
    const imgUrl = m[1].replace(/&amp;/g, '&');
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
    return { imageUrl: imgUrl, referer: parfumoUrl, source: 'parfumo' };
  } catch {
    return null;
  }
}

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

async function resolveUniqueImageForPerfume(perfume, seenHashes) {
  const triedUrls = new Set();
  const queries = buildSearchQueries(perfume);

  // 1. Tiendas Shopify especializadas (prioridad principal)
  for (const query of queries) {
    const settled = await Promise.allSettled(
      SHOPIFY_STORES.map((store) => queryShopifyStore(store, query, perfume))
    );
    const candidates = [];
    for (const r of settled) {
      if (r.status === 'fulfilled') candidates.push(...r.value);
    }
    candidates.sort((a, b) => b.score - a.score);

    for (const c of candidates) {
      if (triedUrls.has(c.imageUrl)) continue;
      triedUrls.add(c.imageUrl);
      const img = await downloadValidImage(c.imageUrl, c.referer);
      if (!img) continue;

      const hash = sha256(img.buffer);
      if (seenHashes.has(hash)) {
        console.warn(
          `[DUP SKIP] ${perfume.brand} - ${perfume.name}: SHA-256 ${hash.slice(0, 12)} duplicado con ${seenHashes.get(hash)} (${c.source} "${c.title}"), probando siguiente candidato...`
        );
        continue;
      }
      seenHashes.set(hash, perfume.id);
      return { ...img, source: c.source, matchedTitle: c.title, score: Math.round(c.score) };
    }
  }

  // 2. Fallback a Parfumo solo si el slug coincide estrictamente con el perfume
  const parfumoCandidate = await fetchParfumoImageUrl(perfume);
  if (parfumoCandidate && !triedUrls.has(parfumoCandidate.imageUrl)) {
    const img = await downloadValidImage(parfumoCandidate.imageUrl, parfumoCandidate.referer);
    if (img) {
      const hash = sha256(img.buffer);
      if (seenHashes.has(hash)) {
        console.warn(
          `[DUP SKIP] ${perfume.brand} - ${perfume.name}: SHA-256 ${hash.slice(0, 12)} duplicado con ${seenHashes.get(hash)} (parfumo), usando fallback local.`
        );
      } else {
        seenHashes.set(hash, perfume.id);
        return { ...img, source: 'parfumo', matchedTitle: perfume.name, score: 100 };
      }
    }
  }

  return null;
}

async function getCachedPath(id) {
  for (const ext of ['webp', 'jpg', 'png']) {
    const filePath = path.join(HD_DIR, `${id}.${ext}`);
    try {
      const s = await fs.stat(filePath);
      if (s.size >= 8_000) return filePath;
    } catch {
      // continue
    }
  }
  return null;
}

async function seedExistingHashes(perfumes, seenHashes) {
  for (const p of perfumes) {
    const cachedPath = await getCachedPath(p.id);
    if (!cachedPath) continue;
    try {
      const buf = await fs.readFile(cachedPath);
      seenHashes.set(sha256(buf), p.id);
    } catch {
      // ignore
    }
  }
}

async function main() {
  await fs.mkdir(HD_DIR, { recursive: true });
  const raw = JSON.parse(await fs.readFile(CATALOG_PATH, 'utf8'));
  const perfumes = raw.perfumes || [];

  const seenHashes = new Map();
  await seedExistingHashes(perfumes, seenHashes);

  let cached = 0;
  let downloaded = 0;
  let failed = 0;
  let idx = 0;
  const CONCURRENCY = 1;

  async function worker() {
    while (idx < perfumes.length) {
      const current = perfumes[idx++];
      if (await getCachedPath(current.id)) {
        cached++;
        continue;
      }
      const result = await resolveUniqueImageForPerfume(current, seenHashes);
      await sleep(1100);
      if (result) {
        const dest = path.join(HD_DIR, `${current.id}.${result.ext}`);
        const tmp = `${dest}.${process.pid}.${Date.now()}.tmp`;
        await fs.writeFile(tmp, result.buffer);
        await fs.rename(tmp, dest);
        downloaded++;
        console.log(
          `[HD OK] ${current.brand} - ${current.name} -> ${result.source} "${result.matchedTitle}" (score ${result.score}, ${Math.round(result.buffer.length / 1024)} KB)`
        );
      } else {
        failed++;
        console.log(`[FALLBACK] ${current.brand} - ${current.name}`);
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
  console.log(
    `\nResumen HD: ${cached} ya en caché, ${downloaded} descargadas HD, ${failed} con fallback local.`
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
