import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "./Footer";

describe("Footer service links", () => {
  it("renders every service as an actionable link", () => {
    render(<Footer />);

    const sellLink = screen.getByRole("link", { name: "Jual Properti" });
    const buyLink = screen.getByRole("link", { name: "Beli Properti" });
    const rentLink = screen.getByRole("link", { name: "Sewa Properti" });
    const consultationLink = screen.getByRole("link", { name: "Konsultasi Properti" });

    expect(sellLink.getAttribute("href")).toContain("wa.me/6282230357009");
    expect(buyLink.getAttribute("href")).toBe("/listing");
    expect(rentLink.getAttribute("href")).toContain("wa.me/6282230357009");
    expect(consultationLink.getAttribute("href")).toContain("wa.me/6282230357009");
  });
});
