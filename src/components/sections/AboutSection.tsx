'use client';
// src/components/sections/AboutSection.tsx — SR Essences · Proceso de Compra, Pagos & Campaña Visual Dual
import Image from 'next/image';
import { SR_CONTACT, buildPerfumeWhatsAppUrl } from '@/lib/whatsapp';
import { usePerfumeStore } from '@/hooks/usePerfumeStore';

const STEPS = [
  {
    num: '01',
    title: 'Explora el Showroom 3D',
    desc: 'Elige Dama (Palais Lumière) o Caballero (Noche Obsidiana), gira el frasco 3D y revisa sus notas.',
  },
  {
    num: '02',
    title: 'Solicita o Arma tu Bolsa',
    desc: 'Toca «Pedir ya» o agrega varias referencias en 50ml / 100ml a tu bolsa hacia WhatsApp (322 467 1698).',
  },
  {
    num: '03',
    title: 'Enlace de Pago Seguro',
    desc: 'Te enviaremos un enlace directo para pagar mediante Transferencia, Nequi, Daviplata o Bre-B.',
  },
];

export default function AboutSection() {
  const { dispatch } = usePerfumeStore();

  return (
    <div className="relative overflow-hidden py-6 sm:py-8 md:py-12 px-3.5 sm:px-6 md:px-10">
      <div className="relative max-w-[1500px] 3xl:max-w-[1800px] mx-auto">
        {/* ——— BREADCRUMB DE UBICACIÓN ——— */}
        <div
          className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-10"
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
              Proceso de Compra & La Maison
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => dispatch({ type: 'ENTER_UNIVERSE', department: 'dama' })}
              className="filter-chip cursor-pointer"
            >
              ☀ Catálogo Dama
            </button>
            <button
              onClick={() => dispatch({ type: 'ENTER_UNIVERSE', department: 'caballero' })}
              className="filter-chip cursor-pointer"
            >
              ☾ Caballero
            </button>
          </div>
        </div>

        {/* ——— PROCESO DE COMPRA + GALERÍA DUAL LUMIÈRE / NOCTURNE ——— */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
          <div className="lg:col-span-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="divider-gold-left w-10" />
              <span
                className="font-sans text-[11px] font-medium tracking-[0.34em] uppercase"
                style={{ color: 'var(--gold)' }}
              >
                Proceso de Compra · {SR_CONTACT.subtitle}
              </span>
            </div>

            <h2
              className="font-serif font-light leading-none mb-5"
              style={{
                fontSize: 'clamp(2.4rem, 4.8vw, 4rem)',
                color: 'var(--text-primary)',
              }}
            >
              Compra fácil y{' '}
              <span className="italic text-gold">atención directa</span>
            </h2>

            <p
              className="font-sans text-sm font-light leading-[1.85] mb-7"
              style={{ color: 'var(--text-secondary)' }}
            >
              {SR_CONTACT.purchaseStep}
            </p>

            {/* 3 pasos claros */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">
              {STEPS.map((s) => (
                <div key={s.num} className="surface-card p-5">
                  <span className="font-serif text-xl text-gold block mb-2">{s.num}</span>
                  <h3 className="font-serif text-base font-normal mb-1.5" style={{ color: 'var(--text-primary)' }}>
                    {s.title}
                  </h3>
                  <p className="font-sans text-[11px] font-light leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Tarjeta de Métodos de Pago y Contacto Directo */}
            <div id="contacto" className="surface-gold maison-frame p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                <div>
                  <p
                    className="font-sans text-[10px] font-medium tracking-[0.26em] uppercase mb-3"
                    style={{ color: 'var(--gold)' }}
                  >
                    Métodos de Pago Aceptados
                  </p>
                  <ul className="space-y-1.5 font-sans text-xs" style={{ color: 'var(--text-primary)' }}>
                    {SR_CONTACT.paymentMethods.map((m) => (
                      <li key={m} className="flex items-center gap-2">
                        <span style={{ color: 'var(--gold)' }}>✓</span>
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <p
                    className="font-sans text-[10px] font-medium tracking-[0.26em] uppercase"
                    style={{ color: 'var(--gold)' }}
                  >
                    Contacto Oficial
                  </p>
                  <p className="font-sans text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    ✆ {SR_CONTACT.whatsappDisplay}
                  </p>
                  <p className="font-sans text-xs" style={{ color: 'var(--text-secondary)' }}>
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
                  <div className="flex flex-wrap gap-2.5 pt-1">
                    <a
                      href={buildPerfumeWhatsAppUrl(null)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-luxury py-2.5 px-5 text-[10px]"
                    >
                      Escribir a WhatsApp
                    </a>
                    <a
                      href={SR_CONTACT.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost py-2.5 px-4 text-[10px]"
                    >
                      Instagram
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dos arcos parisinos con las películas visuales de campaña (Dama & Caballero) */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-3 sm:gap-5 items-end">
            <div
              className="palais-arch overflow-hidden shadow-xl relative aspect-[3/4] border"
              style={{ borderColor: 'var(--border-gold)' }}
            >
              <video
                src="/videos/perfume-lumiere.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <div
                className="absolute bottom-2.5 sm:bottom-3 inset-x-2 sm:inset-x-3 px-2 sm:px-3 py-1.5 backdrop-blur-md text-center"
                style={{
                  background: 'rgba(247, 243, 236, 0.82)',
                  border: '1px solid rgba(184, 142, 52, 0.38)',
                }}
              >
                <span className="font-sans text-[8px] sm:text-[9px] font-medium tracking-[0.14em] sm:tracking-[0.2em] uppercase text-obsidian-900">
                  Dama · Palais Lumière
                </span>
              </div>
            </div>

            <div
              className="palais-arch overflow-hidden shadow-xl relative aspect-[3/4] sm:translate-y-6 border"
              style={{ borderColor: 'var(--border-gold)' }}
            >
              <video
                src="/videos/perfume-reference.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <div
                className="absolute bottom-2.5 sm:bottom-3 inset-x-2 sm:inset-x-3 px-2 sm:px-3 py-1.5 backdrop-blur-md text-center"
                style={{
                  background: 'rgba(15, 13, 10, 0.78)',
                  border: '1px solid rgba(212, 171, 76, 0.38)',
                }}
              >
                <span className="font-sans text-[8px] sm:text-[9px] font-medium tracking-[0.14em] sm:tracking-[0.2em] uppercase text-alabaster-50">
                  Caballero · Noche Obsidiana
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ——— SELLO DE MARCA SR ESSENCES ——— */}
        <div className="surface-card maison-frame p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div
              className="relative w-36 h-36 md:w-44 md:h-44 flex-shrink-0 overflow-hidden shadow-lg"
              style={{ border: '1px solid var(--border-gold)' }}
            >
              <Image
                src="/images/textures/fondo-beige.jpg"
                alt="SR Essences Sello Oficial"
                fill
                className="object-cover"
              />
            </div>

            <div className="flex-1 text-center md:text-left">
              <span
                className="font-sans text-[10px] font-medium tracking-[0.32em] uppercase block mb-2"
                style={{ color: 'var(--gold)' }}
              >
                SR Essences · {SR_CONTACT.subtitle}
              </span>
              <blockquote
                className="font-serif text-2xl md:text-3xl font-light italic leading-relaxed mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                &ldquo;{SR_CONTACT.tagline}&rdquo;
              </blockquote>
              <p className="font-sans text-xs font-light mb-5" style={{ color: 'var(--text-secondary)' }}>
                Atención personalizada para elegir tu próxima fragancia de diseñador o perfumería árabe importada.
              </p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <button
                  onClick={() => dispatch({ type: 'ENTER_UNIVERSE', department: 'dama' })}
                  className="btn-luxury py-2.5 px-5 text-[10px] cursor-pointer"
                >
                  ☀ Ver Catálogo Dama
                </button>
                <button
                  onClick={() => dispatch({ type: 'ENTER_UNIVERSE', department: 'caballero' })}
                  className="btn-ghost py-2.5 px-5 text-[10px] cursor-pointer"
                >
                  ☾ Ver Catálogo Caballero
                </button>
                <button
                  onClick={() => dispatch({ type: 'SET_VIEW', view: 'encyclopedia' })}
                  className="btn-ghost py-2.5 px-5 text-[10px] cursor-pointer"
                >
                  Enciclopedia 25K
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
