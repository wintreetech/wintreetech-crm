import { Server } from "socket.io";
import { registrMyTasksSocket } from "./mytasks.socket.js";
import { EVENTS } from "./events.js";

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
      methods: ["GET", "POST", "PATCH", "DELETE"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connection succesfull to FE");
    // each user joins their own room
    socket.on(EVENTS.MYTASKS.JOIN, ({ userId }) => {
      console.log("userId:", userId);
      if (userId) socket.join(`mytasks:${userId}`);
    });

    socket.on(EVENTS.MYTASKS.LEAVE, ({ userId }) => {
      if (userId) socket.leave(`mytasks:${userId}`);
    });

    registrMyTasksSocket(socket);
  });

  return io;
};

export const getIO = () => {
  if (!io)
    throw new Error(
      "Socket.io not initialized. Call initSocket(server) first."
    );
  return io;
};
