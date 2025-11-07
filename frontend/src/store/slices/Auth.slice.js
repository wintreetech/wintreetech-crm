import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api";
import { decryptData, encryptData } from "../../utils/cryptoUtils";

//Thunks
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/login", credentials);
      const user = res.data.user;

      console.log("User data", user);

      if (!user) {
        throw new Error("No user returned from server");
      }

      // Encrypt user data before saving
      const encryptedUser = await encryptData(user);
      localStorage.setItem("currentUser", encryptedUser);
      console.log("item setetd");

      return { user, message: res.data.message };
    } catch (err) {
      console.error(err);
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  }
);

export const getUserFromStorage = createAsyncThunk(
  "auth/getUserFromStorage",
  async (_, { dispatch }) => {
    try {
      const stored = localStorage.getItem("currentUser");
      if (!stored) return null;

      const user = await decryptData(stored); // ⟵ decrypt here
      dispatch(setCurentUser(user)); // ⟵ set your state
      return user;
    } catch (err) {
      localStorage.removeItem("currentUser");
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
      state.currentUser = action.payload;
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
