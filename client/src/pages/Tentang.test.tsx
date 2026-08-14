// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Tentang from "./Tentang";

vi.mock("@/components/Header", () => ({ default: () => <header>Header</header> }));
vi.mock("@/components/Footer", () => ({ default: () => <footer>Footer</footer> }));

describe("Tentang", () => {
  afterEach(() => cleanup());

  it("menampilkan 400+ properti tanpa klaim sertifikasi atau jumlah agen", () => {
    render(<Tentang />);

    expect(screen.getByText("400+")).toBeInTheDocument();
    expect(screen.getByText("Properti Terjual")).toBeInTheDocument();
    expect(screen.queryByText(/agen properti bersertifikat/i)).not.toBeInTheDocument();
    expect(screen.queryByText("Agen Profesional")).not.toBeInTheDocument();
    expect(screen.queryByText("50+")).not.toBeInTheDocument();
  });
});
