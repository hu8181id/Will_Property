import { describe, expect, it } from "vitest";
import { generatePropertySeoDraft } from "./propertySeoTemplate";

describe("generatePropertySeoDraft", () => {
  it("membuat judul dan deskripsi spesifik dari data apartemen", () => {
    const draft = generatePropertySeoDraft({
      title: "Gunawangsa Manyar 2BR Furnished dekat Unair & ITS",
      propertyType: "apartemen",
      transactionType: "dijual",
      price: "300000000",
      location: "Manyar, Surabaya",
      address: "Tower A, Gunawangsa Manyar",
      area: "36",
      bedrooms: "2",
      bathrooms: "1",
      condition: "Fully furnished",
      facilities: "Kolam renang, gym",
    });

    expect(draft.title).toBe("Dijual Apartemen Gunawangsa Manyar 2BR Furnished dekat Unair & ITS di Manyar, Surabaya | Primedeal");
    expect(draft.description).toContain("2 kamar tidur, 1 kamar mandi, luas 36 m², kondisi Fully furnished.");
    expect(draft.description).toContain("Harga Rp300.000.000.");
    expect(draft.description).toContain("Hubungi Primedeal untuk detail unit dan jadwal survei.");
  });

  it("tetap menghasilkan template yang rapi bila detail opsional belum diisi", () => {
    const draft = generatePropertySeoDraft({
      title: "Rumah Rungkut",
      propertyType: "rumah",
      transactionType: "disewa",
      price: "",
      location: "Surabaya",
      address: "",
      area: "",
      bedrooms: "",
      bathrooms: "",
      condition: "",
      facilities: "",
    });

    expect(draft.title).toBe("Disewa Rumah Rumah Rungkut di Surabaya | Primedeal");
    expect(draft.description).toBe("Disewa rumah Rumah Rungkut di Surabaya. Hubungi Primedeal untuk detail unit dan jadwal survei.");
  });
});
