import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api";

//Thunks
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/login", credentials);
      const user = res.data.user;
      localStorage.setItem("currentUser", JSON.stringify(user));
      return { user, message: res.data.message };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  }
);

export const getUserFromStorage = createAsyncThunk(
  "auth/getUserFromStorage",
  async (_, { dispatch }) => {
    try {
      const storedUser = localStorage.getItem("currentUser");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        dispatch(setCurentUser(user));
        return user;
      }
      return null;
    } catch (err) {
      console.error("Error retrieving user from localStorage:", err);
      return null;
    }
  }
);

// State
const initialState = {
  currentUser: {
    username: "",
    email: "",
  },
  loading: false,
  error: null,
};

// Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCurentUser: (state, action) => {
      const { username, email } = action.payload;
      state.currentUser = { username, email };
    },
    logout: (state) => {
      try {
        localStorage.removeItem("currentUser");
        localStorage.clear();
      } catch (err) {
        console.error("logout failed", e);
      }
      state = initialState;
    },
  },
  extraReducers: (buider) => {
    buider
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload.user;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Actions
export const { setCurentUser, setAllUsers, logout } = authSlice.actions;

// Reducer
export default authSlice.reducer;

// Selectors
export const selectCurrentUser = (state) => state.auth.currentUser;
export const selectIsAuthenticated = (state) =>
  Boolean(state.auth.currentUser?.email);
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
