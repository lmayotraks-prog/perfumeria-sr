// src/lib/olfactoryDictionary.ts
// Diccionario bilingüe (ES <-> EN) y paleta cromática para acordes y notas olfativas estilo Fragrantica.es

export const ACCORD_MAP: Record<string, { label: string; color: string }> = {
  floral:      { label: 'Floral',            color: '#c97a92' },
  spicy:       { label: 'Especiado',         color: '#b84b44' },
  sweet:       { label: 'Dulce',             color: '#c67c4e' },
  woody:       { label: 'Amaderado',         color: '#8f6a3e' },
  fresh:       { label: 'Fresco',            color: '#4f92b5' },
  fruity:      { label: 'Afrutado',          color: '#c95e6a' },
  citrus:      { label: 'Cítrico',           color: '#d9a441' },
  green:       { label: 'Verde',             color: '#65854b' },
  powdery:     { label: 'Atalcado',          color: '#b592b0' },
  synthetic:   { label: 'Aldehídico',        color: '#8a99a8' },
  oriental:    { label: 'Ámbar / Oriental',  color: '#b56e2b' },
  creamy:      { label: 'Cremoso',           color: '#c9a675' },
  gourmand:    { label: 'Gourmand',          color: '#a86541' },
  resinous:    { label: 'Resinoso',          color: '#9c5a25' },
  aquatic:     { label: 'Acuático',          color: '#347ca1' },
  smoky:       { label: 'Ahumado',           color: '#5c534c' },
  leathery:    { label: 'Cuero',             color: '#6e4934' },
  earthy:      { label: 'Terroso',           color: '#736243' },
  animal:      { label: 'Animálico',         color: '#785038' },
  chypre:      { label: 'Chipre',            color: '#5b7542' },
  fougere:     { label: 'Fougère',           color: '#4c7085' },
  musky:       { label: 'Almizclado',        color: '#baa37d' },
  amber:       { label: 'Ámbar',             color: '#c4722a' },
  vanilla:     { label: 'Vainilla',          color: '#d4a656' },
  oud:         { label: 'Oud',               color: '#614228' },
};

export const NOTE_TRANSLATIONS: Record<string, string> = {
  musk: 'Almizcle',
  'white musk': 'Almizcle blanco',
  bergamot: 'Bergamota',
  sandalwood: 'Sándalo',
  jasmine: 'Jazmín',
  amber: 'Ámbar',
  vanilla: 'Vainilla',
  patchouli: 'Pachulí',
  rose: 'Rosa',
  vetiver: 'Vetiver',
  'mandarin orange': 'Mandarina',
  lemon: 'Limón',
  cedarwood: 'Madera de cedro',
  cedar: 'Cedro',
  'tonka bean': 'Haba tonka',
  'lily of the valley': 'Lirio de los valles',
  lavender: 'Lavanda',
  'orange blossom': 'Flor de azahar',
  iris: 'Iris',
  'ylang-ylang': 'Ylang-ylang',
  cardamom: 'Cardamomo',
  violet: 'Violeta',
  grapefruit: 'Pomelo',
  'pink pepper': 'Pimienta rosa',
  oakmoss: 'Musgo de roble',
  geranium: 'Geranio',
  frankincense: 'Incienso',
  incense: 'Incienso',
  leather: 'Cuero',
  orange: 'Naranja',
  blackcurrant: 'Grosella negra',
  oud: 'Oud',
  agarwood: 'Madera de oud',
  saffron: 'Azafrán',
  cinnamon: 'Canela',
  coffee: 'Café',
  honey: 'Miel',
  peony: 'Peonía',
  magnolia: 'Magnolia',
  tuberose: 'Nardo',
  neroli: 'Neroli',
  ambroxan: 'Ambroxan',
  labdanum: 'Ládano',
  benzoin: 'Benjuí',
  myrrh: 'Mirra',
  pear: 'Pera',
  apple: 'Manzana',
  pineapple: 'Piña',
  peach: 'Melocotón',
  coconut: 'Coco',
  almond: 'Almendra',
  caramel: 'Caramelo',
  chocolate: 'Chocolate',
  tobacco: 'Tabaco',
  ginger: 'Jengibre',
  nutmeg: 'Nuez moscada',
  'black pepper': 'Pimienta negra',
  'cashmere wood': 'Madera de cachemira',
  'guaiac wood': 'Madera de gaiac',
  cypress: 'Ciprés',
  pine: 'Pino',
  mint: 'Menta',
  sage: 'Salvia',
  'sea salt': 'Sal marina',
  'haitian vetiver': 'Vetiver de Haití',
};

