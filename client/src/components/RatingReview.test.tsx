// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import RatingReview from "./RatingReview";

const mocks = vi.hoisted(() => ({
  query: {
    data: { reviews: [], averageRating: 0, reviewCount: 0 },
    isLoading: false,
    isError: false,
  },
  mutation: {
    isPending: false,
    mutateAsync: vi.fn(),
  },
  invalidate: vi.fn(),
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    property: {
      listReviews: { useQuery: vi.fn(() => mocks.query) },
      addReview: { useMutation: vi.fn(() => mocks.mutation) },
    },
    useUtils: vi.fn(() => ({
      property: { listReviews: { invalidate: mocks.invalidate } },
    })),
  },
}));

describe("RatingReview", () => {
  afterEach(() => cleanup());
  beforeEach(() => {
    mocks.query.data = { reviews: [], averageRating: 0, reviewCount: 0 };
    mocks.query.isLoading = false;
    mocks.query.isError = false;
    mocks.mutation.isPending = false;
    mocks.mutation.mutateAsync.mockReset();
    mocks.mutation.mutateAsync.mockResolvedValue({ success: true, status: "pending" });
    mocks.invalidate.mockReset();
  });

  const renderDialog = () => render(
    <RatingReview propertyId={12} open onOpenChange={vi.fn()} />,
  );

  it("shows an honest empty state when there are no approved reviews", () => {
    renderDialog();
    expect(screen.getByText("Belum ada rating. Jadilah yang pertama memberikan ulasan.")).toBeInTheDocument();
    expect(screen.getByText("Belum ada ulasan yang disetujui.")).toBeInTheDocument();
  });

  it("shows loading and error states from the review query", () => {
    mocks.query.isLoading = true;
    const { rerender } = renderDialog();
    expect(screen.getByText("Memuat...")).toBeInTheDocument();

    mocks.query.isLoading = false;
    mocks.query.isError = true;
    rerender(<RatingReview propertyId={12} open onOpenChange={vi.fn()} />);
    expect(screen.getByText("Ulasan belum dapat dimuat. Silakan coba lagi.")).toBeInTheDocument();
  });

  it("submits a valid review and sends it to pending moderation", async () => {
    renderDialog();
    fireEvent.change(screen.getByLabelText("Nama Anda"), { target: { value: "Andi Pratama" } });
    fireEvent.click(screen.getByRole("radio", { name: "4 bintang" }));
    fireEvent.change(screen.getByLabelText("Ceritakan pengalaman Anda"), { target: { value: "Lokasi properti sangat strategis." } });
    const form = screen.getByRole("button", { name: "Kirim Ulasan" }).closest("form");
    fireEvent.submit(form!);

    await waitFor(() => expect(mocks.mutation.mutateAsync).toHaveBeenCalledWith({
      propertyId: 12,
      authorName: "Andi Pratama",
      rating: 4,
      comment: "Lokasi properti sangat strategis.",
    }));
    expect(mocks.invalidate).toHaveBeenCalledWith({ propertyId: 12 });
  });

  it("does not submit invalid short review content", async () => {
    renderDialog();
    fireEvent.change(screen.getByLabelText("Nama Anda"), { target: { value: "A" } });
    fireEvent.change(screen.getByLabelText("Ceritakan pengalaman Anda"), { target: { value: "Bagus" } });
    const form = screen.getByRole("button", { name: "Kirim Ulasan" }).closest("form");
    fireEvent.submit(form!);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(mocks.mutation.mutateAsync).not.toHaveBeenCalled();
  });
});
