import { describe, expect, it } from "vitest";
import { buildPropertySlug, propertyDetailPath, slugifyPropertyTitle } from "./propertySlug";

describe("property slug URL", () => {
  it("membuat slug stabil dari judul Indonesia dan ID listing", () => {
    expect(buildPropertySlug("Gunawangsa Manyar 2BR Furnished dekat Unair, ITS & Merr", 360001)).toBe(
      "gunawangsa-manyar-2br-furnished-dekat-unair-its-merr-360001",
    );
  });

  it("menghasilkan URL detail slug dan mempertahankan slug tersimpan bila tersedia", () => {
    expect(propertyDetailPath({ id: 360001, title: "Gunawangsa Manyar 2BR" })).toBe(
      "/properti/gunawangsa-manyar-2br-360001",
    );
    expect(propertyDetailPath({ id: 360001, title: "Judul baru", slug: "gunawangsa-manyar-2br-360001" })).toBe(
      "/properti/gunawangsa-manyar-2br-360001",
    );
  });

  it("menyediakan fallback aman untuk judul tanpa karakter URL", () => {
    expect(slugifyPropertyTitle("   ")).toBe("");
    expect(buildPropertySlug("   ", 12)).toBe("properti-12");
  });
});
