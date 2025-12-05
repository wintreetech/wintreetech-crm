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
          () => resolve(initialColumns.map(({ title, ...rest }) => rest)),
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

const taskSlice = createSlice({
  name: "tasks",
  initialState: {
    // columns: initialColumns.map(({ title, ...rest }) => ({
    //   ...rest,
    //   tasks: rest.tasks || [],
    // })),
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
        state.columns = action.payload || [];
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
      });
  },
});

export const { setMyTasksColumns, addMyTask, updateMyTask, deleteMyTask } =
  taskSlice.actions;

export default taskSlice.reducer;

// ✅ Selectors
export const selectMyTasksColumns = (state) => {
  return state?.tasks?.columns ?? [];
};
export const selectTasksLoading = (state) => state.tasks.loading;
export const selectTasksError = (state) => state.tasks.error;
