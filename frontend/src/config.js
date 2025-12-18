const env = import.meta.env.VITE_ENV;

const CRM_BASE =
  env === "production"
    ? import.meta.env.VITE_PROD_URL
    : import.meta.env.VITE_LOCAL_URL;

const TASKS_BASE =
  env === "production"
    ? import.meta.env.VITE_TASKS_PROD_URL
    : import.meta.env.VITE_TASKS_URL;

export const CRM_API_BASE = CRM_BASE + "crm" + "/api/v1";
export const TASKS_API_BASE = TASKS_BASE + "tasks" + "/api/v1";
