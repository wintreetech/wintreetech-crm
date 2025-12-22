import Workspace from "../models/workspace.model.js";
import { emitEvent } from "../realtime/emitter.js";
import { EVENTS } from "./events.js";

export const registrWorkspaceSocket = (socket) => {
  // SAVE BOARD (Drag and Drop / Full Sync)
  socket.on(EVENTS.WORKSPACE.SAVE_BOARD, async ({ workspaceId, columns }) => {
    try {
      if (!workspaceId) throw new Error("workspaceId required");

      const board = await Workspace.findOneAndUpdate(
        { _id: workspaceId },
        { $set: { columns } },
        { new: true }
      ).lean();

      if (!board) throw new Error("Workspace not found");

      emitEvent({
        room: `workspace:${workspaceId}`,
        event: EVENTS.WORKSPACE.BOARD_SYNC,
        payload: { columns: board.columns },
      });
    } catch (error) {
      socket.emit("error", { message: error.message });
    }
  });

  // UPDATE TASK (Used for the Edit Modal in Workspace)
  socket.on(
    EVENTS.WORKSPACE.UPDATE_TASK,
    async ({ workspaceId, columnId, taskId, updates }) => {
      try {
        if (!workspaceId) throw new Error("workspaceId required");

        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) throw new Error("Workspace not found");

        const col = workspace.columns.find(
          (c) => String(c.id) === String(columnId)
        );
        if (!col) throw new Error("Column not found");

        const taskIdx = col.tasks.findIndex(
          (t) => String(t.id) === String(taskId)
        );
        if (taskIdx === -1) throw new Error("Task not found");

        // Apply updates directly to the found task reference
        col.tasks[taskIdx] = {
          ...col.tasks[taskIdx],
          ...updates,
        };

        // Tell Mongoose the nested array has changed
        workspace.markModified("columns");
        await workspace.save();

        emitEvent({
          room: `workspace:${workspaceId}`,
          event: EVENTS.WORKSPACE.BOARD_SYNC,
          payload: { columns: workspace.columns },
        });
      } catch (error) {
        socket.emit("error", { message: error.message });
      }
    }
  );
};
