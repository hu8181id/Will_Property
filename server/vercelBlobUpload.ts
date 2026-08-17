import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { del } from '@vercel/blob';
import type { Request, Response } from 'express';

const ALLOWED_CONTENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-m4v',
  'video/3gpp',
  'video/3gpp2',
] as const;

function isAllowedMediaPath(pathname: string) {
  return /^properties\/uploads\/(images|videos)\/[a-f0-9-]+\.[a-z0-9]+$/i.test(pathname);
}

export async function handleVercelBlobUploadAuth(req: Request, res: Response) {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("[Vercel Blob] BLOB_READ_WRITE_TOKEN environment variable is missing in Vercel settings!");
      return res.status(500).json({ error: "Konfigurasi Vercel Blob belum lengkap: BLOB_READ_WRITE_TOKEN belum diset di Vercel dashboard." });
    }
    const body = req.body as HandleUploadBody;
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        const adminKeyHeader = req.headers['x-admin-key'] || req.query.admin_key;
        const expectedKey = process.env.ADMIN_SECRET_KEY || 'PDmanage!2026#SafeKey84';
        
        if (adminKeyHeader !== expectedKey) {
          throw new Error("Unauthorized: Invalid admin key for blob upload token");
        }

        if (!isAllowedMediaPath(pathname)) {
          throw new Error('Path upload media tidak valid.');
        }
        
        return {
          allowedContentTypes: [...ALLOWED_CONTENT_TYPES],
          tokenPayload: JSON.stringify({ uploadedAt: Date.now() }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('[Vercel Blob] Upload completed:', blob.url, tokenPayload);
      },
    });

    return res.status(200).json(jsonResponse);
  } catch (error: any) {
    console.error('[Vercel Blob] Error generating upload token:', error);
    return res.status(400).json({ error: error.message || 'Error handling blob upload' });
  }
}

export async function handleVercelBlobDelete(req: Request, res: Response) {
  try {
    const adminKeyHeader = req.headers['x-admin-key'] || req.query.admin_key;
    const expectedKey = process.env.ADMIN_SECRET_KEY || 'PDmanage!2026#SafeKey84';
    if (adminKeyHeader !== expectedKey) {
      return res.status(403).json({ error: "Unauthorized: Invalid admin key for blob deletion" });
    }

    const { url } = req.body || {};
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: "Missing blob url" });
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return res.status(500).json({ error: "BLOB_READ_WRITE_TOKEN not configured" });
    }

    await del(url, { token: process.env.BLOB_READ_WRITE_TOKEN });
    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('[Vercel Blob] Error deleting blob:', error);
    return res.status(500).json({ error: error.message || 'Error deleting blob' });
  }
}
