'use client';
// src/components/sections/CatalogSection.tsx — SR Essences · Galería Boutique Editorial (Dama 88 + Caballero 130)
import { useState, useEffect, useRef } from 'react';
import { usePerfumeStore } from '@/hooks/usePerfumeStore';
import {
  DAMA_PERFUMES,
  CABALLERO_PERFUMES,
  getBrandsByDepartment,
  getFamiliesByDepartment,
} from '@/data/availableCatalog';
import { buildPerfumeWhatsAppUrl } from '@/lib/whatsapp';
import { translateAccord, getAccordColor } from '@/lib/olfactoryDictionary';
import CatalogBottleImage from '@/components/ui/CatalogBottleImage';
import { Perfume } from '@/types';

const PAGE_SIZE = 12;

export default function CatalogSection() {
  const { state, dispatch } = usePerfumeStore();
  const { filteredPerfumes, filters, ui, bag } = state;
  const isCaballero = ui.department === 'caballero';

  const [page, setPage] = useState(1);
  const topRef = useRef<HTMLDivElement>(null);

  const brands = getBrandsByDepartment(ui.department);
  const families = getFamiliesByDepartment(ui.department);

  useEffect(() => {
    setPage(1);
  }, [
    ui.department,
    filters.search,
    filters.brand,
    filters.family,
    filters.sortBy,
    filters.showBestsellers,
    filters.showNewArrivals,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredPerfumes.length / PAGE_SIZE));
  const paginated = filteredPerfumes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const isInBag = (perfume: Perfume) => bag.some((item) => item.perfume.id === perfume.id);

  return (
    <div ref={topRef} className="max-w-[1600px] 3xl:max-w-[1920px] 4xl:max-w-[2280px] mx-auto px-3.5 sm:px-6 md:px-10 py-6 sm:py-8 md:py-12 select-none">
      {/* ——— BREADCRUMB DE UBICACIÓN EXACTA ——— */}
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
            Catálogo {isCaballero ? 'Caballero · Noche Obsidiana' : 'Dama · Palais Lumière'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => dispatch({ type: 'SET_VIEW', view: 'encyclopedia' })}
            className="font-sans text-[10px] tracking-[0.16em] uppercase hover:underline cursor-pointer"
            style={{ color: 'var(--text-secondary)' }}
          >
            Ir a Enciclopedia 25K →
          </button>
        </div>
      </div>

      {/* ——— ENCABEZADO + SWITCH DAMA / CABALLERO ——— */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
        <div>
          <span
            className="font-sans text-[10px] font-medium tracking-[0.3em] uppercase block mb-2"
            style={{ color: 'var(--gold)' }}
          >
            Perfumería Importada · Despacho & Enlace de Pago Inmediato
          </span>
          <h2
            className="font-serif font-light leading-none mb-2"
            style={{
              fontSize: 'clamp(2.2rem, 4.4vw, 3.6rem)',
              color: 'var(--text-primary)',
            }}
          >
            Catálogo{' '}
            <span className="italic text-gold">
              {isCaballero ? 'Caballero' : 'Dama'}
            </span>
          </h2>
          <p className="font-sans text-xs font-light" style={{ color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>{filteredPerfumes.length}</strong>{' '}
            fragancias en stock · Toca cualquier frasco para ver su{' '}
            <span style={{ color: 'var(--gold)' }}>Showroom 3D y Ficha Olfativa</span> o agrégalo a tu bolsa.
          </p>
        </div>

        {/* Selector grande Dama / Caballero */}
        <div className="surface-card p-1.5 w-full sm:w-auto grid grid-cols-2 sm:inline-flex items-center gap-1.5 self-start lg:self-end">
          <button
            onClick={() => dispatch({ type: 'SET_DEPARTMENT', department: 'dama' })}
            className="min-h-[42px] px-3 sm:px-5 py-2.5 font-sans text-[10px] sm:text-[11px] tracking-[0.16em] sm:tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer"
            style={{
              background: !isCaballero ? 'var(--gold)' : 'transparent',
              color: !isCaballero ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: !isCaballero ? 600 : 400,
            }}
          >
            <span>☀ Dama</span>
            <span className="opacity-80">({DAMA_PERFUMES.length})</span>
          </button>
          <button
            onClick={() => dispatch({ type: 'SET_DEPARTMENT', department: 'caballero' })}
            className="min-h-[42px] px-3 sm:px-5 py-2.5 font-sans text-[10px] sm:text-[11px] tracking-[0.16em] sm:tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer"
            style={{
              background: isCaballero ? 'var(--gold)' : 'transparent',
              color: isCaballero ? '#0b0a09' : 'var(--text-secondary)',
              fontWeight: isCaballero ? 600 : 400,
            }}
          >
            <span>☾ Caballero</span>
            <span className="opacity-80">({CABALLERO_PERFUMES.length})</span>
          </button>
        </div>
      </div>

      {/* ——— BUSCADOR + FILTROS RÁPIDOS ——— */}
      <div className="surface-card p-5 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
          <div className="md:col-span-5 relative">
            <input
              type="text"
              value={filters.search}
              onChange={(e) => dispatch({ type: 'SET_FILTER', key: 'search', value: e.target.value })}
              placeholder={`Buscar por nombre, marca o nota (ej. ${
                isCaballero ? 'Sauvage, Aventus, Vainilla, Oud' : 'Good Girl, Cloud, Rosa, Vainilla'
              })...`}
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            {filters.search && (
              <button
                onClick={() => dispatch({ type: 'SET_FILTER', key: 'search', value: '' })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                style={{ color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            )}
          </div>

          <div className="md:col-span-3">
            <select
              value={filters.family || ''}
              onChange={(e) =>
                dispatch({ type: 'SET_FILTER', key: 'family', value: e.target.value || null })
              }
              className="w-full px-3 py-3 font-sans text-xs font-light focus:outline-none cursor-pointer"
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-gold)',
                color: 'var(--text-primary)',
              }}
            >
              <option value="">Familia: Todas</option>
              {families.map((fam) => (
                <option key={fam} value={fam}>
                  Familia: {fam}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={filters.sortBy}
              onChange={(e) => dispatch({ type: 'SET_FILTER', key: 'sortBy', value: e.target.value })}
              className="w-full px-3 py-3 font-sans text-xs font-light focus:outline-none cursor-pointer"
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-gold)',
                color: 'var(--text-primary)',
              }}
            >
              <option value="featured">Destacados</option>
              <option value="rating">Mejor Valorados</option>
              <option value="name">Marca A–Z</option>
              <option value="newest">Más Recientes</option>
            </select>
          </div>

          <div className="md:col-span-2 flex gap-2">
            <button
              onClick={() =>
                dispatch({ type: 'SET_FILTER', key: 'showBestsellers', value: !filters.showBestsellers })
              }
              className={`filter-chip w-full py-2.5 text-center ${filters.showBestsellers ? 'active' : ''}`}
            >
              ✦ Top Ventas
            </button>
          </div>
        </div>

        {/* Marcas disponibles */}
        <div
          className="mt-4 pt-4 flex flex-nowrap md:flex-wrap overflow-x-auto no-scrollbar items-center gap-1.5 pb-1 md:pb-0"
          style={{ borderTop: '1px solid var(--border-subtle)' }}
        >
          <span
            className="font-sans text-[10px] font-medium uppercase tracking-widest mr-2 flex-shrink-0"
            style={{ color: 'var(--text-muted)' }}
          >
            Marcas ({brands.length}):
          </span>
          <button
            onClick={() => dispatch({ type: 'SET_FILTER', key: 'brand', value: null })}
            className={`filter-chip ${!filters.brand ? 'active' : ''}`}
          >
            Todas
          </button>
          {brands.slice(0, 14).map((b) => (
            <button
              key={b.name}
              onClick={() =>
                dispatch({
                  type: 'SET_FILTER',
                  key: 'brand',
                  value: filters.brand === b.name ? null : b.name,
                })
              }
              className={`filter-chip ${filters.brand === b.name ? 'active' : ''}`}
            >
              {b.name} <span className="opacity-60 ml-0.5">({b.count})</span>
            </button>
          ))}
          {(filters.search || filters.brand || filters.family || filters.showBestsellers) && (
            <button
              onClick={() => dispatch({ type: 'RESET_FILTERS' })}
              className="font-sans text-[10px] font-medium underline ml-2"
              style={{ color: 'var(--gold)' }}
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* ——— GALERÍA BOUTIQUE DE FRASCOS REALES ——— */}
      {paginated.length === 0 ? (
        <div className="surface-card text-center py-20">
          <p className="font-serif text-2xl font-light mb-2" style={{ color: 'var(--text-primary)' }}>
            No encontramos coincidencias en {isCaballero ? 'Caballero' : 'Dama'}
          </p>
          <p className="font-sans text-xs font-light mb-5" style={{ color: 'var(--text-muted)' }}>
            Prueba limpiando los filtros o explora la Enciclopedia de 25,663 perfumes.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => dispatch({ type: 'RESET_FILTERS' })}
              className="btn-ghost text-xs py-2 px-5"
            >
              Ver todo {isCaballero ? 'Caballero' : 'Dama'}
            </button>
            <button
              onClick={() => dispatch({ type: 'SET_VIEW', view: 'encyclopedia' })}
              className="btn-luxury text-xs py-2 px-5"
            >
              Buscar en Enciclopedia 25K
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5 gap-4 sm:gap-5 3xl:gap-6">
          {paginated.map((perfume) => {
            const added = isInBag(perfume);
            return (
              <article
                key={perfume.id}
                className="perfume-card p-4 sm:p-5 flex flex-col justify-between transition-all"
              >
                <div>
                  {/* Vitrina editorial HD (abre Showroom & Ficha 3D Modal sin perder el scroll) */}
                  <div
                    onClick={() => dispatch({ type: 'OPEN_DETAIL', perfume })}
                    className="relative h-52 sm:h-60 xl:h-64 3xl:h-72 mb-4 flex items-center justify-center p-4 sm:p-5 cursor-pointer group overflow-hidden transition-all duration-500"
                    style={{
                      background: isCaballero
                        ? 'radial-gradient(circle at 50% 48%, #ffffff 0%, #f7f3eb 78%, #ede5d6 100%)'
                        : 'radial-gradient(circle at 50% 48%, #ffffff 0%, #faf6ef 80%, #f1e9dc 100%)',
                      border: isCaballero
                        ? '1px solid rgba(212, 171, 76, 0.36)'
                        : '1px solid var(--border-subtle)',
                      boxShadow: isCaballero
                        ? 'inset 0 0 28px rgba(18, 14, 10, 0.1)'
                        : 'inset 0 0 24px rgba(184, 142, 52, 0.05)',
                    }}
                    title="Abrir en Showroom 3D y Ficha Olfativa"
                  >
                    {/* Etiqueta En Stock Inmediato */}
                    <span
                      className="absolute top-2.5 left-2.5 z-10 font-sans text-[8.5px] font-medium tracking-[0.16em] uppercase px-2 py-0.5 flex items-center gap-1 backdrop-blur-sm"
                      style={{
                        background: 'rgba(255, 253, 249, 0.9)',
                        border: '1px solid rgba(184, 142, 52, 0.35)',
                        color: '#8f6b1e',
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>En stock</span>
                    </span>

                    {/* Guía rápida 50ml · 100ml */}
                    <span
                      className="absolute top-2.5 right-2.5 z-10 font-sans text-[8.5px] uppercase tracking-wider px-2 py-0.5 backdrop-blur-sm"
                      style={{
                        background: 'rgba(255, 253, 249, 0.9)',
                        border: '1px solid rgba(25, 22, 19, 0.08)',
                        color: '#4d453b',
                      }}
                    >
                      50 · 100 ml
                    </span>

                    <CatalogBottleImage perfume={perfume} />

                    {/* Indicador discreto en hover */}
                    <span
                      className="absolute bottom-2.5 inset-x-0 mx-auto w-fit z-10 font-sans text-[8.5px] tracking-[0.2em] uppercase px-2.5 py-1 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
                      style={{
                        background: 'rgba(18, 15, 11, 0.84)',
                        color: '#f7df94',
                        border: '1px solid rgba(212, 171, 76, 0.45)',
                      }}
                    >
                      Ver Showroom 3D & Notas
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span
                      className="font-sans text-[10px] font-medium tracking-[0.22em] uppercase truncate"
                      style={{ color: 'var(--gold)' }}
                    >
                      {perfume.brand}
                    </span>
                    <span className="font-sans text-[10px] font-light" style={{ color: 'var(--text-muted)' }}>
                      {perfume.family}
                    </span>
                  </div>

                  <h3
                    onClick={() => dispatch({ type: 'OPEN_DETAIL', perfume })}
                    className="font-serif text-[1.35rem] font-normal leading-snug mb-2.5 line-clamp-1 cursor-pointer hover:underline"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {perfume.name}
                  </h3>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {perfume.accords.slice(0, 3).map((acc) => {
                      const dotColor = getAccordColor(acc.name, acc.color);
                      return (
                        <span
                          key={acc.name}
                          className="inline-flex items-center gap-1.5 font-sans text-[9px] font-medium px-2 py-0.5 uppercase tracking-wider"
                          style={{
                            background: 'var(--bg-input)',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ background: dotColor }}
                          />
                          <span>{translateAccord(acc.name)}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Acciones duales de conversión: Pedir ya + Bolsa + Ver en 3D */}
                <div
                  className="pt-3 flex items-stretch gap-1.5"
                  style={{ borderTop: '1px solid var(--border-subtle)' }}
                >
                  <a
                    href={buildPerfumeWhatsAppUrl(perfume, 100)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-[1.3] btn-luxury !min-h-[38px] !py-2 !px-2 text-[9px] sm:text-[9.5px] text-center flex items-center justify-center gap-1 whitespace-nowrap"
                    title="Pedir directamente por WhatsApp"
                  >
                    <span>✆</span>
                    <span>Pedir ya</span>
                  </a>

                  <button
                    onClick={() => dispatch({ type: 'ADD_TO_BAG', perfume, sizeMl: 100 })}
                    className="flex-1 min-h-[38px] py-2 px-1.5 font-sans text-[9px] sm:text-[9.5px] font-medium tracking-[0.1em] uppercase transition-all cursor-pointer whitespace-nowrap"
                    style={{
                      background: added ? 'var(--gold)' : 'var(--gold-pale)',
                      color: added ? '#ffffff' : 'var(--gold)',
                      border: '1px solid var(--border-gold)',
                    }}
                    title="Agregar a tu bolsa de cotización WhatsApp"
                  >
                    {added ? '✓ En bolsa' : '+ Bolsa'}
                  </button>

                  <button
                    onClick={() => dispatch({ type: 'OPEN_DETAIL', perfume })}
                    className="flex-[0.85] btn-ghost !min-h-[38px] !py-2 !px-1.5 text-[9px] sm:text-[9.5px] text-center whitespace-nowrap"
                    title="Ver Frasco 3D y Ficha Olfativa sin perder tu lugar"
                  >
                    Ver 3D
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Paginación con retorno suave arriba */}
      {totalPages > 1 && (
        <div
          className="mt-12 pt-7 flex flex-wrap items-center justify-center gap-3 sm:gap-4"
          style={{ borderTop: '1px solid var(--border-subtle)' }}
        >
          <button
            onClick={() => handlePageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className="btn-ghost text-xs px-4 py-2 disabled:opacity-30 disabled:pointer-events-none"
          >
            ← Anterior
          </button>

          <span className="font-sans text-xs font-light" style={{ color: 'var(--text-secondary)' }}>
            Página <strong style={{ color: 'var(--text-primary)' }}>{page}</strong> de {totalPages}
          </span>

          <button
            onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="btn-ghost text-xs px-4 py-2 disabled:opacity-30 disabled:pointer-events-none"
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}
