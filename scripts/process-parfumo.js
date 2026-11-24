// scripts/process-parfumo.js
// Procesa el dataset Parfumo 2024 y genera un catálogo seleccionado para SR Essences
const fs = require('fs');
const path = require('path');

const CSV_PATH = path.join(__dirname, '..', 'parfumo_data_clean.csv');
const OUT_PATH = path.join(__dirname, '..', 'src', 'data', 'parfumo-catalog.json');

// Parsear CSV simple (gestiona comillas y comas internas)
function parseCSVLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

// Limpiar texto con caracteres corruptos de encoding (latin1 → utf8)
function cleanText(str) {
  if (!str) return '';
  // El CSV ya es UTF-8: solo quitamos caracteres de reemplazo y normalizamos espacios
  return str.replace(/\uFFFD/g, '').replace(/\s+/g, ' ').trim();
}

// Mapping de famílias de acordes a colores y variantes visuales
const FAMILY_MAP = {
  'woody': { family: 'Amaderado', color: '#8a6e3a', glowColor: 'rgba(80,55,30,0.6)', liquidColor: '#3d2b1f', liquidColorAlt: '#6b4a30', marble: 'earth', accent: '#a07840' },
  'floral': { family: 'Floral', color: '#d4588a', glowColor: 'rgba(180,60,110,0.5)', liquidColor: '#8B1A4A', liquidColorAlt: '#c4588a', marble: 'bronze', accent: '#d4588a' },
  'oriental': { family: 'Oriental', color: '#c4722a', glowColor: 'rgba(120,50,0,0.6)', liquidColor: '#1a0a00', liquidColorAlt: '#3d1800', marble: 'noir', accent: '#c4722a' },
  'citrus': { family: 'Cítrico', color: '#f0a030', glowColor: 'rgba(220,140,30,0.5)', liquidColor: '#8a6020', liquidColorAlt: '#c8a040', marble: 'bronze', accent: '#f0a030' },
  'fresh': { family: 'Fresco', color: '#4aade0', glowColor: 'rgba(30,100,180,0.5)', liquidColor: '#1a4a6b', liquidColorAlt: '#2a7aab', marble: 'dark', accent: '#4aade0' },
  'aquatic': { family: 'Acuático', color: '#1a7aab', glowColor: 'rgba(20,100,160,0.5)', liquidColor: '#0a2a4b', liquidColorAlt: '#1a5a8b', marble: 'dark', accent: '#1a7aab' },
  'fougere': { family: 'Fougère', color: '#4a7a9a', glowColor: 'rgba(50,100,140,0.5)', liquidColor: '#1a3a4a', liquidColorAlt: '#2a6a8a', marble: 'dark', accent: '#4a7a9a' },
  'chypre': { family: 'Chypre', color: '#7a9a4a', glowColor: 'rgba(80,130,50,0.5)', liquidColor: '#2a3a1a', liquidColorAlt: '#4a6a2a', marble: 'earth', accent: '#7a9a4a' },
  'gourmand': { family: 'Gourmand', color: '#c97040', glowColor: 'rgba(180,90,40,0.5)', liquidColor: '#4a2000', liquidColorAlt: '#8a4010', marble: 'bronze', accent: '#c97040' },
  'spicy': { family: 'Especiado', color: '#c4404a', glowColor: 'rgba(180,50,50,0.5)', liquidColor: '#3a0a08', liquidColorAlt: '#6a2018', marble: 'noir', accent: '#c4404a' },
  'musky': { family: 'Almizclado', color: '#c9a84c', glowColor: 'rgba(180,150,70,0.4)', liquidColor: '#d4c4a0', liquidColorAlt: '#e8d8b8', marble: 'bronze', accent: '#c9a84c' },
  'powdery': { family: 'Empolvado', color: '#d4a0c0', glowColor: 'rgba(200,140,180,0.4)', liquidColor: '#8a4a6a', liquidColorAlt: '#c08090', marble: 'bronze', accent: '#d4a0c0' },
  'leather': { family: 'Cuero', color: '#8a4a2a', glowColor: 'rgba(120,60,30,0.5)', liquidColor: '#3a1808', liquidColorAlt: '#6a3018', marble: 'earth', accent: '#8a4a2a' },
  'green': { family: 'Verde', color: '#4a8a3a', glowColor: 'rgba(50,120,40,0.5)', liquidColor: '#1a3a10', liquidColorAlt: '#2a6a20', marble: 'earth', accent: '#4a8a3a' },
  'default': { family: 'Oriental', color: '#c9a84c', glowColor: 'rgba(201,168,76,0.4)', liquidColor: '#3a2800', liquidColorAlt: '#6a4a10', marble: 'noir', accent: '#c9a84c' },
};

