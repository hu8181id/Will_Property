import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import AdminLogin from "./AdminLogin";

const mocks = vi.hoisted(() => ({
  invalidate: vi.fn().mockResolvedValue(undefined),
  setLocation: vi.fn(),
  mutate: vi.fn(),
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
    adminAuth: {
      checkConfig: {
        useQuery: () => ({ data: { configured: true, hasUsername: true, hasPassword: true } }),
      },
      login: {
        useMutation: (opts: { onSuccess?: () => void; onError?: (err: Error) => void }) => ({
          mutate: (input: { username: string; password: string }) => {
            mocks.mutate(input);
            if (input.password === "wrong") {
              opts.onError?.(new Error("Username atau password admin salah."));
            } else {
              opts.onSuccess?.();
            }
          },
          isLoading: false,
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
  it("submits admin credentials via tRPC adminAuth.login mutation", async () => {
    render(<AdminLogin />);

    fireEvent.change(screen.getByLabelText(/username admin/i), { target: { value: "owner" } });
    fireEvent.change(screen.getByLabelText(/password admin/i), { target: { value: "strong-password" } });
    fireEvent.submit(screen.getByRole("button", { name: /login ke akun admin/i }).closest("form")!);

    await waitFor(() => expect(mocks.mutate).toHaveBeenCalledWith({ username: "owner", password: "strong-password" }));
    expect(mocks.invalidate).toHaveBeenCalledTimes(1);
    expect(mocks.setLocation).toHaveBeenCalledWith("/admin");
  });

  it("shows a useful error when standalone credentials are rejected", async () => {
    render(<AdminLogin />);

    fireEvent.change(screen.getByLabelText(/username admin/i), { target: { value: "owner" } });
    fireEvent.change(screen.getByLabelText(/password admin/i), { target: { value: "wrong" } });
    fireEvent.submit(screen.getByRole("button", { name: /login ke akun admin/i }).closest("form")!);

    await waitFor(() => expect(screen.getByRole("alert").textContent).toMatch(/username atau password admin salah/i));
  });
});
