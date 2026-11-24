'use client';
// src/components/layout/Footer.tsx — SR Essences · Footer Oficial Conectado a Vistas Boutique
import { SR_CONTACT, buildPerfumeWhatsAppUrl } from '@/lib/whatsapp';
import { usePerfumeStore } from '@/hooks/usePerfumeStore';

export default function Footer() {
  const { dispatch } = usePerfumeStore();
  const year = new Date().getFullYear();

  return (
    <footer
      className="relative overflow-hidden pt-14 sm:pt-16 pb-[max(5.5rem,calc(env(safe-area-inset-bottom)+4.5rem))] md:pb-10 px-4 sm:px-6 md:px-10"
      style={{
        background: 'var(--bg-page)',
        borderTop: '1px solid var(--border-gold)',
      }}
    >
      <div className="relative max-w-[1400px] 3xl:max-w-[1800px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-5">
            <div className="flex items-baseline gap-2.5 mb-4">
              <span
                className="font-serif text-4xl font-light tracking-widest"
                style={{ color: 'var(--text-primary)' }}
              >
                SR
              </span>
              <span className="font-script text-3xl text-gold">Essences</span>
            </div>

            <p
              className="font-sans text-xs md:text-sm font-light leading-[1.85] mb-4 max-w-xs"
              style={{ color: 'var(--text-secondary)' }}
            >
              {SR_CONTACT.tagline}. {SR_CONTACT.subtitle} con asesoría personalizada y enlaces de pago directos.
            </p>

            <p className="font-sans text-xs mb-5" style={{ color: 'var(--gold)' }}>
              Pagos: {SR_CONTACT.paymentMethods.join(' · ')}
            </p>

            <div className="flex flex-wrap gap-4 sm:gap-5">
              <a
                href={buildPerfumeWhatsAppUrl(null)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-sans text-[10px] font-medium tracking-[0.22em] uppercase hover:underline"
                style={{ color: 'var(--gold)' }}
              >
                WhatsApp {SR_CONTACT.whatsappDisplay}
              </a>
              <a
                href={SR_CONTACT.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-sans text-[10px] font-medium tracking-[0.22em] uppercase hover:underline"
                style={{ color: 'var(--text-muted)' }}
              >
                {SR_CONTACT.instagramHandle}
              </a>
            </div>
          </div>

          {/* Catálogo & Vistas */}
          <div className="md:col-span-3">
            <h4
              className="font-sans text-[10px] font-medium tracking-[0.28em] uppercase mb-4"
              style={{ color: 'var(--gold)' }}
            >
              Showroom & Catálogo
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() => dispatch({ type: 'SET_VIEW', view: 'home' })}
                  className="font-sans text-xs font-light tracking-wide hover:underline cursor-pointer"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Portada Showroom 3D
                </button>
              </li>
              <li>
                <button
                  onClick={() => dispatch({ type: 'ENTER_UNIVERSE', department: 'dama' })}
                  className="font-sans text-xs font-light tracking-wide hover:underline cursor-pointer"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  ☀ Colección Dama (Palais Lumière)
                </button>
              </li>
              <li>
                <button
                  onClick={() => dispatch({ type: 'ENTER_UNIVERSE', department: 'caballero' })}
                  className="font-sans text-xs font-light tracking-wide hover:underline cursor-pointer"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  ☾ Colección Caballero (Noche Obsidiana)
                </button>
              </li>
              <li>
                <button
                  onClick={() => dispatch({ type: 'SET_VIEW', view: 'encyclopedia' })}
                  className="font-sans text-xs font-light tracking-wide hover:underline cursor-pointer"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Enciclopedia Mundial 25K
                </button>
              </li>
              <li>
                <button
                  onClick={() => dispatch({ type: 'SET_VIEW', view: 'how-to-buy' })}
                  className="font-sans text-xs font-light tracking-wide hover:underline cursor-pointer"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Proceso de Compra & Pagos
                </button>
              </li>
            </ul>
          </div>

          {/* Contacto Directo */}
          <div className="md:col-span-4">
            <h4
              className="font-sans text-[10px] font-medium tracking-[0.28em] uppercase mb-4"
              style={{ color: 'var(--gold)' }}
            >
              Pedidos por WhatsApp
            </h4>
            <p
              className="font-sans text-xs font-light leading-relaxed mb-4"
              style={{ color: 'var(--text-muted)' }}
            >
              {SR_CONTACT.purchaseStep}
            </p>
            <a
              href={buildPerfumeWhatsAppUrl(null)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-luxury py-2.5 px-6 text-[10px]"
            >
              ✆ Solicitar Referencia ({SR_CONTACT.whatsappDisplay})
            </a>
          </div>
        </div>

        <div className="divider-gold opacity-40 mb-6" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-sans text-[11px] font-light tracking-widest" style={{ color: 'var(--text-muted)' }}>
            © {year} SR Essences · {SR_CONTACT.subtitle}. Todos los derechos reservados.
          </p>
          <p className="font-sans text-[10px] font-light tracking-[0.22em] uppercase text-gold">
            {SR_CONTACT.tagline}
          </p>
        </div>
      </div>
    </footer>
  );
}
