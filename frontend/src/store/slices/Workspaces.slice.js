import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { workspaceApi } from "../../api";
import { deleteTask } from "./Tasks.slice";

// --- Async Thunks ---

export const fetchWorkspaces = createAsyncThunk(
  "workspaces/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await workspaceApi.get("/all");
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch workspaces"
      );
    }
  }
);

export const createWorkspace = createAsyncThunk(
  "workspaces/create",
  async (workspaceData, { rejectWithValue }) => {
    try {
      const res = await workspaceApi.post("/create", workspaceData);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to create workspace"
      );
    }
  }
);

export const updateMembersInWorkspace = createAsyncThunk(
  "workspaces/updateMembers",
  async ({ workspaceId, membersToAdd }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const workspace = state.workspaces.list.find(
        (w) => String(w.id) === String(workspaceId)
      );
      if (!workspace) throw new Error("Workspace not found locally");

      const res = await workspaceApi.post(`/${workspace.slug}/members`, {
        members: membersToAdd,
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to update members"
      );
    }
  }
);

export const deleteWorkspace = createAsyncThunk(
  "workspaces/delete",
  async ({ workspaceId }, { rejectWithValue }) => {
    try {
      // Logic for API delete would go here
      return { workspaceId };
    } catch (err) {
      return rejectWithValue(err?.message || "Delete workspace failed");
    }
  }
);

// --- Slice ---

const WorkspacesSlice = createSlice({
  name: "workspaces",
  initialState: {
    list: [],
    activeWorkspaceSlug: null,
    loading: false,
    error: null,
  },
  reducers: {
    setActiveWorkspace: (state, action) => {
      state.activeWorkspaceSlug = action.payload;
    },

    setWorkspaceColumns: (state, action) => {
      const { workspaceSlug, columns } = action.payload;
      const ws = state.list.find((w) => w.slug === workspaceSlug);
      if (!ws) return;

      // GUARD: Prevent Redux trigger if data is identical (prevents socket loops)
      if (JSON.stringify(ws.columns) === JSON.stringify(columns)) return;

      ws.columns = columns;
    },

    addWorkspace: (state, action) => {
      state.list.unshift(action.payload);
    },

    addTaskToWorkspaceTodo: (state, action) => {
      const { workspaceSlug, task } = action.payload;
      const ws = state.list.find((w) => w.slug === workspaceSlug);
      if (!ws || !Array.isArray(ws.columns)) return;

      // Find 'todo' column by normalized key
      const todoCol =
        ws.columns.find((c) => {
          const key = (c?.id || c?.title || "")
            .toString()
            .toLowerCase()
            .replace(/\s+/g, "-");
          return key === "todo";
        }) || ws.columns[0];

      if (todoCol) {
        if (!Array.isArray(todoCol.tasks)) todoCol.tasks = [];
        todoCol.tasks.unshift(task);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      /* Fetch Workspaces */
      .addCase(fetchWorkspaces.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWorkspaces.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload || [];
      })
      .addCase(fetchWorkspaces.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* Create Workspace */
      .addCase(createWorkspace.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })

      /* Update Members (Handles both Add and Update) */
      .addCase(updateMembersInWorkspace.fulfilled, (state, action) => {
        const updatedWs = action.payload;
        const index = state.list.findIndex(
          (w) => String(w.id) === String(updatedWs.id)
        );
        if (index !== -1) state.list[index] = updatedWs;
      })

      /* Delete Task (Syncing columns) */
      .addCase(deleteTask.fulfilled, (state, action) => {
        if (action.payload.scope !== "workspace") return;
        const { workspaceSlug, columns } = action.payload;
        const ws = state.list.find((w) => w.slug === workspaceSlug);
        if (ws) ws.columns = columns || ws.columns;
      })

      /* Delete Workspace */
      .addCase(deleteWorkspace.fulfilled, (state, action) => {
        const { workspaceId } = action.payload;
        state.list = state.list.filter(
          (w) => String(w.id) !== String(workspaceId)
        );

        // Reset active slug if the active workspace was deleted
        const activeExists = state.list.some(
          (w) => w.slug === state.activeWorkspaceSlug
        );
        if (!activeExists) state.activeWorkspaceSlug = null;
      });
  },
});

// --- Exports ---

export const {
  setActiveWorkspace,
  setWorkspaceColumns,
  addWorkspace,
  addTaskToWorkspaceTodo,
} = WorkspacesSlice.actions;

export default WorkspacesSlice.reducer;

// Selectors
export const selectWorkspaces = (state) => state.workspaces.list;
export const selectWorkspaceLoading = (state) => state.workspaces.loading;
export const selectActiveWorkspace = (state) =>
  state.workspaces.list.find(
    (w) => w.slug === state.workspaces.activeWorkspaceSlug
  );
