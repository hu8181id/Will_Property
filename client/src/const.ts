import { OAUTH_STATE_COOKIE, encodeOAuthState } from "@shared/const";

export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

const DEFAULT_OAUTH_PORTAL_URL = "https://manus.im";

const createOAuthNonce = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export const buildOAuthLoginUrl = ({
  portalUrl,
  appId,
  redirectUri,
  state,
}: {
  portalUrl: string;
  appId: string;
  redirectUri: string;
  state: string;
}) => {
  if (!appId) throw new Error("VITE_APP_ID belum dikonfigurasi untuk login admin.");

  const url = new URL(`${portalUrl.replace(/\/+$/, "")}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");
  return url.toString();
};

// Start the Manus OAuth login. Call this from an event handler or effect at the
// moment you want to navigate, e.g. `onClick={() => startLogin()}`.
export const startLogin = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL || DEFAULT_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID || "";
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const nonce = createOAuthNonce();

  document.cookie = `${OAUTH_STATE_COOKIE}=${nonce}; Path=/; Max-Age=600; SameSite=None; Secure`;
  const state = encodeOAuthState({ redirectUri, nonce });
  const loginUrl = buildOAuthLoginUrl({ portalUrl: oauthPortalUrl, appId, redirectUri, state });

  window.location.assign(loginUrl);
};
