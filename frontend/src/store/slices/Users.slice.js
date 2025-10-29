import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api";

// Thunks
export const fetchUsers = createAsyncThunk(
  "users/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api("/auth/allUser");
      return res?.data?.data?.slice().reverse() || [];
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to fetch users"
      );
    }
  }
);

export const registerUser = createAsyncThunk(
  "users/register",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await api.post("auth/register", formData);
      console.log("from the register user thunk", res);
      return {
        user: res.data?.data,
        message: res.data?.message || "User Created",
      };
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to register user"
      );
    }
  }
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
      (state.list = []), (state.error = null);
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
