'use client';
// src/components/catalog/FragranceDetailModal.tsx — Showroom 3D + Ficha Olfativa Completa Unificada
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Perfume } from '@/types';
import { usePerfumeStore } from '@/hooks/usePerfumeStore';
import { translateAccord, translateNote, getAccordColor } from '@/lib/olfactoryDictionary';
import { buildPerfumeWhatsAppUrl } from '@/lib/whatsapp';
import { IS_STATIC_EXPORT } from '@/lib/assetPath';
import { queryEncyclopediaSimilar } from '@/lib/clientEncyclopedia';
import StarRating from '@/components/ui/StarRating';
import IntensityBar from '@/components/ui/IntensityBar';

const PerfumeViewer = dynamic(() => import('@/components/3d/PerfumeViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--stage-bg)' }}>
      <div
        className="w-10 h-10 rounded-full animate-spin"
        style={{
          border: '1px solid var(--border-subtle)',
          borderTopColor: 'var(--gold)',
        }}
      />
    </div>
  ),
});

export default function FragranceDetailModal() {
  const { state, dispatch } = usePerfumeStore();
  const perfume = state.detailPerfume;
  const { bag } = state;

  const [selectedSize, setSelectedSize] = useState<50 | 100>(100);
  const [justAdded, setJustAdded] = useState(false);
  const [similar, setSimilar] = useState<Perfume[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  // Cerrar con Escape + bloquear scroll de fondo mientras el modal está abierto
  useEffect(() => {
    if (!perfume) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dispatch({ type: 'CLOSE_DETAIL' });
    };
    window.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [perfume, dispatch]);

  // Reiniciar selección y cargar similares cuando cambia el perfume abierto
  useEffect(() => {
    setSelectedSize(100);
    setJustAdded(false);

    if (!perfume) {
      setSimilar([]);
      return;
    }
    const controller = new AbortController();
    setLoadingSimilar(true);

    if (IS_STATIC_EXPORT) {
      queryEncyclopediaSimilar(
        perfume.id,
        perfume.accords.map((a) => a.name),
        perfume.notes.map((n) => n.name),
        perfume.family
      )
        .then((json) => {
          if (!controller.signal.aborted) setSimilar(json.items || []);
        })
        .catch((err) => {
          console.error('Error cargando similares:', err);
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoadingSimilar(false);
        });

      return () => controller.abort();
    }

    const params = new URLSearchParams({
      similarTo: perfume.id,
      accords: perfume.accords.map((a) => a.name).join(','),
      notes: perfume.notes.map((n) => n.name).join(','),
      family: perfume.family,
    });

    fetch(`/api/fragrances?${params.toString()}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((json) => {
        if (!controller.signal.aborted) {
          setSimilar(json.items || []);
        }
      })
      .catch((err) => {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error cargando similares:', err);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingSimilar(false);
      });

    return () => controller.abort();
  }, [perfume]);

  if (!perfume) return null;

  const isInStock = Boolean(perfume.available);
  const inBagForSize = bag.some(
    (item) => item.perfume.id === perfume.id && item.sizeMl === selectedSize
  );
  const topNotes = perfume.notes.filter((n) => n.category === 'salida');
  const midNotes = perfume.notes.filter((n) => n.category === 'corazon');
  const baseNotes = perfume.notes.filter((n) => n.category === 'fondo');

  const jumpWithFilter = (preset: {
    brand?: string;
    perfumer?: string;
    includeNote?: string;
    accord?: string;
  }) => {
    dispatch({ type: 'JUMP_TO_ENCYCLOPEDIA', preset });
  };

  const handleAddToBag = () => {
    dispatch({ type: 'ADD_TO_BAG', perfume, sizeMl: selectedSize });
    setJustAdded(true);
  };

  const openBagDrawer = () => {
    dispatch({ type: 'CLOSE_DETAIL' });
    dispatch({ type: 'SET_BAG_OPEN', open: true });
  };

  const fragranticaSearchUrl = `https://www.fragrantica.es/buscar/?q=${encodeURIComponent(
    `${perfume.brand} ${perfume.name}`
  )}`;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-0 sm:p-4 md:p-6 overflow-hidden"
      style={{ background: 'rgba(10, 9, 7, 0.76)', backdropFilter: 'blur(12px)' }}
      onClick={() => dispatch({ type: 'CLOSE_DETAIL' })}
      role="dialog"
      aria-modal="true"
      aria-label={`Showroom 3D y ficha olfativa de ${perfume.name}`}
    >
      <div
        className="surface-card maison-frame relative w-full h-[100dvh] sm:h-auto sm:max-h-[92dvh] sm:max-w-5xl 3xl:max-w-6xl overflow-hidden flex flex-col lg:flex-row shadow-2xl"
        style={{ background: 'var(--bg-page)', borderColor: 'var(--border-gold)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón Cerrar fijo arriba a la derecha */}
        <button
          onClick={() => dispatch({ type: 'CLOSE_DETAIL' })}
          className="absolute top-[max(0.75rem,env(safe-area-inset-top))] right-3 sm:top-4 sm:right-4 z-30 w-10 h-10 flex items-center justify-center text-sm transition-transform hover:scale-105 surface-card cursor-pointer"
          style={{ color: 'var(--text-primary)' }}
          aria-label="Cerrar showroom 3D"
        >
          ✕
        </button>

        {/* ——— PANEL IZQUIERDO: SHOWROOM 3D INTERACTIVO + FOTO REFERENCIA + FILM ——— */}
        <div
          className="lg:w-[45%] h-[34svh] min-h-[230px] max-h-[330px] sm:h-[360px] sm:max-h-none lg:h-auto lg:min-h-[580px] relative flex-shrink-0 border-b lg:border-b-0 lg:border-r"
          style={{ borderColor: 'var(--border-gold)' }}
        >
          <PerfumeViewer variant="modal" />
        </div>

        {/* ——— PANEL DERECHO: FICHA OLFATIVA + CONVERSIÓN WHATSAPP / BOLSA ——— */}
        <div className="lg:w-[55%] flex-1 min-h-0 overflow-y-auto p-4 sm:p-8 pb-[max(1.5rem,env(safe-area-inset-bottom))] space-y-6">
          {/* Cabecera */}
          <div className="pr-10 pb-5" style={{ borderBottom: '1px solid var(--border-gold)' }}>
            {/* Estado de stock + Casa + Año */}
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <span
                className="font-sans text-[9px] font-medium tracking-[0.16em] uppercase px-2.5 py-0.5 flex items-center gap-1.5"
                style={{
                  background: isInStock ? 'var(--gold-pale)' : 'transparent',
                  border: '1px solid var(--border-gold)',
                  color: 'var(--gold)',
                }}
              >
                {isInStock && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                <span>{isInStock ? 'En stock inmediato' : 'Referencia Enciclopedia 25K'}</span>
              </span>

              <button
                onClick={() => jumpWithFilter({ brand: perfume.brand })}
                className="font-sans text-[10px] font-medium tracking-[0.22em] uppercase hover:underline cursor-pointer"
                style={{ color: 'var(--gold)' }}
                title="Explorar esta casa en Enciclopedia 25K"
              >
                {perfume.brand}
              </button>

              <span style={{ color: 'var(--text-muted)' }}>·</span>
              <span className="font-sans text-[10px] tracking-[0.18em] uppercase" style={{ color: 'var(--text-muted)' }}>
                {perfume.concentration}
              </span>

              {perfume.year && (
                <>
                  <span style={{ color: 'var(--text-muted)' }}>·</span>
                  <span className="font-sans text-[10px] tracking-[0.18em] uppercase" style={{ color: 'var(--text-muted)' }}>
                    {perfume.year}
                  </span>
                </>
              )}
            </div>

            <h2
              className="font-serif font-light leading-tight mb-2.5"
              style={{ fontSize: 'clamp(1.65rem, 3vw, 2.5rem)', color: 'var(--text-primary)' }}
            >
              {perfume.name}
            </h2>

            {/* Rating o archivo */}
            <div className="flex flex-wrap items-center gap-3 mb-3.5">
              {perfume.reviews > 0 ? (
                <StarRating rating={perfume.rating} reviews={perfume.reviews} size="sm" />
              ) : (
                <span className="font-sans text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  {perfume.family} · Pirámide registrada
                </span>
              )}
            </div>

            {/* La Nariz / Perfumistas */}
            {perfume.perfumers && perfume.perfumers.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mb-4">
                <span className="font-sans text-[10px] uppercase tracking-widest mr-1" style={{ color: 'var(--text-muted)' }}>
                  La Nariz:
                </span>
                {perfume.perfumers.map((nose) => (
                  <button
                    key={nose}
                    onClick={() => jumpWithFilter({ perfumer: nose })}
                    className="filter-chip text-[10px]"
                    title="Ver creaciones de este perfumista en Enciclopedia"
                  >
                    ✦ {nose}
                  </button>
                ))}
              </div>
            )}

            {/* Selector de Presentación 50ml / 100ml + Botones WhatsApp & Bolsa */}
            <div className="surface-gold p-4 space-y-3 mt-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span
                  className="font-sans text-[10px] font-medium tracking-[0.22em] uppercase"
                  style={{ color: 'var(--gold)' }}
                >
                  Presentación para cotizar:
                </span>
                <div className="flex gap-1.5">
                  {([50, 100] as const).map((sz) => (
                    <button
                      key={sz}
                      onClick={() => {
                        setSelectedSize(sz);
                        setJustAdded(false);
                      }}
                      className="min-h-[40px] px-3.5 py-1.5 font-sans text-[10px] font-medium transition-all cursor-pointer"
                      style={{
                        background: selectedSize === sz ? 'var(--gold)' : 'transparent',
                        color: selectedSize === sz ? '#ffffff' : 'var(--text-primary)',
                        border: `1px solid ${
                          selectedSize === sz ? 'var(--gold)' : 'var(--border-gold)'
                        }`,
                      }}
                    >
                      {sz} ml
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <a
                  href={buildPerfumeWhatsAppUrl(perfume, selectedSize)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-luxury flex-1 min-w-[130px] !py-2.5 !px-3.5 text-[10px] flex items-center justify-center gap-1.5"
                >
                  <span>✆</span>
                  <span>
                    {isInStock
                      ? `Pedir ya (${selectedSize}ml)`
                      : `Consultar (${selectedSize}ml)`}
                  </span>
                </a>

                <button
                  onClick={handleAddToBag}
                  className="btn-ghost flex-1 min-w-[130px] !py-2.5 !px-3.5 text-[10px] cursor-pointer"
                  style={{
                    background: inBagForSize || justAdded ? 'var(--gold-pale)' : 'transparent',
                    borderColor: inBagForSize || justAdded ? 'var(--gold)' : 'var(--border-gold)',
                    color: inBagForSize || justAdded ? 'var(--gold)' : 'var(--text-primary)',
                  }}
                >
                  {justAdded || inBagForSize
                    ? `✓ En tu bolsa (${selectedSize}ml)`
                    : `+ Agregar a Bolsa`}
                </button>
              </div>

              {(justAdded || bag.length > 0) && (
                <div className="flex items-center justify-between pt-1">
                  <span className="font-sans text-[10px] font-light" style={{ color: 'var(--text-muted)' }}>
                    {justAdded ? 'Agregado correctamente a tu cotización.' : 'Tienes perfumes listos en tu bolsa.'}
                  </span>
                  <button
                    onClick={openBagDrawer}
                    className="font-sans text-[10px] font-medium uppercase tracking-wider underline cursor-pointer"
                    style={{ color: 'var(--gold)' }}
                  >
                    Ver Bolsa ({bag.reduce((s, i) => s + i.qty, 0)}) →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ——— ACORDES PRINCIPALES ——— */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="font-sans text-[10px] font-medium tracking-[0.26em] uppercase" style={{ color: 'var(--gold)' }}>
                Acordes Principales
              </h3>
              <span className="font-sans text-[10px]" style={{ color: 'var(--text-muted)' }}>
                Clic para explorar similares en 25K
              </span>
            </div>

            {perfume.accords.length > 0 ? (
              <div className="space-y-1.5">
                {perfume.accords.map((acc) => {
                  const bg = getAccordColor(acc.name, acc.color);
                  return (
                    <button
                      key={acc.name}
                      onClick={() => jumpWithFilter({ accord: acc.name })}
                      className="w-full text-left group block cursor-pointer"
                      title={`Buscar perfumes con acorde ${translateAccord(acc.name)}`}
                    >
                      <div
                        className="relative h-6 flex items-center justify-between px-3 transition-transform duration-300 group-hover:translate-x-1"
                        style={{
                          width: `${Math.max(36, acc.percentage)}%`,
                          background: bg,
                          color: '#ffffff',
                        }}
                      >
                        <span className="font-sans text-[10px] font-medium tracking-wider truncate">
                          {translateAccord(acc.name)}
                        </span>
                        <span className="font-sans text-[9px] opacity-85 ml-2 flex-shrink-0">
                          {acc.percentage}%
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="font-sans text-xs font-light" style={{ color: 'var(--text-muted)' }}>
                Sin acordes registrados para esta referencia.
              </p>
            )}
          </div>

          {/* ——— PIRÁMIDE OLFATIVA DE 3 FASES ——— */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="font-sans text-[10px] font-medium tracking-[0.26em] uppercase" style={{ color: 'var(--gold)' }}>
                Pirámide Olfativa
              </h3>
              <span className="font-sans text-[10px]" style={{ color: 'var(--text-muted)' }}>
                Clic en nota para buscar (+)
              </span>
            </div>

            <div className="space-y-3">
              {[
                { key: 'salida', label: 'Notas de Salida', time: '0 — 30 min', list: topNotes, border: '#d4ab4c' },
                { key: 'corazon', label: 'Notas de Corazón', time: '30 min — 4 h', list: midNotes, border: '#b88e34' },
                { key: 'fondo', label: 'Notas de Fondo', time: '4 — 24+ h', list: baseNotes, border: '#8a6922' },
              ].map((tier) => (
                <div
                  key={tier.key}
                  className="p-3.5 surface-card"
                  style={{ borderLeft: `2px solid ${tier.border}` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-serif text-base" style={{ color: 'var(--text-primary)' }}>
                      {tier.label}
                    </span>
                    <span className="font-sans text-[9px] uppercase tracking-wider" style={{ color: tier.border }}>
                      {tier.time}
                    </span>
                  </div>

                  {tier.list.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {tier.list.map((note) => (
                        <button
                          key={`${tier.key}-${note.name}`}
                          onClick={() => jumpWithFilter({ includeNote: note.name })}
                          className="px-2.5 py-1 text-[11px] font-sans transition-all hover:scale-[1.03] cursor-pointer"
                          style={{
                            background: 'var(--gold-pale)',
                            border: '1px solid var(--border-gold)',
                            color: 'var(--text-primary)',
                          }}
                          title={`Buscar fragancias con ${translateNote(note.name)} en 25K`}
                        >
                          + {translateNote(note.name)}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="font-sans text-[11px] font-light" style={{ color: 'var(--text-muted)' }}>
                      Composición lineal / sin desglose en esta capa.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ——— RENDIMIENTO / REFERENCIAS EXTERNAS ——— */}
          <div className="surface-card p-4 space-y-3">
            {isInStock && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-sans">
                    <span style={{ color: 'var(--text-muted)' }}>Duración</span>
                    <span style={{ color: 'var(--text-primary)' }}>{perfume.longevity} / 5</span>
                  </div>
                  <IntensityBar value={perfume.longevity * 20} height="3px" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-sans">
                    <span style={{ color: 'var(--text-muted)' }}>Estela</span>
                    <span style={{ color: 'var(--text-primary)' }}>{perfume.sillage} / 5</span>
                  </div>
                  <IntensityBar value={perfume.sillage * 20} height="3px" />
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <a
                href={fragranticaSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost py-2 px-3.5 text-[9px]"
              >
                Fragrantica.es ↗
              </a>
              {perfume.parfumoUrl && (
                <a
                  href={perfume.parfumoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost py-2 px-3.5 text-[9px]"
                >
                  Archivo Parfumo ↗
                </a>
              )}
            </div>
          </div>

          {/* ——— PERFILES SIMILARES ——— */}
          <div className="pt-4" style={{ borderTop: '1px solid var(--border-gold)' }}>
            <h3 className="font-sans text-[10px] font-medium tracking-[0.24em] uppercase mb-3" style={{ color: 'var(--gold)' }}>
              Fragancias Con Acordes Similares
            </h3>

            {loadingSimilar ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[0, 1].map((i) => (
                  <div key={i} className="surface-card p-3 h-16 animate-pulse" />
                ))}
              </div>
            ) : similar.length === 0 ? (
              <p className="font-sans text-xs font-light" style={{ color: 'var(--text-muted)' }}>
                Sin coincidencias cercanas registradas.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {similar.slice(0, 4).map((sim) => (
                  <button
                    key={sim.id}
                    onClick={() => dispatch({ type: 'OPEN_DETAIL', perfume: sim })}
                    className="perfume-card p-3 text-left flex items-center gap-3 cursor-pointer"
                  >
                    <div
                      className="w-6 h-6 rounded-full flex-shrink-0"
                      style={{
                        background: `radial-gradient(circle at 32% 30%, ${sim.liquidColorAlt}, ${sim.liquidColor})`,
                        border: '1px solid var(--border-gold)',
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-sans text-[9px] uppercase tracking-widest truncate" style={{ color: 'var(--gold)' }}>
                        {sim.brand}
                      </p>
                      <p className="font-serif text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                        {sim.name}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
