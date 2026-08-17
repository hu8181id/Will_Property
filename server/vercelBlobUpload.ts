import { del } from '@vercel/blob';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import type { Request, Response } from 'express';

const ALLOWED_CONTENT_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif',
  'video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v', 'video/3gpp', 'video/3gpp2',
] as const;

function isAllowedMediaPath(pathname: string) {
  return /^properties\/uploads\/(images|videos)\/[a-f0-9-]+\.[a-z0-9]+$/i.test(pathname);
}

function isAuthorizedAdminRequest(req: Request) {
  const provided = req.headers['x-admin-key'] || req.query.admin_key;
  const expected = process.env.ADMIN_SECRET_KEY;
  return Boolean(expected && typeof provided === 'string' && provided === expected);
}

export async function handleVercelBlobUploadAuth(req: Request, res: Response) {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return res.status(500).json({ error: 'Konfigurasi Vercel Blob belum lengkap: BLOB_READ_WRITE_TOKEN belum diset di Vercel Dashboard.' });
    }
    const jsonResponse = await handleUpload({
      body: req.body as HandleUploadBody,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        if (!isAuthorizedAdminRequest(req)) throw new Error('Unauthorized: invalid admin key for blob upload token');
        if (!isAllowedMediaPath(pathname)) throw new Error('Path upload media tidak valid.');
        return { allowedContentTypes: [...ALLOWED_CONTENT_TYPES], tokenPayload: JSON.stringify({ uploadedAt: Date.now() }) };
      },
      onUploadCompleted: async ({ blob }) => console.info('[Vercel Blob] Upload completed:', blob.url),
    });
    return res.status(200).json(jsonResponse);
  } catch (error: any) {
    console.error('[Vercel Blob] Error generating upload token:', error);
    return res.status(400).json({ error: error.message || 'Error handling blob upload' });
  }
}

export async function handleVercelBlobDelete(req: Request, res: Response) {
  try {
    if (!isAuthorizedAdminRequest(req)) return res.status(403).json({ error: 'Unauthorized: invalid admin key for blob deletion' });
    const { url } = req.body || {};
    if (!url || typeof url !== 'string') return res.status(400).json({ error: 'Missing blob URL' });
    if (!process.env.BLOB_READ_WRITE_TOKEN) return res.status(500).json({ error: 'BLOB_READ_WRITE_TOKEN not configured' });
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' || !parsed.hostname.endsWith('.blob.vercel-storage.com')) {
      return res.status(400).json({ error: 'URL Vercel Blob tidak valid' });
    }
    await del(url, { token: process.env.BLOB_READ_WRITE_TOKEN });
    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('[Vercel Blob] Error deleting blob:', error);
    return res.status(500).json({ error: error.message || 'Error deleting blob' });
  }
}
