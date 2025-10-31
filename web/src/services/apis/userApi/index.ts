import { createApi } from '@reduxjs/toolkit/query/react';

import Endpoints from '../../Endpoints';
import { baseQuery } from '../../../config/reduxjs.config';

const {
  USERS: { TOKENS, FETCH, INVITE, MODIFY_TOKEN },
} = Endpoints;

// create the createApi
const userApi = createApi({
  baseQuery,
  reducerPath: 'userApi',
  refetchOnReconnect: true,
  tagTypes: ['Users', 'Tokens'],
  endpoints: builder => ({
    getUsers: builder.query<PaginatedResponse<User>, GetUsersPayload>({
      query: ({ params }) => ({ params, method: 'GET', url: FETCH }),
      providesTags: ['Users'],
    }),
    getTokens: builder.query<PaginatedResponse<AdminToken>, GetTokensPayload>({
      query: () => ({ method: 'GET', url: TOKENS }),
      providesTags: ['Tokens'],
    }),
    inviteUser: builder.mutation<NullResponse, AdminInvitePayload>({
      query: body => ({ body, method: 'POST', url: INVITE }),
      invalidatesTags: ['Users'],
    }),
    modifyToken: builder.mutation<NullResponse, ModifyTokenPayload>({
      query: ({ tokenID, ...body }) => ({
        body,
        method: 'PATCH',
        url: MODIFY_TOKEN.replace(':id', tokenID),
      }),
      invalidatesTags: ['Tokens'],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetTokensQuery,
  useInviteUserMutation,
  useModifyTokenMutation,
} = userApi;

export default userApi;
