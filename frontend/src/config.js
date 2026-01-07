const env = import.meta.env.VITE_ENV;

const CRM_BASE =
  env === "prod"
    ? import.meta.env.VITE_PROD_URL
    : import.meta.env.VITE_LOCAL_URL;

const TASKS_BASE =
  env === "prod"
    ? import.meta.env.VITE_TASKS_PROD_URL
    : import.meta.env.VITE_TASKS_URL;

export const CRM_API_BASE = CRM_BASE + "crm" + "/api/v1";
export const TASKS_API_BASE = TASKS_BASE + "tasks" + "/api/v1";
export const WORKSPACE_API_BASE = TASKS_BASE + "workspaces" + "/api/v1";
export const NOTIFICATION_API_BASE = TASKS_BASE + "notifications" + "/api/v1";
export const S3_API_BASE = TASKS_BASE + "s3" + "/api/v1";
