import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { s3Api, workspaceApi } from "../../api";
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
  async ({ slug, id }, { rejectWithValue }) => {
    try {
      const response = await workspaceApi.delete(`/${slug}`, {
        data: { workspaceId: id },
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err?.message || "Delete workspace failed");
    }
  }
);

export const downloadWorkspaceDocs = createAsyncThunk(
  "workspaces/download",
  async ({ fileUrl, fileName }, { rejectWithValue }) => {
    try {
      const response = await workspaceApi.post("/download", {
        fileUrl,
        fileName,
      });

      const { downloadUrl } = response.data;

      if (downloadUrl) {
        // 1. Create a hidden link
        const link = document.createElement("a");
        link.href = downloadUrl;

        // 2. Set the download attribute to the actual filename
        link.setAttribute("download", fileName);

        // 3. Append, Click, and Remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        return { success: true };
      }

      return rejectWithValue("No download URL returned");
    } catch (error) {
      console.error("Download Thunk Error:", error);
      return rejectWithValue(
        error?.response?.data?.message || "Failed to get download link"
      );
    }
  }
);

// THUNK FOR AWS UPLOAD
export const uploadTaskFilesAction = createAsyncThunk(
  "workspaces/uploadTaskFiles",
  async (
    { workspaceSlug, taskId, rawFiles, existingAttachments = [] },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      rawFiles.forEach((file) => formData.append("files", file));
      formData.append("path", `workspaces/${workspaceSlug}/tasks/${taskId}`);

      // Send metadata if your middleware/backend uses it for the path
      formData.append("workspaceSlug", workspaceSlug);
      formData.append("taskId", taskId);

      // Call your specific endpoint
      const response = await s3Api.post("/upload-task-files", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        // Merge the new S3 file metadata with any files already on the task

        return {
          taskId,
          attachments: [...existingAttachments, ...response.data.files],
        };
      }

      throw new Error("Upload failed");
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
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
    isSyncing: false,
    error: null,
  },
  reducers: {
    setActiveWorkspace: (state, action) => {
      state.activeWorkspaceSlug = action.payload;
    },

    setSyncing: (state, action) => {
      state.isSyncing = action.payload;
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

    // New : updates the workspace tasks after the S3 file uploads
    updateWorkspaceTask: (state, action) => {
      const { workspaceSlug, taskId, updates } = action.payload;
      const ws = state.list.find((w) => w.slug === workspaceSlug);
      if (!ws) return;

      ws.columns.forEach((col) => {
        const index = col.tasks?.findIndex((t) => (t.id || t._id) === taskId);
        if (index !== -1 && col.tasks) {
          // Create a clean version of updates.attachments
          const cleanAttachments =
            updates.attachments?.filter((a) => a.url) || [];

          col.tasks[index] = {
            ...col.tasks[index],
            ...updates,
            attachments: cleanAttachments,
          };
        }
      });
    },

    updateTaskAttachments: (state, action) => {
      const { taskId, attachments } = action.payload;
      const activeWorkspace = state.list.find(
        (w) => w.slug === state.activeWorkspaceSlug
      );

      if (activeWorkspace && activeWorkspace.columns) {
        // Look through every column (Todo, In Progress, etc.)
        activeWorkspace.columns.forEach((column) => {
          const foundTask = column.tasks?.find((t) => t.id === taskId);
          if (foundTask) {
            // Replace or merge the attachments with the real S3 URLs
            foundTask.attachments = attachments.filter(
              (a) => a.url && typeof a.url === "string"
            );
          }
        });
      }
    },

    removeSingleAttachment: (state, action) => {
      const { taskId, fileKey } = action.payload;
      const ws = state.list.find((w) => w.slug === state.activeWorkspaceSlug);
      ws?.columns?.forEach((col) => {
        const task = col.tasks?.find((t) => t.id === taskId);
        if (task) {
          task.attachments = task.attachments.filter(
            (file) => file.key !== fileKey
          );
        }
      });
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

      .addCase(uploadTaskFilesAction.pending, (state) => {
        state.loading = true;
      })

      .addCase(uploadTaskFilesAction.fulfilled, (state, action) => {
        const { taskId, attachments } = action.payload;
        // Update the attachments in the state once AWS upload is finished

        console.log("uploadTaskFilesAction", action.payload);

        state.list.forEach((ws) => {
          ws.columns.forEach((col) => {
            const task = col.tasks?.find((t) => (t.id || t._id) === taskId);
            if (task) {
              task.attachments = attachments;
            }
          });
        });
      })

      .addCase(uploadTaskFilesAction.rejected, (state) => {
        state.loading = false;
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
      .addCase(deleteWorkspace.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteWorkspace.fulfilled, (state, action) => {
        state.loading = false;

        const deletedId = action.payload.id;

        state.list = state.list.filter((ws) => ws.id !== deletedId);

        if (state.activeWorkspaceSlug === action.payload.slug) {
          state.activeWorkspaceSlug = null;
        }
      })
      .addCase(deleteWorkspace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// --- Exports ---

export const {
  setActiveWorkspace,
  setWorkspaceColumns,
  addWorkspace,
  addTaskToWorkspaceTodo,
  updateWorkspaceTask,
  updateTaskAttachments,
  removeSingleAttachment,
  setSyncing,
} = WorkspacesSlice.actions;

export default WorkspacesSlice.reducer;

// Selectors
export const selectWorkspaces = (state) => state.workspaces.list;
export const selectWorkspaceLoading = (state) => state.workspaces.loading;
export const selectActiveWorkspace = (state) =>
  state.workspaces.list.find(
    (w) => w.slug === state.workspaces.activeWorkspaceSlug
  );
export const selectIsSyncing = (state) => state.workspaces.isSyncing;
