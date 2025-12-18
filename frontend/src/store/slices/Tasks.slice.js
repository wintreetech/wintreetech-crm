import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { tasksApi } from "../../api";

/**
 * HELPER: Internal utility to find and update a column by ID/Title
 * This keeps the Thunk logic clean without changing the actual filter/map logic.
 */
const getUpdatedColumns = (columns, columnId, taskTransform) => {
  const targetKey = String(columnId).toLowerCase().replace(/\s+/g, "-");

  return (columns || []).map((col) => {
    const colKey = String(col?.id || col?.title)
      .toLowerCase()
      .replace(/\s+/g, "-");
    if (colKey !== targetKey) return col;

    return {
      ...col,
      tasks: taskTransform(col.tasks || []),
    };
  });
};

// --- Thunks ---

export const fetchMyTasks = createAsyncThunk(
  "tasks/fetchMyTasks",
  async ({ userId, username }, { rejectWithValue }) => {
    try {
      const res = await tasksApi.get("/mytasks", {
        params: { userId, username },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || err?.message || "Failed to fetch"
      );
    }
  }
);

export const createMyTasksSpace = createAsyncThunk(
  "tasks/createMyTasksSpace",
  async ({ user, columns }, { rejectWithValue }) => {
    try {
      const res = await tasksApi.post("/mytasks", { user, columns });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || err?.message || "Failed to create space"
      );
    }
  }
);

export const deleteTask = createAsyncThunk(
  "tasks/deleteTask",
  async (
    { scope = "mytasks", workspaceSlug = null, columnId, taskId },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState();
      let columns = [];

      if (scope === "workspace") {
        const ws = state.workspaces.list.find((w) => w.slug === workspaceSlug);
        if (!ws) return rejectWithValue("Workspace not found");
        columns = ws.columns;
      } else {
        columns = state.tasks.columns;
      }

      const updatedColumns = getUpdatedColumns(columns, columnId, (tasks) =>
        tasks.filter((t) => String(t.id) !== String(taskId))
      );

      return { scope, workspaceSlug, columns: updatedColumns };
    } catch (err) {
      return rejectWithValue(err?.message || "Delete failed");
    }
  }
);

export const updateTask = createAsyncThunk(
  "tasks/updateTask",
  async (
    { scope = "mytasks", workspaceSlug = null, columnId, taskId, updates },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState();
      let columns = [];

      if (scope === "workspace") {
        const ws = state.workspaces.list.find((w) => w.slug === workspaceSlug);
        if (!ws) return rejectWithValue("Workspace not found");
        columns = ws.columns;
      } else {
        columns = state.tasks.columns;
      }

      const updatedColumns = getUpdatedColumns(columns, columnId, (tasks) =>
        tasks.map((t) =>
          String(t.id) === String(taskId) ? { ...t, ...updates } : t
        )
      );

      return { scope, workspaceSlug, columns: updatedColumns };
    } catch (err) {
      return rejectWithValue(err?.message || "Update failed");
    }
  }
);

// --- Slice ---

const taskSlice = createSlice({
  name: "tasks",
  initialState: {
    user: { id: null, username: null },
    columns: [],
    loading: false,
    error: null,
  },

  reducers: {
    setMyTasksColumns: (state, action) => {
      const incoming = Array.isArray(action.payload)
        ? action.payload
        : action.payload.columns;

      // Keep the Deep Equality Guard to prevent loops
      if (JSON.stringify(state.columns) === JSON.stringify(incoming)) return;

      state.columns = incoming;
    },

    addMyTask(state, action) {
      const { columnId = "todo", task } = action.payload || {};
      const col = state.columns.find((c) => c.id === columnId);
      if (col) col.tasks.unshift(task);
    },
  },

  extraReducers: (builder) => {
    builder
      // Fetch
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
        state.error = action.payload;
      })
      // Create
      .addCase(createMyTasksSpace.pending, (state) => {
        state.loading = true;
      })
      .addCase(createMyTasksSpace.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload?.user || state.user;
        state.columns = action.payload?.columns || [];
      })
      // Global Delete & Update handlers
      .addMatcher(
        (action) =>
          [deleteTask.fulfilled.type, updateTask.fulfilled.type].includes(
            action.type
          ),
        (state, action) => {
          if (action.payload.scope === "mytasks") {
            state.columns = action.payload.columns || state.columns;
          }
        }
      );
  },
});

export const { setMyTasksColumns, addMyTask } = taskSlice.actions;
export default taskSlice.reducer;

// --- Selectors ---

export const selectMyTasksColumns = (state) => state?.tasks ?? {};
export const selectTasksLoading = (state) => state.tasks.loading;
export const selectTasksError = (state) => state.tasks.error;
