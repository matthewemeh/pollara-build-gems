import { createApi } from '@reduxjs/toolkit/query/react';

import Endpoints from '../../Endpoints';
import { updateFormData } from '../../../utils';
import { baseQuery } from '../../../config/reduxjs.config';

const { CONTESTANTS } = Endpoints;

// create the createApi
const contestantApi = createApi({
  baseQuery,
  tagTypes: ['Contestants'],
  reducerPath: 'contestantApi',
  refetchOnReconnect: true,
  endpoints: builder => ({
    addContestant: builder.mutation<AddContestantResponse, AddContestantPayload>({
      query: body => {
        const formData = new FormData();
        Object.entries(body).forEach(updateFormData(formData));

        return { body: formData, method: 'POST', url: CONTESTANTS.ADD };
      },
      invalidatesTags: ['Contestants'],
    }),
    updateContestant: builder.mutation<NullResponse, UpdateContestantPayload>({
      query: ({ id, ...body }) => {
        const formData = new FormData();
        Object.entries(body).forEach(updateFormData(formData));

        return { body: formData, method: 'PATCH', url: CONTESTANTS.EDIT.replace(':id', id) };
      },
      invalidatesTags: ['Contestants'],
    }),
    deleteContestant: builder.mutation<NullResponse, string>({
      query: id => ({
        method: 'DELETE',
        url: CONTESTANTS.DELETE.replace(':id', id),
      }),
      invalidatesTags: ['Contestants'],
    }),
    getContestants: builder.query<PaginatedResponse<Contestant>, GetContestantsPayload>({
      query: ({ params }) => ({ params, method: 'GET', url: CONTESTANTS.FETCH }),
      providesTags: ['Contestants'],
    }),
    getElectionContestants: builder.query<GetElectionContestantsResponse, string>({
      query: electionID => ({
        method: 'GET',
        url: CONTESTANTS.ELECTION.replace(':id', electionID),
      }),
      providesTags: ['Contestants'],
    }),
  }),
});

export const {
  useGetContestantsQuery,
  useAddContestantMutation,
  useUpdateContestantMutation,
  useDeleteContestantMutation,
  useGetElectionContestantsQuery,
} = contestantApi;

export default contestantApi;
