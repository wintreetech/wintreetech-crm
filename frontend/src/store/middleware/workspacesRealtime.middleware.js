import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import {
  registerWorkspaceSocket,
  joinWorkspaceRoom,
  saveWorkspaceBoard,
} from "../../socket/workspace.socket";

import {
  setWorkspaceColumns,
  setActiveWorkspace,
  addTaskToWorkspaceTodo,
  updateTaskAttachments,
  updateWorkspaceTask,
} from "../slices/Workspaces.slice.js";
import { s3Api } from "../../api.js";

export const workspacesRealtimeListener = createListenerMiddleware();

let socketRegistered = false;
let currentJoinedRoomId = null;

// Handle Socket Registration and Room Joining
workspacesRealtimeListener.startListening({
  actionCreator: setActiveWorkspace,
  effect: async (action, listenerApi) => {
    const slug = action.payload;
    const state = listenerApi.getState();
    const workspace = state.workspaces.list.find((w) => w.slug === slug);

    if (!workspace?.id) return;

    // Register socket listeners once for the active slug
    if (!socketRegistered) {
      registerWorkspaceSocket(slug);
      socketRegistered = true;
    }

    // Join or switch room only if the workspace ID has changed
    if (currentJoinedRoomId !== workspace.id) {
      joinWorkspaceRoom(workspace.id);
      currentJoinedRoomId = workspace.id;
    }
  },
});

// Handle Debounced Sync to Backend via Sockets
workspacesRealtimeListener.startListening({
  matcher: isAnyOf(
    setWorkspaceColumns,
    addTaskToWorkspaceTodo,
    updateWorkspaceTask
  ),
  effect: async (action, listenerApi) => {
    // CRITICAL: Stop if the update was received from another user (remote)
    if (action.payload?.isRemote) return;

    // Debounce: Cancel previous pending syncs and wait 700ms
    listenerApi.cancelActiveListeners();

    // S3 FILE UPLOAD LOGIC (For both Add and Edit)
    const isAdd = addTaskToWorkspaceTodo.match(action);
    const isUpdate = updateWorkspaceTask.match(action);

    if (isAdd || isUpdate) {
      const { workspaceSlug, rawFiles } = action.payload;
      const targetId = isAdd ? action.payload.task.id : action.payload.taskId;
      const taskName = isAdd
        ? action.payload.task.title
        : action.payload.updates?.title;

      if (rawFiles && rawFiles.length > 0) {
        try {
          const formData = new FormData();
          formData.append("workspaceSlug", workspaceSlug);
          formData.append("taskName", taskName || "task-file");

          rawFiles.forEach((file) => {
            // Ensure we are grabbing the actual File object
            const fileToUpload = file.file || file;
            formData.append("files", fileToUpload);
          });

          const response = await s3Api.post("/upload-task-files", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          if (response.data.success) {
            // Get the freshest state to find existing attachments
            const state = listenerApi.getState();
            const activeWorkspace = state.workspaces.list.find(
              (w) => w.slug === workspaceSlug
            );

            let currentAttachments = [];
            if (activeWorkspace?.columns) {
              activeWorkspace.columns.forEach((col) => {
                const foundTask = col.tasks?.find(
                  (t) => (t.id || t._id) === targetId
                );
                if (foundTask) currentAttachments = foundTask.attachments || [];
              });
            }

            // MERGE LOGIC:
            // 1. Keep existing files that are NOT raw File objects
            // 2. Add the new S3 response files
            const finalAttachments = [
              ...currentAttachments.filter(
                (a) => a.url && typeof a.url === "string"
              ),
              ...response.data.files,
            ];

            // Update Redux state with clean S3 URLs
            listenerApi.dispatch(
              updateTaskAttachments({
                taskId: targetId,
                attachments: finalAttachments,
              })
            );
          }
        } catch (error) {
          console.error("S3 Upload Failed:", error);
        }
      }
    }

    // Wait for the debounce delay
    await listenerApi.delay(700);

    const state = listenerApi.getState();
    const list = state.workspaces?.list;
    const activeSlug = state.workspaces?.activeWorkspaceSlug;

    if (!list || !activeSlug) return;

    const workspace = list.find((w) => w.slug === activeSlug);
    const currentUser = state.auth.currentUser;

    if (workspace?.id && workspace?.columns) {
      // Sync the final board (with S3 URLs) to the database/sockets
      saveWorkspaceBoard({
        workspaceId: workspace.id,
        columns: workspace.columns,
        user: currentUser,
      });
    }
  },
});
