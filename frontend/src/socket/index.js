import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3902";

// ✅ one socket for whole app
export const socket = io(SOCKET_URL, {
  autoConnect: true,
  transports: ["websocket"],
});
