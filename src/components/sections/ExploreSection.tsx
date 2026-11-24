'use client';
// src/components/sections/ExploreSection.tsx — SR Essences · Familias y Acordes
import { useState } from 'react';
import { getAllFamilies, PERFUMES } from '@/data/perfumes';
import { usePerfumeStore } from '@/hooks/usePerfumeStore';

const FAMILY_DATA: Record<string, { desc: string; symbol: string; color: string }> = {
  Oriental:  { desc: 'Oud, resinas y especias exóticas. Calidez envolvente.',       symbol: '◆', color: '#c4722a' },
  Floral:    { desc: 'Rosas de Grasse, iris y pétalos blancos en plenitud.',       symbol: '✿', color: '#c85a82' },
  Amaderado: { desc: 'Sándalo de Mysore, vetiver y cedro. Nobleza terrosa.',       symbol: '⬟', color: '#9a7538' },
  Fresco:    { desc: 'Verbena, cítricos y toques luminosos. Vitalidad pura.',      symbol: '◈', color: '#4a98c8' },
  Cítrico:   { desc: 'Bergamota, neroli y mandarina dorada. Radiante.',            symbol: '◉', color: '#d4902a' },
  Gourmand:  { desc: 'Vainilla bourbon, miel de acacia y haba tonka.',             symbol: '◎', color: '#b8683a' },
  Acuático:  { desc: 'Brisa marina del Mediterráneo y acordes ozónicos.',          symbol: '◇', color: '#26729c' },
  Especiado: { desc: 'Cardamomo, pimienta rosa y nuez moscada.',                   symbol: '◆', color: '#b43e48' },
  Chypre:    { desc: 'Musgo de roble, bergamota y pachulí elegante.',              symbol: '◈', color: '#6b8740' },
  Fougère:   { desc: 'Lavanda aromática, madera seca y frescor clásico.',          symbol: '◉', color: '#4a708a' },
};

