import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';
import { authApi } from '../../api/services';

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await authApi.login(credentials);
    return data;
  } catch (err) {
    return rejectWithValue(
      err.response?.data?.message || err.response?.data?.error || 'Login failed. Check username/password.'
    );
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, { getState }) => {
  const { refreshToken } = getState().auth;
  if (refreshToken) await authApi.logout(refreshToken).catch(() => {});
  localStorage.clear();
});

export const restoreSession = createAsyncThunk('auth/restoreSession', async (_, { dispatch }) => {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    if (decoded.exp * 1000 > Date.now()) {
      return {
        accessToken: token,
        refreshToken: localStorage.getItem('refreshToken'),
        user: {
          // ✅ FIX: decoded.sub is a string (JWT standard). Convert to Number so
          //         it matches the type from login.fulfilled (payload.userId = Long).
          //         Prevents subtle === comparison failures after page refresh.
          userId: Number(decoded.sub),
          username: decoded.username || decoded.email?.split('@')[0],
          email: decoded.email,
          role: decoded.role,
          classId: decoded.classId,
          subjectIds: decoded.subjectIds,
        },
      };
    } else {
      localStorage.clear();
      return null;
    }
  } catch {
    localStorage.clear();
    return null;
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    accessToken: localStorage.getItem('accessToken') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    isAuthenticated: false,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.accessToken = payload.accessToken;
        state.refreshToken = payload.refreshToken;
        state.isAuthenticated = true;
        state.user = {
          userId: payload.userId,       // already a number from server response
          username: payload.username,
          email: payload.email,
          role: payload.role,
          classId: payload.classId,
        };
        localStorage.setItem('accessToken', payload.accessToken);
        localStorage.setItem('refreshToken', payload.refreshToken);
      })
      .addCase(login.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
        state.isAuthenticated = false;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(restoreSession.fulfilled, (state, { payload }) => {
        if (payload) {
          state.accessToken = payload.accessToken;
          state.refreshToken = payload.refreshToken;
          state.user = payload.user;
          state.isAuthenticated = true;
        }
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;

export const selectUser = (state) => state.auth.user;
export const selectRole = (state) => state.auth.user?.role;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;