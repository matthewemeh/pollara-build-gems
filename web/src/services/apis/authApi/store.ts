import { type CaseReducer, type PayloadAction, createSlice } from '@reduxjs/toolkit';

import authApi from './index';
import { AppStorage, STORAGE_KEYS } from '../../../utils/storage.utils';

const initialState: AuthStore = {
  resetToken: '',
  isAuthenticated: false,
  prefersDarkMode: false,
  currentUser: {
    email: '',
    role: 'USER',
    lastName: '',
    firstName: '',
    emailVerified: false,
  },
};

const refreshAction: CaseReducer<AuthStore, PayloadAction<TokensResponse>> = (
  state,
  { payload }
) => {
  AppStorage.set(STORAGE_KEYS.AUTH, payload.data, true);
  return state;
};

const loginAction: CaseReducer<AuthStore, PayloadAction<LoginResponse>> = (state, { payload }) => {
  const { user, tokens } = payload.data;
  AppStorage.set(STORAGE_KEYS.AUTH, tokens, true);
  return { ...state, currentUser: user, isAuthenticated: true };
};

const logoutAction: CaseReducer<AuthStore> = state => {
  const { prefersDarkMode } = state;
  AppStorage.remove(STORAGE_KEYS.AUTH);
  return { ...initialState, prefersDarkMode };
};

export const authStoreSlice = createSlice({
  name: 'authStore',
  initialState,
  reducers: {
    logout: logoutAction,
    updateUser: (state, action: PayloadAction<Partial<CurrentUser>>) => {
      state = Object.assign(state, { currentUser: { ...state.currentUser, ...action.payload } });
    },
    updateAuthStore: (state, action: PayloadAction<Partial<Omit<AuthStore, 'currentUser'>>>) => {
      state = Object.assign(state, action.payload);
    },
  },
  extraReducers: builder => {
    // these are backend routes(endpoints) which when fufilled, return payloads that updates AuthStore
    const { login, logout, refreshTokens } = authApi.endpoints;
    builder.addMatcher(login.matchFulfilled, loginAction);
    builder.addMatcher(logout.matchFulfilled, logoutAction);
    builder.addMatcher(refreshTokens.matchFulfilled, refreshAction);
  },
});

export const { updateUser, updateAuthStore, logout } = authStoreSlice.actions;
export default authStoreSlice.reducer;
