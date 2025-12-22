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
} from "../slices/Workspaces.slice.js";

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
    await listenerApi.delay(700);

    const state = listenerApi.getState();
    const list = state.workspaces?.list;
    const activeSlug = state.workspaces?.activeWorkspaceSlug;

    if (!list || !activeSlug) return;

    const workspace = list.find((w) => w.slug === activeSlug);

    if (workspace?.id && workspace?.columns) {
      saveWorkspaceBoard({
        workspaceId: workspace.id,
        columns: workspace.columns,
      });
    }
  },
});
