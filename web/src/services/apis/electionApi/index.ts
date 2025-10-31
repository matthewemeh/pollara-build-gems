import { createApi } from '@reduxjs/toolkit/query/react';

import Endpoints from '../../Endpoints';
import { baseQuery } from '../../../config/reduxjs.config';

const { ELECTIONS } = Endpoints;

// create the createApi
const electionApi = createApi({
  baseQuery,
  refetchOnReconnect: true,
  reducerPath: 'electionApi',
  tagTypes: ['Elections', 'Contestants'],
  endpoints: builder => ({
    getUserElections: builder.query<PaginatedResponse<Election>, GetUserElectionsPayload>({
      query: ({ params }) => ({ params, method: 'GET', url: ELECTIONS.USER_ELECTIONS }),
      providesTags: ['Elections'],
    }),
    getUserVotedElections: builder.query<VotedElectionsResponse, void>({
      query: () => ({ method: 'GET', url: ELECTIONS.USER_VOTED_ELECTIONS }),
    }),
    getElections: builder.query<PaginatedResponse<Election>, GetElectionsPayload>({
      query: ({ params }) => ({ params, method: 'GET', url: ELECTIONS.MAIN }),
      providesTags: ['Elections'],
    }),
    addElection: builder.mutation<AddElectionResponse, AddElectionPayload>({
      query: body => ({ body, method: 'POST', url: ELECTIONS.MAIN }),
      invalidatesTags: ['Elections'],
    }),
    updateElection: builder.mutation<NullResponse, UpdateElectionPayload>({
      query: ({ id, ...body }) => ({
        body,
        method: 'PATCH',
        url: ELECTIONS.ELECTION.replace(':id', id),
      }),
      invalidatesTags: ['Elections'],
    }),
    deleteElection: builder.mutation<NullResponse, string>({
      query: electionID => ({
        method: 'DELETE',
        url: ELECTIONS.ELECTION.replace(':id', electionID),
      }),
      invalidatesTags: ['Elections'],
    }),
    addElectionContestant: builder.mutation<NullResponse, ElectionContestantPayload>({
      query: ({ electionID, ...body }) => ({
        body,
        method: 'PATCH',
        url: ELECTIONS.ADD_CONTESTANT.replace(':id', electionID),
      }),
      invalidatesTags: ['Contestants'],
    }),
    removeElectionContestant: builder.mutation<NullResponse, ElectionContestantPayload>({
      query: ({ electionID, ...body }) => ({
        body,
        method: 'PATCH',
        url: ELECTIONS.REMOVE_CONTESTANT.replace(':id', electionID),
      }),
      invalidatesTags: ['Contestants'],
    }),
  }),
});

export const {
  useGetElectionsQuery,
  useAddElectionMutation,
  useGetUserElectionsQuery,
  useUpdateElectionMutation,
  useDeleteElectionMutation,
  useGetUserVotedElectionsQuery,
  useAddElectionContestantMutation,
  useRemoveElectionContestantMutation,
} = electionApi;

export default electionApi;
