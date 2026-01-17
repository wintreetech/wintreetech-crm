const env = import.meta.env.VITE_ENV;

const CRM_BASE =
  env === "prod"
    ? import.meta.env.VITE_PROD_URL
    : import.meta.env.VITE_LOCAL_URL;

const TASKS_BASE = CRM_BASE + "taskflow";

const API_VERSION = "/api/v1";

export const CRM_API_BASE = CRM_BASE + "crm" + API_VERSION;
export const TASKS_API_BASE = TASKS_BASE + API_VERSION;
export const WORKSPACE_API_BASE = TASKS_BASE + "/workspaces" + API_VERSION;
export const NOTIFICATION_API_BASE =
  TASKS_BASE + "/notifications" + API_VERSION;
export const S3_API_BASE = TASKS_BASE + "/s3" + API_VERSION;
