import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import { socket } from "../../socket";
import {
  registerMyTasksSocket,
  joinMyTasksRoom,
} from "../../socket/mytasks.socket";

import {
  fetchMyTasks,
  createMyTasksSpace,
  setMyTasksColumns,
  updateTask,
  deleteTask,
} from "../slices/Tasks.slice.js";

export const myTasksRealtimeListener = createListenerMiddleware();

let socketRegistered = false;
let joinedUserId = null;

const emitSaveBoard = (user, columns) => {
  // Keeping console logs for monitoring
  console.log("user", user);
  console.log("columns", columns);

  if (!user?.id || !Array.isArray(columns)) return;
  socket.emit("mytasks:save_board", { user, columns });
  console.log("board saved sent");
};

// Handle socket registration and room entry
myTasksRealtimeListener.startListening({
  matcher: isAnyOf(fetchMyTasks.fulfilled, createMyTasksSpace.fulfilled),
  effect: async (action, listenerApi) => {
    const state = listenerApi.getState();
    const user = state?.tasks?.user || action.payload?.user;

    if (!user?.id) return;

    // Register listeners once
    if (!socketRegistered) {
      registerMyTasksSocket({
        onBoardSync: (columns) => {
          // isRemote flag prevents sync loops
          listenerApi.dispatch(setMyTasksColumns({ columns, isRemote: true }));
        },
      });
      socketRegistered = true;
    }

    // Join room once per session
    if (joinedUserId !== user.id) {
      joinMyTasksRoom(user.id);
      joinedUserId = user.id;
    }
  },
});

// Handle debounced persistence
myTasksRealtimeListener.startListening({
  // Listen to ALL actions that change the board
  matcher: isAnyOf(
    setMyTasksColumns,
    updateTask.fulfilled,
    deleteTask.fulfilled
  ),
  effect: async (action, listenerApi) => {
    // Skip if update came from server
    if (action.payload?.isRemote) return;

    listenerApi.cancelActiveListeners();
    await listenerApi.delay(700);

    const state = listenerApi.getState();
    const { user, columns } = state.tasks;

    if (user?.id && Array.isArray(columns)) {
      emitSaveBoard(user, columns);
    }
  },
});
