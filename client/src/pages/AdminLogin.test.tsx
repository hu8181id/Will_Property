import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import AdminLogin from "./AdminLogin";

const mocks = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  invalidate: vi.fn().mockResolvedValue(undefined),
  setLocation: vi.fn(),
}));

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    logout: vi.fn(),
  }),
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ auth: { me: { invalidate: mocks.invalidate } } }),
    auth: {
      adminLogin: {
        useMutation: (options: { onSuccess?: (data: unknown) => unknown; onError?: (error: Error) => void }) => ({
          isPending: false,
          mutateAsync: async (input: unknown) => {
            try {
              const result = await mocks.mutateAsync(input);
              await options.onSuccess?.(result);
              return result;
            } catch (error) {
              options.onError?.(error as Error);
              throw error;
            }
          },
        }),
      },
    },
  },
}));

vi.mock("wouter", () => ({
  useLocation: () => ["/admin", mocks.setLocation],
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("AdminLogin", () => {
  it("submits admin credentials without using Manus OAuth", async () => {
    mocks.mutateAsync.mockResolvedValue({ success: true });
    render(<AdminLogin />);

    fireEvent.change(screen.getByLabelText(/username admin/i), { target: { value: "owner" } });
    fireEvent.change(screen.getByLabelText(/password admin/i), { target: { value: "strong-password" } });
    fireEvent.submit(screen.getByRole("button", { name: /login ke akun admin/i }).closest("form")!);

    await waitFor(() => expect(mocks.mutateAsync).toHaveBeenCalledWith({
      username: "owner",
      password: "strong-password",
    }));
    expect(mocks.invalidate).toHaveBeenCalledTimes(1);
  });

  it("shows a useful error when standalone credentials are rejected", async () => {
    mocks.mutateAsync.mockRejectedValue(new Error("Username atau password admin salah."));
    render(<AdminLogin />);

    fireEvent.change(screen.getByLabelText(/username admin/i), { target: { value: "owner" } });
    fireEvent.change(screen.getByLabelText(/password admin/i), { target: { value: "wrong" } });
    fireEvent.submit(screen.getByRole("button", { name: /login ke akun admin/i }).closest("form")!);

    await waitFor(() => expect(screen.getByRole("alert").textContent).toMatch(/username atau password admin salah/i));
  });
});
