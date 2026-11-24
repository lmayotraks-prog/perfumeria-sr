// src/lib/whatsapp.ts — SR Essences · Contacto Oficial, Pagos y Enlaces Directos de WhatsApp

export const SR_CONTACT = {
  whatsappRaw: '573224671698',
  whatsappDisplay: '322 467 1698',
  instagramHandle: '@essences.sr',
  instagramUrl: 'https://www.instagram.com/essences.sr/',
  tagline: 'El arte del aroma en cada frasco',
  subtitle: 'Perfumería Importada',
  paymentMethods: ['Transferencia bancaria', 'Nequi', 'Daviplata', 'Bre-B'],
  purchaseStep: 'Escríbenos y solicita la referencia deseada. Te enviaremos un enlace para que puedas pagar tus productos.',
} as const;

export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${SR_CONTACT.whatsappRaw}?text=${encodeURIComponent(message)}`;
}

function getDeptLabel(perfume: { gender?: string; available?: boolean }): string {
  if (!perfume.available) return 'Enciclopedia';
  if (perfume.gender === 'femenino') return 'Dama';
  if (perfume.gender === 'masculino') return 'Caballero';
  return 'Unisex';
}

export function buildPerfumeWhatsAppUrl(
  perfume?: {
    name: string;
    brand: string;
    gender?: string;
    available?: boolean;
  } | null,
  sizeMl?: number
): string {
  if (!perfume) {
    return buildWhatsAppUrl(
      'Hola SR Essences! Me gustaría recibir asesoría para elegir un perfume de su catálogo disponible.'
    );
  }

  const dept = getDeptLabel(perfume);
  const sizePart = sizeMl ? ` (${sizeMl}ml)` : '';

  if (perfume.available) {
    return buildWhatsAppUrl(
      `Hola SR Essences! Me interesa comprar la referencia *${perfume.brand} — ${perfume.name}* [${dept}]${sizePart} que vi en su showroom web. ¿Me pueden enviar el precio y el enlace de pago?`
    );
  }

  return buildWhatsAppUrl(
    `Hola SR Essences! Vi la referencia *${perfume.brand} — ${perfume.name}* en su enciclopedia olfativa${sizePart}. ¿La tienen disponible o me pueden asesorar con una opción similar?`
  );
}

export function buildBagWhatsAppUrl(
  items: {
    perfume: {
      name: string;
      brand: string;
      gender?: string;
      available?: boolean;
    };
    sizeMl: 50 | 100;
    qty: number;
  }[]
): string {
  if (!items || items.length === 0) {
    return buildPerfumeWhatsAppUrl(null);
  }

  const lines = items.map(
    (item, idx) =>
      `${idx + 1}. *${item.perfume.brand} — ${item.perfume.name}* [${getDeptLabel(item.perfume)}] · ${item.sizeMl}ml × ${item.qty}`
  );

  const msg = [
    'Hola SR Essences! 👋 Quiero cotizar y solicitar enlace de pago para los siguientes perfumes:',
    '',
    ...lines,
    '',
    'Quedo atento(a) a precios y enlace de pago (Transferencia / Nequi / Daviplata / Bre-B). ✨',
  ].join('\n');

  return buildWhatsAppUrl(msg);
}
