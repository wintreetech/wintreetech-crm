import { DeleteObjectsCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import s3 from "./s3Client.js";
import { keys } from "./keys.js";

export const deleteS3TaskFolder = async (workspaceSlug, taskName) => {
  // SANITIZE: Match the format used during upload
  const sanitizedTaskName = taskName.trim().replace(/\s+/g, "_");
  const prefix = `workspaces/${workspaceSlug}/${sanitizedTaskName}/`;

  console.log("Attempting to delete S3 Prefix:", prefix);

  try {
    // List all objects with the task prefix
    const listCommand = new ListObjectsV2Command({
      Bucket: keys.aws.S3_BUCKET_NAME,
      Prefix: prefix,
    });

    const listResponse = await s3.send(listCommand);

    if (!listResponse.Contents || listResponse.Contents.length === 0) {
      console.log("No files found in S3 for this task prefix.");
      return;
    }
    // Prepare objects for deletion
    const deleteParams = {
      Bucket: keys.aws.S3_BUCKET_NAME,
      Delete: {
        Objects: listResponse.Contents.map((obj) => ({ Key: obj.Key })),
      },
    };

    // Delete everything inside that "folder"
    await s3.send(new DeleteObjectsCommand(deleteParams));
    console.log(`✅ Cleaned up S3 folder: ${prefix}`);
  } catch (error) {
    console.error("S3 Cleanup Error:", error);
  }
};
