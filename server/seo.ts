import { eq } from "drizzle-orm";
import { propertyListings } from "../drizzle/schema";
import { getDb } from "./db";

const SITE_NAME = "Primedeal Properti";
const DEFAULT_TITLE = "Primedeal - Agensi Properti Modern & Jual Beli Rumah Terbaik di Surabaya";
const DEFAULT_DESCRIPTION = "Temukan properti impian Anda di Surabaya bersama Primedeal Properti. Jual beli rumah, apartemen, ruko, dan tanah dengan mudah, aman, serta konsultasi WhatsApp langsung.";
const DEFAULT_ORIGIN = "https://primedeal.manus.space";

function escapeHtml(value: string) {
  return value.replace(/[&<>\"']/g, character => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '\"': "&quot;",
      "'": "&#39;",
    };
    return entities[character] ?? character;
  });
}

function absoluteAssetUrl(value: string | undefined, origin: string) {
  if (!value) return `${origin}/favicon.ico`;
  if (/^https?:\/\//i.test(value)) return value;
  return `${origin}${value.startsWith("/") ? value : `/${value}`}`;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price);
}

function replaceOrInsert(html: string, pattern: RegExp, tag: string) {
  if (pattern.test(html)) return html.replace(pattern, tag);
  return html.replace("</head>", `  ${tag}\n</head>`);
}

function replaceMeta(html: string, attribute: "name" | "property", key: string, value: string) {
  const safeKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`<meta\\s+[^>]*${attribute}=[\\\"']${safeKey}[\\\"'][^>]*>`, "i");
  const tag = `<meta ${attribute}="${key}" content="${escapeHtml(value)}" />`;
  return replaceOrInsert(html, pattern, tag);
}

function applyHead(html: string, meta: {
  title: string;
  description: string;
  canonical: string;
  image: string;
  imageAlt: string;
  jsonLd?: object;
}) {
  let output = html.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(meta.title)}</title>`);
  output = replaceOrInsert(output, /<title>[^<]*<\/title>/i, `<title>${escapeHtml(meta.title)}</title>`);

  output = replaceMeta(output, "name", "description", meta.description);
  output = replaceMeta(output, "property", "og:type", "website");
  output = replaceMeta(output, "property", "og:url", meta.canonical);
  output = replaceMeta(output, "property", "og:title", meta.title);
  output = replaceMeta(output, "property", "og:description", meta.description);
  output = replaceMeta(output, "property", "og:image", meta.image);
  output = replaceMeta(output, "property", "og:image:alt", meta.imageAlt);
  output = replaceMeta(output, "name", "twitter:card", "summary_large_image");
  output = replaceMeta(output, "name", "twitter:title", meta.title);
  output = replaceMeta(output, "name", "twitter:description", meta.description);
  output = replaceMeta(output, "name", "twitter:image", meta.image);

  const canonicalPattern = /<link\s+[^>]*rel=['"]canonical['"][^>]*>/i;
  output = replaceOrInsert(output, canonicalPattern, `<link rel="canonical" href="${escapeHtml(meta.canonical)}" />`);

  if (meta.jsonLd) {
    const jsonScript = `<script type="application/ld+json">${JSON.stringify(meta.jsonLd)}</script>`;
    output = output.replace("</head>", `  ${jsonScript}\n</head>`);
  }

  return output;
}

export async function injectSeoMetadata(html: string, requestUrl: string, _origin?: string) {
  const canonicalOrigin = (process.env.CANONICAL_ORIGIN || DEFAULT_ORIGIN).replace(/\/$/, "");
  const fallback = {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    canonical: `${canonicalOrigin}/`,
    image: `${canonicalOrigin}/favicon.ico`,
    imageAlt: `${SITE_NAME} - agensi properti Surabaya`,
  };

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(requestUrl, canonicalOrigin);
  } catch {
    return applyHead(html, fallback);
  }

  if (parsedUrl.pathname !== "/listing") {
    return applyHead(html, fallback);
  }

  const rawId = parsedUrl.searchParams.get("property");
  const propertyId = rawId ? Number(rawId) : NaN;
  if (!Number.isInteger(propertyId) || propertyId <= 0) {
    return applyHead(html, fallback);
  }

  try {
    const db = await getDb();
    if (!db) return applyHead(html, fallback);
    const rows = await db
      .select()
      .from(propertyListings)
      .where(eq(propertyListings.id, propertyId))
      .limit(1);
    const property = rows[0];
    if (!property) return applyHead(html, fallback);

    const title = `${property.title} | Primedeal Properti`;
    const details = `${property.location} • ${formatPrice(property.price)} • ${property.propertyType}`;
    const description = `${property.description.slice(0, 170)}${property.description.length > 170 ? "…" : ""} ${details}. Konsultasi melalui WhatsApp Primedeal.`;
    const canonical = `${canonicalOrigin}/listing?property=${property.id}`;
    const image = absoluteAssetUrl(property.images?.[0], canonicalOrigin);
    
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "RealEstateListing",
      "name": property.title,
      "description": property.description,
      "url": canonical,
      "image": property.images?.map(img => absoluteAssetUrl(img, canonicalOrigin)) || [image],
      "price": property.price,
      "priceCurrency": "IDR",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": property.location,
        "addressCountry": "ID"
      }
    };

    return applyHead(html, { title, description, canonical, image, imageAlt: property.title, jsonLd });
  } catch (error) {
    console.warn("[SEO] Falling back to default metadata:", error);
    return applyHead(html, fallback);
  }
}
