'use client';
// src/app/page.tsx — SR Essences · Boutique App con Vistas Dedicadas (Portada Inmersiva / Catálogo / Enciclopedia 25K / Cómo Comprar)
import { useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/sections/HeroSection';
import CatalogSection from '@/components/sections/CatalogSection';
import GlobalCatalogSection from '@/components/sections/GlobalCatalogSection';
import AboutSection from '@/components/sections/AboutSection';
import FragranceDetailModal from '@/components/catalog/FragranceDetailModal';
import QuoteBagDrawer from '@/components/layout/QuoteBagDrawer';
import { usePerfumeStore } from '@/hooks/usePerfumeStore';

export default function HomePage() {
  const { state, dispatch } = usePerfumeStore();
  const { activeView, isBagOpen } = state.ui;
  const bagCount = state.bag.reduce((sum, item) => sum + item.qty, 0);

  // Scroll suave al inicio cada vez que el cliente cambia de vista
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeView]);

  return (
    <main className="relative marble-surface-bg min-h-screen flex flex-col">
      <Navbar />

      <div className={activeView === 'home' ? 'flex-1' : 'flex-1 pt-[calc(4rem+env(safe-area-inset-top))] md:pt-[calc(5rem+env(safe-area-inset-top))]'}>
        {activeView === 'home' && <HeroSection />}
        {activeView === 'catalog' && <CatalogSection />}
        {activeView === 'encyclopedia' && <GlobalCatalogSection />}
        {activeView === 'how-to-buy' && <AboutSection />}
      </div>

      {activeView !== 'home' && <Footer />}

      {/* Modales y Drawers Globales */}
      <FragranceDetailModal />
      <QuoteBagDrawer />

      {/* Píldora flotante en móvil para terminar cotización de bolsa desde cualquier vista */}
      {bagCount > 0 && !isBagOpen && (
        <button
          onClick={() => dispatch({ type: 'SET_BAG_OPEN', open: true })}
          className="md:hidden fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-40 btn-luxury min-h-[44px] py-2.5 px-4 text-[10px] shadow-2xl flex items-center gap-2"
          aria-label="Abrir bolsa de cotización"
        >
          <span>🛍</span>
          <span>
            Ver Bolsa ({bagCount}) · WhatsApp
          </span>
        </button>
      )}
    </main>
  );
}
