'use client';
// src/components/sections/HeroSection.tsx — SR Essences · Portada 3D Pantalla Completa (100dvh) + Dos Puertas
import dynamic from 'next/dynamic';
import { usePerfumeStore } from '@/hooks/usePerfumeStore';
import { DAMA_PERFUMES, CABALLERO_PERFUMES } from '@/data/availableCatalog';
import { SR_CONTACT, buildPerfumeWhatsAppUrl } from '@/lib/whatsapp';

const PerfumeViewer = dynamic(() => import('@/components/3d/PerfumeViewer'), {
  ssr: false,
  loading: () => (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ background: 'var(--stage-bg)' }}
    >
      <div
        className="w-12 h-12 rounded-full animate-spin"
        style={{
          border: '1px solid var(--border-subtle)',
          borderTopColor: 'var(--gold)',
        }}
      />
    </div>
  ),
});

export default function HeroSection() {
  const { state, dispatch } = usePerfumeStore();
  const { ui, detailPerfume } = state;
  const isNocturne = ui.ambiance === 'nocturne';
  const isFilm = ui.viewerMode === 'film';

  return (
    <section
      id="hero"
      className="relative min-h-[100dvh] sm:h-[100dvh] sm:min-h-[620px] w-full flex flex-col justify-between overflow-hidden select-none"
    >
      {/* ——— ESCENARIO 3D / FILM A PANTALLA COMPLETA (desmonta 3D si se abre modal para mantener 1 contexto WebGL) ——— */}
      <div className="absolute inset-0 z-10 w-full h-full">
        {!detailPerfume && <PerfumeViewer variant="cinematic" />}
      </div>

      {/* ——— VIÑETA SUTIL SOLO EN LOS EXTREMOS SUPERIOR E INFERIOR PARA DEJAR EL FRASCO 3D PROTAGONISTA ——— */}
      <div
        className="absolute inset-0 z-10 pointer-events-none transition-all duration-700"
        style={{
          background: isNocturne
            ? 'linear-gradient(180deg, rgba(5,5,4,0.52) 0%, rgba(5,5,4,0.0) 24%, rgba(5,5,4,0.0) 68%, rgba(5,5,4,0.78) 100%)'
            : 'linear-gradient(180deg, rgba(247,243,236,0.56) 0%, rgba(247,243,236,0.0) 24%, rgba(247,243,236,0.0) 68%, rgba(247,243,236,0.82) 100%)',
        }}
      />

      {/* ——— CAPA EDITORIAL FLOTANTE (POINTER-EVENTS-NONE PARA INTERACTUAR CON EL 3D EN TODA LA PANTALLA) ——— */}
      <div className="relative z-20 flex-1 flex flex-col justify-between pointer-events-none px-3.5 xs:px-4 sm:px-8 pt-[calc(4.5rem+env(safe-area-inset-top))] md:pt-[calc(5.25rem+env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] md:pb-6 max-w-[1520px] 3xl:max-w-[1800px] 4xl:max-w-[2160px] mx-auto w-full">
        {/* Franja Superior Minimalista + Toggle 3D / Film */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-2.5 sm:gap-3">
          <div className="hidden md:block w-40" />

          <div className="text-center max-w-2xl mx-auto">
            <p
              className="font-sans text-[9px] sm:text-[10px] font-medium tracking-[0.28em] sm:tracking-[0.36em] uppercase mb-1 sm:mb-1.5"
              style={{ color: 'var(--gold)' }}
            >
              SR ESSENCES · {SR_CONTACT.subtitle.toUpperCase()}
            </p>
            <h1
              className="font-serif leading-[0.94] font-light"
              style={{
                fontSize: 'clamp(1.65rem, 3.8vw, 3.75rem)',
                color: 'var(--text-primary)',
                letterSpacing: '-0.015em',
              }}
            >
              El arte del aroma{' '}
              <span className="italic text-gold">en cada frasco</span>
            </h1>
          </div>

          {/* Toggle compacto 3D / Film */}
          <div className="flex justify-center md:justify-end md:w-40 pointer-events-auto">
            <div className="surface-card p-1 inline-flex items-center gap-1 backdrop-blur-md">
              <button
                onClick={() => dispatch({ type: 'SET_VIEWER_MODE', mode: 'crystal3d' })}
                className="min-h-[36px] px-2.5 sm:px-3 py-1 font-sans text-[9px] sm:text-[10px] tracking-[0.16em] uppercase transition-all cursor-pointer"
                style={{
                  background: !isFilm ? 'var(--gold)' : 'transparent',
                  color: !isFilm ? '#ffffff' : 'var(--text-muted)',
                  fontWeight: !isFilm ? 600 : 400,
                }}
              >
                Frasco 3D
              </button>
              <button
                onClick={() => dispatch({ type: 'SET_VIEWER_MODE', mode: 'film' })}
                className="min-h-[36px] px-2.5 sm:px-3 py-1 font-sans text-[9px] sm:text-[10px] tracking-[0.16em] uppercase transition-all cursor-pointer"
                style={{
                  background: isFilm ? 'var(--gold)' : 'transparent',
                  color: isFilm ? '#ffffff' : 'var(--text-muted)',
                  fontWeight: isFilm ? 600 : 400,
                }}
              >
                Film
              </button>
            </div>
          </div>
        </div>

        {/* Espacio Central Completamente Abierto para el Frasco 3D */}
        <div className="flex-1 min-h-[180px] sm:min-h-[220px] flex items-end justify-center pb-2 sm:pb-2.5">
          {!isFilm && (
            <span
              className="font-sans text-[9px] tracking-[0.24em] sm:tracking-[0.28em] uppercase px-3 py-1 surface-card opacity-75"
              style={{ color: 'var(--text-muted)' }}
            >
              ⟳ Arrastra para girar 360°
            </span>
          )}
        </div>

        {/* DOCK INFERIOR COMPACTO: LAS DOS PUERTAS (DAMA & CABALLERO) + ENLACES */}
        <div className="max-w-3xl 3xl:max-w-4xl mx-auto w-full pointer-events-auto space-y-2.5 sm:space-y-3">
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-2.5 sm:gap-4">
            {/* PUERTA 1: DAMA · PALAIS LUMIÈRE */}
            <button
              onMouseEnter={() => dispatch({ type: 'SET_AMBIANCE', ambiance: 'lumiere' })}
              onClick={() => dispatch({ type: 'ENTER_UNIVERSE', department: 'dama' })}
              className="surface-card maison-frame px-3.5 py-2.5 sm:px-5 sm:py-4 text-left group transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              style={{
                borderColor: !isNocturne ? 'var(--gold)' : 'var(--border-gold)',
              }}
            >
              <div className="flex items-center justify-between gap-1.5 mb-1">
                <span
                  className="font-sans text-[8.5px] sm:text-[9px] font-medium tracking-[0.2em] sm:tracking-[0.26em] uppercase flex items-center gap-1 truncate"
                  style={{ color: 'var(--gold)' }}
                >
                  <span>☀</span>
                  <span>Palais Lumière</span>
                </span>
                <span
                  className="font-sans text-[8.5px] sm:text-[9px] px-1.5 sm:px-2 py-0.5 uppercase tracking-wider flex-shrink-0"
                  style={{
                    background: 'var(--gold-pale)',
                    color: 'var(--gold)',
                    border: '1px solid var(--border-gold)',
                  }}
                >
                  {DAMA_PERFUMES.length} en stock
                </span>
              </div>

              <div className="flex items-end justify-between gap-2">
                <div className="min-w-0">
                  <h2
                    className="font-serif text-lg sm:text-2xl font-normal leading-tight"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Universo Dama
                  </h2>
                  <p className="font-sans text-[10px] sm:text-[11px] font-light mt-0.5 line-clamp-1" style={{ color: 'var(--text-muted)' }}>
                    Luminoso, floral y floral-oriental
                  </p>
                </div>
                <span
                  className="font-sans text-[9.5px] sm:text-[10px] font-medium tracking-[0.14em] sm:tracking-[0.18em] uppercase group-hover:translate-x-1 transition-transform flex-shrink-0"
                  style={{ color: 'var(--gold)' }}
                >
                  Entrar →
                </span>
              </div>
            </button>

            {/* PUERTA 2: CABALLERO · NOCHE OBSIDIANA */}
            <button
              onMouseEnter={() => dispatch({ type: 'SET_AMBIANCE', ambiance: 'nocturne' })}
              onClick={() => dispatch({ type: 'ENTER_UNIVERSE', department: 'caballero' })}
              className="surface-card maison-frame px-3.5 py-2.5 sm:px-5 sm:py-4 text-left group transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              style={{
                borderColor: isNocturne ? 'var(--gold)' : 'var(--border-gold)',
              }}
            >
              <div className="flex items-center justify-between gap-1.5 mb-1">
                <span
                  className="font-sans text-[8.5px] sm:text-[9px] font-medium tracking-[0.2em] sm:tracking-[0.26em] uppercase flex items-center gap-1 truncate"
                  style={{ color: 'var(--gold)' }}
                >
                  <span>☾</span>
                  <span>Noche Obsidiana</span>
                </span>
                <span
                  className="font-sans text-[8.5px] sm:text-[9px] px-1.5 sm:px-2 py-0.5 uppercase tracking-wider flex-shrink-0"
                  style={{
                    background: 'var(--gold-pale)',
                    color: 'var(--gold)',
                    border: '1px solid var(--border-gold)',
                  }}
                >
                  {CABALLERO_PERFUMES.length} en stock
                </span>
              </div>

              <div className="flex items-end justify-between gap-2">
                <div className="min-w-0">
                  <h2
                    className="font-serif text-lg sm:text-2xl font-normal leading-tight"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Universo Caballero
                  </h2>
                  <p className="font-sans text-[10px] sm:text-[11px] font-light mt-0.5 line-clamp-1" style={{ color: 'var(--text-muted)' }}>
                    Intenso, amaderado y especiado 24k
                  </p>
                </div>
                <span
                  className="font-sans text-[9.5px] sm:text-[10px] font-medium tracking-[0.14em] sm:tracking-[0.18em] uppercase group-hover:translate-x-1 transition-transform flex-shrink-0"
                  style={{ color: 'var(--gold)' }}
                >
                  Entrar →
                </span>
              </div>
            </button>
          </div>

          {/* Enlaces secundarios discretos */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-6 gap-y-1.5">
            <button
              onClick={() => dispatch({ type: 'SET_VIEW', view: 'encyclopedia' })}
              className="min-h-[36px] inline-flex items-center font-sans text-[9.5px] sm:text-[10px] font-medium tracking-[0.16em] sm:tracking-[0.18em] uppercase hover:underline cursor-pointer"
              style={{ color: 'var(--text-secondary)' }}
            >
              ✦ Enciclopedia 25K (Notas & Acordes)
            </button>
            <button
              onClick={() => dispatch({ type: 'SET_VIEW', view: 'how-to-buy' })}
              className="min-h-[36px] inline-flex items-center font-sans text-[9.5px] sm:text-[10px] font-medium tracking-[0.16em] sm:tracking-[0.18em] uppercase hover:underline cursor-pointer"
              style={{ color: 'var(--text-secondary)' }}
            >
              ◈ Cómo Comprar & Pagos
            </button>
            <a
              href={buildPerfumeWhatsAppUrl(null)}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[36px] inline-flex items-center font-sans text-[9.5px] sm:text-[10px] font-medium tracking-[0.16em] sm:tracking-[0.18em] uppercase hover:underline"
              style={{ color: 'var(--gold)' }}
            >
              ✆ WhatsApp ({SR_CONTACT.whatsappDisplay})
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
