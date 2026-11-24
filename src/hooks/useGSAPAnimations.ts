'use client';
// src/hooks/useGSAPAnimations.ts
// Animaciones GSAP con ScrollTrigger para toda la web

import { useEffect, useRef } from 'react';

export function useRevealOnScroll(selector: string, options?: {
  stagger?: number;
  y?: number;
  duration?: number;
  delay?: number;
}) {
  useEffect(() => {
    // Lazy import GSAP para evitar SSR issues
    let ctx: { revert?: () => void } = {};

    const init = async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      const elements = document.querySelectorAll(selector);
      if (!elements.length) return;

      const tl = gsap.fromTo(
        elements,
        {
          opacity: 0,
          y: options?.y ?? 50,
          filter: 'blur(4px)',
        },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: options?.duration ?? 1.1,
          stagger: options?.stagger ?? 0.12,
          delay: options?.delay ?? 0,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: elements[0] as Element,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      ctx = { revert: () => tl.kill() };
    };

    init();
    return () => ctx.revert?.();
  }, [selector, options?.stagger, options?.y, options?.duration, options?.delay]);
}

// Hook para el hero — animación de entrada al cargar
export function useHeroEntrance() {
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const init = async () => {
      const { gsap } = await import('gsap');

      const tl = gsap.timeline({ delay: 0.3 });

      tl.fromTo(
        '[data-hero-pretitle]',
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' }
      )
        .fromTo(
          '[data-hero-title]',
          { opacity: 0, y: 40, filter: 'blur(8px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.2, ease: 'power3.out' },
          '-=0.4'
        )
        .fromTo(
          '[data-hero-desc]',
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out' },
          '-=0.6'
        )
        .fromTo(
          '[data-hero-card]',
          { opacity: 0, y: 20, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'back.out(1.4)' },
          '-=0.5'
        )
        .fromTo(
          '[data-hero-ctas]',
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' },
          '-=0.5'
        )
        .fromTo(
          '[data-hero-stats]',
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
          '-=0.4'
        );
    };

    init();
  }, []);
}

// Hook para el parallax del viewer 3D
export function useViewerParallax(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!ref.current) return;
    let ctx: { revert?: () => void } = {};

    const init = async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      if (!ref.current) return;

      const anim = gsap.to(ref.current, {
        yPercent: -15,
        ease: 'none',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      ctx = { revert: () => anim.kill() };
    };

    init();
    return () => ctx.revert?.();
  }, [ref]);
}
