import axios from "axios";
import { CRM_API_BASE, TASKS_API_BASE } from "./config.js";

export const api = axios.create({
  baseURL: CRM_API_BASE,
  withCredentials: true, // important
});

export const tasksApi = axios.create({
  baseURL: TASKS_API_BASE,
  withCredentials: true, // important
});
