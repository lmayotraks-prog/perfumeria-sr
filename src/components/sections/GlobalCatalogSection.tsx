'use client';
// src/components/sections/GlobalCatalogSection.tsx — Enciclopedia Olfativa Estilo Fragrantica.es (25,663 fragancias)
import { useState, useEffect, useCallback } from 'react';
import { usePerfumeStore } from '@/hooks/usePerfumeStore';
import { Perfume } from '@/types';
import {
  NOTE_SEARCH_GROUPS,
  ACCORD_SEARCH_LIST,
  translateAccord,
  translateNote,
  getAccordColor,
} from '@/lib/olfactoryDictionary';
import { buildPerfumeWhatsAppUrl } from '@/lib/whatsapp';
import StarRating from '@/components/ui/StarRating';

interface FragranceApiResponse {
  total: number;
  page: number;
  limit: number;
  pages: number;
  items: Perfume[];
}

interface MetaResponse {
  totalCatalog: number;
  totalBrands: number;
  totalPerfumers: number;
  letterCounts: Record<string, number>;
  topBrands: { name: string; count: number; letter: string }[];
  letterBrands: { name: string; count: number; letter: string }[];
  topPerfumers: { name: string; count: number }[];
}

type HubTab = 'explore' | 'notes' | 'accords' | 'directory';

const FAMOUS_BRANDS = [
  'Creed',
  'Tom Ford',
  'Dior',
  'Chanel',
  'Guerlain',
  'Xerjoff',
  'Parfums de Marly',
  'Yves Saint Laurent',
  'Givenchy',
  'Amouage',
  'Kilian',
  'Roja Dove',
];

const FAMILIES = [
  'Todas',
  'Floral',
  'Gourmand',
  'Cítrico',
  'Especiado',
  'Fresco',
  'Amaderado',
  'Verde',
  'Oriental',
  'Cuero',
  'Empolvado',
  'Acuático',
  'Almizclado',
  'Chypre',
];

const CONCENTRATIONS = [
  { label: 'Todas', value: '' },
  { label: 'Extrait / Pure', value: 'Extrait' },
  { label: 'Eau de Parfum', value: 'EDP' },
  { label: 'Eau de Toilette', value: 'EDT' },
  { label: 'Eau de Cologne', value: 'EDC' },
];

const DECADES = [
  { label: 'Cualquier año', value: 'todas' },
  { label: '2020s (Recientes)', value: '2020' },
  { label: '2010s', value: '2010' },
  { label: '2000s', value: '2000' },
  { label: '1990s', value: '1990' },
  { label: 'Clásicos (<1990)', value: 'classic' },
];

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split('');

