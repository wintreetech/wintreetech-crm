import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { workspaces as initialWorkspaces } from "../../utils/data";
import { deleteTask } from "./Tasks.slice";

// ✅ fetch list (mock)
export const fetchWorkspaces = createAsyncThunk(
  "workspaces/fetchWorkspaces",
  async () => {
    // later replace with API
    return initialWorkspaces;
  }
);

// ✅ save columns (mock)
export const saveWorkspaceColumns = createAsyncThunk(
  "workspaces/saveWorkspaceColumns",
  async ({ workspaceSlug, columns }) => {
    // later replace with API
    return { workspaceSlug, columns };
  }
);

const WorkspacesSlice = createSlice({
  name: "workspaces",
  initialState: {
    // list: [],
    list: initialWorkspaces,
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
      if (ws) ws.columns = columns;
    },

    addWorkspace: (state, action) => {
      state.list.unshift(action.payload);
    },

    // ✅ EXISTING: Add-only behavior (kept as-is)
    addMembersToWorkspace: (state, action) => {
      const { workspaceId, membersToAdd } = action.payload;

      const ws = state.list.find((w) => String(w.id) === String(workspaceId));
      if (!ws) return;

      if (!Array.isArray(ws.members)) ws.members = [];

      const existingKeys = new Set(ws.members.map((m) => m._id || m.email));

      membersToAdd.forEach((m) => {
        const key = m._id || m.email;
        if (!existingKeys.has(key)) {
          ws.members.push(m);
          existingKeys.add(key);
        }
      });
    },

    // ✅ NEW: Update members (replace workspace members with selected list)
    updateMembersInWorkspace: (state, action) => {
      const { workspaceId, membersToAdd } = action.payload;

      const ws = state.list.find((w) => String(w.id) === String(workspaceId));
      if (!ws) return;

      // ensure array
      const nextMembers = Array.isArray(membersToAdd) ? membersToAdd : [];

      // de-dup by _id/email while preserving order
      const seen = new Set();
      ws.members = nextMembers.filter((m) => {
        const key = m?._id || m?.email;
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    },

    // ✅ NEW: add task to TODO column with tag "New" + assign info
    addTaskToWorkspaceTodo: (state, action) => {
      const { workspaceSlug, task } = action.payload;
      const ws = state.list.find((w) => w.slug === workspaceSlug);
      if (!ws) return;

      if (!Array.isArray(ws.columns)) ws.columns = [];

      // find todo column (supports id/title/name/slug)
      const todoCol =
        ws.columns.find((c) => {
          const key = (c?.id || c?.title || c?.name || c?.slug || "")
            .toString()
            .toLowerCase()
            .replace(/\s+/g, "-");
          return key === "todo" || key === "to-do";
        }) || ws.columns[0];

      if (!todoCol) return;
      if (!Array.isArray(todoCol.tasks)) todoCol.tasks = [];

      todoCol.tasks.unshift(task); // add on top
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkspaces.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWorkspaces.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload || [];
      })
      .addCase(fetchWorkspaces.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || "Failed to load workspaces";
      })

      .addCase(saveWorkspaceColumns.fulfilled, (state, action) => {
        const { workspaceSlug, columns } = action.payload;
        const ws = state.list.find((w) => w.slug === workspaceSlug);
        if (ws) ws.columns = columns;
      })

      // ✅ NEW: handle deleteTask for workspace
      .addCase(deleteTask.fulfilled, (state, action) => {
        if (action.payload.scope !== "workspace") return;

        const { workspaceSlug, columns } = action.payload;
        const ws = state.list.find((w) => w.slug === workspaceSlug);
        if (ws) ws.columns = columns || ws.columns;
      });
  },
});

export const {
  setActiveWorkspace,
  setWorkspaceColumns,
  addWorkspace,
  addMembersToWorkspace,
  updateMembersInWorkspace, // ✅ export new updater
  addTaskToWorkspaceTodo,
} = WorkspacesSlice.actions;

export default WorkspacesSlice.reducer;

// ✅ selectors
export const selectWorkspaces = (state) => state.workspaces.list;
export const selectWorkspaceLoading = (state) => state.workspaces.loading;
export const selectActiveWorkspace = (state) =>
  state.workspaces.list.find(
    (w) => w.slug === state.workspaces.activeWorkspaceSlug
  );
