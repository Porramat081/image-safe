// backend/src/services/r2.ts
//
// WHAT  The Cloudflare R2 implementation of StorageDriver. Production storage.
// HOW   Selected by storage.ts when STORAGE_DRIVER=r2. Talks to R2 over the S3 API.
// WHY   R2 is cheap, durable, and has NO egress fees — a real win for serving lots of
//       image bytes. The S3 API means the same code also works for AWS S3 and MinIO.
// ALTERNATIVES
//   - AWS S3: identical code, different endpoint, but charges egress (front it with a CDN).
//   - Backend filesystem: simple but stateful and unscalable (see localDisk.ts).
//
// The S3 client is created lazily so that running in local-disk mode (where the R2_*
// vars are intentionally empty) never tries to construct a client with missing config.

import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../config/env";
import type { StorageDriver } from "./storage";

let client: S3Client | null = null;
function getClient(): S3Client {
  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID!,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }
  return client;
}

export const r2Driver: StorageDriver = {
  async uploadFile(buffer, key, mimeType) {
    await getClient().send(
      new PutObjectCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      })
    );
  },

  getPublicUrl(key) {
    return `${env.R2_PUBLIC_URL}/${key}`;
  },

  async deleteFile(key) {
    await getClient().send(
      new DeleteObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: key })
    );
  },

  // Lets the client PUT bytes straight to R2 without proxying through the API.
  async getUploadUrl(key, mimeType) {
    return getSignedUrl(
      getClient(),
      new PutObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: key, ContentType: mimeType }),
      { expiresIn: 300 } // 5 minutes
    );
  },
};
