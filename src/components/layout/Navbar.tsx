'use client';
// src/components/layout/Navbar.tsx — SR Essences · Header Boutique + Menú Hamburguesa + Bolsa de Cotización
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { usePerfumeStore } from '@/hooks/usePerfumeStore';
import { DAMA_PERFUMES, CABALLERO_PERFUMES } from '@/data/availableCatalog';
import { SR_CONTACT, buildBagWhatsAppUrl, buildPerfumeWhatsAppUrl } from '@/lib/whatsapp';
import { AppView } from '@/types';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { state, dispatch } = usePerfumeStore();
  const { ui, activePerfume, bag } = state;
  const isNocturne = ui.ambiance === 'nocturne';
  const isCaballero = ui.department === 'caballero';
  const drawerOpen = ui.isDrawerOpen;
  const activeView = ui.activeView;

  const bagCount = bag.reduce((sum, item) => sum + item.qty, 0);
  const primaryWhatsAppUrl =
    bag.length > 0 ? buildBagWhatsAppUrl(bag) : buildPerfumeWhatsAppUrl(activePerfume);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dispatch({ type: 'SET_DRAWER_OPEN', open: false });
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [drawerOpen, dispatch]);

  const goView = (view: AppView) => {
    dispatch({ type: 'SET_VIEW', view });
  };

  const enterDept = (department: 'dama' | 'caballero') => {
    dispatch({ type: 'ENTER_UNIVERSE', department });
  };

  const navTabStyle = (active: boolean) => ({
    color: active ? 'var(--gold)' : 'var(--text-secondary)',
    fontWeight: active ? 600 : 400,
    borderBottom: active ? '2px solid var(--gold)' : '2px solid transparent',
  });

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 min-h-[4rem] md:min-h-[5rem] pt-[env(safe-area-inset-top)] flex items-center transition-all duration-500"
        style={{
          background:
            activeView === 'home' && !scrolled
              ? isNocturne
                ? 'linear-gradient(180deg, rgba(5,5,4,0.72) 0%, rgba(5,5,4,0.0) 100%)'
                : 'linear-gradient(180deg, rgba(247,243,236,0.78) 0%, rgba(247,243,236,0.0) 100%)'
              : 'var(--bg-nav-scroll)',
          backdropFilter: activeView === 'home' && !scrolled ? 'blur(6px)' : 'blur(18px)',
          borderBottom:
            activeView === 'home' && !scrolled
              ? '1px solid transparent'
              : '1px solid var(--border-gold)',
        }}
      >
        <div className="w-full max-w-[1600px] 3xl:max-w-[1920px] 4xl:max-w-[2280px] h-16 md:h-20 mx-auto px-3 xs:px-4 md:px-8 flex items-center justify-between gap-2 xs:gap-3">
          {/* ——— IZQUIERDA: MENÚ HAMBURGUESA + LOGO ——— */}
          <div className="flex items-center gap-2 xs:gap-3 md:gap-4">
            <button
              onClick={() => dispatch({ type: 'TOGGLE_DRAWER' })}
              className="surface-card min-h-[40px] px-2.5 xs:px-3 py-2 flex items-center gap-2 xs:gap-2.5 cursor-pointer transition-all hover:scale-[1.02]"
              aria-label="Abrir menú de navegación"
              aria-expanded={drawerOpen}
            >
              <span className="flex flex-col gap-1">
                <span className="block w-4 h-[1.5px]" style={{ background: 'var(--gold)' }} />
                <span className="block w-3 h-[1.5px]" style={{ background: 'var(--gold)' }} />
                <span className="block w-4 h-[1.5px]" style={{ background: 'var(--gold)' }} />
              </span>
              <span
                className="hidden sm:inline font-sans text-[10px] font-medium tracking-[0.22em] uppercase"
                style={{ color: 'var(--text-primary)' }}
              >
                Menú
              </span>
            </button>

            <button
              onClick={() => goView('home')}
              className="flex items-center gap-2.5 group text-left cursor-pointer"
              title="Ir al Inicio Showroom"
            >
              <div
                className="relative w-10 h-9 overflow-hidden flex-shrink-0"
                style={{
                  borderRadius: isNocturne ? '9999px' : '4px',
                  border: isNocturne ? '1px solid rgba(212,171,76,0.35)' : 'none',
                }}
              >
                {isNocturne ? (
                  <Image
                    src="/images/logo/sr-essences-logo.jpeg"
                    alt="SR Essences"
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <Image
                    src="/images/textures/fondo-blanco.jpg"
                    alt="SR Essences"
                    fill
                    className="object-contain mix-blend-multiply scale-125"
                    priority
                  />
                )}
              </div>
              <div className="hidden sm:flex flex-col leading-none">
                <span
                  className="font-serif text-base md:text-lg font-medium tracking-[0.2em] uppercase"
                  style={{ color: 'var(--text-primary)' }}
                >
                  SR <span className="font-script text-lg md:text-xl tracking-normal lowercase text-gold">Essences</span>
                </span>
                <span
                  className="font-sans text-[8px] font-light tracking-[0.3em] uppercase mt-0.5"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {SR_CONTACT.subtitle}
                </span>
              </div>
            </button>
          </div>

          {/* ——— CENTRO: NAVEGACIÓN POR VISTAS (TABLET & DESKTOP) ——— */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-7 h-full">
            <button
              onClick={() => goView('home')}
              className="h-full px-1 font-sans text-[10px] lg:text-[11px] tracking-[0.16em] lg:tracking-[0.2em] uppercase transition-all cursor-pointer whitespace-nowrap"
              style={navTabStyle(activeView === 'home')}
            >
              Inicio
            </button>
            <button
              onClick={() => enterDept('dama')}
              className="h-full px-1 font-sans text-[10px] lg:text-[11px] tracking-[0.16em] lg:tracking-[0.2em] uppercase transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              style={navTabStyle(activeView === 'catalog' && !isCaballero)}
            >
              <span>☀</span>
              <span>Dama</span>
            </button>
            <button
              onClick={() => enterDept('caballero')}
              className="h-full px-1 font-sans text-[10px] lg:text-[11px] tracking-[0.16em] lg:tracking-[0.2em] uppercase transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              style={navTabStyle(activeView === 'catalog' && isCaballero)}
            >
              <span>☾</span>
              <span>Caballero</span>
            </button>
            <button
              onClick={() => goView('encyclopedia')}
              className="h-full px-1 font-sans text-[10px] lg:text-[11px] tracking-[0.16em] lg:tracking-[0.2em] uppercase transition-all cursor-pointer whitespace-nowrap"
              style={navTabStyle(activeView === 'encyclopedia')}
            >
              Enciclopedia 25K
            </button>
          </nav>

          {/* ——— DERECHA: LUZ + BOLSA DE COTIZACIÓN + WHATSAPP ——— */}
          <div className="flex items-center gap-1.5 xs:gap-2 md:gap-2.5">
            <button
              onClick={() => dispatch({ type: 'TOGGLE_AMBIANCE' })}
              className="surface-card w-10 h-10 sm:w-9 sm:h-9 flex items-center justify-center text-sm cursor-pointer"
              title={`Cambiar luz a ${isNocturne ? 'Palais Lumière (claro)' : 'Noche Obsidiana (oscuro)'}`}
              style={{ color: 'var(--gold)' }}
              aria-label="Alternar tema claro u oscuro"
            >
              {isNocturne ? '☀' : '☾'}
            </button>

            <button
              onClick={() => dispatch({ type: 'TOGGLE_BAG' })}
              className="surface-card px-2.5 xs:px-3 h-10 sm:h-9 flex items-center gap-1.5 xs:gap-2 cursor-pointer relative transition-transform hover:scale-[1.02]"
              aria-label="Abrir bolsa de cotización"
              title="Tu bolsa de perfumes para cotizar por WhatsApp"
            >
              <span className="text-sm" style={{ color: 'var(--gold)' }}>
                🛍
              </span>
              <span
                className="hidden md:inline font-sans text-[10px] font-medium tracking-[0.16em] uppercase"
                style={{ color: 'var(--text-primary)' }}
              >
                Bolsa
              </span>
              <span
                className="min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-sans font-semibold flex items-center justify-center"
                style={{
                  background: bagCount > 0 ? 'var(--gold)' : 'var(--border-subtle)',
                  color: bagCount > 0 ? '#ffffff' : 'var(--text-muted)',
                }}
              >
                {bagCount}
              </span>
            </button>

            <a
              href={primaryWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-luxury py-2 px-3.5 md:px-4 text-[10px] flex items-center gap-1.5"
            >
              <span className="text-xs">✆</span>
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          </div>
        </div>
      </header>

      {/* ——— MENÚ HAMBURGUESA DESPLEGABLE (DRAWER LATERAL) ——— */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-[80] flex"
          style={{ background: 'rgba(8, 7, 6, 0.68)', backdropFilter: 'blur(8px)' }}
          onClick={() => dispatch({ type: 'SET_DRAWER_OPEN', open: false })}
        >
          <aside
            className="w-[310px] sm:w-[370px] max-w-[90vw] h-full overflow-y-auto px-5 sm:px-8 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] flex flex-col justify-between shadow-2xl"
            style={{
              background: 'var(--bg-page)',
              borderRight: '1px solid var(--border-gold)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Cabecera del menú */}
              <div
                className="flex items-center justify-between pb-5 mb-6"
                style={{ borderBottom: '1px solid var(--border-gold)' }}
              >
                <div>
                  <p className="font-serif text-xl tracking-[0.2em] uppercase" style={{ color: 'var(--text-primary)' }}>
                    SR <span className="font-script text-2xl lowercase text-gold">Essences</span>
                  </p>
                  <p className="font-sans text-[9px] tracking-[0.26em] uppercase" style={{ color: 'var(--text-muted)' }}>
                    Showroom & Catálogo
                  </p>
                </div>

                <button
                  onClick={() => dispatch({ type: 'SET_DRAWER_OPEN', open: false })}
                  className="surface-card w-9 h-9 flex items-center justify-center text-sm"
                  style={{ color: 'var(--text-primary)' }}
                  aria-label="Cerrar menú"
                >
                  ✕
                </button>
              </div>

              {/* Acceso directo por Universo */}
              <p className="font-sans text-[10px] font-medium tracking-[0.24em] uppercase mb-3" style={{ color: 'var(--gold)' }}>
                Elige tu Universo
              </p>
              <div className="grid grid-cols-2 gap-2.5 mb-7">
                <button
                  onClick={() => enterDept('dama')}
                  className={`p-3.5 text-left transition-all ${
                    activeView === 'catalog' && !isCaballero ? 'surface-gold maison-frame' : 'surface-card'
                  }`}
                >
                  <span className="block text-base mb-1" style={{ color: 'var(--gold)' }}>☀</span>
                  <span className="font-serif text-base block" style={{ color: 'var(--text-primary)' }}>Dama</span>
                  <span className="font-sans text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {DAMA_PERFUMES.length} frascos · Luz
                  </span>
                </button>

                <button
                  onClick={() => enterDept('caballero')}
                  className={`p-3.5 text-left transition-all ${
                    activeView === 'catalog' && isCaballero ? 'surface-gold maison-frame' : 'surface-card'
                  }`}
                >
                  <span className="block text-base mb-1" style={{ color: 'var(--gold)' }}>☾</span>
                  <span className="font-serif text-base block" style={{ color: 'var(--text-primary)' }}>Caballero</span>
                  <span className="font-sans text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {CABALLERO_PERFUMES.length} frascos · Noche
                  </span>
                </button>
              </div>

              {/* Mapa de navegación exacto */}
              <p className="font-sans text-[10px] font-medium tracking-[0.24em] uppercase mb-3" style={{ color: 'var(--gold)' }}>
                Navegación Rápida
              </p>
              <nav className="space-y-1.5 mb-8">
                {[
                  {
                    num: '01',
                    label: 'Portada Showroom 3D',
                    sub: 'Entrada cinematográfica y acceso',
                    active: activeView === 'home',
                    onClick: () => goView('home'),
                  },
                  {
                    num: '02',
                    label: 'Catálogo Disponible Dama',
                    sub: `${DAMA_PERFUMES.length} referencias en stock inmediato`,
                    active: activeView === 'catalog' && !isCaballero,
                    onClick: () => enterDept('dama'),
                  },
                  {
                    num: '03',
                    label: 'Catálogo Disponible Caballero',
                    sub: `${CABALLERO_PERFUMES.length} referencias en stock inmediato`,
                    active: activeView === 'catalog' && isCaballero,
                    onClick: () => enterDept('caballero'),
                  },
                  {
                    num: '04',
                    label: 'Enciclopedia Mundial 25K',
                    sub: 'Notas (+/−), acordes y perfumistas',
                    active: activeView === 'encyclopedia',
                    onClick: () => goView('encyclopedia'),
                  },
                  {
                    num: '05',
                    label: 'Cómo Comprar & Pagos',
                    sub: 'WhatsApp, Nequi, Daviplata, Bre-B',
                    active: activeView === 'how-to-buy',
                    onClick: () => goView('how-to-buy'),
                  },
                ].map((item) => (
                  <button
                    key={item.num}
                    onClick={item.onClick}
                    className={`w-full p-3 text-left transition-all flex items-start gap-3 ${
                      item.active ? 'surface-gold maison-frame' : 'surface-card hover:translate-x-1'
                    }`}
                  >
                    <span className="font-serif text-sm text-gold pt-0.5">{item.num}</span>
                    <div>
                      <span className="font-serif text-base block leading-tight" style={{ color: 'var(--text-primary)' }}>
                        {item.label}
                      </span>
                      <span className="font-sans text-[10px] font-light" style={{ color: 'var(--text-muted)' }}>
                        {item.sub}
                      </span>
                    </div>
                  </button>
                ))}
              </nav>
            </div>

            {/* Bloque oficial de contacto y pagos */}
            <div className="surface-gold p-4 space-y-3">
              <p className="font-sans text-[10px] font-medium tracking-[0.22em] uppercase" style={{ color: 'var(--gold)' }}>
                Atención Directa SR Essences
              </p>
              <p className="font-sans text-xs font-light leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                WhatsApp: <strong style={{ color: 'var(--text-primary)' }}>{SR_CONTACT.whatsappDisplay}</strong>
                <br />
                Instagram:{' '}
                <a
                  href={SR_CONTACT.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                  style={{ color: 'var(--gold)' }}
                >
                  {SR_CONTACT.instagramHandle}
                </a>
              </p>
              <p className="font-sans text-[10px] font-light" style={{ color: 'var(--text-muted)' }}>
                Pagos: {SR_CONTACT.paymentMethods.join(' · ')}
              </p>
              <a
                href={primaryWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-luxury w-full py-2.5 text-[10px]"
              >
                Escribir por WhatsApp Ahora
              </a>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
