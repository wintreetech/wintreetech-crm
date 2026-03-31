import Workspace from "../models/workspace.model.js";
import { sendNotification } from "../notifications/notification.service.js";
import { emitEvent } from "../realtime/emitter.js";
import { clearExpiredTagsInBoard } from "../utils/taskCleanup.js";
import { EVENTS } from "./events.js";

export const registrWorkspaceSocket = (socket) => {
  // SAVE BOARD (Drag and Drop / Full Sync)
  socket.on(
    EVENTS.WORKSPACE.SAVE_BOARD,
    async ({ workspaceId, columns, senderInfo }) => {
      try {
        if (!workspaceId) throw new Error("workspaceId required");

        const oldWorkspace = await Workspace.findById(workspaceId).lean();
        const board = await Workspace.findOneAndUpdate(
          { _id: workspaceId },
          { $set: { columns } },
          { new: true },
        ).lean();

        if (!board) throw new Error("Workspace not found");

        const newTasks = columns.flatMap((col) => col.tasks || []);
        const oldTasks =
          oldWorkspace?.columns?.flatMap((col) => col.tasks || []) || [];

        for (const task of newTasks) {
          const oldTask = oldTasks.find(
            (t) => String(t.id || t._id) === String(task.id || task._id),
          );

          // NEW TASK NOTIFICATION (Map Names to IDs)
          if (!oldTask) {
            const assigneeNames = task.assignees || [];

            console.log("assignee names", assigneeNames);

            // Convert names strings into User IDs using the workspace members list
            const assigneeIds = assigneeNames
              .map((name) => {
                const member = oldWorkspace.members.find(
                  (m) => m.username === name,
                );
                return member ? member.id : null;
              })
              .filter((id) => id && String(id) !== String(senderInfo.id));

            console.log("assignee ids", assigneeIds);

            if (assigneeIds.length > 0) {
              await sendNotification({
                recipients: assigneeIds,
                sender: senderInfo,
                title: "New Task Assigned",
                message: `${senderInfo.name} assigned "${task.title}" to you in ${oldWorkspace.title}`,
                type: "ASSIGNED",
                metadata: {
                  workspaceId,
                  taskId: task.id,
                  link: `/tasks/workspaces/${oldWorkspace.slug}`,
                },
              });
            }
            continue;
          }

          // COMPLETION NOTIFICATION (Your working logic)
          const isNowCompleted = task.status?.toLowerCase() === "completed";
          const wasNotCompleted =
            oldTask?.status?.toLowerCase() !== "completed";

          if (isNowCompleted && wasNotCompleted) {
            const otherMembers = oldWorkspace.members
              .filter((m) => String(m.id) !== String(senderInfo.id))
              .map((m) => m.id);

            if (otherMembers.length > 0) {
              await sendNotification({
                recipients: otherMembers,
                sender: senderInfo,
                title: "Task Completed ✅",
                message: `${senderInfo.name} completed "${task.title}" in ${oldWorkspace.title}`,
                type: "TASK_COMPLETED",
                metadata: {
                  workspaceId,
                  taskId: task.id,
                  link: `/tasks/workspaces/${oldWorkspace.slug}`,
                },
              });
            }
          }
        }

        emitEvent({
          room: `workspace:${workspaceId}`,
          event: EVENTS.WORKSPACE.BOARD_SYNC,
          payload: { columns: board.columns },
        });
      } catch (error) {
        socket.emit("error", { message: error.message });
      }
    },
  );

  // UPDATE TASK (Used for the Edit Modal in Workspace)
  socket.on(
    EVENTS.WORKSPACE.UPDATE_TASK,
    async ({ workspaceId, columnId, taskId, updates, senderInfo }) => {
      try {
        if (!workspaceId) throw new Error("workspaceId required");

        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) throw new Error("Workspace not found");

        const col = workspace.columns.find(
          (c) => String(c.id) === String(columnId),
        );
        if (!col) throw new Error("Column not found");

        const taskIdx = col.tasks.findIndex(
          (t) => String(t.id) === String(taskId),
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
    },
  );

  socket.on(
    EVENTS.WORKSPACE.CLEAR_EXPIRED_TAGS,
    async ({ workspaceId, taskIds }) => {
      try {
        console.log("Request recieved for tags clearing Workspace");

        if (!workspaceId || !Array.isArray(taskIds) || taskIds.length === 0)
          return;

        const board = await Workspace.findById(workspaceId);
        if (!board) return;

        const updated = clearExpiredTagsInBoard(board, taskIds);

        if (updated) {
          await board.save();
          emitEvent({
            room: `workspace:${workspaceId}`,
            event: EVENTS.WORKSPACE.BOARD_SYNC,
            payload: { columns: board.columns },
          });
          console.log(
            `[Workspace] Cleared tags for ${taskIds.length} tasks in ${workspaceId}`,
          );
        }
      } catch (error) {
        console.error("Workspace tag cleanup error:", error);
      }
    },
  );
};
