import axios from "axios";
import {
	CRM_API_BASE,
	TASKS_API_BASE,
	WORKSPACE_API_BASE,
	NOTIFICATION_API_BASE,
	S3_API_BASE,
} from "./config.js";

axios.interceptors.request.use((request) => {
	console.log("API URL:", request.method?.toUpperCase(), request.url);
	console.log("Full Request:", request);
	return request;
});

export const api = axios.create({
	baseURL: CRM_API_BASE,
	withCredentials: true, // important
});

export const tasksApi = axios.create({
	baseURL: TASKS_API_BASE,
	withCredentials: true, // important
});

export const workspaceApi = axios.create({
	baseURL: WORKSPACE_API_BASE,
	withCredentials: true, // important
});

export const notificationApi = axios.create({
	baseURL: NOTIFICATION_API_BASE,
	withCredentials: true,
});

export const s3Api = axios.create({
	baseURL: S3_API_BASE,
	withCredentials: true,
});

// Shared Interceptor Logic (in the case if user not authenticated than logout the user)
const authInterceptor = (instance) => {
	instance.interceptors.response.use(
		(response) => {
			return response;
		},
		(error) => {
			if (error.response && error.response.status === 401) {
				// PREVENT LOOP: If we are already on the login page, don't redirect again
				if (window.location.pathname === "/login") {
					return Promise.reject(error);
				}

				console.warn(
					"Unauthorized! Clearing session and redirecting...",
					error,
				);

				// Clear Local Storage
				localStorage.removeItem("currentUser");

				// Redirect to Login
				// Using window.location.href is the safest way to break the React state
				// and ensure a clean slate on the login page.
				window.location.href = "/login";
			}
			return Promise.reject(error);
		},
	);
};

// Apply the interceptor to ALL instances
[api, tasksApi, workspaceApi, notificationApi, s3Api].forEach((instance) => {
	authInterceptor(instance);
});
