import { createApi } from '@reduxjs/toolkit/query/react';

import Endpoints from '../../Endpoints';
import { baseQuery } from '../../../config/reduxjs.config';

const { VOTES } = Endpoints;

// create the createApi
const formVoteApi = createApi({
  baseQuery,
  refetchOnReconnect: true,
  reducerPath: 'formVoteApi',
  endpoints: builder => ({
    castVote: builder.mutation<VoteResponse, FormVotePayload>({
      query: body => ({ body, method: 'POST', url: VOTES.FORMS.CAST }),
    }),
    verifyVote: builder.mutation<VerifyFormVoteResponse, VerifyVotePayload>({
      query: body => ({ body, method: 'POST', url: VOTES.FORMS.VERIFY }),
    }),
    addVoteToken: builder.mutation<AddVoteTokenResponse, void>({
      query: () => ({ method: 'POST', url: VOTES.FORMS.TOKEN }),
    }),
    getVotes: builder.query<PaginatedResponse<Vote>, GetVotesPayload>({
      query: ({ id, params }) => ({
        params,
        method: 'GET',
        url: VOTES.FORMS.FETCH.replace(':id', id),
      }),
    }),
  }),
});

export const {
  useGetVotesQuery,
  useCastVoteMutation,
  useVerifyVoteMutation,
  useAddVoteTokenMutation,
} = formVoteApi;

export default formVoteApi;
