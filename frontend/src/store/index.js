import { configureStore } from "@reduxjs/toolkit";
// Import slices
import authReducer from "./slices/Auth.slice.js";
import usersReducer from "./slices/Users.slice.js";
import salesReducer from "./slices/Sales.slice.js";
import taskReducer from "./slices/Tasks.slice.js";
import workspaceReducer from "./slices/Workspaces.slice.js";
import { myTasksRealtimeListener } from "./middleware/mytasksRealtime.middleware.js";
import { workspacesRealtimeListener } from "./middleware/workspacesRealtime.middleware.js";

//Store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    sales: salesReducer,
    tasks: taskReducer,
    workspaces: workspaceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: {
        ignoredPaths: ["tasks.columns"], // skip deep checking this heavy path
        warnAfter: 128,
      },
      serializableCheck: {
        ignoredPaths: ["tasks.columns"],
        ignoredActions: [
          "tasks/setMyTasksColumns",
          "tasks/fetchMyTasks/fulfilled",
        ],
      },
    })
      .prepend(myTasksRealtimeListener.middleware)
      .prepend(workspacesRealtimeListener.middleware),
});

export default store;
