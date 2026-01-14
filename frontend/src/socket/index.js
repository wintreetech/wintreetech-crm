import { io } from "socket.io-client";

const ENV = import.meta.env.VITE_ENV;

const SOCKET_URL =
  ENV === "prod"
    ? import.meta.env.VITE_SOCKET_URL_PROD
    : "http://localhost:3939";

// ✅ one socket for whole app
export const socket = io(SOCKET_URL, {
  path: "/socket.io",
  autoConnect: true,
  transports: ["websocket"],
  withCredentials: true,
});
