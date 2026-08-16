import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import type { Request, Response } from 'express';

export async function handleVercelBlobUploadAuth(req: Request, res: Response) {
  try {
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
        
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime', 'video/3gpp', 'video/x-m4v', 'application/octet-stream'],
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
