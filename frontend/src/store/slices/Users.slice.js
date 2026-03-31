import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../api.js";

// Thunks
export const fetchUsers = createAsyncThunk(
  "users/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api("/auth/allUser");
      return res?.data?.data?.slice().reverse() || [];
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to fetch users",
      );
    }
  },
);

export const registerUser = createAsyncThunk(
  "users/register",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await api.post("auth/register", formData);
      return {
        user: res.data?.data,
        message: res.data?.message || "User Created",
      };
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to register user",
      );
    }
  },
);

export const updateUser = createAsyncThunk(
  "users/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/auth/${id}`, data);
      return {
        user: res.data?.data,
        message: res.data?.message || "User updated",
      };
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || err?.message || "Failed to update user",
      );
    }
  },
);

export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.delete(`auth/${id}`);
      return {
        id,
        message: res?.data?.message || "User deleted successfully",
      };
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to delete user",
      );
    }
  },
);

// State
const initialState = {
  list: [],
  loading: false,
  error: null,
};

// Slice
const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setUsers: (state, action) => {
      state.list = action.payload || [];
    },
    clearUsers: (state, action) => {
      ((state.list = []), (state.error = null));
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetching all users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // registerUser
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        const created = action.payload?.user;
        if (created) {
          state.list = [created, ...state.list];
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // updateUser
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload?.user;
        if (!updated?.id) return;

        const idx = state.list.findIndex((u) => u._id === updated.id);
        if (idx !== -1) {
          state.list[idx] = { ...state.list[idx], ...updated };
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || action.error?.message || "Failed to update user";
      })

      // deleteUser
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        const id = action.payload.id;
        state.list = state.list.filter((u) => u._id !== id);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete user";
      });
  },
});

// Actions
export const { setUsers, clearUsers } = usersSlice.actions;
export default usersSlice.reducer;

// Selectors
export const selectAllUsers = (state) => state.users.list;
export const selectUsersLoading = (state) => state.users.loading;
export const selectUsersError = (state) => state.users.error;
