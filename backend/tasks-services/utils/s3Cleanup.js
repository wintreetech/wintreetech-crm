import { DeleteObjectsCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import s3 from "./s3Client.js";
import { keys } from "./keys.js";

export const deleteS3TaskFiles = async (fileKeys) => {
  if (!fileKeys || fileKeys.length === 0) return;

  try {
    const deleteParams = {
      Bucket: keys.aws.S3_BUCKET_NAME,
      Delete: {
        Objects: fileKeys.map((key) => ({ Key: key })),
        Quiet: true,
      },
    };

    await s3.send(new DeleteObjectsCommand(deleteParams));
    console.log(`Deleted ${fileKeys.length} specific attachments from S3.`);
  } catch (error) {
    console.error("S3 Individual Key Deletion Error:", error);
  }
};

// Deletes the full folder of the workspace when delete a specific workspace in AWS S3
export const deleteS3WorkspaceFolder = async (workspaceSlug) => {
  const prefix = `workspaces/${workspaceSlug}/`;

  try {
    // List all objects with this workspace prefix
    const listCommand = new ListObjectsV2Command({
      Bucket: keys.aws.S3_BUCKET_NAME,
      Prefix: prefix,
    });

    const listResponse = await s3.send(listCommand);

    if (!listResponse.Contents || listResponse.Contents.length === 0) {
      console.log(`No files found in S3 for workspace: ${workspaceSlug}`);
      return;
    }

    // 2. Prepare and execute deletion
    const deleteParams = {
      Bucket: keys.aws.S3_BUCKET_NAME,
      Delete: {
        Objects: listResponse.Contents.map((obj) => ({ Key: obj.Key })),
      },
    };

    await s3.send(new DeleteObjectsCommand(deleteParams));
    console.log(`✅ Fully cleaned up S3 Workspace folder: ${prefix}`);
  } catch (error) {
    console.error("S3 Workspace Cleanup Error:", error);
  }
};

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
