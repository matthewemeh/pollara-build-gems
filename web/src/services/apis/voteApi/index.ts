import { createApi } from '@reduxjs/toolkit/query/react';

import Endpoints from '../../Endpoints';
import { baseQuery } from '../../../config/reduxjs.config';

const { VOTES } = Endpoints;

// create the createApi
const electionVoteApi = createApi({
  baseQuery,
  refetchOnReconnect: true,
  reducerPath: 'electionVoteApi',
  endpoints: builder => ({
    castVote: builder.mutation<VoteResponse, ElectionVotePayload>({
      query: body => ({ body, method: 'POST', url: VOTES.ELECTIONS.CAST }),
    }),
    verifyVote: builder.mutation<VerifyElectionVoteResponse, VerifyVotePayload>({
      query: body => ({ body, method: 'POST', url: VOTES.ELECTIONS.VERIFY }),
    }),
    addVoteToken: builder.mutation<AddVoteTokenResponse, void>({
      query: () => ({ method: 'POST', url: VOTES.ELECTIONS.TOKEN }),
    }),
    getVotes: builder.query<PaginatedResponse<Vote>, GetVotesPayload>({
      query: ({ id, params }) => ({
        params,
        method: 'GET',
        url: VOTES.ELECTIONS.FETCH.replace(':id', id),
      }),
    }),
  }),
});

export const {
  useGetVotesQuery,
  useCastVoteMutation,
  useVerifyVoteMutation,
  useAddVoteTokenMutation,
} = electionVoteApi;

export default electionVoteApi;
