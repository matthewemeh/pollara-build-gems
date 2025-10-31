import { createApi } from '@reduxjs/toolkit/query/react';

import Endpoints from '../../Endpoints';
import { updateFormData } from '../../../utils';
import { baseQuery } from '../../../config/reduxjs.config';

const { PARTIES } = Endpoints;

// create the createApi
const partyApi = createApi({
  baseQuery,
  tagTypes: ['Party'],
  reducerPath: 'partyApi',
  refetchOnReconnect: true,
  endpoints: builder => ({
    addParty: builder.mutation<AddPartyResponse, AddPartyPayload>({
      query: body => {
        const formData = new FormData();
        Object.entries(body).forEach(updateFormData(formData));

        return { body: formData, method: 'POST', url: PARTIES.ADD };
      },
      invalidatesTags: ['Party'],
    }),
    updateParty: builder.mutation<NullResponse, UpdatePartyPayload>({
      query: ({ id, ...body }) => {
        const formData = new FormData();
        Object.entries(body).forEach(updateFormData(formData));

        return { body: formData, method: 'PATCH', url: PARTIES.EDIT.replace(':id', id) };
      },
      invalidatesTags: ['Party'],
    }),
    getParties: builder.query<GetPartiesResponse, GetPartiesPayload>({
      query: ({ params }) => ({ params, method: 'GET', url: PARTIES.FETCH }),
      providesTags: ['Party'],
    }),
  }),
});

export const { useAddPartyMutation, useGetPartiesQuery, useUpdatePartyMutation } = partyApi;

export default partyApi;