function detectFamilyFromOne(a) {
  if (a.includes('woody') || a.includes('sandalwood') || a.includes('cedar')) return FAMILY_MAP.woody;
  if (a.includes('floral') || a.includes('rose') || a.includes('jasmine') || a.includes('white flower')) return FAMILY_MAP.floral;
  if (a.includes('oriental') || a.includes('amber') || a.includes('resin') || a.includes('oud')) return FAMILY_MAP.oriental;
  if (a.includes('citrus') || a.includes('bergamot') || a.includes('lemon')) return FAMILY_MAP.citrus;
  if (a.includes('aquatic') || a.includes('marine') || a.includes('ocean') || a.includes('ozonic')) return FAMILY_MAP.aquatic;
  if (a.includes('fresh')) return FAMILY_MAP.fresh;
  if (a.includes('green')) return FAMILY_MAP.green;
  if (a.includes('fougere') || a.includes('aromatic') || a.includes('lavender')) return FAMILY_MAP.fougere;
  if (a.includes('chypre') || a.includes('mossy') || a.includes('oakmoss')) return FAMILY_MAP.chypre;
  if (a.includes('gourmand') || a.includes('sweet') || a.includes('vanilla') || a.includes('chocolate')) return FAMILY_MAP.gourmand;
  if (a.includes('spicy') || a.includes('pepper') || a.includes('cinnamon')) return FAMILY_MAP.spicy;
  if (a.includes('musk') || a.includes('animal')) return FAMILY_MAP.musky;
  if (a.includes('powder')) return FAMILY_MAP.powdery;
  if (a.includes('leather') || a.includes('tobacco') || a.includes('smoky')) return FAMILY_MAP.leather;
  if (a.includes('fruity')) return FAMILY_MAP.citrus;
  return null;
}

// Usa el acorde principal (primero de la lista); si no mapea, prueba los siguientes
function detectFamily(accords) {
  if (!accords || accords === 'NA') return FAMILY_MAP.default;
  const list = accords.toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
  for (const a of list) {
    const fam = detectFamilyFromOne(a);
    if (fam) return fam;
  }
  return FAMILY_MAP.default;
}

// Parsear notas separadas por coma en un array limpio
function parseNotes(notesStr, category) {
  if (!notesStr || notesStr.trim() === 'NA' || notesStr.trim() === '') return [];
  // Parfumo no publica intensidades: usamos el orden de aparición (estimación por rango, determinista)
  return notesStr.split(',').map(n => n.trim()).filter(n => n && n !== 'NA').slice(0, 6).map((name, i) => ({
    name: cleanText(name),
    intensity: 92 - i * 11,
    category,
  }));
}