export default function ExploreSection() {
  const { dispatch } = usePerfumeStore();
  const families = getAllFamilies();
  const [activeFamily, setActiveFamily] = useState<string | null>(null);

  const familyPerfumes = activeFamily
    ? PERFUMES.filter((p) => p.family === activeFamily || p.subfamilies.includes(activeFamily as never))
    : [];

  const handleFamilyClick = (f: string) => {
    const next = activeFamily === f ? null : f;
    setActiveFamily(next);
    dispatch({ type: 'SET_FILTER', key: 'family', value: next });
  };

  const featuredPerfumes = PERFUMES.filter((p) => p.featured).slice(0, 4);

  return (
    <div className="max-w-[1500px] mx-auto px-4 md:px-10 py-24">
      <div className="text-center mb-16">
        <div className="flex items-center justify-center gap-5 mb-5">
          <div className="divider-gold w-14" />
          <span
            className="font-sans text-[11px] font-medium tracking-[0.38em] uppercase"
            style={{ color: 'var(--gold)' }}
          >
            Universo Sensorial
          </span>
          <div className="divider-gold w-14" />
        </div>
        <h2
          className="font-serif font-light leading-none mb-4"
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            color: 'var(--text-primary)',
          }}
        >
          Familias <span className="italic text-gold">Olfativas</span>
        </h2>
        <p
          className="font-sans text-xs md:text-sm font-light leading-relaxed max-w-md mx-auto"
          style={{ color: 'var(--text-secondary)' }}
        >
          Cada territorio olfativo define un carácter. Explora nuestras familias y filtra tu esencia ideal.
        </p>
      </div>

      {/* Grid de familias */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-16">
        {families.map((f) => {
          const cfg = FAMILY_DATA[f] ?? { desc: '', symbol: '◆', color: '#b88e34' };
          const isActive = activeFamily === f;
          const count = PERFUMES.filter(
            (p) => p.family === f || p.subfamilies.includes(f as never)
          ).length;

          return (
            <button
              key={f}
              onClick={() => handleFamilyClick(f)}
              className={`surface-card group relative p-5 text-left transition-all duration-400 ${
                isActive ? 'maison-frame' : ''
              }`}
              style={{
                borderColor: isActive ? 'var(--gold)' : undefined,
              }}
            >
              <div
                className="text-2xl mb-3 transition-transform duration-300 group-hover:scale-110"
                style={{ color: cfg.color }}
              >
                {cfg.symbol}
              </div>

              <h3
                className="font-serif text-lg font-normal mb-1.5"
                style={{ color: 'var(--text-primary)' }}
              >
                {f}
              </h3>

              <p
                className="font-sans text-xs font-light leading-relaxed line-clamp-2 mb-3"
                style={{ color: 'var(--text-muted)' }}
              >
                {cfg.desc}
              </p>

              <span
                className="font-sans text-[10px] font-medium tracking-widest uppercase"
                style={{ color: 'var(--gold)' }}
              >
                {count} {count !== 1 ? 'aromas' : 'aroma'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Resultados de familia seleccionada */}
      {activeFamily && familyPerfumes.length > 0 && (
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-7">
            <span className="font-serif text-2xl italic text-gold">{activeFamily}</span>
            <div className="divider-gold-left flex-1" />
            <span className="font-sans text-xs font-light" style={{ color: 'var(--text-muted)' }}>
              {familyPerfumes.length} resultado{familyPerfumes.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {familyPerfumes.map((p) => (
              <button
                key={p.id}
                onClick={() => dispatch({ type: 'SET_ACTIVE_PERFUME', id: p.id })}
                className="perfume-card text-left p-4"
              >
                <div className="flex items-center gap-3 mb-2.5">
                  <div
                    className="w-7 h-7 rounded-full flex-shrink-0"
                    style={{
                      background: `radial-gradient(circle at 32% 30%, ${p.liquidColorAlt}, ${p.liquidColor})`,
                      border: '1px solid var(--border-gold)',
                    }}
                  />
                  <span className="font-serif text-base font-normal" style={{ color: 'var(--text-primary)' }}>
                    {p.name}
                  </span>
                </div>
                <p
                  className="font-sans text-xs font-light line-clamp-2 leading-relaxed"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {p.shortDesc}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Acordes protagonistas */}
      <div className="pt-14" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-4 mb-9">
          <span
            className="font-sans text-[10px] font-medium tracking-[0.3em] uppercase"
            style={{ color: 'var(--gold)' }}
          >
            Armonía de Acordes Principales
          </span>
          <div className="divider-gold-left flex-1" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {featuredPerfumes.map((p) => (
            <div
              key={p.id}
              className="surface-card p-5 cursor-pointer"
              onClick={() => dispatch({ type: 'SET_ACTIVE_PERFUME', id: p.id })}
            >
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-8 h-8 rounded-full flex-shrink-0"
                  style={{
                    background: `radial-gradient(circle at 32% 30%, ${p.liquidColorAlt}, ${p.liquidColor})`,
                    boxShadow: `0 4px 12px ${p.glowColor}`,
                    border: '1px solid var(--border-gold)',
                  }}
                />
                <div>
                  <h4 className="font-serif text-base font-normal leading-tight" style={{ color: 'var(--text-primary)' }}>
                    {p.name}
                  </h4>
                  <p className="font-sans text-[10px] font-light tracking-widest uppercase" style={{ color: 'var(--gold)' }}>
                    {p.family}
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {p.accords.map((accord) => (
                  <div key={accord.name}>
                    <div className="flex items-center justify-between mb-1 text-[11px]">
                      <span className="font-sans font-light" style={{ color: 'var(--text-secondary)' }}>
                        {accord.name}
                      </span>
                      <span className="font-sans font-light" style={{ color: 'var(--text-muted)' }}>
                        {accord.percentage}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-subtle)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${accord.percentage}%`,
                          background: accord.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
