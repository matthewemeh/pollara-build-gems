import { createApi } from '@reduxjs/toolkit/query/react';

import Endpoints from '../../Endpoints';
import { baseQuery } from '../../../config/reduxjs.config';

const { RESULTS } = Endpoints;

// create the createApi
const electionResultApi = createApi({
  baseQuery,
  keepUnusedDataFor: 0,
  reducerPath: 'electionResultApi',
  tagTypes: ['ElectionResults', 'ElectionResult'],
  refetchOnReconnect: true,
  endpoints: builder => ({
    getResults: builder.query<PaginatedResponse<ElectionResultData>, GetResultsPayload>({
      query: ({ params }) => ({ params, method: 'GET', url: RESULTS.ELECTIONS.FETCH }),
      providesTags: ['ElectionResults'],
    }),
    getResult: builder.query<ElectionResultResponse, string>({
      query: electionID => ({
        method: 'GET',
        url: RESULTS.ELECTIONS.RESULT.replace(':id', electionID),
      }),
      providesTags: ['ElectionResult'],
    }),
  }),
});

export const { useGetResultsQuery, useGetResultQuery } = electionResultApi;

export default electionResultApi;
