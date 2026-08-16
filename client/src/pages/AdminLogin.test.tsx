import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import AdminLogin from "./AdminLogin";
import { startLogin } from "@/const";

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    logout: vi.fn(),
  }),
}));

vi.mock("@/const", () => ({
  startLogin: vi.fn(),
}));

vi.mock("wouter", () => ({
  useLocation: () => ["/admin", vi.fn()],
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("AdminLogin", () => {
  it("starts admin login when the mobile-friendly button is clicked", () => {
    render(<AdminLogin />);
    const loginButton = screen.getByRole("button", { name: /login ke akun admin/i });

    expect(loginButton.getAttribute("type")).toBe("button");
    fireEvent.click(loginButton);

    expect(startLogin).toHaveBeenCalledTimes(1);
  });

  it("shows a useful message when OAuth cannot start", () => {
    vi.mocked(startLogin).mockImplementationOnce(() => {
      throw new Error("OAuth configuration missing");
    });

    render(<AdminLogin />);
    fireEvent.click(screen.getByRole("button", { name: /login ke akun admin/i }));

    expect(screen.getByRole("alert").textContent).toMatch(/login belum dapat dimulai/i);
  });
});
