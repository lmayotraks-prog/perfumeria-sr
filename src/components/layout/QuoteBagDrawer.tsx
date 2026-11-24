'use client';
// src/components/layout/QuoteBagDrawer.tsx — Bolsa de Cotización para WhatsApp (50ml / 100ml + Envío Agrupado)
import { useEffect } from 'react';
import { usePerfumeStore } from '@/hooks/usePerfumeStore';
import { SR_CONTACT, buildBagWhatsAppUrl } from '@/lib/whatsapp';
import CatalogBottleImage from '@/components/ui/CatalogBottleImage';

export default function QuoteBagDrawer() {
  const { state, dispatch } = usePerfumeStore();
  const { bag, ui } = state;
  const isOpen = ui.isBagOpen;

  const totalUnits = bag.reduce((sum, item) => sum + item.qty, 0);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dispatch({ type: 'SET_BAG_OPEN', open: false });
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, dispatch]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[85] flex justify-end"
      style={{ background: 'rgba(8, 7, 6, 0.68)', backdropFilter: 'blur(8px)' }}
      onClick={() => dispatch({ type: 'SET_BAG_OPEN', open: false })}
      role="dialog"
      aria-modal="true"
      aria-label="Bolsa de cotización SR Essences"
    >
      <aside
        className="w-[340px] sm:w-[420px] max-w-[94vw] h-full flex flex-col justify-between shadow-2xl"
        style={{
          background: 'var(--bg-page)',
          borderLeft: '1px solid var(--border-gold)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div
          className="px-5 sm:px-6 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4 sm:py-5 flex items-center justify-between flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border-gold)' }}
        >
          <div>
            <p
              className="font-sans text-[10px] font-medium tracking-[0.26em] uppercase"
              style={{ color: 'var(--gold)' }}
            >
              Cotización Directa
            </p>
            <h2 className="font-serif text-2xl font-light" style={{ color: 'var(--text-primary)' }}>
              Tu Bolsa <span className="text-gold">({totalUnits})</span>
            </h2>
          </div>

          <button
            onClick={() => dispatch({ type: 'SET_BAG_OPEN', open: false })}
            className="surface-card w-10 h-10 flex items-center justify-center text-sm cursor-pointer"
            style={{ color: 'var(--text-primary)' }}
            aria-label="Cerrar bolsa"
          >
            ✕
          </button>
        </div>

        {/* Lista de Perfumes */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {bag.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-10">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-4 surface-gold"
                style={{ color: 'var(--gold)' }}
              >
                <span className="text-xl">✦</span>
              </div>
              <h3 className="font-serif text-2xl font-light mb-2" style={{ color: 'var(--text-primary)' }}>
                Tu bolsa de cotización está vacía
              </h3>
              <p
                className="font-sans text-xs font-light leading-relaxed max-w-xs mb-6"
                style={{ color: 'var(--text-muted)' }}
              >
                Agrega uno o varios perfumes en 50ml o 100ml para enviarnos tu selección en un solo mensaje de WhatsApp.
              </p>
              <div className="flex flex-col sm:flex-row gap-2.5 w-full">
                <button
                  onClick={() => dispatch({ type: 'ENTER_UNIVERSE', department: 'dama' })}
                  className="btn-luxury flex-1 py-2.5 px-4 text-[10px]"
                >
                  ☀ Catálogo Dama
                </button>
                <button
                  onClick={() => dispatch({ type: 'ENTER_UNIVERSE', department: 'caballero' })}
                  className="btn-ghost flex-1 py-2.5 px-4 text-[10px]"
                >
                  ☾ Catálogo Caballero
                </button>
              </div>
            </div>
          ) : (
            bag.map((item) => (
              <div
                key={`${item.perfume.id}-${item.sizeMl}`}
                className="surface-card p-3.5 flex gap-3.5 items-start"
              >
                {/* Miniatura frasco HD o esfera */}
                {item.perfume.available || item.perfume.imageUrl ? (
                  <div
                    className="w-16 h-16 flex-shrink-0 flex items-center justify-center p-1.5"
                    style={{
                      background: '#faf7f1',
                      border: '1px solid var(--border-gold)',
                    }}
                  >
                    <CatalogBottleImage perfume={item.perfume} compact />
                  </div>
                ) : (
                  <div
                    className="w-14 h-14 rounded-full flex-shrink-0 mt-1"
                    style={{
                      background: `radial-gradient(circle at 32% 30%, ${item.perfume.liquidColorAlt} 0%, ${item.perfume.liquidColor} 70%)`,
                      border: '1px solid var(--border-gold)',
                    }}
                  />
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-0.5">
                    <span
                      className="font-sans text-[9px] font-medium tracking-[0.2em] uppercase truncate"
                      style={{ color: 'var(--gold)' }}
                    >
                      {item.perfume.brand} ·{' '}
                      {!item.perfume.available
                        ? 'Enciclopedia'
                        : item.perfume.gender === 'femenino'
                        ? 'Dama'
                        : 'Caballero'}
                    </span>
                    <button
                      onClick={() =>
                        dispatch({
                          type: 'REMOVE_FROM_BAG',
                          id: item.perfume.id,
                          sizeMl: item.sizeMl,
                        })
                      }
                      className="text-xs opacity-60 hover:opacity-100"
                      style={{ color: 'var(--text-muted)' }}
                      aria-label={`Eliminar ${item.perfume.name}`}
                    >
                      ✕
                    </button>
                  </div>

                  <p
                    className="font-serif text-base font-normal leading-tight truncate mb-2.5"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {item.perfume.name}
                  </p>

                  {/* Selector rápido 50ml / 100ml + Cantidad */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex gap-1">
                      {([50, 100] as const).map((sz) => (
                        <button
                          key={sz}
                          onClick={() =>
                            dispatch({
                              type: 'UPDATE_BAG_ITEM',
                              id: item.perfume.id,
                              oldSizeMl: item.sizeMl,
                              sizeMl: sz,
                            })
                          }
                          className="font-sans text-[9px] font-medium px-2 py-1 transition-all"
                          style={{
                            background: item.sizeMl === sz ? 'var(--gold)' : 'transparent',
                            color: item.sizeMl === sz ? '#ffffff' : 'var(--text-muted)',
                            border: `1px solid ${
                              item.sizeMl === sz ? 'var(--gold)' : 'var(--border-subtle)'
                            }`,
                          }}
                        >
                          {sz}ml
                        </button>
                      ))}
                    </div>

                    <div
                      className="flex items-center"
                      style={{ border: '1px solid var(--border-gold)' }}
                    >
                      <button
                        onClick={() =>
                          dispatch({
                            type: 'UPDATE_BAG_ITEM',
                            id: item.perfume.id,
                            oldSizeMl: item.sizeMl,
                            qty: item.qty - 1,
                          })
                        }
                        className="w-8 h-8 text-xs flex items-center justify-center hover:opacity-75 cursor-pointer"
                        style={{ color: 'var(--text-primary)' }}
                        aria-label="Disminuir cantidad"
                      >
                        −
                      </button>
                      <span
                        className="px-2.5 font-sans text-[11px] font-medium"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {item.qty}
                      </span>
                      <button
                        onClick={() =>
                          dispatch({
                            type: 'UPDATE_BAG_ITEM',
                            id: item.perfume.id,
                            oldSizeMl: item.sizeMl,
                            qty: item.qty + 1,
                          })
                        }
                        className="w-8 h-8 text-xs flex items-center justify-center hover:opacity-75 cursor-pointer"
                        style={{ color: 'var(--text-primary)' }}
                        aria-label="Aumentar cantidad"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer de Acciones WhatsApp */}
        {bag.length > 0 && (
          <div
            className="px-5 sm:px-6 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] space-y-3 flex-shrink-0"
            style={{
              background: 'var(--bg-surface)',
              borderTop: '1px solid var(--border-gold)',
            }}
          >
            <div className="surface-gold p-3 space-y-1">
              <p className="font-sans text-[10px] font-light leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {SR_CONTACT.purchaseStep}
              </p>
              <p className="font-sans text-[9px] font-medium tracking-wider uppercase" style={{ color: 'var(--gold)' }}>
                {SR_CONTACT.paymentMethods.join(' · ')}
              </p>
            </div>

            <a
              href={buildBagWhatsAppUrl(bag)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-luxury w-full py-3.5 text-[10px] flex items-center justify-center gap-2"
            >
              <span>✆</span>
              <span>
                Enviar Cotización por WhatsApp ({totalUnits}{' '}
                {totalUnits === 1 ? 'perfume' : 'perfumes'})
              </span>
            </a>

            <button
              onClick={() => dispatch({ type: 'CLEAR_BAG' })}
              className="w-full py-2 font-sans text-[10px] tracking-[0.2em] uppercase opacity-70 hover:opacity-100 transition-opacity"
              style={{ color: 'var(--text-muted)' }}
            >
              Vaciar bolsa
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
