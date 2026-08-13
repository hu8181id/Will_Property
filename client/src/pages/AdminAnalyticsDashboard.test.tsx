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
            today: 4,
            last7Days: 15,
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
    },
  },
}));

vi.mock("wouter", () => ({ useLocation: () => ["/admin/dashboard", setLocation] }));

import AdminAnalyticsDashboard from "./AdminAnalyticsDashboard";

describe("AdminAnalyticsDashboard", () => {
  it("menampilkan ringkasan dan tren pengunjung untuk admin", () => {
    render(<AdminAnalyticsDashboard />);

    expect(screen.getByRole("heading", { name: /ringkasan pengunjung/i })).toBeTruthy();
    expect(screen.getByText("Pengunjung Hari Ini")).toBeTruthy();
    expect(screen.getByText("Total 7 Hari Terakhir")).toBeTruthy();
    expect(screen.getByText("15")).toBeTruthy();
    expect(screen.getByText("Tren kunjungan 7 hari")).toBeTruthy();
  });
});
