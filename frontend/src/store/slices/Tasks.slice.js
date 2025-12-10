import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { initialColumns } from "../../utils/data";

/**
 * ✅ Async Thunks (API placeholders)
 * Replace the fake Promise with your real API calls later.
 */

// Fetch logged-in user's tasks (columns)
export const fetchMyTasks = createAsyncThunk(
  "tasks/fetchMyTasks",
  async (_, { rejectWithValue }) => {
    try {
      // TODO: replace with real API call
      // const res = await api.get("/tasks/mytasks");
      // return res.data.columns;

      return new Promise((resolve) => {
        setTimeout(
          () =>
            resolve({
              user: { id: "1", username: "demo" },
              columns: initialColumns.map(({ title, ...rest }) => rest),
              // columns: [],
            }),
          500
        );
      });
    } catch (err) {
      return rejectWithValue(err?.message || "Failed to fetch my tasks");
    }
  }
);

// Save board columns after drag/drop
export const saveMyTasksColumns = createAsyncThunk(
  "tasks/saveMyTasksColumns",
  async (columns, { rejectWithValue }) => {
    try {
      // TODO: replace with real API call
      // await api.patch("/tasks/mytasks", { columns });

      return new Promise((resolve) => {
        setTimeout(() => resolve(columns), 200);
      });
    } catch (err) {
      return rejectWithValue(err?.message || "Failed to save tasks");
    }
  }
);

// Creates a new
export const createMyTasksSpace = createAsyncThunk(
  "tasks/createMyTasksSpace",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();

      const user = state?.tasks?.user ||
        state?.auth?.user || { id: "1", username: "demo" };

      return new Promise((resolve) => {
        setTimeout(
          () =>
            resolve({
              user,
              columns: [],
            }),
          200
        );
      });
    } catch (err) {
      return rejectWithValue(err?.message || "Failed to create my tasks space");
    }
  }
);

/**
 * ✅ NEW THUNK: deleteTask
 * - works for BOTH mytasks + workspace tasks
 * - returns updated columns
 */

export const deleteTask = createAsyncThunk(
  "tasks/deleteTask",
  async (
    { scope = "mytasks", workspaceSlug = null, columnId, taskId },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState();

      // WORKSPACE delete
      if (scope === "workspace") {
        const ws = state.workspaces.list.find((w) => w.slug === workspaceSlug);

        if (!ws) return rejectWithValue("Workspace not found");

        const columns = Array.isArray(ws.columns) ? ws.columns : [];

        const updatedColumns = columns.map((col) => {
          const colKey = String(col?.id || col?.title)
            .toLocaleLowerCase()
            .replace(/\s+/g, "-");

          const targetKey = String(columnId).toLowerCase().replace(/\s+/g, "-");

          if (colKey !== targetKey) return col;

          return {
            ...col,
            tasks: Array.isArray(col.tasks)
              ? col.tasks.filter((t) => String(t.id) !== String(taskId))
              : [],
          };
        });

        return {
          scope: "workspace",
          workspaceSlug,
          columns: updatedColumns,
        };
      }

      // MYTASKS delete

      const columns = Array.isArray(state.tasks.columns)
        ? state.tasks.columns
        : [];

      const updatedColumns = columns.map((col) => {
        const colKey = String(col?.id || col?.title)
          .toLowerCase()
          .replace(/\s+/g, "-");

        const targetKey = String(columnId).toLowerCase().replace(/\s+/g, "-");

        if (colKey !== targetKey) return col;

        return {
          ...col,
          tasks: Array.isArray(col.tasks)
            ? col.tasks.filter((t) => String(t.id) !== String(taskId))
            : [],
        };
      });

      return {
        scope: "mytasks",
        columns: updatedColumns,
      };
    } catch (err) {
      return rejectWithValue(err?.message || "Delete failed");
    }
  }
);

/**
 * ✅ NEW THUNK: updateTask
 * - works for BOTH mytasks + workspace tasks
 * - updates a task by id (optionally moving between columns)
 * - returns updated columns
 */

