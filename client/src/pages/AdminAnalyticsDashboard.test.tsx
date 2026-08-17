import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const setLocation = vi.fn();

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({ user: { role: "admin" }, loading: false }),
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    analytics: {
      dailySummary: {
        useQuery: () => ({
          data: {
            period: { startDate: "2026-08-07", endDate: "2026-08-13" },
            totalVisitors: 15,
            websiteVisitors: 9,
            apkVisitors: 4,
            unknownVisitors: 2,
            averageDailyVisitors: 2.1,
            days: [
              { visitDate: "2026-08-07", visitors: 1 },
              { visitDate: "2026-08-08", visitors: 2 },
              { visitDate: "2026-08-09", visitors: 0 },
              { visitDate: "2026-08-10", visitors: 3 },
              { visitDate: "2026-08-11", visitors: 2 },
              { visitDate: "2026-08-12", visitors: 3 },
              { visitDate: "2026-08-13", visitors: 4 },
            ],
          },
          isLoading: false,
          isError: false,
          isFetching: false,
          refetch: vi.fn(),
        }),
      },
      popularContent: {
        useQuery: () => ({
          data: {
            period: { startDate: "2026-08-07", endDate: "2026-08-13" },
            pages: [{ path: "/kalkulator", contentTitle: "Kalkulator KPR", propertyId: null, views: 8 }],
            listings: [{ path: "/listing/7", contentTitle: "Rumah Contoh Surabaya", propertyId: 7, views: 5 }],
          },
          isLoading: false,
          isError: false,
          isFetching: false,
          refetch: vi.fn(),
        }),
      },
    },
    property: {
      listWhatsAppLeads: {
        useQuery: () => ({
          data: [],
          isLoading: false,
          isError: false,
          isFetching: false,
          refetch: vi.fn(),
        }),
      },
    },
  },
}));

vi.mock("wouter", () => ({ useLocation: () => ["/admin/dashboard", setLocation] }));

import AdminAnalyticsDashboard from "./AdminAnalyticsDashboard";

describe("AdminAnalyticsDashboard", () => {
  it("menampilkan ringkasan dan tren pengunjung untuk admin", () => {
    render(<AdminAnalyticsDashboard />);

    expect(screen.getByRole("heading", { name: /ringkasan pengunjung/i })).toBeTruthy();
    expect(screen.getByText("Total Pengunjung Periode")).toBeTruthy();
    expect(screen.getByText("Rata-rata per Hari")).toBeTruthy();
    expect(screen.getByText("Website")).toBeTruthy();
    expect(screen.getByText("APK Primedeal")).toBeTruthy();
    expect(screen.getByText("Belum Teridentifikasi")).toBeTruthy();
    expect(screen.getByText("9")).toBeTruthy();
    expect(screen.getAllByText("4").length).toBeGreaterThan(0);
    expect(screen.getByText("15")).toBeTruthy();
    expect(screen.getByText("Tren kunjungan periode terpilih")).toBeTruthy();
    expect(screen.getByLabelText("Tanggal mulai")).toBeTruthy();
    expect(screen.getByLabelText("Tanggal akhir")).toBeTruthy();
    expect(screen.getByRole("button", { name: "30 Hari" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Halaman Terpopuler" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Listing Terpopuler" })).toBeTruthy();
    expect(screen.getByText("Kalkulator KPR")).toBeTruthy();
    expect(screen.getByText("Rumah Contoh Surabaya")).toBeTruthy();
    expect(screen.getByRole("link", { name: /buka laporan admob/i })).toHaveProperty("href", "https://apps.admob.com/");
  });
});
