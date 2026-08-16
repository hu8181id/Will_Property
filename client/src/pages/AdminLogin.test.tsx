import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import AdminLogin from "./AdminLogin";

const mocks = vi.hoisted(() => ({
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
  },
}));

vi.mock("wouter", () => ({
  useLocation: () => ["/admin", mocks.setLocation],
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe("AdminLogin", () => {
  it("submits admin credentials to the direct Vercel endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<AdminLogin />);

    fireEvent.change(screen.getByLabelText(/username admin/i), { target: { value: "owner" } });
    fireEvent.change(screen.getByLabelText(/password admin/i), { target: { value: "strong-password" } });
    fireEvent.submit(screen.getByRole("button", { name: /login ke akun admin/i }).closest("form")!);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith("/api/admin/login", expect.objectContaining({
      method: "POST",
      credentials: "include",
      body: JSON.stringify({ username: "owner", password: "strong-password" }),
    })));
    expect(mocks.invalidate).toHaveBeenCalledTimes(1);
    expect(mocks.setLocation).toHaveBeenCalledWith("/admin");
  });

  it("shows a useful error when standalone credentials are rejected", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Username atau password admin salah." }),
    }));
    render(<AdminLogin />);

    fireEvent.change(screen.getByLabelText(/username admin/i), { target: { value: "owner" } });
    fireEvent.change(screen.getByLabelText(/password admin/i), { target: { value: "wrong" } });
    fireEvent.submit(screen.getByRole("button", { name: /login ke akun admin/i }).closest("form")!);

    await waitFor(() => expect(screen.getByRole("alert").textContent).toMatch(/username atau password admin salah/i));
  });
});
