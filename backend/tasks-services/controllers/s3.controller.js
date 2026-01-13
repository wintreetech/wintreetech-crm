import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3 from "../utils/s3Client.js";

export const getTaskDownloadLink = async (req, res) => {
  try {
    const { fileUrl, fileName } = req.body;
    if (!fileUrl) return res.status(400).json({ error: "Missing fileUrl" });

    // Extract the S3 Key from the stored URL
    const url = new URL(fileUrl);
    const key = decodeURIComponent(url.pathname.substring(1));

    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      ResponseContentDisposition: `attachment; filename="${fileName}"`,
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

    return res.json({ downloadUrl: signedUrl });
  } catch (error) {
    console.error("Error generating signed URL:", err);
    return res.status(500).json({ error: "Failed to generate download link" });
  }
};
