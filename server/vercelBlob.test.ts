import { describe, expect, it } from 'vitest';
import { isVercelBlobUrl } from '../client/src/lib/vercelBlobClient';
import { normalizeStoredMediaUrl } from './storage';

describe('Vercel Blob URL persistence', () => {
  it('preserves public Blob URLs without converting them to local proxy paths', () => {
    const blobUrl = 'https://abc123xyz.public.blob.vercel-storage.com/properties/test-image-12345.jpg';
    expect(normalizeStoredMediaUrl(blobUrl)).toBe(blobUrl);
  });

  it('identifies only public Vercel Blob URLs for deletion', () => {
    expect(isVercelBlobUrl('https://abc123.public.blob.vercel-storage.com/properties/uploads/images/photo.jpg')).toBe(true);
    expect(isVercelBlobUrl('/manus-storage/properties/legacy-photo.jpg')).toBe(false);
    expect(isVercelBlobUrl('data:image/jpeg;base64,abc')).toBe(false);
  });
});
