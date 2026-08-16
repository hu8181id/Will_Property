import { describe, expect, it } from "vitest";
import { buildOAuthLoginUrl } from "./const";

describe("buildOAuthLoginUrl", () => {
  it("builds a complete login URL for the configured OAuth portal", () => {
    const url = new URL(
      buildOAuthLoginUrl({
        portalUrl: "https://manus.im/",
        appId: "primedeal-app",
        redirectUri: "https://primedeal-property.vercel.app/api/oauth/callback",
        state: "encoded-state",
      }),
    );

    expect(url.origin).toBe("https://manus.im");
    expect(url.pathname).toBe("/app-auth");
    expect(url.searchParams.get("appId")).toBe("primedeal-app");
    expect(url.searchParams.get("redirectUri")).toBe(
      "https://primedeal-property.vercel.app/api/oauth/callback",
    );
    expect(url.searchParams.get("state")).toBe("encoded-state");
    expect(url.searchParams.get("type")).toBe("signIn");
  });

  it("rejects a missing app ID instead of silently failing", () => {
    expect(() =>
      buildOAuthLoginUrl({
        portalUrl: "https://manus.im",
        appId: "",
        redirectUri: "https://example.com/api/oauth/callback",
        state: "encoded-state",
      }),
    ).toThrow(/VITE_APP_ID/);
  });
});
