import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ENV } from "./_core/env";

function getForgeConfig() {
  const forgeUrl = ENV.forgeApiUrl;
  const forgeKey = ENV.forgeApiKey;

  if (!forgeUrl || !forgeKey) {
    throw new Error(
      "Storage config missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY",
    );
  }

  return { forgeUrl: forgeUrl.replace(/\/+$/, ""), forgeKey };
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function appendHashSuffix(relKey: string): string {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}

function hasBackblazeConfig() {
  return Boolean(
    process.env.S3_ENDPOINT &&
      process.env.S3_BUCKET &&
      process.env.S3_KEY &&
      process.env.S3_SECRET,
  );
}

export function normalizeStorageEndpoint(value?: string) {
  const rawEndpoint = value?.trim();
  if (!rawEndpoint) return undefined;
  return `${/^https?:\/\//i.test(rawEndpoint) ? "" : "https://"}${rawEndpoint}`.replace(/\/+$/, "");
}

function getBackblazeConfig() {
  const endpoint = normalizeStorageEndpoint(process.env.S3_ENDPOINT);
  const bucket = process.env.S3_BUCKET;
  const accessKeyId = process.env.S3_KEY;
  const secretAccessKey = process.env.S3_SECRET;
  if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) {
    throw new Error("S3_ENDPOINT, S3_BUCKET, S3_KEY, dan S3_SECRET wajib diisi.");
  }
  return { endpoint, bucket, accessKeyId, secretAccessKey };
}

let _s3Client: S3Client | null = null;
function getS3Client() {
  if (!_s3Client) {
    const config = getBackblazeConfig();
    _s3Client = new S3Client({
      region: process.env.S3_REGION || "us-east-005",
      endpoint: config.endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }
  return _s3Client;
}

export function storageMediaUrl(relKey: string) {
  const key = normalizeKey(relKey);
  const encodedKey = key.split("/").map(encodeURIComponent).join("/");
  return `/manus-storage/${encodedKey}`;
}

export function normalizeStoredMediaUrl(value?: string | null) {
  if (!value) return value;
  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith("/manus-storage/")) return trimmed;

  const endpoint = normalizeStorageEndpoint(process.env.S3_ENDPOINT);
  const bucket = process.env.S3_BUCKET?.trim();
  if (!/^https?:\/\//i.test(trimmed)) return trimmed;

  try {
    const mediaUrl = new URL(trimmed);
    const endpointUrl = endpoint ? new URL(endpoint) : undefined;
    const bucketPrefix = bucket ? `/${encodeURIComponent(bucket)}/` : undefined;
    if (endpointUrl && bucketPrefix && mediaUrl.origin === endpointUrl.origin && mediaUrl.pathname.startsWith(bucketPrefix)) {
      const encodedKey = mediaUrl.pathname.slice(bucketPrefix.length);
      const key = encodedKey
        .split("/")
        .map((segment) => decodeURIComponent(segment))
        .join("/");
      return key ? storageMediaUrl(key) : trimmed;
    }

    // Older uploads may contain a direct B2 URL even when Vercel has not
    // exposed S3_ENDPOINT/S3_BUCKET to this function. B2 S3 URLs use the
    // stable /bucket/key path form, so the bucket segment can be removed safely.
    if (/\.backblazeb2\.com$/i.test(mediaUrl.hostname)) {
      const segments = mediaUrl.pathname.replace(/^\/+/, "").split("/");
      const encodedKey = segments.slice(1).join("/");
      const key = encodedKey
        .split("/")
        .filter(Boolean)
        .map((segment) => decodeURIComponent(segment))
        .join("/");
      return key ? storageMediaUrl(key) : trimmed;
    }

    return trimmed;
  } catch {
    return trimmed;
  }
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  const key = appendHashSuffix(normalizeKey(relKey));

  if (hasBackblazeConfig()) {
    const config = getBackblazeConfig();
    await getS3Client().send(
      new PutObjectCommand({
        Bucket: config.bucket,
        Key: key,
        Body: data,
        ContentType: contentType,
      }),
    );
    return { key, url: storageMediaUrl(key) };
  }

  const { url, uploadUrl } = await storageCreateUploadUrl(relKey, key);
  const blob =
    typeof data === "string"
      ? new Blob([data], { type: contentType })
      : new Blob([data as any], { type: contentType });

  const uploadResp = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: blob,
  });

  if (!uploadResp.ok) {
    throw new Error(`Storage upload to S3 failed (${uploadResp.status})`);
  }

  return { key, url };
}

export async function storageCreateUploadUrl(
  relKey: string,
  providedKey?: string,
): Promise<{ key: string; url: string; uploadUrl: string }> {
  const key = providedKey ?? appendHashSuffix(normalizeKey(relKey));

  if (hasBackblazeConfig()) {
    // The server performs uploads directly for the current API. This branch is
    // retained as a clear error instead of returning a misleading server URL.
    throw new Error("Backblaze B2 upload harus dilakukan melalui storagePut().");
  }

  const { forgeUrl, forgeKey } = getForgeConfig();
  const presignUrl = new URL("v1/storage/presign/put", forgeUrl + "/");
  presignUrl.searchParams.set("path", key);

  const presignResp = await fetch(presignUrl, {
    headers: { Authorization: `Bearer ${forgeKey}` },
  });

  if (!presignResp.ok) {
    const msg = await presignResp.text().catch(() => presignResp.statusText);
    throw new Error(`Forge storage presign failed (${presignResp.status}): ${msg}`);
  }

  const { url: uploadUrl } = (await presignResp.json()) as { url: string };
  if (!uploadUrl) throw new Error("Forge returned empty presign URL");

  return { key, url: storageMediaUrl(key), uploadUrl };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  return { key, url: storageMediaUrl(key) };
}

export async function storageGetSignedUrl(relKey: string): Promise<string> {
  const key = normalizeKey(relKey);

  if (hasBackblazeConfig()) {
    const config = getBackblazeConfig();
    return getSignedUrl(
      getS3Client(),
      new GetObjectCommand({ Bucket: config.bucket, Key: key }),
      { expiresIn: 900 },
    );
  }

  const { forgeUrl, forgeKey } = getForgeConfig();
  const getUrl = new URL("v1/storage/presign/get", forgeUrl + "/");
  getUrl.searchParams.set("path", key);

  const resp = await fetch(getUrl, {
    headers: { Authorization: `Bearer ${forgeKey}` },
  });

  if (!resp.ok) {
    const msg = await resp.text().catch(() => resp.statusText);
    throw new Error(`Storage signed URL failed (${resp.status}): ${msg}`);
  }

  const { url } = (await resp.json()) as { url: string };
  return url;
}