export const updateTask = createAsyncThunk(
  "tasks/updateTask",
  async (
    { scope = "mytasks", workspaceSlug = null, columnId, taskId, updates },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState();

      // WORKSPACE update
      if (scope === "workspace") {
        const ws = state.workspaces.list.find((w) => w.slug === workspaceSlug);
        if (!ws) return rejectWithValue("Workspace not found");

        const columns = Array.isArray(ws.columns) ? ws.columns : [];

        const updatedColumns = columns.map((col) => {
          const colKey = String(col?.id || col?.title)
            .toLowerCase()
            .replace(/\s+/g, "-");

          const targetKey = String(columnId).toLowerCase().replace(/\s+/g, "-");
          if (colKey !== targetKey) return col;

          return {
            ...col,
            tasks: Array.isArray(col.tasks)
              ? col.tasks.map((t) =>
                  String(t.id) === String(taskId) ? { ...t, ...updates } : t
                )
              : [],
          };
        });

        return {
          scope: "workspace",
          workspaceSlug,
          columns: updatedColumns,
        };
      }

      // MYTASKS update
      const columns = Array.isArray(state.tasks.columns)
        ? state.tasks.columns
        : [];

      const updatedColumns = columns.map((col) => {
        const colKey = String(col?.id || col?.title)
          .toLowerCase()
          .replace(/\s+/g, "-");

        const targetKey = String(columnId).toLowerCase().replace(/\s+/g, "-");
        if (colKey !== targetKey) return col;

        return {
          ...col,
          tasks: Array.isArray(col.tasks)
            ? col.tasks.map((t) =>
                String(t.id) === String(taskId) ? { ...t, ...updates } : t
              )
            : [],
        };
      });

      return {
        scope: "mytasks",
        columns: updatedColumns,
      };
    } catch (err) {
      return rejectWithValue(err?.message || "Update failed");
    }
  }
);

const taskSlice = createSlice({
  name: "tasks",
  initialState: {
    user: { id: null, username: null },
    columns: [],
    loading: false,
    error: null,
  },

  reducers: {
    /**
     * ✅ Directly replace columns from UI board callback
     * payload must be: [{ id, tasks }]
     */
    setMyTasksColumns(state, action) {
      state.columns = action.payload || [];
    },

    /**
     * ✅ Add task into a specific column (default todo)
     * payload: { columnId?: "todo"|"inprogress"|"completed", task }
     */
    addMyTask(state, action) {
      const { columnId = "todo", task } = action.payload || {};
      const col = state.columns.find((c) => c.id === columnId);
      if (!col) return;
      col.tasks.unshift(task);
    },

    /**
     * ✅ Update a task by id inside any column
     * payload: { taskId, updates }
     */
    updateMyTask(state, action) {
      const { taskId, updates } = action.payload || {};
      if (!taskId) return;

      for (const col of state.columns) {
        const i = col.tasks.findIndex((t) => t.id === taskId);
        if (i !== -1) {
          col.tasks[i] = { ...col.tasks[i], ...updates };
          break;
        }
      }
    },

    /**
     * ✅ Remove task by id
     * payload: taskId
     */
    deleteMyTask(state, action) {
      const taskId = action.payload;
      if (!taskId) return;

      for (const col of state.columns) {
        col.tasks = col.tasks.filter((t) => t.id !== taskId);
      }
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchMyTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload?.user || state.user;
        state.columns = action.payload?.columns || [];
      })
      .addCase(fetchMyTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      })

      .addCase(saveMyTasksColumns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveMyTasksColumns.fulfilled, (state, action) => {
        state.loading = false;
        state.columns = action.payload || state.columns;
      })
      .addCase(saveMyTasksColumns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to save";
      })
      .addCase(createMyTasksSpace.fulfilled, (state, action) => {
        state.user = action.payload?.user || state.user;
        state.columns = action.payload?.columns || [];
      })
      // ✅ NEW: handle deleteTask for mytasks
      .addCase(deleteTask.fulfilled, (state, action) => {
        if (action.payload.scope !== "mytasks") return;
        state.columns = action.payload.columns || state.columns;
      })

      // ✅ NEW: handle updateTask for mytasks and workspace
      .addCase(updateTask.fulfilled, (state, action) => {
        if (action.payload.scope !== "mytasks") return;
        state.columns = action.payload.columns || state.columns;
      });
  },
});

export const { setMyTasksColumns, addMyTask, updateMyTask, deleteMyTask } =
  taskSlice.actions;

export default taskSlice.reducer;

// ✅ Selectors
export const selectMyTasksColumns = (state) => {
  return state?.tasks ?? {};
};
export const selectTasksLoading = (state) => state.tasks.loading;
export const selectTasksError = (state) => state.tasks.error;
