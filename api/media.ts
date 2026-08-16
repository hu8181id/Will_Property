import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

type MediaRequest = {
  url?: string;
  headers?: Headers | Record<string, string | string[] | undefined>;
};

function getHeader(request: MediaRequest, name: string) {
  const headers = request.headers;
  if (!headers) return undefined;

  if (typeof (headers as Headers).get === "function") {
    return (headers as Headers).get(name) ?? undefined;
  }

  const record = headers as Record<string, string | string[] | undefined>;
  const value = record[name] ?? record[name.toLowerCase()] ?? record[name.toUpperCase()];
  if (Array.isArray(value)) return value[0];
  return typeof value === "string" ? value : undefined;
}

function getRequestUrl(request: MediaRequest) {
  const rawUrl = typeof request.url === "string" ? request.url : "/";
  const protocol = getHeader(request, "x-forwarded-proto")?.split(",")[0]?.trim() || "https";
  const host =
    getHeader(request, "x-forwarded-host")?.split(",")[0]?.trim() ||
    getHeader(request, "host") ||
    "primedeal-property.vercel.app";
  const baseUrl = `${protocol}://${host}`;

  try {
    return new URL(rawUrl, baseUrl);
  } catch {
    return new URL("/", baseUrl);
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

function normalizeStorageEndpoint(value?: string) {
  const rawEndpoint = value?.trim();
  if (!rawEndpoint) return undefined;
  return `${/^https?:\/\//i.test(rawEndpoint) ? "" : "https://"}${rawEndpoint}`.replace(/\/+$/, "");
}

async function redirectToBackblaze(key: string) {
  const endpoint = normalizeStorageEndpoint(process.env.S3_ENDPOINT);
  const bucket = process.env.S3_BUCKET?.trim();
  const accessKeyId = process.env.S3_KEY?.trim();
  const secretAccessKey = process.env.S3_SECRET?.trim();

  if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) {
    throw new Error("S3_ENDPOINT, S3_BUCKET, S3_KEY, dan S3_SECRET wajib diisi.");
  }

  const client = new S3Client({
    region: process.env.S3_REGION || "us-east-005",
    endpoint,
    forcePathStyle: true,
    credentials: { accessKeyId, secretAccessKey },
  });

  return getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: bucket, Key: key }),
    { expiresIn: 900 },
  );
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

export default async function handler(request: MediaRequest): Promise<Response> {
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
      const signedUrl = await redirectToBackblaze(key);
      return redirectTo(signedUrl, 3600);
    } catch (error) {
      console.error("[MediaProxy] Backblaze signed URL failed, falling back to public storage:", error);
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

  const legacyPath = key
    .split("/")
    .map(segment => encodeURIComponent(segment))
    .join("/");
  return redirectTo(
    `https://primedeal-jl8furcm.manus.space/manus-storage/${legacyPath}`,
    300,
  );
}