export interface NoteCategoryGroup {
  title: string;
  symbol: string;
  items: { key: string; label: string }[];
}

export const NOTE_SEARCH_GROUPS: NoteCategoryGroup[] = [
  {
    title: 'Cítricos & Frescos',
    symbol: '◉',
    items: [
      { key: 'Bergamot', label: 'Bergamota' },
      { key: 'Lemon', label: 'Limón' },
      { key: 'Mandarin orange', label: 'Mandarina' },
      { key: 'Grapefruit', label: 'Pomelo' },
      { key: 'Orange', label: 'Naranja' },
      { key: 'Neroli', label: 'Neroli' },
      { key: 'Orange blossom', label: 'Flor de azahar' },
      { key: 'Mint', label: 'Menta' },
    ],
  },
  {
    title: 'Flores & Pétalos',
    symbol: '✿',
    items: [
      { key: 'Rose', label: 'Rosa' },
      { key: 'Jasmine', label: 'Jazmín' },
      { key: 'Iris', label: 'Iris' },
      { key: 'Lily of the valley', label: 'Lirio de los valles' },
      { key: 'Ylang-ylang', label: 'Ylang-ylang' },
      { key: 'Violet', label: 'Violeta' },
      { key: 'Peony', label: 'Peonía' },
      { key: 'Tuberose', label: 'Nardo' },
    ],
  },
  {
    title: 'Especias & Aromáticos',
    symbol: '◆',
    items: [
      { key: 'Cardamom', label: 'Cardamomo' },
      { key: 'Pink pepper', label: 'Pimienta rosa' },
      { key: 'Lavender', label: 'Lavanda' },
      { key: 'Geranium', label: 'Geranio' },
      { key: 'Cinnamon', label: 'Canela' },
      { key: 'Saffron', label: 'Azafrán' },
      { key: 'Ginger', label: 'Jengibre' },
      { key: 'Black pepper', label: 'Pimienta negra' },
    ],
  },
  {
    title: 'Maderas & Musgos',
    symbol: '⬟',
    items: [
      { key: 'Sandalwood', label: 'Sándalo' },
      { key: 'Vetiver', label: 'Vetiver' },
      { key: 'Cedar', label: 'Cedro' },
      { key: 'Patchouli', label: 'Pachulí' },
      { key: 'Oakmoss', label: 'Musgo de roble' },
      { key: 'Oud', label: 'Oud' },
      { key: 'Guaiac wood', label: 'Madera de gaiac' },
      { key: 'Cashmere wood', label: 'Cachemira' },
    ],
  },
  {
    title: 'Resinas, Cuero & Tabaco',
    symbol: '◈',
    items: [
      { key: 'Amber', label: 'Ámbar' },
      { key: 'Frankincense', label: 'Incienso' },
      { key: 'Labdanum', label: 'Ládano' },
      { key: 'Benzoin', label: 'Benjuí' },
      { key: 'Leather', label: 'Cuero' },
      { key: 'Ambroxan', label: 'Ambroxan' },
      { key: 'Tobacco', label: 'Tabaco' },
      { key: 'Myrrh', label: 'Mirra' },
    ],
  },
  {
    title: 'Dulces, Frutas & Almizcles',
    symbol: '◎',
    items: [
      { key: 'Vanilla', label: 'Vainilla' },
      { key: 'Musk', label: 'Almizcle' },
      { key: 'White musk', label: 'Almizcle blanco' },
      { key: 'Tonka bean', label: 'Haba tonka' },
      { key: 'Honey', label: 'Miel' },
      { key: 'Coffee', label: 'Café' },
      { key: 'Blackcurrant', label: 'Grosella negra' },
      { key: 'Pineapple', label: 'Piña' },
    ],
  },
];

