import { createApi } from '@reduxjs/toolkit/query/react';

import Endpoints from '../../Endpoints';
import { baseQuery } from '../../../config/reduxjs.config';

const { RESULTS } = Endpoints;

// create the createApi
const formResultApi = createApi({
  baseQuery,
  keepUnusedDataFor: 0,
  refetchOnReconnect: true,
  reducerPath: 'formResultApi',
  tagTypes: ['FormResults', 'FormResult'],
  endpoints: builder => ({
    getResults: builder.query<PaginatedResponse<FormResultData>, GetResultsPayload>({
      query: ({ params }) => ({ params, method: 'GET', url: RESULTS.FORMS.FETCH }),
      providesTags: ['FormResults'],
    }),
    getResult: builder.query<FormResultResponse, string>({
      query: formID => ({
        method: 'GET',
        url: RESULTS.FORMS.RESULT.replace(':id', formID),
      }),
      providesTags: ['FormResult'],
    }),
  }),
});

export const { useGetResultsQuery, useGetResultQuery } = formResultApi;

export default formResultApi;
