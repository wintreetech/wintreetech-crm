const env = import.meta.env.VITE_ENV;

const API_BASE_URL =
  env === "production"
    ? import.meta.env.VITE_PROD_URL
    : import.meta.env.VITE_LOCAL_URL;

export const CRM_API_BASE = API_BASE_URL + "crm" + "/api/v1";
export const TASKS_API_BASE = API_BASE_URL + "tasks" + "/api/v1";
