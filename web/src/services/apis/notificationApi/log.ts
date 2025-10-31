import { createApi } from '@reduxjs/toolkit/query/react';

import Endpoints from '../../Endpoints';
import { baseQuery } from '../../../config/reduxjs.config';

const { LOGS } = Endpoints;

// create the createApi
const logApi = createApi({
  baseQuery,
  tagTypes: ['Logs'],
  reducerPath: 'logApi',
  refetchOnReconnect: true,
  endpoints: builder => ({
    getLogs: builder.query<PaginatedResponse<Log>, GetLogsPayload>({
      query: ({ params }) => ({ params, method: 'GET', url: LOGS }),
      providesTags: ['Logs'],
    }),
  }),
});

export const { useGetLogsQuery } = logApi;

export default logApi;
