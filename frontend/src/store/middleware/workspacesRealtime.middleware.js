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
  matcher: isAnyOf(setWorkspaceColumns, addTaskToWorkspaceTodo),
  effect: async (action, listenerApi) => {
    // CRITICAL: Stop if the update was received from another user (remote)
    if (action.payload?.isRemote) return;

    // Debounce: Cancel previous pending syncs and wait 700ms
    listenerApi.cancelActiveListeners();

    // S3 FILE UPLOAD LOGIC
    if (addTaskToWorkspaceTodo.match(action)) {
      const { workspaceSlug, task, rawFiles } = action.payload;
      const { id: taskId, title: taskName } = task;

      // Note: We need the raw File objects.
      // Ensure your 'action.payload' includes the raw files
      // even if the 'task' object inside it has serialized versions.

      if (rawFiles && rawFiles.length > 0) {
        try {
          const formData = new FormData();
          formData.append("workspaceSlug", workspaceSlug);
          formData.append("taskName", taskName);
          rawFiles.forEach((file) => {
            // If your 'file' is wrapped in an object, make sure you pass the actual File/Blob
            const fileToUpload = file.file || file;
            formData.append("files", fileToUpload);
          });

          const response = await s3Api.post("/upload-task-files", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          if (response.data.success) {
            // Update Redux state with S3 URLs
            listenerApi.dispatch(
              updateTaskAttachments({
                taskId,
                attachments: response.data.files,
              })
            );
          }
        } catch (error) {
          console.error("S3 Upload Failed:", error);
        }
      }
    }

    await listenerApi.delay(700);

    const state = listenerApi.getState();
    const list = state.workspaces?.list;
    const activeSlug = state.workspaces?.activeWorkspaceSlug;

    if (!list || !activeSlug) return;

    const workspace = list.find((w) => w.slug === activeSlug);
    const currentUser = state.auth.currentUser;

    if (workspace?.id && workspace?.columns) {
      saveWorkspaceBoard({
        workspaceId: workspace.id,
        columns: workspace.columns,
        user: currentUser,
      });
    }
  },
});
