import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3939";

// ✅ one socket for whole app
export const socket = io(SOCKET_URL, {
  path: "/socket.io",
  autoConnect: true,
  transports: ["websocket"],
  withCredentials: true,
});