function getAccordColor(name, idx) {
  const n = name.toLowerCase();
  if (n.includes('citrus')) return '#d9a441';
  if (n.includes('floral') || n.includes('rose')) return '#c97a92';
  if (n.includes('woody') || n.includes('earthy')) return '#8f6a3e';
  if (n.includes('sweet') || n.includes('gourmand') || n.includes('creamy')) return '#c67c4e';
  if (n.includes('spicy')) return '#b84b44';
  if (n.includes('fresh') || n.includes('aquatic')) return '#4f92b5';
  if (n.includes('fruity')) return '#c95e6a';
  if (n.includes('green') || n.includes('chypre')) return '#65854b';
  if (n.includes('powdery')) return '#b592b0';
  if (n.includes('oriental') || n.includes('resinous')) return '#b56e2b';
  if (n.includes('leathery') || n.includes('smoky') || n.includes('animal')) return '#6e4934';
  if (n.includes('fougere')) return '#507287';
  const fallback = ['#c9a84c', '#8a6e3a', '#c97a92', '#4f92b5', '#c4722a', '#65854b'];
  return fallback[idx % fallback.length];
}

// Parsear acordes con paleta cromática semántica (estilo Fragrantica)
function parseAccords(accordsStr) {
  if (!accordsStr || accordsStr.trim() === 'NA' || accordsStr.trim() === '') return [];
  return accordsStr.split(',').map(a => a.trim()).filter(a => a && a !== 'NA').slice(0, 7).map((name, i) => {
    const cleaned = cleanText(name);
    return {
      name: cleaned,
      percentage: Math.max(24, 100 - i * 12),
      color: getAccordColor(cleaned, i),
    };
  });
}

// Parsear perfumistas ("La Nariz")
function parsePerfumers(perfStr) {
  if (!perfStr || perfStr === 'NA') return [];
  const ignore = new Set(['perfume maker', 'brand owner', 'unknown', 'na']);
  return perfStr
    .split(',')
    .map((s) => cleanText(s).replace(/\s+Brand owner$/i, '').trim())
    .filter((s) => s.length >= 3 && !ignore.has(s.toLowerCase()))
    .slice(0, 4);
}

