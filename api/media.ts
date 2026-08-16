type VercelRequest = {
  query?: Record<string, string | string[] | undefined>;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  setHeader: (name: string, value: string) => void;
  end: (body?: string) => void;
};

function getPath(req: VercelRequest) {
  const value = req.query?.path;
  if (Array.isArray(value)) return value.join("/").replace(/^\/+/, "");
  return typeof value === "string" ? value.replace(/^\/+/, "") : "";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const key = getPath(req);
  const forgeApiUrl = process.env.BUILT_IN_FORGE_API_URL ?? "";
  const forgeApiKey = process.env.BUILT_IN_FORGE_API_KEY ?? "";

  if (!key) {
    res.status(400).end("Missing media path");
    return;
  }
  if (!forgeApiUrl || !forgeApiKey) {
    console.error("[MediaProxy] Forge storage environment is not configured");
    res.status(503).end("Media storage is not configured");
    return;
  }

  try {
    const presignUrl = new URL(
      "v1/storage/presign/get",
      forgeApiUrl.replace(/\/+$/, "") + "/",
    );
    presignUrl.searchParams.set("path", key);
    const response = await fetch(presignUrl, {
      headers: { Authorization: `Bearer ${forgeApiKey}` },
    });
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.error(`[MediaProxy] presign failed: ${response.status} ${body.slice(0, 300)}`);
      res.status(502).end("Media storage backend error");
      return;
    }

    const payload = (await response.json()) as { url?: string };
    if (!payload.url) {
      res.status(502).end("Media storage returned no URL");
      return;
    }

    res.status(307);
    res.setHeader("Location", payload.url);
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.end();
  } catch (error) {
    console.error("[MediaProxy] failed:", error);
    res.status(502).end("Media proxy error");
  }
}
