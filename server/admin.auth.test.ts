import { describe, expect, it } from "vitest";
import { ADMIN_LOGIN_ENDPOINT, verifyAdminCredentials } from "./adminAuth";

describe("admin standalone authentication", () => {
  it("exposes a lightweight login endpoint contract", () => {
    expect(ADMIN_LOGIN_ENDPOINT).toBe("/api/trpc/auth.adminLogin");
  });

  it("accepts the configured admin credentials and rejects invalid credentials", () => {
    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;

    expect(username).toBeTruthy();
    expect(password).toBeTruthy();
    expect(verifyAdminCredentials(username ?? "", password ?? "")).toBe(true);
    expect(verifyAdminCredentials(username ?? "", `${password ?? ""}-wrong`)).toBe(false);
  });
});
