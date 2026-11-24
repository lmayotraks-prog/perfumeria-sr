'use client';
// src/components/catalog/FilterPanel.tsx — SR Essences · Fragrantica-Grade Luxury Filters
import { usePerfumeStore } from '@/hooks/usePerfumeStore';
import { getAllFamilies, getAllNotes } from '@/data/perfumes';
import { FilterState } from '@/types';

const FAMILIES = getAllFamilies();
const TOP_NOTES = getAllNotes().slice(0, 18);

const GENDERS = [
  { label: 'Todos', value: null },
  { label: 'Hombre', value: 'masculino' },
  { label: 'Mujer', value: 'femenino' },
  { label: 'Unisex', value: 'unisex' },
];

const SEASONS = ['primavera', 'verano', 'otoño', 'invierno'];
const OCCASIONS = ['día', 'noche', 'trabajo', 'especial', 'casual'];

const SORTS: { label: string; value: FilterState['sortBy'] }[] = [
  { label: 'Destacados', value: 'featured' },
  { label: 'Mayor Calificación', value: 'rating' },
  { label: 'Nombre A-Z', value: 'name' },
  { label: 'Últimos Lanzamientos', value: 'newest' },
];

export default function FilterPanel() {
  const { state, dispatch } = usePerfumeStore();
  const { filters } = state;

  const setFilter = (key: keyof FilterState, value: unknown) =>
    dispatch({ type: 'SET_FILTER', key, value });

  const toggleNote = (note: string) => {
    const notes = filters.notes.includes(note)
      ? filters.notes.filter((n) => n !== note)
      : [...filters.notes, note];
    setFilter('notes', notes);
  };

  const hasActiveFilters = Boolean(
    filters.search ||
    filters.family ||
    filters.gender ||
    filters.season ||
    filters.occasion ||
    filters.showBestsellers ||
    filters.showNewArrivals ||
    filters.notes.length > 0
  );

  return (
    <div className="space-y-6 pb-2 select-none">
      <div
        className="flex items-center justify-between pb-3"
        style={{ borderBottom: '1px solid var(--border-gold)' }}
      >
        <div className="flex items-center gap-2.5">
          <span className="pulse-dot" />
          <h3
            className="font-serif text-lg font-normal tracking-wide"
            style={{ color: 'var(--text-primary)' }}
          >
            Filtros Olfativos & Búsqueda
          </h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={() => dispatch({ type: 'RESET_FILTERS' })}
            className="font-sans text-[10px] font-medium tracking-widest uppercase underline underline-offset-4"
            style={{ color: 'var(--gold)' }}
          >
            Restablecer Todo
          </button>
        )}
      </div>

      {/* Buscador */}
      <div>
        <label
          className="block font-sans text-[10px] font-medium tracking-[0.22em] uppercase mb-2"
          style={{ color: 'var(--gold)' }}
        >
          Buscar por Nombre, Acorde o Nota
        </label>
        <div className="relative">
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
            placeholder="Ej. Oud, Iris, Rosa, Ámbar, Bergamota..."
            className="w-full px-4 py-3 pl-10 font-sans text-xs font-light focus:outline-none transition-all duration-300"
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
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          {filters.search && (
            <button
              onClick={() => setFilter('search', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
              style={{ color: 'var(--text-muted)' }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Ordenamiento */}
      <div>
        <label
          className="block font-sans text-[10px] font-medium tracking-[0.22em] uppercase mb-2.5"
          style={{ color: 'var(--text-muted)' }}
        >
          Ordenar Catálogo
        </label>
        <div className="flex flex-wrap gap-2">
          {SORTS.map((s) => (
            <button
              key={s.value}
              onClick={() => setFilter('sortBy', s.value)}
              className={`filter-chip ${filters.sortBy === s.value ? 'active' : ''}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Destacados */}
      <div>
        <label
          className="block font-sans text-[10px] font-medium tracking-[0.22em] uppercase mb-2.5"
          style={{ color: 'var(--text-muted)' }}
        >
          Selección Maison
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('showBestsellers', !filters.showBestsellers)}
            className={`filter-chip ${filters.showBestsellers ? 'active' : ''}`}
          >
            ✦ Más Vendidos
          </button>
          <button
            onClick={() => setFilter('showNewArrivals', !filters.showNewArrivals)}
            className={`filter-chip ${filters.showNewArrivals ? 'active' : ''}`}
          >
            ◈ Nuevas Creaciones
          </button>
        </div>
      </div>

      {/* Familias */}
      <div>
        <label
          className="block font-sans text-[10px] font-medium tracking-[0.22em] uppercase mb-2.5"
          style={{ color: 'var(--text-muted)' }}
        >
          Familia Olfativa
        </label>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setFilter('family', null)}
            className={`filter-chip ${!filters.family ? 'active' : ''}`}
          >
            Todas
          </button>
          {FAMILIES.map((f) => (
            <button
              key={f}
              onClick={() => setFilter('family', filters.family === f ? null : f)}
              className={`filter-chip ${filters.family === f ? 'active' : ''}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Género, Temporada, Ocasión */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <label
            className="block font-sans text-[10px] font-medium tracking-[0.22em] uppercase mb-2"
            style={{ color: 'var(--text-muted)' }}
          >
            Género
          </label>
          <div className="flex flex-wrap gap-1.5">
            {GENDERS.map((g) => (
              <button
                key={g.label}
                onClick={() => setFilter('gender', g.value)}
                className={`filter-chip ${filters.gender === g.value ? 'active' : ''}`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            className="block font-sans text-[10px] font-medium tracking-[0.22em] uppercase mb-2"
            style={{ color: 'var(--text-muted)' }}
          >
            Temporada
          </label>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setFilter('season', null)}
              className={`filter-chip ${!filters.season ? 'active' : ''}`}
            >
              Todas
            </button>
            {SEASONS.map((s) => (
              <button
                key={s}
                onClick={() => setFilter('season', filters.season === s ? null : s)}
                className={`filter-chip ${filters.season === s ? 'active' : ''}`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            className="block font-sans text-[10px] font-medium tracking-[0.22em] uppercase mb-2"
            style={{ color: 'var(--text-muted)' }}
          >
            Ocasión
          </label>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setFilter('occasion', null)}
              className={`filter-chip ${!filters.occasion ? 'active' : ''}`}
            >
              Todas
            </button>
            {OCCASIONS.map((o) => (
              <button
                key={o}
                onClick={() => setFilter('occasion', filters.occasion === o ? null : o)}
                className={`filter-chip ${filters.occasion === o ? 'active' : ''}`}
              >
                {o.charAt(0).toUpperCase() + o.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notas clave */}
      <div>
        <label
          className="block font-sans text-[10px] font-medium tracking-[0.22em] uppercase mb-2.5"
          style={{ color: 'var(--text-muted)' }}
        >
          Notas Olfativas Clave
        </label>
        <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
          {TOP_NOTES.map((n) => {
            const isSelected = filters.notes.includes(n);
            return (
              <button
                key={n}
                onClick={() => toggleNote(n)}
                className={`filter-chip ${isSelected ? 'active' : ''}`}
              >
                {isSelected && <span className="mr-1">✓</span>}
                {n}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
