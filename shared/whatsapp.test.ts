import { describe, expect, it } from "vitest";
import { buildWhatsAppPropertyMessage, buildWhatsAppPropertyUrl, PRIDEAL_AGENT_WHATSAPP_PHONE } from "./whatsapp";

describe("WhatsApp property lead helper", () => {
  const property = {
    title: "Rumah Nyaman di Depok",
    location: "Depok, Jawa Barat",
    price: 850000000,
    transactionType: "dijual",
    propertyType: "rumah",
    listingUrl: "https://primedeal-property.vercel.app/properti/rumah-nyaman-di-depok-450001",
  };

  it("builds a readable property-specific message", () => {
    const message = buildWhatsAppPropertyMessage(property);
    expect(message).toContain(property.title);
    expect(message).toContain("Rp 850.000.000");
    expect(message).toContain(property.listingUrl);
    expect(message).toContain("Mohon informasi lebih lanjut");
  });

  it("builds a direct agent WhatsApp URL with encoded message", () => {
    const url = buildWhatsAppPropertyUrl(property);
    expect(url.startsWith(`https://wa.me/${PRIDEAL_AGENT_WHATSAPP_PHONE}?text=`)).toBe(true);
    expect(decodeURIComponent(url.split("?text=")[1])).toContain(property.listingUrl);
  });
});
