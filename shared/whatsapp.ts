export const PRIDEAL_AGENT_WHATSAPP_PHONE = "6282230357009";

export type WhatsAppPropertyLead = {
  title: string;
  location: string;
  price: number;
  transactionType: string;
  propertyType: string;
  listingUrl: string;
};

export function formatWhatsAppPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price);
}

export function buildWhatsAppPropertyMessage(property: WhatsAppPropertyLead) {
  return [
    `Halo Primedeal, saya tertarik dengan listing "${property.title}".`,
    `Lokasi: ${property.location}`,
    `Harga: ${formatWhatsAppPrice(property.price)}`,
    `Tipe: ${property.transactionType.toUpperCase()} - ${property.propertyType}`,
    "",
    "Mohon informasi lebih lanjut dan jadwal kunjungan jika tersedia.",
    `Link listing: ${property.listingUrl}`,
  ].join("\n");
}

export function buildWhatsAppPropertyUrl(property: WhatsAppPropertyLead) {
  const message = buildWhatsAppPropertyMessage(property);
  return `https://wa.me/${PRIDEAL_AGENT_WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}