export const ACCORD_SEARCH_LIST = [
  { key: 'Woody', label: 'Amaderado', color: '#8f6a3e' },
  { key: 'Floral', label: 'Floral', color: '#c97a92' },
  { key: 'Sweet', label: 'Dulce', color: '#c67c4e' },
  { key: 'Spicy', label: 'Especiado', color: '#b84b44' },
  { key: 'Fresh', label: 'Fresco', color: '#4f92b5' },
  { key: 'Citrus', label: 'Cítrico', color: '#d9a441' },
  { key: 'Fruity', label: 'Afrutado', color: '#c95e6a' },
  { key: 'Powdery', label: 'Atalcado', color: '#b592b0' },
  { key: 'Oriental', label: 'Ámbar / Oriental', color: '#b56e2b' },
  { key: 'Gourmand', label: 'Gourmand', color: '#a86541' },
  { key: 'Green', label: 'Verde', color: '#65854b' },
  { key: 'Resinous', label: 'Resinoso', color: '#9c5a25' },
  { key: 'Aquatic', label: 'Acuático', color: '#347ca1' },
  { key: 'Smoky', label: 'Ahumado', color: '#5c534c' },
  { key: 'Leathery', label: 'Cuero', color: '#6e4934' },
  { key: 'Creamy', label: 'Cremoso', color: '#c9a675' },
  { key: 'Earthy', label: 'Terroso', color: '#736243' },
  { key: 'Chypre', label: 'Chipre', color: '#5b7542' },
];

export function translateAccord(name: string): string {
  const clean = name.trim().toLowerCase();
  if (ACCORD_MAP[clean]) return ACCORD_MAP[clean].label;
  return name;
}

export function getAccordColor(name: string, fallbackColor = '#b88e34'): string {
  const clean = name.trim().toLowerCase();
  if (ACCORD_MAP[clean]) return ACCORD_MAP[clean].color;
  for (const [k, v] of Object.entries(ACCORD_MAP)) {
    if (clean.includes(k)) return v.color;
  }
  return fallbackColor;
}

export function translateNote(name: string): string {
  const clean = name.trim().toLowerCase();
  if (NOTE_TRANSLATIONS[clean]) return NOTE_TRANSLATIONS[clean];
  return name;
}

// Mapa inverso ES -> EN para búsquedas en el API
const REVERSE_TERMS: Record<string, string[]> = {};
for (const [en, data] of Object.entries(ACCORD_MAP)) {
  const es = data.label.toLowerCase();
  for (const token of es.split('/').map((s) => s.trim())) {
    if (!REVERSE_TERMS[token]) REVERSE_TERMS[token] = [];
    REVERSE_TERMS[token].push(en);
  }
}
for (const [en, esLabel] of Object.entries(NOTE_TRANSLATIONS)) {
  const es = esLabel.toLowerCase();
  if (!REVERSE_TERMS[es]) REVERSE_TERMS[es] = [];
  REVERSE_TERMS[es].push(en);
}

/** Expande un término de búsqueda en español/inglés para coincidir contra el catálogo */
export function expandSearchTerms(term: string): string[] {
  const clean = term.trim().toLowerCase();
  if (!clean) return [];
  const normalized = clean
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const set = new Set<string>([clean, normalized]);

  if (REVERSE_TERMS[clean]) REVERSE_TERMS[clean].forEach((t) => set.add(t));
  for (const [esKey, enList] of Object.entries(REVERSE_TERMS)) {
    const esNorm = esKey.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (esNorm === normalized) {
      enList.forEach((t) => set.add(t));
    }
  }
  return Array.from(set);
}
