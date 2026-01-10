import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const REGION = process.env.AWS_REGION;
const BUCKET = process.env.S3_BUCKET_NAME;

if (!REGION) throw new Error("Missing AWS_REGION in env");
if (!BUCKET) throw new Error("Missing S3_BUCKET_NAME in env");

export const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export const getS3KeyFromUrl = (fileUrl) => {
  if (!fileUrl) return null;
  try {
    const u = new URL(fileUrl);
    // "/merchant/Drift.../Shareholders.zip" -> "merchant/Drift.../Shareholders.zip"
    return decodeURIComponent(u.pathname.replace(/^\/+/, ""));
  } catch {
    return null;
  }
};

export const deleteS3ObjectByKey = async (key) => {
  if (!key) return;
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  );
};

export const deleteS3ObjectByUrl = async (fileUrl) => {
  const key = getS3KeyFromUrl(fileUrl);
  if (!key) throw new Error(`Invalid fileUrl (cannot parse key): ${fileUrl}`);
  await deleteS3ObjectByKey(key);
};
