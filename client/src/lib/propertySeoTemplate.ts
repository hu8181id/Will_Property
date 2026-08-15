export interface PropertySeoTemplateFields {
  title: string;
  propertyType: string;
  transactionType: string;
  price: string;
  location: string;
  address: string;
  area: string;
  bedrooms: string;
  bathrooms: string;
  condition: string;
  facilities: string;
}

export interface PropertySeoDraft {
  title: string;
  description: string;
}

const propertyTypeLabels: Record<string, string> = {
  rumah: "Rumah",
  apartemen: "Apartemen",
  ruko: "Ruko",
  tanah: "Tanah",
  lainnya: "Properti",
};

function cleanText(value: string | undefined) {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function formatPrice(value: string) {
  const numericValue = Number(value.replace(/[^0-9]/g, ""));
  if (!Number.isFinite(numericValue) || numericValue <= 0) return "";
  return `Rp${new Intl.NumberFormat("id-ID").format(numericValue)}`;
}

function removeBrand(value: string) {
  return cleanText(value.replace(/\s*[|–-]\s*Primedeal\s*$/i, ""));
}

export function generatePropertySeoDraft(fields: PropertySeoTemplateFields): PropertySeoDraft {
  const type = propertyTypeLabels[fields.propertyType] ?? "Properti";
  const transaction = fields.transactionType === "disewa" ? "Disewa" : "Dijual";
  const existingTitle = removeBrand(fields.title);
  const location = cleanText(fields.location);
  const address = cleanText(fields.address);
  const titleSubject = existingTitle || [type, location].filter(Boolean).join(" di ") || type;
  const titleLocation = location && !existingTitle.toLocaleLowerCase("id-ID").includes(location.toLocaleLowerCase("id-ID")) ? ` di ${location}` : "";
  const seoTitle = `${transaction} ${type} ${titleSubject}${titleLocation} | Primedeal`.replace(/\s+/g, " ").trim();

  const specifications = [
    fields.bedrooms && `${cleanText(fields.bedrooms)} kamar tidur`,
    fields.bathrooms && `${cleanText(fields.bathrooms)} kamar mandi`,
    fields.area && `luas ${cleanText(fields.area)} m²`,
  ].filter(Boolean);
  const condition = cleanText(fields.condition);
  const price = formatPrice(fields.price);
  const facilities = cleanText(fields.facilities);

  const opening = `${transaction} ${type.toLocaleLowerCase("id-ID")} ${existingTitle ? `${existingTitle} ` : ""}${location ? `di ${location}` : ""}`.replace(/\s+/g, " ").trim();
  const detailSentence = specifications.length ? `${specifications.join(", ")}${condition ? `, kondisi ${condition}` : ""}.` : condition ? `Kondisi ${condition}.` : "";
  const locationSentence = address ? `Berlokasi di ${address}.` : "";
  const facilitiesSentence = facilities ? `Fasilitas: ${facilities}.` : "";
  const priceSentence = price ? `Harga ${price}.` : "";
  const description = [opening ? `${opening}.` : "", detailSentence, locationSentence, facilitiesSentence, priceSentence, "Hubungi Primedeal untuk detail unit dan jadwal survei."].filter(Boolean).join(" ");

  return { title: seoTitle, description };
}