export default function GlobalCatalogSection() {
  const { state, dispatch } = usePerfumeStore();
  const activeId = state.ui.activePerfumeId;
  const preset = state.encyclopediaPreset;
  const bag = state.bag;

  const [activeTab, setActiveTab] = useState<HubTab>('explore');
  const [search, setSearch] = useState('');
  const [selectedFamily, setSelectedFamily] = useState('Todas');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedPerfumer, setSelectedPerfumer] = useState('');
  const [selectedConcentration, setSelectedConcentration] = useState('');
  const [selectedDecade, setSelectedDecade] = useState('todas');
  const [selectedAccords, setSelectedAccords] = useState<string[]>([]);
  const [includeNotes, setIncludeNotes] = useState<string[]>([]);
  const [excludeNotes, setExcludeNotes] = useState<string[]>([]);
  const [noteInputMode, setNoteInputMode] = useState<'include' | 'exclude'>('include');
  const [sortBy, setSortBy] = useState('rating');
  const [page, setPage] = useState(1);

  const [data, setData] = useState<FragranceApiResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // Estado del directorio A-Z y Perfumistas
  const [dirLetter, setDirLetter] = useState('C');
  const [dirQuery, setDirQuery] = useState('');
  const [metaData, setMetaData] = useState<MetaResponse | null>(null);

  // Aplicar saltos desde FragranceDetailModal (ej. clic en nota, acorde, casa o perfumista)
  useEffect(() => {
    if (!preset) return;
    if (preset.brand !== undefined) {
      setSelectedBrand(preset.brand);
      setActiveTab('explore');
    }
    if (preset.perfumer !== undefined) {
      setSelectedPerfumer(preset.perfumer);
      setActiveTab('explore');
    }
    if (preset.accord) {
      setSelectedAccords((prev) =>
        prev.includes(preset.accord!) ? prev : [...prev, preset.accord!].slice(0, 3)
      );
      setActiveTab('accords');
    }
    if (preset.includeNote) {
      setIncludeNotes((prev) =>
        prev.includes(preset.includeNote!) ? prev : [...prev, preset.includeNote!]
      );
      setExcludeNotes((prev) => prev.filter((n) => n !== preset.includeNote));
      setActiveTab('notes');
    }
    if (preset.search !== undefined) {
      setSearch(preset.search);
    }
    setPage(1);
    dispatch({ type: 'CLEAR_ENCYCLOPEDIA_PRESET' });
  }, [preset, dispatch]);

  // Cargar índice de Diseñadores A-Z y Perfumistas ("La Nariz")
  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ mode: 'meta', letter: dirLetter });
    if (dirQuery.trim()) params.set('q', dirQuery.trim());

    fetch(`/api/fragrances?${params.toString()}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json && !controller.signal.aborted) setMetaData(json);
      })
      .catch((err) => {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error cargando directorio:', err);
        }
      });

    return () => controller.abort();
  }, [dirLetter, dirQuery]);

  // Consultar listado de fragancias con filtros estilo Fragrantica.es
  const fetchFragrances = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '16',
          sortBy,
        });
        if (search.trim()) params.set('search', search.trim());
        if (selectedFamily && selectedFamily !== 'Todas') params.set('family', selectedFamily);
        if (selectedBrand.trim()) params.set('brand', selectedBrand.trim());
        if (selectedPerfumer.trim()) params.set('perfumer', selectedPerfumer.trim());
        if (selectedConcentration) params.set('concentration', selectedConcentration);
        if (selectedDecade && selectedDecade !== 'todas') params.set('decade', selectedDecade);
        if (selectedAccords.length > 0) params.set('accords', selectedAccords.join(','));
        if (includeNotes.length > 0) params.set('includeNotes', includeNotes.join(','));
        if (excludeNotes.length > 0) params.set('excludeNotes', excludeNotes.join(','));

        const res = await fetch(`/api/fragrances?${params.toString()}`, { signal });
        if (res.ok) {
          const json: FragranceApiResponse = await res.json();
          setData(json);
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error fetching catalog:', err);
        }
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [
      page,
      search,
      selectedFamily,
      selectedBrand,
      selectedPerfumer,
      selectedConcentration,
      selectedDecade,
      selectedAccords,
      includeNotes,
      excludeNotes,
      sortBy,
    ]
  );

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetchFragrances(controller.signal);
    }, search.trim() ? 160 : 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [fetchFragrances, search]);

  const handleOpenInModal = (perfume: Perfume) => {
    dispatch({ type: 'OPEN_DETAIL', perfume });
  };

  const toggleNoteKey = (noteKey: string) => {
    if (noteInputMode === 'include') {
      setExcludeNotes((prev) => prev.filter((n) => n !== noteKey));
      setIncludeNotes((prev) =>
        prev.includes(noteKey) ? prev.filter((n) => n !== noteKey) : [...prev, noteKey]
      );
    } else {
      setIncludeNotes((prev) => prev.filter((n) => n !== noteKey));
      setExcludeNotes((prev) =>
        prev.includes(noteKey) ? prev.filter((n) => n !== noteKey) : [...prev, noteKey]
      );
    }
    setPage(1);
  };

  const toggleAccordKey = (accordKey: string) => {
    setSelectedAccords((prev) =>
      prev.includes(accordKey) ? prev.filter((a) => a !== accordKey) : [...prev, accordKey].slice(-3)
    );
    setPage(1);
  };

  const clearAllFilters = () => {
    setSearch('');
    setSelectedFamily('Todas');
    setSelectedBrand('');
    setSelectedPerfumer('');
    setSelectedConcentration('');
    setSelectedDecade('todas');
    setSelectedAccords([]);
    setIncludeNotes([]);
    setExcludeNotes([]);
    setPage(1);
  };

  const hasActiveFilters = Boolean(
    search.trim() ||
    selectedFamily !== 'Todas' ||
    selectedBrand ||
    selectedPerfumer ||
    selectedConcentration ||
    selectedDecade !== 'todas' ||
    selectedAccords.length > 0 ||
    includeNotes.length > 0 ||
    excludeNotes.length > 0
  );

  const TABS: { id: HubTab; label: string; badge?: number }[] = [
    { id: 'explore', label: 'Buscador General' },
    { id: 'notes', label: 'Buscar por Notas (+/−)', badge: includeNotes.length + excludeNotes.length },
    { id: 'accords', label: 'Buscar por Acordes', badge: selectedAccords.length },
    { id: 'directory', label: 'Diseñadores (A–Z) & Narices' },
  ];

  return (
    <div className="max-w-[1600px] 3xl:max-w-[1920px] 4xl:max-w-[2280px] mx-auto px-3.5 sm:px-6 md:px-10 py-6 sm:py-8 md:py-12 select-none">
      {/* ——— BREADCRUMB DE UBICACIÓN + RETORNO DIRECTO A STOCK INMEDIATO ——— */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-8"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-center gap-2 text-[11px] font-sans">
          <button
            onClick={() => dispatch({ type: 'SET_VIEW', view: 'home' })}
            className="uppercase tracking-[0.18em] hover:underline cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
          >
            Inicio
          </button>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span className="uppercase tracking-[0.18em] font-medium" style={{ color: 'var(--gold)' }}>
            Enciclopedia Olfativa Mundial (25,663)
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => dispatch({ type: 'ENTER_UNIVERSE', department: 'dama' })}
            className="filter-chip cursor-pointer"
          >
            ☀ Catálogo Disponible Dama
          </button>
          <button
            onClick={() => dispatch({ type: 'ENTER_UNIVERSE', department: 'caballero' })}
            className="filter-chip cursor-pointer"
          >
            ☾ Caballero
          </button>
        </div>
      </div>

      {/* Encabezado Editorial + Fragrantica Hub */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-4 mb-5">
          <div className="divider-gold w-14" />
          <span
            className="font-sans text-[11px] font-medium tracking-[0.35em] uppercase"
            style={{ color: 'var(--gold)' }}
          >
            Enciclopedia Olfativa Mundial · {metaData?.totalCatalog ? metaData.totalCatalog.toLocaleString('es') : '25,663'} Perfumes
          </span>
          <div className="divider-gold w-14" />
        </div>

        <h2
          className="font-serif font-light leading-none mb-4"
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 4.1rem)',
            color: 'var(--text-primary)',
          }}
        >
          Archivo{' '}
          <span className="italic text-gold">Perfumístico</span>
        </h2>

        <p
          className="font-sans text-xs md:text-sm font-light max-w-2xl mx-auto leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          Navega como en una enciclopedia profesional: busca por{' '}
          <strong className="font-medium" style={{ color: 'var(--text-primary)' }}>notas incluidas o excluidas</strong>,
          arma tu perfil de{' '}
          <strong className="font-medium" style={{ color: 'var(--text-primary)' }}>acordes principales</strong>, explora el directorio{' '}
          <strong className="font-medium" style={{ color: 'var(--text-primary)' }}>A–Z de casas y narices</strong> y abre la ficha completa o proyéctala en el{' '}
          <span className="font-medium" style={{ color: 'var(--gold)' }}>Frasco 3D</span>.
        </p>
      </div>

      {/* ——— BARRA DE PESTAÑAS ESTILO FRAGRANTICA HUB ——— */}
      <div className="flex flex-nowrap md:flex-wrap overflow-x-auto no-scrollbar justify-start md:justify-center gap-2 pb-1 md:pb-0 mb-8">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 min-h-[42px] px-4 sm:px-5 py-2.5 sm:py-3 font-sans text-[10px] sm:text-[11px] tracking-[0.16em] sm:tracking-[0.18em] uppercase transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${isActive ? 'surface-gold maison-frame' : 'surface-card opacity-85 hover:opacity-100'
                }`}
              style={{
                color: isActive ? 'var(--gold)' : 'var(--text-primary)',
                borderColor: isActive ? 'var(--gold)' : 'var(--border-gold)',
                fontWeight: isActive ? 500 : 400,
              }}
            >
              <span>{tab.label}</span>
              {Boolean(tab.badge && tab.badge > 0) && (
                <span
                  className="px-1.5 py-0.5 text-[9px] rounded-full"
                  style={{ background: 'var(--gold)', color: '#fff' }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ——— PANEL ACTIVO DEL HUB ——— */}
      <div className="surface-card p-6 mb-8">
        {activeTab === 'explore' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
              <div className="md:col-span-4 relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Perfume, casa, nariz o nota (Vainilla, Creed, Morillas)..."
                  className="w-full px-4 py-3 pl-10 font-sans text-xs font-light focus:outline-none"
                  style={{
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-gold)',
                    color: 'var(--text-primary)',
                  }}
                />
                <svg
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: 'var(--gold)' }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                {search && (
                  <button
                    onClick={() => {
                      setSearch('');
                      setPage(1);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="md:col-span-2">
                <select
                  value={selectedFamily}
                  onChange={(e) => {
                    setSelectedFamily(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-3 font-sans text-xs font-light focus:outline-none cursor-pointer"
                  style={{
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-gold)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {FAMILIES.map((fam) => (
                    <option key={fam} value={fam}>
                      Familia: {fam}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <select
                  value={selectedConcentration}
                  onChange={(e) => {
                    setSelectedConcentration(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-3 font-sans text-xs font-light focus:outline-none cursor-pointer"
                  style={{
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-gold)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {CONCENTRATIONS.map((c) => (
                    <option key={c.label} value={c.value}>
                      Concentración: {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <select
                  value={selectedDecade}
                  onChange={(e) => {
                    setSelectedDecade(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-3 font-sans text-xs font-light focus:outline-none cursor-pointer"
                  style={{
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-gold)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {DECADES.map((d) => (
                    <option key={d.value} value={d.value}>
                      Época: {d.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-3 font-sans text-xs font-light focus:outline-none cursor-pointer"
                  style={{
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-gold)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="rating">Calificación (Mayor)</option>
                  <option value="reviews">Más Reseñas</option>
                  <option value="year">Más Recientes</option>
                  <option value="year_asc">Más Clásicos</option>
                  <option value="name">Nombre A-Z</option>
                </select>
              </div>
            </div>

            {/* Casas míticas rápidas */}
            <div
              className="mt-4 pt-4 flex flex-wrap items-center gap-1.5"
              style={{ borderTop: '1px solid var(--border-subtle)' }}
            >
              <span
                className="font-sans text-[10px] font-medium uppercase tracking-widest mr-2"
                style={{ color: 'var(--text-muted)' }}
              >
                Casas Emblemáticas:
              </span>
              {FAMOUS_BRANDS.map((b) => (
                <button
                  key={b}
                  onClick={() => {
                    setSelectedBrand(selectedBrand === b ? '' : b);
                    setPage(1);
                  }}
                  className={`filter-chip ${selectedBrand === b ? 'active' : ''}`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ——— TAB 2: BUSCAR POR NOTAS (+ / -) ESTILO FRAGRANTICA ——— */}
        {activeTab === 'notes' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <h3 className="font-serif text-xl font-normal" style={{ color: 'var(--text-primary)' }}>
                  Buscador por Notas Olfativas
                </h3>
                <p className="font-sans text-xs font-light" style={{ color: 'var(--text-muted)' }}>
                  Combina ingredientes que deseas incluir (+) y descarta las notas que prefieres evitar (−).
                </p>
              </div>

              <div className="flex items-center gap-2 surface-gold p-1 self-start">
                <button
                  onClick={() => setNoteInputMode('include')}
                  className="px-3.5 py-1.5 font-sans text-[10px] tracking-widest uppercase transition-all"
                  style={{
                    background: noteInputMode === 'include' ? 'var(--gold)' : 'transparent',
                    color: noteInputMode === 'include' ? '#fff' : 'var(--text-primary)',
                  }}
                >
                  + Incluir Nota
                </button>
                <button
                  onClick={() => setNoteInputMode('exclude')}
                  className="px-3.5 py-1.5 font-sans text-[10px] tracking-widest uppercase transition-all"
                  style={{
                    background: noteInputMode === 'exclude' ? '#9e4747' : 'transparent',
                    color: noteInputMode === 'exclude' ? '#fff' : 'var(--text-primary)',
                  }}
                >
                  − Excluir Nota
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {NOTE_SEARCH_GROUPS.map((grp) => (
                <div key={grp.title} className="p-4 surface-gold">
                  <p
                    className="font-sans text-[10px] font-medium tracking-[0.2em] uppercase mb-3 flex items-center gap-2"
                    style={{ color: 'var(--gold)' }}
                  >
                    <span>{grp.symbol}</span>
                    <span>{grp.title}</span>
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {grp.items.map((item) => {
                      const isInc = includeNotes.includes(item.key);
                      const isExc = excludeNotes.includes(item.key);
                      return (
                        <button
                          key={item.key}
                          onClick={() => toggleNoteKey(item.key)}
                          className="px-2.5 py-1 text-[11px] font-sans transition-all"
                          style={{
                            background: isInc
                              ? 'var(--gold)'
                              : isExc
                                ? '#9e4747'
                                : 'var(--bg-card)',
                            color: isInc || isExc ? '#ffffff' : 'var(--text-secondary)',
                            border: `1px solid ${isInc ? 'var(--gold)' : isExc ? '#9e4747' : 'var(--border-subtle)'
                              }`,
                            textDecoration: isExc ? 'line-through' : 'none',
                          }}
                        >
                          {isInc ? '+ ' : isExc ? '− ' : ''}
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ——— TAB 3: BUSCAR POR ACORDES PRINCIPALES ——— */}
        {activeTab === 'accords' && (
          <div>
            <div className="pb-4 mb-5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 className="font-serif text-xl font-normal mb-1" style={{ color: 'var(--text-primary)' }}>
                Buscar por Perfil de Acordes Principales
              </h3>
              <p className="font-sans text-xs font-light" style={{ color: 'var(--text-muted)' }}>
                Selecciona hasta 3 acordes dominantes para descubrir fragancias que compartan exactamente esa firma aromática.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              {ACCORD_SEARCH_LIST.map((acc) => {
                const isSelected = selectedAccords.includes(acc.key);
                return (
                  <button
                    key={acc.key}
                    onClick={() => toggleAccordKey(acc.key)}
                    className="p-3 text-left transition-all relative overflow-hidden"
                    style={{
                      background: isSelected ? acc.color : 'var(--bg-input)',
                      color: isSelected ? '#ffffff' : 'var(--text-primary)',
                      border: `1px solid ${isSelected ? acc.color : 'var(--border-gold)'}`,
                    }}
                  >
                    <div
                      className="h-1 w-full mb-2"
                      style={{ background: isSelected ? 'rgba(255,255,255,0.65)' : acc.color }}
                    />
                    <span className="font-sans text-xs font-medium block truncate">
                      {isSelected ? '✓ ' : ''}
                      {acc.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ——— TAB 4: DIRECTORIO A–Z DE DISEÑADORES & MAESTROS PERFUMISTAS ("LA NARIZ") ——— */}
        {activeTab === 'directory' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
            {/* Directorio Alfabético de Casas */}
            <div className="lg:col-span-7">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="font-serif text-xl font-normal" style={{ color: 'var(--text-primary)' }}>
                    Directorio de Diseñadores (A–Z)
                  </h3>
                  <p className="font-sans text-xs font-light" style={{ color: 'var(--text-muted)' }}>
                    {metaData?.totalBrands ? `${metaData.totalBrands.toLocaleString('es')} casas registradas` : 'Índice de casas perfumistas'}
                  </p>
                </div>

                <input
                  type="text"
                  value={dirQuery}
                  onChange={(e) => setDirQuery(e.target.value)}
                  placeholder="Filtrar casa o nariz..."
                  className="px-3 py-2 text-xs font-sans focus:outline-none"
                  style={{
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-gold)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              {/* Índice A-Z */}
              <div className="flex flex-wrap gap-1 mb-4">
                {ALPHABET.map((l) => {
                  const active = dirLetter === l && !dirQuery.trim();
                  return (
                    <button
                      key={l}
                      onClick={() => {
                        setDirQuery('');
                        setDirLetter(l);
                      }}
                      className={`min-w-[34px] h-9 sm:w-8 sm:h-8 text-[11px] font-sans font-medium transition-all cursor-pointer ${active ? 'active' : ''
                        }`}
                      style={{
                        background: active ? 'var(--gold)' : 'var(--bg-input)',
                        color: active ? '#fff' : 'var(--text-primary)',
                        border: '1px solid var(--border-gold)',
                      }}
                    >
                      {l}
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
                {(metaData?.letterBrands || []).map((b) => (
                  <button
                    key={b.name}
                    onClick={() => {
                      setSelectedBrand(selectedBrand === b.name ? '' : b.name);
                      setPage(1);
                    }}
                    className={`px-3 py-2 text-left text-xs font-sans flex items-center justify-between gap-2 transition-all ${selectedBrand === b.name ? 'active' : ''
                      }`}
                    style={{
                      background: selectedBrand === b.name ? 'var(--gold-pale)' : 'var(--bg-input)',
                      border: `1px solid ${selectedBrand === b.name ? 'var(--gold)' : 'var(--border-subtle)'}`,
                      color: 'var(--text-primary)',
                    }}
                  >
                    <span className="truncate">{b.name}</span>
                    <span className="text-[10px] opacity-60 flex-shrink-0">{b.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Directorio de Maestros Perfumistas ("La Nariz") */}
            <div className="lg:col-span-5 border-t pt-6 lg:border-t-0 lg:pt-0 lg:border-l lg:pl-6" style={{ borderColor: 'var(--border-subtle)' }}>
              <h3 className="font-serif text-xl font-normal mb-1" style={{ color: 'var(--text-primary)' }}>
                Maestros Perfumistas («La Nariz»)
              </h3>
              <p className="font-sans text-xs font-light mb-4" style={{ color: 'var(--text-muted)' }}>
                {metaData?.totalPerfumers ? `${metaData.totalPerfumers.toLocaleString('es')} autores registrados` : 'Creadores de las fórmulas'}
              </p>

              <div className="flex flex-wrap gap-1.5 max-h-72 overflow-y-auto pr-1">
                {(metaData?.topPerfumers || []).map((p) => (
                  <button
                    key={p.name}
                    onClick={() => {
                      setSelectedPerfumer(selectedPerfumer === p.name ? '' : p.name);
                      setPage(1);
                    }}
                    className={`filter-chip ${selectedPerfumer === p.name ? 'active' : ''}`}
                  >
                    ✦ {p.name} <span className="opacity-65 ml-1">({p.count})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ——— PÍLDORAS DE FILTROS ACTIVOS ——— */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="font-sans text-[10px] uppercase tracking-widest mr-1" style={{ color: 'var(--text-muted)' }}>
            Filtros activos:
          </span>

          {selectedBrand && (
            <ActivePill label={`Casa: ${selectedBrand}`} onRemove={() => { setSelectedBrand(''); setPage(1); }} />
          )}
          {selectedPerfumer && (
            <ActivePill label={`Nariz: ${selectedPerfumer}`} onRemove={() => { setSelectedPerfumer(''); setPage(1); }} />
          )}
          {selectedFamily !== 'Todas' && (
            <ActivePill label={`Familia: ${selectedFamily}`} onRemove={() => { setSelectedFamily('Todas'); setPage(1); }} />
          )}
          {selectedConcentration && (
            <ActivePill label={selectedConcentration} onRemove={() => { setSelectedConcentration(''); setPage(1); }} />
          )}
          {selectedDecade !== 'todas' && (
            <ActivePill label={`Época: ${selectedDecade}`} onRemove={() => { setSelectedDecade('todas'); setPage(1); }} />
          )}
          {selectedAccords.map((acc) => (
            <ActivePill
              key={`pill-acc-${acc}`}
              label={`Acorde: ${translateAccord(acc)}`}
              onRemove={() => toggleAccordKey(acc)}
            />
          ))}
          {includeNotes.map((n) => (
            <ActivePill
              key={`pill-inc-${n}`}
              label={`+ ${translateNote(n)}`}
              onRemove={() => setIncludeNotes((prev) => prev.filter((x) => x !== n))}
            />
          ))}
          {excludeNotes.map((n) => (
            <ActivePill
              key={`pill-exc-${n}`}
              label={`− ${translateNote(n)}`}
              variant="danger"
              onRemove={() => setExcludeNotes((prev) => prev.filter((x) => x !== n))}
            />
          ))}

          <button
            onClick={clearAllFilters}
            className="font-sans text-[10px] font-medium underline ml-2"
            style={{ color: 'var(--gold)' }}
          >
            Restablecer todo
          </button>
        </div>
      )}

      {/* Contador */}
      <div className="flex items-center justify-between mb-6 text-xs font-light" style={{ color: 'var(--text-muted)' }}>
        <p>
          {loading ? (
            <span className="animate-pulse">Consultando archivo olfativo...</span>
          ) : (
            <span>
              Mostrando <strong style={{ color: 'var(--text-primary)' }}>{data?.items.length || 0}</strong> de{' '}
              <strong style={{ color: 'var(--gold)' }}>{(data?.total || 0).toLocaleString('es')}</strong> fragancias
            </span>
          )}
        </p>
        {data && data.pages > 1 && (
          <p>
            Página <span style={{ color: 'var(--text-primary)' }}>{data.page}</span> de {data.pages}
          </p>
        )}
      </div>

      {/* ——— GRID DE RESULTADOS CON ACORDES FRAGRANTICA ——— */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5 gap-4 sm:gap-5">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="surface-card p-5 animate-pulse h-72 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-20 h-3 opacity-25" style={{ background: 'var(--border-gold)' }} />
                <div className="w-3/4 h-5 opacity-25" style={{ background: 'var(--border-subtle)' }} />
                <div className="w-1/2 h-3 opacity-20" style={{ background: 'var(--border-subtle)' }} />
              </div>
              <div className="w-full h-16 opacity-20" style={{ background: 'var(--border-subtle)' }} />
            </div>
          ))}
        </div>
      ) : data?.items.length === 0 ? (
        <div className="surface-card text-center py-20">
          <p className="font-serif text-2xl font-light mb-2" style={{ color: 'var(--text-primary)' }}>
            Sin coincidencias exactas para esa combinación
          </p>
          <p className="font-sans text-xs font-light mb-5" style={{ color: 'var(--text-muted)' }}>
            Prueba relajando alguna nota o acorde de tu búsqueda
          </p>
          <button onClick={clearAllFilters} className="btn-ghost text-xs py-2 px-5">
            Ver todas las fragancias
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5 gap-4 sm:gap-5">
          {data?.items.map((perfume) => {
            const isCurrentlyActive = activeId === perfume.id;
            return (
              <div
                key={perfume.id}
                onClick={() => dispatch({ type: 'OPEN_DETAIL', perfume })}
                className={`perfume-card p-5 flex flex-col justify-between ${isCurrentlyActive ? 'active maison-frame' : ''
                  }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5 gap-2">
                    <span
                      className="font-sans text-[10px] font-medium tracking-[0.18em] uppercase truncate"
                      style={{ color: 'var(--gold)' }}
                    >
                      {perfume.brand}
                    </span>
                    <span className="font-sans text-[10px] flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                      {perfume.year ? `${perfume.year} · ` : ''}{perfume.concentration}
                    </span>
                  </div>

                  <h3
                    className="font-serif text-lg font-normal leading-tight mb-1 line-clamp-1"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {perfume.name}
                  </h3>

                  {perfume.perfumers && perfume.perfumers.length > 0 && (
                    <p className="font-sans text-[10px] font-light truncate mb-2" style={{ color: 'var(--text-muted)' }}>
                      Nariz: {perfume.perfumers.join(', ')}
                    </p>
                  )}

                  <div className="mb-3">
                    {perfume.reviews > 0 ? (
                      <StarRating rating={perfume.rating} reviews={perfume.reviews} size="sm" />
                    ) : (
                      <span
                        className="font-sans text-[10px] font-light tracking-widest uppercase"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        Archivo con pirámide
                      </span>
                    )}
                  </div>

                  {/* Mini barras de Acordes Principales estilo Fragrantica.es */}
                  {perfume.accords && perfume.accords.length > 0 && (
                    <div className="space-y-1 mb-4">
                      {perfume.accords.slice(0, 4).map((acc) => (
                        <div
                          key={acc.name}
                          className="h-4 px-2 flex items-center justify-between text-[9px] font-sans font-medium tracking-wider"
                          style={{
                            width: `${Math.max(46, acc.percentage)}%`,
                            background: getAccordColor(acc.name, acc.color),
                            color: '#ffffff',
                          }}
                        >
                          <span className="truncate">{translateAccord(acc.name)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pie de tarjeta: Ver 3D / Ficha, + Bolsa y WhatsApp */}
                <div
                  className="pt-3 grid grid-cols-12 gap-1.5"
                  style={{ borderTop: '1px solid var(--border-subtle)' }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenInModal(perfume);
                    }}
                    className="col-span-5 py-1.5 px-2 font-sans text-[9px] font-medium tracking-wider uppercase transition-colors cursor-pointer"
                    style={{
                      background: isCurrentlyActive ? 'var(--gold)' : 'var(--gold-pale)',
                      color: isCurrentlyActive ? '#ffffff' : 'var(--gold)',
                      border: '1px solid var(--border-gold)',
                    }}
                    title="Abrir Visor 3D y Ficha Olfativa completa"
                  >
                    Ver 3D / Ficha ◈
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch({ type: 'ADD_TO_BAG', perfume, sizeMl: 100 });
                    }}
                    className="col-span-3 py-1.5 px-1 font-sans text-[9px] font-medium tracking-wider uppercase transition-colors cursor-pointer surface-card"
                    style={{
                      color: bag.some((b) => b.perfume.id === perfume.id)
                        ? 'var(--gold)'
                        : 'var(--text-primary)',
                    }}
                    title="Agregar a la bolsa de cotización"
                  >
                    {bag.some((b) => b.perfume.id === perfume.id) ? '✓ Bolsa' : '+ Bolsa'}
                  </button>

                  <a
                    href={buildPerfumeWhatsAppUrl(perfume)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="col-span-4 py-1.5 px-1 font-sans text-[9px] font-medium tracking-wider uppercase text-center surface-gold"
                    style={{ color: 'var(--gold)' }}
                    title="Consultar disponibilidad por WhatsApp"
                  >
                    ✆ Consultar
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Paginación */}
      {data && data.pages > 1 && (
        <div
          className="mt-14 pt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4"
          style={{ borderTop: '1px solid var(--border-subtle)' }}
        >
          <button
            onClick={() => {
              setPage((p) => Math.max(1, p - 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            disabled={page === 1}
            className="btn-ghost text-xs px-4 py-2 disabled:opacity-30 disabled:pointer-events-none"
          >
            ← Anterior
          </button>

          <div
            className="flex items-center gap-2 font-sans text-xs font-light"
            style={{ color: 'var(--text-secondary)' }}
          >
            <span>Página</span>
            <input
              type="number"
              min={1}
              max={data.pages}
              value={page}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (val >= 1 && val <= data.pages) setPage(val);
              }}
              className="w-14 px-2 py-1 text-center focus:outline-none"
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-gold)',
                color: 'var(--text-primary)',
              }}
            />
            <span>de {data.pages}</span>
          </div>

          <button
            onClick={() => {
              setPage((p) => Math.min(data.pages, p + 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            disabled={page === data.pages}
            className="btn-ghost text-xs px-4 py-2 disabled:opacity-30 disabled:pointer-events-none"
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}

function ActivePill({
  label,
  onRemove,
  variant = 'gold',
}: {
  label: string;
  onRemove: () => void;
  variant?: 'gold' | 'danger';
}) {
  return (
    <button
      onClick={onRemove}
      className="px-2.5 py-1 text-[10px] font-sans font-medium flex items-center gap-1.5 transition-opacity hover:opacity-80"
      style={{
        background: variant === 'danger' ? 'rgba(158, 71, 71, 0.14)' : 'var(--gold-pale)',
        border: `1px solid ${variant === 'danger' ? '#9e4747' : 'var(--border-gold)'}`,
        color: variant === 'danger' ? '#9e4747' : 'var(--gold)',
      }}
    >
      <span>{label}</span>
      <span>✕</span>
    </button>
  );
}
