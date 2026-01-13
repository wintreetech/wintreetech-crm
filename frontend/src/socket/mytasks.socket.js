import { socket } from "./index.js";

/**
 * Register socket listeners once.
 * - Calls `onBoardSync(columns)` when backend broadcasts updated board state.
 */

export const registerMyTasksSocket = ({ onBoardSync }) => {
  // Avoid duplicate listeners if called multiple times
  socket.off("mytasks:board_sync");

  socket.on("mytasks:board_sync", ({ columns }) => {
    onBoardSync?.(columns || []);
  });

  socket.on("error", (err) => {
    console.error("Socket error:", err);
  });
};

// join the socket room for myTasks
export const joinMyTasksRoom = (userId) => {
  if (!userId) return;
  socket.emit("join:mytasks", { userId });
  console.log("socket room joined");
};

// leave the socket room for myTasks
export const leaveMyTasksRoom = (userId) => {
  if (!userId) return;
  socket.emit("leave:mytasks", { userId });
};

// save board will save the current board of the user
export const saveMyTasksBoard = ({ user, columns }) => {
  if (!user?.id) return;
  if (!Array.isArray(columns)) return;

  socket.emit("mytasks:save_board", { user, columns });
};
