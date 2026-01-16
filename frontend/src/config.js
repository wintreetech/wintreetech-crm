const env = import.meta.env.VITE_ENV;

const CRM_BASE =
  env === "prod"
    ? import.meta.env.VITE_PROD_URL
    : import.meta.env.VITE_LOCAL_URL;

const TASKS_BASE = CRM_BASE + "tasks";

export const CRM_API_BASE = CRM_BASE + "crm" + "/api/v1";
export const TASKS_API_BASE = TASKS_BASE + "/api/v1";
export const WORKSPACE_API_BASE = TASKS_BASE + "/workspaces" + "/api/v1";
export const NOTIFICATION_API_BASE = TASKS_BASE + "/notifications" + "/api/v1";
export const S3_API_BASE = TASKS_BASE + "/s3" + "/api/v1";
