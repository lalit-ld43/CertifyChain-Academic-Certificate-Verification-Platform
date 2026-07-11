import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

/** Uploads a certificate file privately (authenticated delivery, not public). */
export async function uploadCertificateFile(
  buffer: Buffer,
  filename: string,
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        type: 'authenticated',
        public_id: filename,
        folder: 'certifychain/certificates',
      },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error('Upload failed'));
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );
    stream.end(buffer);
  });
}

/** Generates a short-lived signed URL for authorized download. */
export function getSignedDownloadUrl(publicId: string): string {
  return cloudinary.utils.private_download_url(publicId, undefined, {
    resource_type: 'auto',
    type: 'authenticated',
    expires_at: Math.floor(Date.now() / 1000) + 60 * 10, // 10 minutes
  });
}

export async function deleteCertificateFile(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId, { resource_type: 'auto', type: 'authenticated' });
}
