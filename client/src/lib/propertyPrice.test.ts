import { describe, expect, it } from "vitest";
import { formatPriceShort } from "./propertyPrice";

describe("formatPriceShort", () => {
  it("menulis harga juta dan miliar dengan singkat dalam format Indonesia", () => {
    expect(formatPriceShort(325_000_000)).toBe("Rp325 jt");
    expect(formatPriceShort(2_500_000_000)).toBe("Rp2,5 M");
  });

  it("menangani angka kecil dan nilai yang tidak valid secara aman", () => {
    expect(formatPriceShort(750_000)).toBe("Rp750 rb");
    expect(formatPriceShort(0)).toBe("Rp0");
    expect(formatPriceShort(Number.NaN)).toBe("Rp0");
  });
});
