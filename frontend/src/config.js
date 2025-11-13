const env = import.meta.env.VITE_ENV;

const API_BASE_URL =
	env === "production"
		? import.meta.env.VITE_PROD_URL
		: import.meta.env.VITE_LOCAL_URL;

export default API_BASE_URL;
