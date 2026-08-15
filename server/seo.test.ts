import { afterEach, describe, expect, it } from "vitest";
import { seoMetadataUtils } from "./seo";

describe("canonical origin metadata SEO", () => {
  const originalCanonicalOrigin = process.env.CANONICAL_ORIGIN;

  afterEach(() => {
    if (originalCanonicalOrigin === undefined) {
      delete process.env.CANONICAL_ORIGIN;
      return;
    }
    process.env.CANONICAL_ORIGIN = originalCanonicalOrigin;
  });

  it("memakai domain publik dari request saat tidak ada konfigurasi eksplisit", () => {
    delete process.env.CANONICAL_ORIGIN;

    expect(
      seoMetadataUtils.resolveCanonicalOrigin("https://primedeal-jl8furcm.manus.space"),
    ).toBe("https://primedeal-jl8furcm.manus.space");
  });

  it("memprioritaskan konfigurasi canonical eksplisit dan menormalisasi garis miring", () => {
    process.env.CANONICAL_ORIGIN = "https://www.primedeal.example/";

    expect(
      seoMetadataUtils.resolveCanonicalOrigin("https://primedeal-jl8furcm.manus.space"),
    ).toBe("https://www.primedeal.example");
  });

  it("mengabaikan konfigurasi tidak valid tanpa menghilangkan canonical publik", () => {
    process.env.CANONICAL_ORIGIN = "bukan-url-valid";

    expect(
      seoMetadataUtils.resolveCanonicalOrigin("https://primedeal-jl8furcm.manus.space"),
    ).toBe("https://primedeal-jl8furcm.manus.space");
  });
});

describe("metadata listing untuk pencarian non-merek", () => {
  const gunawangsaListing = {
    title: "Gunawangsa Manyar 2BR Furnished dekat Unair, ITS, Merr",
    description: "Tower A lantai 9 dengan view city dan fasilitas unit lengkap.",
    propertyType: "apartemen",
    transactionType: "dijual",
    price: 300000000,
    location: "Manyar, Surabaya",
    area: 36,
    bedrooms: 2,
    bathrooms: 1,
    condition: "Furnished",
  };

  it("menempatkan tipe, transaksi, proyek, lokasi, dan merek dalam title yang natural", () => {
    expect(seoMetadataUtils.buildListingTitle(gunawangsaListing)).toBe(
      "Dijual Apartemen Gunawangsa Manyar 2BR Furnished dekat Unair, ITS, Merr di Manyar, Surabaya | Primedeal Properti",
    );
  });

  it("menempatkan fakta yang dicari pembeli pada awal meta description", () => {
    const description = seoMetadataUtils.buildListingDescription(gunawangsaListing);

    expect(description).toContain("Dijual apartemen Gunawangsa Manyar 2BR Furnished dekat Unair, ITS, Merr di Manyar, Surabaya.");
    expect(description).toContain("2 kamar tidur, 1 kamar mandi, luas 36 m², kondisi Furnished.");
    expect(description).toMatch(/Harga Rp\s?300\.000\.000\./);
  });
});
