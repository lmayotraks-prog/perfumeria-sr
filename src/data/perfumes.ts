// src/data/perfumes.ts
// Base de datos de perfumes SR Essences — Catálogo completo

export type OlfactoryFamily =
  | 'Oriental'
  | 'Floral'
  | 'Amaderado'
  | 'Fresco'
  | 'Cítrico'
  | 'Gourmand'
  | 'Acuático'
  | 'Especiado'
  | 'Chypre'
  | 'Fougère';

export type NoteCategory = 'salida' | 'corazon' | 'fondo';

export interface OlfactoryNote {
  name: string;
  intensity: number; // 0-100
  category: NoteCategory;
}

export interface OlfactoryAccord {
  name: string;
  percentage: number; // 0-100
  color: string; // hex
}

export interface Perfume {
  id: string;
  name: string;
  brand: string;
  year?: number;
  description: string;
  shortDesc: string;
  family: OlfactoryFamily;
  subfamilies: OlfactoryFamily[];
  gender: 'masculino' | 'femenino' | 'unisex';
  concentration: 'Parfum' | 'EDP' | 'EDT' | 'EDC' | 'Extrait';
  // Visual identity
  liquidColor: string;        // hex — color del líquido en 3D
  liquidColorAlt: string;     // hex — color secundario para gradiente
  glowColor: string;          // hex — aura del frasco
  accentColor: string;        // hex — destacados UI
  marbleVariant: 'dark' | 'bronze' | 'noir' | 'obsidian' | 'earth'; // fondo de mármol
  // Olfactory pyramid
  notes: OlfactoryNote[];
  accords: OlfactoryAccord[];
  // Catalog data
  price: number;
  priceML: number;            // ml disponibles
  sizes: number[];            // ml options
  rating: number;             // 0-5
  reviews: number;
  tags: string[];
  featured: boolean;
  newArrival: boolean;
  bestseller: boolean;
  // Inspiration & Encyclopedia Metadata
  inspiredBy?: string;        // nombre de la fragancia de lujo que inspira
  perfumers?: string[];       // perfumistas ("La Nariz")
  parfumoUrl?: string;        // URL de referencia externa
  imageUrl?: string;          // PNG extraído del frasco real disponible
  available?: boolean;        // disponible en catálogo inmediato SR Essences
  season: ('primavera' | 'verano' | 'otoño' | 'invierno')[];
  occasion: ('día' | 'noche' | 'trabajo' | 'especial' | 'casual')[];
  sillage: 1 | 2 | 3 | 4 | 5;    // estela (1=íntimo, 5=bestial)
  longevity: 1 | 2 | 3 | 4 | 5;  // duración
}

