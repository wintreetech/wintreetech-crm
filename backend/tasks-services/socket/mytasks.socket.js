import MyTasksBoard from "../models/task.model.js";
import { EVENTS } from "./events.js";
import { emitEvent } from "../realtime/emitter.js";
import { clearExpiredTagsInBoard } from "../utils/taskCleanup.js";

export const registrMyTasksSocket = (socket) => {
  // SAVE WHOLE BOARD (drag/drop)
  socket.on(EVENTS.MYTASKS.SAVE_BOARD, async ({ user, columns }) => {
    try {
      if (!user?.id) throw new Error("user.id required");
      if (!Array.isArray(columns)) throw new Error("columns must be an array");

      // prevent creating/saving empty boards
      if (columns.length === 0) {
        throw new Error("Refusing to save empty columns");
      }

      const board = await MyTasksBoard.findOneAndUpdate(
        { "user.id": user.id },
        { user, columns },
        { new: true, upsert: true },
      ).lean();

      console.log("SOCKET save_board incoming columns:", columns?.length);
      console.log("SOCKET board after update columns:", board?.columns?.length);

      emitEvent({
        room: `mytasks:${user.id}`,
        event: EVENTS.MYTASKS.BOARD_SYNC,
        payload: { columns: board?.columns || [] },
      });
    } catch (error) {
      socket.emit("error", {
        message: error?.message || "Failed to save board",
      });
    }
  });

  // DELETE TASK
  socket.on(
    EVENTS.MYTASKS.DELETE_TASK,
    async ({ userId, columnId, taskId }) => {
      try {
        if (!userId || !columnId || !taskId)
          throw new Error("userId, columnId, taskId required");

        const board = await MyTasksBoard.findOne({ "user.id": userId });
        if (!board) throw new Error("Board not found");

        const col = (board.columns || []).find(
          (c) => String(c.id) === String(columnId),
        );
        if (!col) throw new Error("Column not found");

        // const idx = (col.tasks || []).findIndex(
        //   (t) => String(t.id) === String(taskId)
        // );
        // if (idx === -1) throw new Error("Task not found");

        // col.tasks[idx] = {
        //   ...(col.tasks[idx].toObject?.() ?? col.tasks[idx]),
        //   ...updates,
        // };

        // actually delete
        col.tasks = (col.tasks || []).filter(
          (t) => String(t.id) !== String(taskId),
        );

        await board.save();

        emitEvent({
          room: `mytasks:${userId}`,
          event: EVENTS.MYTASKS.BOARD_SYNC,
          payload: { columns: board.columns || [] },
        });
      } catch (error) {
        socket.emit("error", {
          message: error.message || "Failed to update task",
        });
      }
    },
  );

  // UPDATE TASK (edit modal)
  socket.on(
    EVENTS.MYTASKS.UPDATE_TASK,
    async ({ userId, columnId, taskId, updates }) => {
      try {
        if (!userId || !columnId || !taskId)
          throw new Error("userId, columnId, taskId required");

        if (!updates || typeof updates !== "object") {
          throw new Error("updates object required");
        }

        const board = await MyTasksBoard.findOne({ "user.id": userId });
        if (!board) throw new Error("Board not found");

        const col = (board.columns || []).find(
          (c) => String(c.id) === String(columnId),
        );
        if (!col) throw new Error("Column not found");

        const idx = (col.tasks || []).findIndex(
          (t) => String(t.id) === String(taskId),
        );
        if (idx === -1) throw new Error("Task not found");

        col.tasks[idx] = {
          ...(col.tasks[idx].toObject?.() ?? col.tasks[idx]),
          ...updates,
        };
        await board.save();

        emitEvent({
          room: `mytasks:${userId}`,
          event: EVENTS.MYTASKS.BOARD_SYNC,
          payload: { columns: board.columns },
        });
      } catch (error) {
        socket.emit("error", { message: e.message || "Failed to update task" });
      }
    },
  );

  socket.on(EVENTS.MYTASKS.CLEAR_EXPIRED_TAGS, async ({ userId, taskIds }) => {
    try {
      console.log("Request recieved for tags clearing My Tasks");

      if (!userId || !Array.isArray(taskIds) || taskIds.length === 0) return;

      const board = await MyTasksBoard.findOne({ "user.id": userId });
      if (!board) return;

      const updated = clearExpiredTagsInBoard(board, taskIds);

      if (updated) {
        await board.save();
        emitEvent({
          room: `mytasks:${userId}`,
          event: EVENTS.MYTASKS.BOARD_SYNC,
          payload: { columns: board.columns },
        });
        console.log(`[MyTasks] Cleared tags for ${taskIds.length} tasks`);
      }
    } catch (error) {
      console.error("Failed to clear expired tags:", error);
    }
  });
};
