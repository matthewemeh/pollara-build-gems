import { createApi } from '@reduxjs/toolkit/query/react';

import Endpoints from '../../Endpoints';
import { baseQuery } from '../../../config/reduxjs.config';

const { NOTIFICATIONS } = Endpoints;

// create the createApi
const notificationApi = createApi({
  baseQuery,
  refetchOnReconnect: true,
  tagTypes: ['Notifications'],
  reducerPath: 'notificationApi',
  endpoints: builder => ({
    getNotifications: builder.query<PaginatedResponse<Notification_>, GetNotificationsPayload>({
      query: ({ params }) => ({ params, method: 'GET', url: NOTIFICATIONS }),
    }),
  }),
});

export const { useGetNotificationsQuery } = notificationApi;

export default notificationApi;
