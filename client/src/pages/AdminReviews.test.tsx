// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AdminReviews from "./AdminReviews";

const mocks = vi.hoisted(() => ({
  auth: { user: { role: "admin", name: "Admin Primedeal" }, loading: false },
  query: { data: [] as any[], isLoading: false, isError: false },
  mutation: { isPending: false, mutateAsync: vi.fn() },
  invalidate: vi.fn(),
  setLocation: vi.fn(),
}));

vi.mock("@/_core/hooks/useAuth", () => ({ useAuth: vi.fn(() => mocks.auth) }));
vi.mock("wouter", () => ({ useLocation: vi.fn(() => ["/admin/reviews", mocks.setLocation]) }));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    property: {
      listPendingReviews: { useQuery: vi.fn(() => mocks.query) },
      moderateReview: { useMutation: vi.fn(() => mocks.mutation) },
    },
    useUtils: vi.fn(() => ({
      property: { listPendingReviews: { invalidate: mocks.invalidate } },
    })),
  },
}));

describe("AdminReviews", () => {
  afterEach(() => cleanup());
  beforeEach(() => {
    mocks.auth = { user: { role: "admin", name: "Admin Primedeal" }, loading: false };
    mocks.query = { data: [] as any[], isLoading: false, isError: false };
    mocks.mutation.isPending = false;
    mocks.mutation.mutateAsync.mockReset();
    mocks.mutation.mutateAsync.mockResolvedValue({ success: true });
    mocks.invalidate.mockReset();
    mocks.setLocation.mockReset();
  });

  it("shows the empty moderation queue without inventing reviews", () => {
    render(<AdminReviews />);
    expect(screen.getByText("Belum ada ulasan yang menunggu moderasi")).toBeInTheDocument();
  });

  it("approves and rejects pending reviews through the protected mutation", async () => {
    mocks.query.data = [
      {
        id: 44,
        propertyId: 12,
        propertyTitle: "Apartemen Surabaya",
        authorName: "Andi Pratama",
        rating: 4,
        comment: "Lokasinya mudah dijangkau.",
        reviewStatus: "pending",
        createdAt: new Date("2026-08-12T00:00:00.000Z"),
      },
    ];
    render(<AdminReviews />);

    fireEvent.click(screen.getByRole("button", { name: /Setujui/i }));
    await waitFor(() => expect(mocks.mutation.mutateAsync).toHaveBeenCalledWith({ reviewId: 44, status: "approved" }));

    fireEvent.click(screen.getByRole("button", { name: /Tolak/i }));
    await waitFor(() => expect(mocks.mutation.mutateAsync).toHaveBeenLastCalledWith({ reviewId: 44, status: "rejected" }));
    expect(mocks.invalidate).toHaveBeenCalled();
  });

  it("blocks non-admin users from the moderation view", () => {
    mocks.auth = { user: { role: "user", name: "Pengunjung" }, loading: false };
    render(<AdminReviews />);
    expect(screen.getByText("Akses terbatas")).toBeInTheDocument();
    expect(screen.queryByText("Belum ada ulasan yang menunggu moderasi")).not.toBeInTheDocument();
  });
});
