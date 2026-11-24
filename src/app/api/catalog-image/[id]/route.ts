// src/app/api/catalog-image/[id]/route.ts
// Sirve la fotografía HD del perfume (caché local HD -> descarga en línea -> fallback local)
import { NextRequest } from 'next/server';
import { isKnownCatalogPerfumeId, resolveCatalogImage } from '@/lib/catalogImageFetcher';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  if (!id || !isKnownCatalogPerfumeId(id)) {
    return new Response('Not Found', { status: 404 });
  }

  const resolved = await resolveCatalogImage(id);
  if (!resolved) {
    return new Response('Image Unavailable', { status: 404 });
  }

  const cacheControl =
    resolved.source === 'local-fallback'
      ? 'public, max-age=60, must-revalidate'
      : 'public, max-age=86400, stale-while-revalidate=604800';

  return new Response(new Uint8Array(resolved.buffer), {
    status: 200,
    headers: {
      'Content-Type': resolved.contentType,
      'Cache-Control': cacheControl,
      'X-Image-Source': resolved.source,
    },
  });
}
