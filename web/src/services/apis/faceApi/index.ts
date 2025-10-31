import { createApi } from '@reduxjs/toolkit/query/react';

import Endpoints from '../../Endpoints';
import { updateFormData } from '../../../utils';
import { baseQuery } from '../../../config/reduxjs.config';

const { FACE_ID } = Endpoints;

// create the createApi
const faceIdApi = createApi({
  baseQuery,
  refetchOnReconnect: true,
  reducerPath: 'faceIdApi',
  endpoints: builder => ({
    registerFace: builder.mutation<NullResponse, RegisterFacePayload>({
      query: body => {
        const formData = new FormData();
        Object.entries(body).forEach(updateFormData(formData));

        return { body: formData, method: 'POST', url: FACE_ID.REGISTER };
      },
    }),
    fetchFace: builder.query<FaceIdResponse, void>({
      keepUnusedDataFor: 300,
      query: () => ({ method: 'GET', url: FACE_ID.FETCH }),
    }),
  }),
});

export const { useLazyFetchFaceQuery, useRegisterFaceMutation } = faceIdApi;

export default faceIdApi;
