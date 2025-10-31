/* persist our store */
import { combineReducers } from 'redux';
import storage from 'redux-persist/lib/storage';
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';

import authApi from './apis/authApi';
import userApi from './apis/userApi';
import faceApi from './apis/faceApi';
import formApi from './apis/formApi';
import partyApi from './apis/partyApi';
import electionApi from './apis/electionApi';
import electionVoteApi from './apis/voteApi';
import formVoteApi from './apis/voteApi/form';
import logApi from './apis/notificationApi/log';
import contestantApi from './apis/contestantApi';
import electionResultApi from './apis/resultApi';
import formResultApi from './apis/resultApi/form';
import authStoreSlice from './apis/authApi/store';
import notificationApi from './apis/notificationApi';

import { isDevMode } from '../helpers/devDetect';

// reducers
const reducer = combineReducers({
  authStore: authStoreSlice,
  [logApi.reducerPath]: logApi.reducer,
  [formApi.reducerPath]: formApi.reducer,
  [authApi.reducerPath]: authApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [faceApi.reducerPath]: faceApi.reducer,
  [partyApi.reducerPath]: partyApi.reducer,
  [electionApi.reducerPath]: electionApi.reducer,
  [formVoteApi.reducerPath]: formVoteApi.reducer,
  [formResultApi.reducerPath]: formResultApi.reducer,
  [contestantApi.reducerPath]: contestantApi.reducer,
  [electionVoteApi.reducerPath]: electionVoteApi.reducer,
  [notificationApi.reducerPath]: notificationApi.reducer,
  [electionResultApi.reducerPath]: electionResultApi.reducer,
});

const persistConfig = {
  storage,
  version: 1,
  key: 'root',
  // Exclude RTK Query caches and temporary data
  blacklist: [
    authApi.reducerPath,
    logApi.reducerPath,
    formApi.reducerPath,
    userApi.reducerPath,
    faceApi.reducerPath,
    partyApi.reducerPath,
    formVoteApi.reducerPath,
    electionApi.reducerPath,
    formResultApi.reducerPath,
    contestantApi.reducerPath,
    electionVoteApi.reducerPath,
    notificationApi.reducerPath,
    electionResultApi.reducerPath,
  ],
};

// persist our store
const persistedReducer = persistReducer(persistConfig, reducer);

// creating our store
const store = configureStore({
  devTools: isDevMode(),
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: { ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER] },
    }).concat(
      logApi.middleware,
      formApi.middleware,
      authApi.middleware,
      userApi.middleware,
      faceApi.middleware,
      partyApi.middleware,
      formVoteApi.middleware,
      electionApi.middleware,
      contestantApi.middleware,
      formResultApi.middleware,
      electionVoteApi.middleware,
      notificationApi.middleware,
      electionResultApi.middleware
    ),
});

// enables refetching on reconnecting to the internet
setupListeners(store.dispatch);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
