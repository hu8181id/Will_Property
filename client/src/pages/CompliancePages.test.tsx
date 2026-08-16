import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Privacy from "./Privacy";
import Terms from "./Terms";

vi.mock("@/components/Header", () => ({ default: () => <header>Header</header> }));
vi.mock("@/components/Footer", () => ({ default: () => <footer>Footer</footer> }));

describe("halaman kepatuhan Primedeal", () => {
  it("menampilkan kebijakan privasi, analitik, dan kontak WhatsApp", () => {
    render(<Privacy />);

    expect(screen.getByRole("heading", { name: "Kebijakan Privasi" })).not.toBeNull();
    expect(screen.getByText(/Google Analytics/i)).not.toBeNull();
    expect(screen.getByRole("link", { name: "0822-3035-7009" }).getAttribute("href")).toBe(
      "https://wa.me/6282230357009"
    );
  });

  it("menampilkan ketentuan penggunaan dan anjuran verifikasi properti", () => {
    render(<Terms />);

    expect(screen.getByRole("heading", { name: "Syarat & Ketentuan" })).not.toBeNull();
    expect(screen.getByText(/verifikasi dokumen dan kondisi properti/i)).not.toBeNull();
  });
});
