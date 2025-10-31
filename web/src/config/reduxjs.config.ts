import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import Endpoints from '../services/Endpoints';
import { AppStorage, STORAGE_KEYS } from '../utils/storage.utils';

const { BASE_URL } = Endpoints;

export const baseQuery = fetchBaseQuery({
  timeout: 30_000,
  baseUrl: BASE_URL,
  prepareHeaders: headers => {
    headers.append('x-api-key', import.meta.env.VITE_API_KEY);

    const tokens = AppStorage.get<Tokens>(STORAGE_KEYS.AUTH, true);
    if (!tokens) return headers;

    headers.append('Authorization', `Bearer ${tokens.accessToken}`);

    return headers;
  },
});
