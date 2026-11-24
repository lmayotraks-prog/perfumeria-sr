'use client';
// src/components/catalog/PerfumeCard.tsx — SR Essences · Boutique Gallery Card
import { Perfume } from '@/data/perfumes';
import { usePerfumeStore } from '@/hooks/usePerfumeStore';
import { formatPrice } from '@/lib/utils';
import StarRating from '@/components/ui/StarRating';

interface PerfumeCardProps {
  perfume: Perfume;
  compact?: boolean;
}

const GENDER_LABEL: Record<string, string> = {
  masculino: 'Hombre',
  femenino: 'Mujer',
  unisex: 'Unisex',
};

export default function PerfumeCard({ perfume, compact = false }: PerfumeCardProps) {
  const { state, dispatch } = usePerfumeStore();
  const isActive = state.ui.activePerfumeId === perfume.id;

  const handleSelect = () => {
    dispatch({ type: 'SET_ACTIVE_PERFUME', id: perfume.id });
    const viewer = document.getElementById('viewer');
    if (viewer) viewer.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const topNotes = perfume.notes.filter((n) => n.category === 'salida').slice(0, 3);

  return (
    <div
      className={`perfume-card p-5 transition-all duration-500 ${isActive ? 'active maison-frame' : ''}`}
      onClick={handleSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleSelect()}
    >
      {/* Header: badges + esfera de esencia */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex gap-1.5 flex-wrap">
          {perfume.featured && <LuxBadge text="Destacado" accent />}
          {perfume.newArrival && <LuxBadge text="Nuevo" accent />}
          {perfume.bestseller && <LuxBadge text="Icono" />}
        </div>

        <div
          className="relative w-9 h-9 rounded-full flex-shrink-0"
          style={{
            background: `radial-gradient(circle at 32% 30%, ${perfume.liquidColorAlt} 0%, ${perfume.liquidColor} 65%, rgba(0,0,0,0.25) 100%)`,
            boxShadow: `0 4px 16px ${perfume.glowColor}`,
            border: '1px solid var(--border-gold)',
          }}
        >
          <div
            className="absolute top-1 left-1.5 w-3 h-1.5 rounded-full"
            style={{ background: 'rgba(255,255,255,0.4)', filter: 'blur(1px)' }}
          />
        </div>
      </div>

      {/* Nombre + subtitulo */}
      <h3
        className="font-serif text-xl font-normal leading-tight mb-1"
        style={{ color: 'var(--text-primary)' }}
      >
        {perfume.name}
      </h3>
      <p
        className="font-sans text-[10px] font-medium tracking-[0.2em] uppercase mb-3"
        style={{ color: 'var(--gold)' }}
      >
        {GENDER_LABEL[perfume.gender]} · {perfume.concentration}
      </p>

      {!compact && (
        <p
          className="font-sans text-xs font-light leading-[1.75] mb-4 line-clamp-2"
          style={{ color: 'var(--text-secondary)' }}
        >
          {perfume.shortDesc}
        </p>
      )}

      {/* Notas de salida */}
      {!compact && topNotes.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {topNotes.map((note) => (
            <span
              key={note.name}
              className="font-sans text-[10px] font-light px-2 py-0.5"
              style={{
                background: 'var(--gold-pale)',
                border: '1px solid var(--border-gold)',
                color: 'var(--text-secondary)',
                letterSpacing: '0.06em',
              }}
            >
              {note.name}
            </span>
          ))}
        </div>
      )}

      {/* Rating */}
      <div className="mb-4">
        <StarRating rating={perfume.rating} reviews={perfume.reviews} />
      </div>

      {/* Footer: precio + estela/duración */}
      <div className="flex items-end justify-between">
        <div>
          <p className="font-serif text-2xl font-normal leading-none text-gold">
            {formatPrice(perfume.price)}
          </p>
          <p className="font-sans text-[10px] font-light mt-1" style={{ color: 'var(--text-muted)' }}>
            {perfume.priceML}ml
          </p>
        </div>

        {!compact && (
          <div className="flex flex-col gap-1.5 items-end">
            <DotBar label="Estela" value={perfume.sillage} />
            <DotBar label="Duración" value={perfume.longevity} />
          </div>
        )}
      </div>

      {isActive && (
        <div
          className="mt-4 pt-3 flex items-center justify-center gap-2"
          style={{ borderTop: '1px solid var(--border-gold)' }}
        >
          <div className="pulse-dot" />
          <span
            className="font-sans text-[10px] font-medium tracking-[0.25em] uppercase"
            style={{ color: 'var(--gold)' }}
          >
            En Visor 3D
          </span>
        </div>
      )}
    </div>
  );
}

function LuxBadge({ text, accent }: { text: string; accent?: boolean }) {
  return (
    <span
      className="font-sans font-medium px-2 py-0.5 uppercase"
      style={{
        fontSize: '9px',
        letterSpacing: '0.14em',
        background: accent ? 'var(--gold-pale)' : 'transparent',
        border: `1px solid ${accent ? 'var(--border-gold)' : 'var(--border-subtle)'}`,
        color: accent ? 'var(--gold)' : 'var(--text-muted)',
      }}
    >
      {text}
    </span>
  );
}

function DotBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="font-sans text-[10px] font-light text-right"
        style={{ color: 'var(--text-muted)', width: '3.4rem' }}
      >
        {label}
      </span>
      <div className="flex gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background:
                i < value
                  ? 'linear-gradient(135deg, #b88e34, #f0c966)'
                  : 'var(--border-subtle)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