export const PERFUMES: Perfume[] = [
  {
    id: 'ethere-dore',
    name: 'Éthéré Doré',
    brand: 'SR Essences',
    year: 2025,
    description:
      'Luz líquida capturada en cristal tallado. La bergamota dorada y la flor de azahar iluminan un corazón de iris pálido y pétalos de jazmín bañados en sol, reposando sobre ámbar blanco, sándalo sedoso y vainilla de Madagascar.',
    shortDesc: 'Flor de azahar · Iris pálido · Ámbar champán',
    family: 'Floral',
    subfamilies: ['Oriental', 'Amaderado'],
    gender: 'unisex',
    concentration: 'Extrait',
    liquidColor: '#d4ab54',
    liquidColorAlt: '#f7e4a3',
    glowColor: 'rgba(218,176,82,0.55)',
    accentColor: '#c9a145',
    marbleVariant: 'bronze',
    notes: [
      { name: 'Bergamota dorada', intensity: 82, category: 'salida' },
      { name: 'Flor de azahar', intensity: 88, category: 'salida' },
      { name: 'Pera blanca', intensity: 64, category: 'salida' },
      { name: 'Iris pallida', intensity: 92, category: 'corazon' },
      { name: 'Jazmín sambac', intensity: 84, category: 'corazon' },
      { name: 'Acorde champán', intensity: 76, category: 'corazon' },
      { name: 'Ámbar blanco', intensity: 90, category: 'fondo' },
      { name: 'Sándalo de seda', intensity: 86, category: 'fondo' },
      { name: 'Almizcle cristalino', intensity: 78, category: 'fondo' },
      { name: 'Vainilla dorada', intensity: 72, category: 'fondo' },
    ],
    accords: [
      { name: 'Floral Luminoso', percentage: 36, color: '#e5c16c' },
      { name: 'Ambarino', percentage: 24, color: '#c9a145' },
      { name: 'Empolvado', percentage: 18, color: '#dfd3c3' },
      { name: 'Almizclado', percentage: 12, color: '#bfa88a' },
      { name: 'Cítrico', percentage: 10, color: '#f2cc66' },
    ],
    price: 92000,
    priceML: 100,
    sizes: [30, 60, 100],
    rating: 4.9,
    reviews: 312,
    tags: ['champan', 'oro', 'luminoso', 'unisex', 'elegante', 'firma'],
    featured: true,
    newArrival: true,
    bestseller: true,
    inspiredBy: 'Baccarat Rouge 540 / Mon Guerlain L’Essence',
    season: ['primavera', 'verano', 'otoño'],
    occasion: ['especial', 'día', 'noche'],
    sillage: 4,
    longevity: 5,
  },
  {
    id: 'noir-absolu',
    name: 'Noir Absolu',
    brand: 'SR Essences',
    year: 2024,
    description:
      'Un abismo de seducción envuelto en sombra. El oud negro de Arabia se funde con la resina de benjuí y el sándalo ahumado en una espiral hipnótica que persiste hasta el alba. Para quien no teme la oscuridad que lo habita.',
    shortDesc: 'Oud negro · Benjuí · Sándalo ahumado',
    family: 'Oriental',
    subfamilies: ['Amaderado', 'Especiado'],
    gender: 'unisex',
    concentration: 'Extrait',
    liquidColor: '#1a0a00',
    liquidColorAlt: '#3d1800',
    glowColor: 'rgba(120,50,0,0.6)',
    accentColor: '#c4722a',
    marbleVariant: 'noir',
    notes: [
      { name: 'Bergamota negra', intensity: 75, category: 'salida' },
      { name: 'Pimienta rosa', intensity: 60, category: 'salida' },
      { name: 'Cardamomo', intensity: 55, category: 'salida' },
      { name: 'Rosa búlgara', intensity: 80, category: 'corazon' },
      { name: 'Oud árabe', intensity: 95, category: 'corazon' },
      { name: 'Incienso', intensity: 70, category: 'corazon' },
      { name: 'Benjuí', intensity: 85, category: 'fondo' },
      { name: 'Sándalo oscuro', intensity: 90, category: 'fondo' },
      { name: 'Ámbar negro', intensity: 88, category: 'fondo' },
      { name: 'Almizcle animal', intensity: 65, category: 'fondo' },
    ],
    accords: [
      { name: 'Oud', percentage: 35, color: '#8B4513' },
      { name: 'Resinoso', percentage: 25, color: '#D4A853' },
      { name: 'Ahumado', percentage: 20, color: '#4a4a4a' },
      { name: 'Especiado', percentage: 12, color: '#c4722a' },
      { name: 'Floral',   percentage: 8,  color: '#8B1A4A' },
    ],
    price: 85000,
    priceML: 100,
    sizes: [30, 60, 100],
    rating: 4.9,
    reviews: 234,
    tags: ['oud', 'oscuro', 'seductor', 'nocturno', 'intenso'],
    featured: true,
    newArrival: false,
    bestseller: true,
    inspiredBy: 'Black Orchid (Tom Ford)',
    season: ['otoño', 'invierno'],
    occasion: ['noche', 'especial'],
    sillage: 5,
    longevity: 5,
  },
  {
    id: 'rose-imperiale',
    name: 'Rose Impériale',
    brand: 'SR Essences',
    year: 2024,
    description:
      'La rosa más aristocrática del mundo, recogida en el amanecer de Grasse, despliega sus pétalos sobre un lecho de peonía y lichi. El pachulí envejece la madera de cachemira hasta convertirla en seda líquida.',
    shortDesc: 'Rosa de Grasse · Peonía · Pachulí seco',
    family: 'Floral',
    subfamilies: ['Chypre', 'Oriental'],
    gender: 'femenino',
    concentration: 'EDP',
    liquidColor: '#8B1A4A',
    liquidColorAlt: '#c4588a',
    glowColor: 'rgba(180,60,110,0.5)',
    accentColor: '#d4588a',
    marbleVariant: 'bronze',
    notes: [
      { name: 'Lichi', intensity: 80, category: 'salida' },
      { name: 'Bergamota', intensity: 65, category: 'salida' },
      { name: 'Frambuesa', intensity: 55, category: 'salida' },
      { name: 'Rosa de Grasse', intensity: 95, category: 'corazon' },
      { name: 'Peonía', intensity: 85, category: 'corazon' },
      { name: 'Magnolia', intensity: 60, category: 'corazon' },
      { name: 'Pachulí', intensity: 70, category: 'fondo' },
      { name: 'Cachemira', intensity: 80, category: 'fondo' },
      { name: 'Almizcle blanco', intensity: 65, category: 'fondo' },
      { name: 'Cedro', intensity: 50, category: 'fondo' },
    ],
    accords: [
      { name: 'Floral', percentage: 40, color: '#E91E8C' },
      { name: 'Suave', percentage: 25, color: '#FFB6C1' },
      { name: 'Frutal', percentage: 20, color: '#FF6B9D' },
      { name: 'Amaderado', percentage: 10, color: '#8B6914' },
      { name: 'Almizclado', percentage: 5,  color: '#D4B896' },
    ],
    price: 72000,
    priceML: 100,
    sizes: [30, 60, 100],
    rating: 4.8,
    reviews: 189,
    tags: ['floral', 'rosa', 'femenino', 'romántico', 'elegante'],
    featured: true,
    newArrival: true,
    bestseller: false,
    inspiredBy: 'Miss Dior (Dior)',
    season: ['primavera', 'verano'],
    occasion: ['día', 'especial', 'trabajo'],
    sillage: 3,
    longevity: 4,
  },
  {
    id: 'bois-sacre',
    name: 'Bois Sacré',
    brand: 'SR Essences',
    year: 2024,
    description:
      'Maderas sagradas que narran el silencio de los bosques antiguos. El vetiver ahumado de Haití, el sándalo de Mysore y el cedro del Atlas crean una sinfonía mineral que habla al subconsciente más profundo.',
    shortDesc: 'Vetiver · Sándalo de Mysore · Cedro Atlas',
    family: 'Amaderado',
    subfamilies: ['Fougère', 'Oriental'],
    gender: 'masculino',
    concentration: 'EDP',
    liquidColor: '#3d2b1f',
    liquidColorAlt: '#6b4a30',
    glowColor: 'rgba(80,55,30,0.6)',
    accentColor: '#a07840',
    marbleVariant: 'earth',
    notes: [
      { name: 'Cedro del Atlas', intensity: 70, category: 'salida' },
      { name: 'Nuez moscada', intensity: 55, category: 'salida' },
      { name: 'Lavanda', intensity: 50, category: 'salida' },
      { name: 'Corazón de cedro', intensity: 85, category: 'corazon' },
      { name: 'Iris', intensity: 60, category: 'corazon' },
      { name: 'Geranio', intensity: 45, category: 'corazon' },
      { name: 'Vetiver de Haití', intensity: 90, category: 'fondo' },
      { name: 'Sándalo de Mysore', intensity: 95, category: 'fondo' },
      { name: 'Ámbar gris', intensity: 70, category: 'fondo' },
      { name: 'Musgo de roble', intensity: 60, category: 'fondo' },
    ],
    accords: [
      { name: 'Amaderado', percentage: 45, color: '#8B6914' },
      { name: 'Terroso', percentage: 25, color: '#6B4F3A' },
      { name: 'Ahumado', percentage: 15, color: '#4a3a2a' },
      { name: 'Especiado', percentage: 10, color: '#c4722a' },
      { name: 'Herbal', percentage: 5,  color: '#5a7a4a' },
    ],
    price: 68000,
    priceML: 100,
    sizes: [30, 60, 100],
    rating: 4.7,
    reviews: 156,
    tags: ['amaderado', 'vetiver', 'masculino', 'sofisticado', 'mineral'],
    featured: true,
    newArrival: false,
    bestseller: true,
    inspiredBy: 'Santal 33 (Le Labo)',
    season: ['otoño', 'invierno'],
    occasion: ['trabajo', 'noche', 'especial'],
    sillage: 3,
    longevity: 5,
  },
  {
    id: 'ambre-soleil',
    name: 'Ambre Soleil',
    brand: 'SR Essences',
    year: 2025,
    description:
      'Cuando el sol se besa con la resina de ámbar báltico, nace esta composición que captura el calor del verano eterno. Vainilla bourbon, tonka y miel de acacia crean una piel comestible que hipnotiza.',
    shortDesc: 'Ámbar báltico · Vainilla Bourbon · Tonka',
    family: 'Oriental',
    subfamilies: ['Gourmand', 'Floral'],
    gender: 'femenino',
    concentration: 'EDP',
    liquidColor: '#c4722a',
    liquidColorAlt: '#e8a04a',
    glowColor: 'rgba(220,130,50,0.6)',
    accentColor: '#f0c060',
    marbleVariant: 'bronze',
    notes: [
      { name: 'Naranja sanguina', intensity: 70, category: 'salida' },
      { name: 'Heliotropo', intensity: 60, category: 'salida' },
      { name: 'Miel de acacia', intensity: 75, category: 'salida' },
      { name: 'Jazmín absoluto', intensity: 65, category: 'corazon' },
      { name: 'Ylang-ylang', intensity: 55, category: 'corazon' },
      { name: 'Gardenia', intensity: 50, category: 'corazon' },
      { name: 'Ámbar báltico', intensity: 90, category: 'fondo' },
      { name: 'Vainilla Bourbon', intensity: 85, category: 'fondo' },
      { name: 'Haba tonka', intensity: 80, category: 'fondo' },
      { name: 'Benjuí', intensity: 60, category: 'fondo' },
    ],
    accords: [
      { name: 'Ambarino', percentage: 35, color: '#D4A853' },
      { name: 'Gourmand', percentage: 30, color: '#8B4513' },
      { name: 'Floral', percentage: 20, color: '#FFB347' },
      { name: 'Suave', percentage: 10, color: '#DEB887' },
      { name: 'Cítrico', percentage: 5,  color: '#FFA500' },
    ],
    price: 75000,
    priceML: 100,
    sizes: [30, 60, 100],
    rating: 4.8,
    reviews: 201,
    tags: ['ambar', 'dulce', 'cálido', 'sensual', 'femenino'],
    featured: false,
    newArrival: true,
    bestseller: false,
    inspiredBy: 'Alien (Mugler)',
    season: ['verano', 'primavera'],
    occasion: ['noche', 'especial', 'casual'],
    sillage: 4,
    longevity: 4,
  },
  {
    id: 'aqua-regalis',
    name: 'Aqua Regalis',
    brand: 'SR Essences',
    year: 2024,
    description:
      'La brisa marina del Mediterráneo lleva en sus alas la frescura de la verbena, el neroli de Sicilia y el cedro de la costa amalfitana. Elegancia cítrica para el hombre que domina cada habitación que entra.',
    shortDesc: 'Neroli · Verbena · Cedro marino',
    family: 'Cítrico',
    subfamilies: ['Acuático', 'Amaderado'],
    gender: 'masculino',
    concentration: 'EDT',
    liquidColor: '#1a4a6b',
    liquidColorAlt: '#2a7aab',
    glowColor: 'rgba(30,100,180,0.5)',
    accentColor: '#4aade0',
    marbleVariant: 'dark',
    notes: [
      { name: 'Neroli de Sicilia', intensity: 85, category: 'salida' },
      { name: 'Verbena limón', intensity: 80, category: 'salida' },
      { name: 'Bergamota', intensity: 70, category: 'salida' },
      { name: 'Jazmín marino', intensity: 60, category: 'corazon' },
      { name: 'Bromelia', intensity: 55, category: 'corazon' },
      { name: 'Cardamomo', intensity: 45, category: 'corazon' },
      { name: 'Cedro marino', intensity: 70, category: 'fondo' },
      { name: 'Almizcle blanco', intensity: 65, category: 'fondo' },
      { name: 'Ámbar marino', intensity: 60, category: 'fondo' },
    ],
    accords: [
      { name: 'Cítrico', percentage: 35, color: '#FFA500' },
      { name: 'Acuático', percentage: 30, color: '#1E90FF' },
      { name: 'Amaderado', percentage: 20, color: '#8B6914' },
      { name: 'Floral', percentage: 10, color: '#98FB98' },
      { name: 'Almizclado', percentage: 5,  color: '#D4B896' },
    ],
    price: 58000,
    priceML: 100,
    sizes: [30, 60, 100],
    rating: 4.6,
    reviews: 142,
    tags: ['fresco', 'cítrico', 'masculino', 'marino', 'verano'],
    featured: false,
    newArrival: false,
    bestseller: false,
    inspiredBy: 'Acqua di Giò (Armani)',
    season: ['primavera', 'verano'],
    occasion: ['día', 'trabajo', 'casual'],
    sillage: 3,
    longevity: 3,
  },
  {
    id: 'jasmin-noir',
    name: 'Jasmin Noir',
    brand: 'SR Essences',
    year: 2025,
    description:
      'El jazmín que florece solo de noche, robado de jardines persas prohibidos. Su voluptuosidad se asienta sobre sándalo blanco y almizcle negro creando un dúo que oscila entre lo sagrado y lo profano.',
    shortDesc: 'Jazmín absoluto · Sándalo blanco · Almizcle negro',
    family: 'Floral',
    subfamilies: ['Oriental', 'Amaderado'],
    gender: 'femenino',
    concentration: 'Extrait',
    liquidColor: '#1a0a2e',
    liquidColorAlt: '#3d1a60',
    glowColor: 'rgba(80,20,150,0.5)',
    accentColor: '#9b59d4',
    marbleVariant: 'obsidian',
    notes: [
      { name: 'Gardenia', intensity: 65, category: 'salida' },
      { name: 'Magnolia', intensity: 60, category: 'salida' },
      { name: 'Durazno', intensity: 50, category: 'salida' },
      { name: 'Jazmín absoluto', intensity: 95, category: 'corazon' },
      { name: 'Tuberosa', intensity: 80, category: 'corazon' },
      { name: 'Ylang-ylang', intensity: 70, category: 'corazon' },
      { name: 'Sándalo blanco', intensity: 85, category: 'fondo' },
      { name: 'Almizcle negro', intensity: 90, category: 'fondo' },
      { name: 'Vainilla', intensity: 55, category: 'fondo' },
      { name: 'Cedro', intensity: 50, category: 'fondo' },
    ],
    accords: [
      { name: 'Floral blanco', percentage: 40, color: '#FFFACD' },
      { name: 'Almizclado', percentage: 25, color: '#6B4F6B' },
      { name: 'Suave', percentage: 20, color: '#DDA0DD' },
      { name: 'Amaderado', percentage: 10, color: '#8B6914' },
      { name: 'Frutal', percentage: 5,  color: '#FFB6C1' },
    ],
    price: 90000,
    priceML: 100,
    sizes: [30, 60, 100],
    rating: 4.9,
    reviews: 178,
    tags: ['jazmín', 'floral blanco', 'nocturno', 'sensual', 'femenino'],
    featured: true,
    newArrival: true,
    bestseller: false,
    inspiredBy: 'Joy (Dior)',
    season: ['verano', 'primavera'],
    occasion: ['noche', 'especial'],
    sillage: 4,
    longevity: 5,
  },
  {
    id: 'tabac-imperial',
    name: 'Tabac Impérial',
    brand: 'SR Essences',
    year: 2024,
    description:
      'Tabaco rubio de Virginia cuidadosamente curado con miel y especias del oriente. Cuero noble, madera de guayacol y un toque de ron añejo componen un fragancia de poder sosegado y autoridad innegable.',
    shortDesc: 'Tabaco rubio · Cuero noble · Ron añejo',
    family: 'Oriental',
    subfamilies: ['Especiado', 'Amaderado'],
    gender: 'masculino',
    concentration: 'EDP',
    liquidColor: '#4a2800',
    liquidColorAlt: '#8a4c10',
    glowColor: 'rgba(140,80,20,0.6)',
    accentColor: '#d4a040',
    marbleVariant: 'earth',
    notes: [
      { name: 'Ron oscuro', intensity: 70, category: 'salida' },
      { name: 'Nuez moscada', intensity: 60, category: 'salida' },
      { name: 'Naranja amarga', intensity: 55, category: 'salida' },
      { name: 'Tabaco Virginia', intensity: 95, category: 'corazon' },
      { name: 'Cuero', intensity: 80, category: 'corazon' },
      { name: 'Miel negra', intensity: 70, category: 'corazon' },
      { name: 'Guayacol', intensity: 85, category: 'fondo' },
      { name: 'Ámbar', intensity: 75, category: 'fondo' },
      { name: 'Pachulí', intensity: 60, category: 'fondo' },
      { name: 'Benjuí', intensity: 65, category: 'fondo' },
    ],
    accords: [
      { name: 'Tabáquico', percentage: 35, color: '#8B6914' },
      { name: 'Cuero', percentage: 25, color: '#6B3A2A' },
      { name: 'Resinoso', percentage: 20, color: '#D4A853' },
      { name: 'Especiado', percentage: 12, color: '#c4722a' },
      { name: 'Gourmand', percentage: 8,  color: '#DEB887' },
    ],
    price: 78000,
    priceML: 100,
    sizes: [30, 60, 100],
    rating: 4.7,
    reviews: 165,
    tags: ['tabaco', 'cuero', 'masculino', 'intenso', 'vintage'],
    featured: false,
    newArrival: false,
    bestseller: true,
    inspiredBy: 'Tobacco Vanille (Tom Ford)',
    season: ['otoño', 'invierno'],
    occasion: ['noche', 'especial'],
    sillage: 4,
    longevity: 5,
  },
  {
    id: 'musc-celeste',
    name: 'Musc Céleste',
    brand: 'SR Essences',
    year: 2025,
    description:
      'Piel sobre piel. El almizcle más puro de Oriente se desnuda ante la cachemira y el sándalo en una composición que imita el olor natural del deseo. Invisible y omnipresente a la vez.',
    shortDesc: 'Almizcle oriental · Cachemira · Sándalo etéreo',
    family: 'Oriental',
    subfamilies: ['Amaderado', 'Floral'],
    gender: 'unisex',
    concentration: 'EDP',
    liquidColor: '#d4c4a0',
    liquidColorAlt: '#e8d8b8',
    glowColor: 'rgba(220,200,150,0.4)',
    accentColor: '#c9a84c',
    marbleVariant: 'bronze',
    notes: [
      { name: 'Almendra', intensity: 55, category: 'salida' },
      { name: 'Heliotropo', intensity: 60, category: 'salida' },
      { name: 'Bergamota suave', intensity: 45, category: 'salida' },
      { name: 'Iris', intensity: 65, category: 'corazon' },
      { name: 'Rosa blanca', intensity: 60, category: 'corazon' },
      { name: 'Cachemira floral', intensity: 70, category: 'corazon' },
      { name: 'Almizcle oriental', intensity: 90, category: 'fondo' },
      { name: 'Sándalo etéreo', intensity: 80, category: 'fondo' },
      { name: 'Ámbar suave', intensity: 70, category: 'fondo' },
      { name: 'Vainilla', intensity: 50, category: 'fondo' },
    ],
    accords: [
      { name: 'Almizclado', percentage: 40, color: '#D4B896' },
      { name: 'Suave', percentage: 30, color: '#DDA0DD' },
      { name: 'Amaderado', percentage: 15, color: '#8B6914' },
      { name: 'Floral', percentage: 10, color: '#FFB6C1' },
      { name: 'Gourmand', percentage: 5,  color: '#DEB887' },
    ],
    price: 65000,
    priceML: 100,
    sizes: [30, 60, 100],
    rating: 4.8,
    reviews: 220,
    tags: ['almizcle', 'suave', 'unisex', 'piel', 'sensual'],
    featured: false,
    newArrival: false,
    bestseller: true,
    inspiredBy: 'Musc Ravageur (Malle)',
    season: ['otoño', 'invierno', 'primavera'],
    occasion: ['día', 'noche', 'casual', 'especial'],
    sillage: 2,
    longevity: 4,
  },
];

// Helpers de filtrado
export const getAllFamilies = (): OlfactoryFamily[] =>
  [...new Set(PERFUMES.flatMap((p) => [p.family, ...p.subfamilies]))].sort();

export const getAllTags = (): string[] =>
  [...new Set(PERFUMES.flatMap((p) => p.tags))].sort();

export const getAllNotes = (): string[] =>
  [...new Set(PERFUMES.flatMap((p) => p.notes.map((n) => n.name)))].sort();

export const getPerfumeById = (id: string): Perfume | undefined =>
  PERFUMES.find((p) => p.id === id);

export const getFeatured = (): Perfume[] =>
  PERFUMES.filter((p) => p.featured);

export const getBestsellers = (): Perfume[] =>
  PERFUMES.filter((p) => p.bestseller);

export const getNewArrivals = (): Perfume[] =>
  PERFUMES.filter((p) => p.newArrival);
