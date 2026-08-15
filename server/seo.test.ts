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
