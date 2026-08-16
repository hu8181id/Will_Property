type MediaRequest = Request;

function getRequestUrl(request: MediaRequest) {
  try {
    return new URL(request.url);
  } catch {
    const protocol =
      request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || "https";
    const host =
      request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
      request.headers.get("host") ||
      "primedeal-property.vercel.app";
    return new URL(request.url, `${protocol}://${host}`);
  }
}

function getStorageKey(request: MediaRequest) {
  const url = getRequestUrl(request);
  const queryValues = url.searchParams.getAll("path");
  const queryPath = queryValues.filter(Boolean).join("/");
  if (queryPath) return queryPath.replace(/^\/+/, "");

  const marker = "/manus-storage/";
  const markerIndex = url.pathname.indexOf(marker);
  if (markerIndex < 0) return "";

  const rawPath = url.pathname.slice(markerIndex + marker.length);
  try {
    return decodeURIComponent(rawPath).replace(/^\/+/, "");
  } catch {
    return rawPath.replace(/^\/+/, "");
  }
}

function redirectTo(url: string, maxAge: number) {
  return new Response(null, {
    status: 307,
    headers: {
      Location: url,
      "Cache-Control": `public, max-age=${maxAge}`,
    },
  });
}

function textResponse(status: number, message: string) {
  return new Response(message, {
    status,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

async function redirectToForge(key: string, forgeApiUrl: string, forgeApiKey: string) {
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
    throw new Error(`presign failed: ${response.status} ${body.slice(0, 300)}`);
  }

  const payload = (await response.json()) as { url?: string };
  if (!payload.url) throw new Error("storage returned no signed URL");
  return payload.url;
}

export default async function handler(request: Request): Promise<Response> {
  const key = getStorageKey(request);
  if (!key) return textResponse(400, "Missing media path");

  const forgeApiUrl = process.env.BUILT_IN_FORGE_API_URL ?? "";
  const forgeApiKey = process.env.BUILT_IN_FORGE_API_KEY ?? "";
  const hasBackblazeConfig = Boolean(
    process.env.S3_ENDPOINT &&
      process.env.S3_BUCKET &&
      process.env.S3_KEY &&
      process.env.S3_SECRET,
  );

  if (hasBackblazeConfig) {
    try {
      // Keep the heavier S3 module out of the top-level import path. This makes
      // the Vercel function load reliably and turns storage errors into a useful
      // HTTP response instead of FUNCTION_INVOCATION_FAILED.
      const { storageGetSignedUrl } = await import("../server/storage");
      const signedUrl = await storageGetSignedUrl(key);
      return redirectTo(signedUrl, 3600);
    } catch (error) {
      console.error("[MediaProxy] Backblaze signed URL failed:", error);
      return textResponse(502, "Media storage backend error");
    }
  }

  if (forgeApiUrl && forgeApiKey) {
    try {
      const signedUrl = await redirectToForge(key, forgeApiUrl, forgeApiKey);
      return redirectTo(signedUrl, 3600);
    } catch (error) {
      console.error("[MediaProxy] Forge signed URL failed:", error);
      return textResponse(502, "Media storage backend error");
    }
  }

  // Existing legacy listings may still be available from the former Manus
  // storage service when neither current storage configuration is present.
  const legacyPath = key
    .split("/")
    .map(segment => encodeURIComponent(segment))
    .join("/");
  return redirectTo(
    `https://primedeal-jl8furcm.manus.space/manus-storage/${legacyPath}`,
    300,
  );
}
