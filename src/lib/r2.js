import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.CLOUDFLARE_R2_BUCKET_NAME;
const PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL;

// Upload a file buffer to R2
export async function uploadToR2(key, buffer, contentType) {
  await r2.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  }));
  return `${PUBLIC_URL}/${key}`;
}

// Generate a short-lived signed URL for private/full-res downloads
export async function getSignedDownloadUrl(key, expiresInSeconds = 3600) {
  return getSignedUrl(r2, new GetObjectCommand({ Bucket: BUCKET, Key: key }), {
    expiresIn: expiresInSeconds,
  });
}

// Delete a file from R2
export async function deleteFromR2(key) {
  await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

// Build the storage key for a photo
// studios/{studioId}/galleries/{galleryId}/{filename}
export function buildPhotoKey(studioId, galleryId, filename) {
  return `studios/${studioId}/galleries/${galleryId}/${filename}`;
}

// Build the storage key for a thumbnail
// studios/{studioId}/galleries/{galleryId}/thumbs/{filename}
export function buildThumbKey(studioId, galleryId, filename) {
  return `studios/${studioId}/galleries/${galleryId}/thumbs/${filename}`;
}
