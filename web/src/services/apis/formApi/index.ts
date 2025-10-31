import { createApi } from '@reduxjs/toolkit/query/react';

import Endpoints from '../../Endpoints';
import { updateFormData } from '../../../utils';
import { baseQuery } from '../../../config/reduxjs.config';

const { FORMS } = Endpoints;

// create the createApi
const formApi = createApi({
  baseQuery,
  reducerPath: 'formApi',
  refetchOnReconnect: true,
  tagTypes: ['Forms', 'Form'],
  endpoints: builder => ({
    addForm: builder.mutation<AddFormResponse, AddFormPayload>({
      query: body => ({ body, method: 'POST', url: FORMS.FETCH }),
      invalidatesTags: ['Forms'],
    }),
    getForms: builder.query<PaginatedResponse<Form>, GetFormsPayload>({
      query: ({ params }) => ({ params, method: 'GET', url: FORMS.FETCH }),
      providesTags: ['Forms'],
    }),
    getForm: builder.query<FormResponse, string>({
      query: formID => ({ method: 'GET', url: FORMS.FORM.replace(':id', formID) }),
      providesTags: ['Form'],
    }),
    getUserVotedForms: builder.query<VotedFormsResponse, void>({
      query: () => ({ method: 'GET', url: FORMS.USER_VOTED_FORMS }),
    }),
    getUserForms: builder.query<PaginatedResponse<Form>, GetUserFormsPayload>({
      query: ({ params }) => ({ params, method: 'GET', url: FORMS.USER }),
      providesTags: ['Forms'],
    }),
    updateForm: builder.mutation<NullResponse, UpdateFormPayload>({
      query: ({ formID, ...body }) => ({
        body,
        method: 'PATCH',
        url: FORMS.FORM.replace(':id', formID),
      }),
      invalidatesTags: ['Forms'],
    }),
    deleteForm: builder.mutation<NullResponse, string>({
      query: formID => ({ method: 'DELETE', url: FORMS.FORM.replace(':id', formID) }),
      invalidatesTags: ['Forms'],
    }),
    addPoll: builder.mutation<NullResponse, AddPollPayload>({
      query: ({ formID, ...body }) => {
        // make each option image (if it exists) a value and make the corresponding key its id in the request body
        body.options.forEach(option => {
          if (option.image.file) {
            // @ts-ignore
            body[option.id] = option.image.file;
          }

          // @ts-ignore
          delete option.image; // to satisfy Joi validation on the backend
        });

        const formData = new FormData();
        Object.entries(body).forEach(updateFormData(formData));

        return { body: formData, method: 'POST', url: FORMS.POLLS.replace(':id', formID) };
      },
      invalidatesTags: ['Forms'],
    }),
    updatePoll: builder.mutation<NullResponse, UpdatePollPayload>({
      query: ({ pollID, ...body }) => {
        body.options?.forEach(option => {
          if (option.image?.file) {
            // @ts-ignore
            body[option.id] = option.image.file;
          }

          // @ts-ignore
          delete option.image; // to satisfy Joi validation on the backend
        });

        const formData = new FormData();
        Object.entries(body).forEach(updateFormData(formData));

        return { body: formData, method: 'PATCH', url: FORMS.POLLS.replace(':id', pollID) };
      },
      invalidatesTags: ['Forms'],
    }),
    getPolls: builder.query<PaginatedResponse<Poll>, GetPollsPayload>({
      query: ({ formID, params }) => ({
        params,
        method: 'GET',
        url: FORMS.POLLS.replace(':id', formID),
      }),
      providesTags: ['Forms'],
    }),
    deletePoll: builder.mutation<NullResponse, string>({
      query: pollID => ({ method: 'DELETE', url: FORMS.POLLS.replace(':id', pollID) }),
      invalidatesTags: ['Forms'],
    }),
  }),
});

export const {
  useGetFormQuery,
  useGetFormsQuery,
  useGetPollsQuery,
  useAddFormMutation,
  useAddPollMutation,
  useLazyGetFormQuery,
  useGetUserFormsQuery,
  useLazyGetPollsQuery,
  useUpdateFormMutation,
  useUpdatePollMutation,
  useDeleteFormMutation,
  useDeletePollMutation,
  useGetUserVotedFormsQuery,
} = formApi;

export default formApi;
