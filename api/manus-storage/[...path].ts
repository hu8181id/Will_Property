import { ENV } from "../../server/_core/env";

type VercelRequest = {
  url?: string;
  query?: Record<string, string | string[] | undefined>;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  setHeader: (name: string, value: string) => void;
  end: (body?: string) => void;
};

function getStorageKey(req: VercelRequest) {
  const queryPath = req.query?.path;
  if (Array.isArray(queryPath)) return queryPath.filter(Boolean).join("/");
  if (typeof queryPath === "string" && queryPath) return queryPath.replace(/^\/+/, "");

  const pathname = (req.url || "").split("?", 1)[0];
  const marker = "/manus-storage/";
  const markerIndex = pathname.indexOf(marker);
  return markerIndex >= 0 ? decodeURIComponent(pathname.slice(markerIndex + marker.length)) : "";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const key = getStorageKey(req);
  if (!key) {
    res.status(400).end("Missing storage key");
    return;
  }

  if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
    console.error("[LegacyStorage] Forge storage environment is not configured");
    res.status(503).end("Legacy storage is not configured");
    return;
  }

  try {
    const presignUrl = new URL("v1/storage/presign/get", ENV.forgeApiUrl.replace(/\/+$/, "") + "/");
    presignUrl.searchParams.set("path", key);
    const response = await fetch(presignUrl, {
      headers: { Authorization: `Bearer ${ENV.forgeApiKey}` },
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.error(`[LegacyStorage] presign failed: ${response.status} ${body.slice(0, 300)}`);
      res.status(502).end("Legacy storage backend error");
      return;
    }

    const payload = (await response.json()) as { url?: string };
    if (!payload.url) {
      res.status(502).end("Legacy storage returned no URL");
      return;
    }

    res.status(307);
    res.setHeader("Location", payload.url);
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.end();
  } catch (error) {
    console.error("[LegacyStorage] proxy failed:", error);
    res.status(502).end("Legacy storage proxy error");
  }
}