function slugify(str) {
  return str.toLowerCase()
    .replace(/[àáâãäå]/g, 'a').replace(/[èéêë]/g, 'e').replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o').replace(/[ùúûü]/g, 'u').replace(/ñ/g, 'n')
    .replace(/ç/g, 'c').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function mapConcentration(c) {
  if (!c || c === 'NA') return 'EDP';
  if (c.includes('Parfum') && !c.includes('Eau')) return 'Extrait';
  if (c.includes('Pure') || c.includes('Extrait') || c.includes('Parfum de Parfum')) return 'Extrait';
  if (c.includes('de Parfum')) return 'EDP';
  if (c.includes('de Toilette')) return 'EDT';
  if (c.includes('de Cologne')) return 'EDC';
  return 'EDP';
}

// Leer CSV
console.log('Leyendo CSV...');
const rawContent = fs.readFileSync(CSV_PATH, 'utf8').replace(/^\uFEFF/, '');
const lines = rawContent.split(/\r?\n/);
const headers = parseCSVLine(lines[0]);
console.log(`Total de líneas: ${lines.length}`);
console.log('Headers:', headers.join(', '));

const records = [];
let skipped = 0;

const seenIds = new Set();
for (let i = 1; i < lines.length; i++) {
  if (!lines[i].trim()) continue;

  try {
    const fields = parseCSVLine(lines[i]);
    if (fields.length < 7) { skipped++; continue; }

    const record = {};
    headers.forEach((h, idx) => { record[h] = fields[idx] || ''; });

    const name = cleanText(record.Name);
    const brand = cleanText(record.Brand);
    if (!name || !brand || name === 'NA' || brand === 'NA') { skipped++; continue; }
    if (name.length < 2 || brand.length < 2) { skipped++; continue; }

    const rawRating = parseFloat(record.Rating_Value);
    const rawCount = parseInt(record.Rating_Count);
    const hasRating = !isNaN(rawRating) && !isNaN(rawCount) && rawCount >= 15;
    const rating = hasRating ? rawRating : 0;
    const ratingCount = hasRating ? rawCount : 0;

    // Incluir si tiene valoración fiable, o si tiene pirámide completa (acordes + al menos una capa de notas)
    const has = (v) => v && v.trim() !== '' && v.trim() !== 'NA';
    const hasPyramid = has(record.Main_Accords) && (has(record.Top_Notes) || has(record.Middle_Notes) || has(record.Base_Notes));
    if (!hasRating && !hasPyramid) { skipped++; continue; }

    const visual = detectFamily(record.Main_Accords);
    const baseId = slugify(`${brand}-${name}`).substring(0, 56) || `perf-${i}`;
    let id = baseId;
    if (seenIds.has(id)) {
      id = `${baseId}-${i}`;
    }
    seenIds.add(id);

    const perfumers = parsePerfumers(record.Perfumers);

    records.push({
      id,
      name,
      brand,
      year: parseInt(record.Release_Year) || null,
      concentration: mapConcentration(record.Concentration),
      rating: Math.round((rating / 2) * 10) / 10, // Parfumo usa escala 0-10 → 0-5
      reviews: ratingCount,
      family: visual.family,
      subfamilies: [],
      gender: 'unisex',
      perfumers,
      description: `${name} de ${brand}.${perfumers.length ? ` Nariz: ${perfumers.join(', ')}.` : ''} Acordes y notas registradas en archivo internacional.`,
      shortDesc: [record.Top_Notes, record.Middle_Notes, record.Base_Notes]
        .filter(n => n && n !== 'NA').map(n => cleanText(n.split(',')[0])).join(' · ').substring(0, 80),
      notes: [
        ...parseNotes(record.Top_Notes, 'salida'),
        ...parseNotes(record.Middle_Notes, 'corazon'),
        ...parseNotes(record.Base_Notes, 'fondo'),
      ].slice(0, 18),
      accords: parseAccords(record.Main_Accords),
      liquidColor: visual.liquidColor,
      liquidColorAlt: visual.liquidColorAlt,
      glowColor: visual.glowColor,
      accentColor: visual.accent,
      marbleVariant: visual.marble,
      price: 0, // fragancia de referencia, no a la venta
      priceML: 0,
      sizes: [],
      tags: (record.Main_Accords || '').split(',').map(a => cleanText(a).toLowerCase()).filter(a => a && a !== 'na').slice(0, 6),
      featured: rating >= 8.8 && ratingCount >= 50,
      newArrival: (parseInt(record.Release_Year) || 0) >= 2022,
      bestseller: rating >= 9 && ratingCount >= 100,
      inspiredBy: null,
      season: [], // el dataset no incluye temporada
      occasion: [],
      sillage: 3, // el dataset no incluye estela/duración: valor neutro
      longevity: 3,
      parfumoUrl: record.URL || '',
      sourceDataset: 'parfumo-2024',
    });
  } catch (err) {
    skipped++;
  }
}

console.log(`Procesados: ${records.length} fragancias válidas. Saltados: ${skipped}`);

// Ordenar por rating desc, luego por número de reviews
records.sort((a, b) => {
  const rDiff = b.rating - a.rating;
  if (Math.abs(rDiff) > 0.05) return rDiff;
  return b.reviews - a.reviews;
});

// Guardar JSON completo
const output = {
  meta: {
    total: records.length,
    generated: new Date().toISOString(),
    source: 'Parfumo TidyTuesday 2024',
    license: 'Public Domain / CC0',
  },
  perfumes: records,
};

fs.writeFileSync(OUT_PATH, JSON.stringify(output), 'utf8');
console.log(`✅ Guardado: ${OUT_PATH} con ${records.length} fragancias`);

// Estadísticas rápidas
const families = {};
records.forEach(r => { families[r.family] = (families[r.family] || 0) + 1; });
console.log('\n📊 Familias olfativas:');
Object.entries(families).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`  ${k}: ${v}`));
console.log(`\nTop 5 por rating:`);
records.slice(0, 5).forEach(r => console.log(`  ${r.rating}★ (${r.reviews} reviews) — ${r.name} by ${r.brand}`));
