'use client';
// src/components/catalog/OlfactoryPyramid.tsx — SR Essences · Pirámide Arquitectónica
import { Perfume } from '@/data/perfumes';
import IntensityBar from '@/components/ui/IntensityBar';
import { translateAccord, translateNote, getAccordColor } from '@/lib/olfactoryDictionary';

interface OlfactoryPyramidProps {
  perfume: Perfume;
}

const LAYER_CONFIG = {
  salida: {
    label: 'Notas de Salida',
    phase: 'Efervescencia Inicial',
    time: '0 — 30 min',
    symbol: '✦',
    color: '#d4ab4c',
  },
  corazon: {
    label: 'Notas de Corazón',
    phase: 'Alma de la Fragancia',
    time: '30 min — 4 h',
    symbol: '◈',
    color: '#b88e34',
  },
  fondo: {
    label: 'Notas de Fondo',
    phase: 'Estela y Memoria',
    time: '4 — 24+ h',
    symbol: '◆',
    color: '#8a6922',
  },
} as const;

type LayerKey = keyof typeof LAYER_CONFIG;

export default function OlfactoryPyramid({ perfume }: OlfactoryPyramidProps) {
  const layers: LayerKey[] = ['salida', 'corazon', 'fondo'];

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div>
        <span
          className="font-sans text-[10px] font-medium tracking-[0.28em] uppercase block mb-1"
          style={{ color: 'var(--gold)' }}
        >
          ✦ Arquitectura Sensorial
        </span>
        <h3
          className="font-serif text-2xl font-normal leading-tight mb-1"
          style={{ color: 'var(--text-primary)' }}
        >
          Pirámide Olfativa
        </h3>
        <p
          className="font-sans text-[11px] font-light tracking-widest uppercase mb-3"
          style={{ color: 'var(--text-muted)' }}
        >
          {perfume.name} · {perfume.family}
        </p>
        <div className="divider-gold-left w-full" />
      </div>

      {/* Pirámide de 3 niveles */}
      <div className="space-y-4">
        {layers.map((layer) => {
          const cfg = LAYER_CONFIG[layer];
          const notes = perfume.notes.filter((n) => n.category === layer);
          if (notes.length === 0) return null;

          return (
            <div
              key={layer}
              className="p-4 transition-all"
              style={{
                background: 'var(--gold-pale)',
                borderLeft: `2px solid ${cfg.color}`,
                borderTop: '1px solid var(--border-subtle)',
                borderRight: '1px solid var(--border-subtle)',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: cfg.color }}>
                    {cfg.symbol}
                  </span>
                  <div>
                    <h4
                      className="font-serif text-base font-normal leading-tight"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {cfg.label}
                    </h4>
                    <p
                      className="font-sans text-[9px] font-light tracking-widest uppercase"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {cfg.phase}
                    </p>
                  </div>
                </div>
                <span
                  className="px-2 py-0.5 text-[10px] font-sans font-medium tracking-wider uppercase"
                  style={{
                    border: `1px solid ${cfg.color}45`,
                    color: cfg.color,
                  }}
                >
                  {cfg.time}
                </span>
              </div>

              <div className="space-y-2 pt-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                {notes.map((note) => (
                  <div key={note.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-light">
                      <span className="font-sans" style={{ color: 'var(--text-secondary)' }}>
                        {translateNote(note.name)}
                      </span>
                      <span className="font-sans font-medium text-[11px]" style={{ color: cfg.color }}>
                        {note.intensity}%
                      </span>
                    </div>
                    <IntensityBar
                      value={note.intensity}
                      color={`linear-gradient(90deg, ${cfg.color}70, ${cfg.color})`}
                      height="2px"
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Acordes */}
      <div className="pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center justify-between mb-3">
          <h4
            className="font-sans text-[10px] font-medium tracking-[0.25em] uppercase"
            style={{ color: 'var(--gold)' }}
          >
            Acordes Principales
          </h4>
          <span
            className="font-sans text-[10px] tracking-widest uppercase"
            style={{ color: 'var(--text-muted)' }}
          >
            Armonía
          </span>
        </div>

        <div className="space-y-2.5">
          {perfume.accords.map((accord) => {
            const color = getAccordColor(accord.name, accord.color);
            return (
              <div key={accord.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-light">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: color }}
                    />
                    <span className="font-sans" style={{ color: 'var(--text-secondary)' }}>
                      {translateAccord(accord.name)}
                    </span>
                  </div>
                  <span className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>
                    {accord.percentage}%
                  </span>
                </div>
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: 'var(--border-subtle)' }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${accord.percentage}%`,
                      background: color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ficha técnica */}
      <div className="surface-gold p-4 space-y-2.5">
        <span
          className="font-sans text-[10px] font-medium tracking-[0.24em] uppercase block mb-2"
          style={{ color: 'var(--gold)' }}
        >
          Ficha del Perfumista
        </span>
        <InfoRow label="Familia" value={perfume.family} />
        <InfoRow
          label="Género"
          value={perfume.gender.charAt(0).toUpperCase() + perfume.gender.slice(1)}
        />
        <InfoRow label="Concentración" value={perfume.concentration} />
        {perfume.perfumers && perfume.perfumers.length > 0 && (
          <InfoRow label="La Nariz" value={perfume.perfumers.join(', ')} />
        )}
        {perfume.inspiredBy && <InfoRow label="Homenaje" value={perfume.inspiredBy} />}
        {perfume.season.length > 0 && (
          <InfoRow
            label="Temporada"
            value={perfume.season.map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(' · ')}
          />
        )}
        {perfume.occasion.length > 0 && (
          <InfoRow
            label="Ocasión"
            value={perfume.occasion.map((o) => o.charAt(0).toUpperCase() + o.slice(1)).join(' · ')}
          />
        )}
        {perfume.price === 0 && (
          <p className="font-sans text-[10px] font-light leading-relaxed pt-1" style={{ color: 'var(--text-muted)' }}>
            Ficha de referencia (Parfumo, CC0). Las intensidades muestran el orden de aparición de notas.
          </p>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex items-center justify-between text-xs py-1 last:border-0"
      style={{ borderBottom: '1px solid var(--border-subtle)' }}
    >
      <span className="font-sans font-light" style={{ color: 'var(--text-muted)' }}>
        {label}
      </span>
      <span className="font-sans font-normal text-right" style={{ color: 'var(--text-primary)' }}>
        {value}
      </span>
    </div>
  );
}
