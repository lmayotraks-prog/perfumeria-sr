'use client';
// src/components/ui/CatalogBottleImage.tsx — Vitrina editorial HD con shimmer y fallback seguro
import { useState, useEffect, useRef } from 'react';
import { Perfume } from '@/types';
import { HD_CATALOG_IMAGES } from '@/data/hdCatalogImages';
import { withBasePath } from '@/lib/assetPath';

interface CatalogBottleImageProps {
  perfume: Perfume;
  className?: string;
  compact?: boolean;
}

export default function CatalogBottleImage({
  perfume,
  className = '',
  compact = false,
}: CatalogBottleImageProps) {
  const deptFolder = perfume.gender === 'femenino' ? 'dama' : 'caballero';
  const fallbackSrc = perfume.available
    ? withBasePath(`/images/catalog/${deptFolder}/${perfume.id}.png`)
    : withBasePath(perfume.imageUrl || '');
  const staticHdSrc = HD_CATALOG_IMAGES[perfume.id]
    ? withBasePath(HD_CATALOG_IMAGES[perfume.id])
    : '';
  const primarySrc = staticHdSrc || fallbackSrc;

  const imgRef = useRef<HTMLImageElement>(null);
  const [src, setSrc] = useState(primarySrc);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setSrc(primarySrc);
    setLoaded(false);
    setFailed(false);
  }, [primarySrc]);

  // Si la imagen ya está en caché del navegador antes de montar el listener onLoad
  useEffect(() => {
    const el = imgRef.current;
    if (el && el.complete && el.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [src]);

  if (!src || failed) {
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center ${className}`}>
        <span className="font-serif text-2xl text-gold opacity-75">SR</span>
        {!compact && (
          <span className="font-sans text-[9px] tracking-[0.22em] uppercase opacity-60 mt-1 text-[#5c5143]">
            {perfume.brand}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full flex items-center justify-center ${className}`}>
      {!loaded && (
        <div
          className="absolute inset-0 luxury-shimmer"
          aria-hidden
        />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt={`${perfume.brand} ${perfume.name}`}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (src !== fallbackSrc && fallbackSrc) {
            setSrc(fallbackSrc);
          } else {
            setFailed(true);
          }
        }}
        className={`max-h-full max-w-full object-contain mix-blend-multiply transition-all duration-500 ${
          loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.97]'
        } ${compact ? '' : 'group-hover:scale-[1.06]'}`}
      />
    </div>
  );
}
