import { createApi } from '@reduxjs/toolkit/query/react';

import Endpoints from '../../Endpoints';
import { baseQuery } from '../../../config/reduxjs.config';
import { AppStorage, STORAGE_KEYS } from '../../../utils/storage.utils';

const {
  SEND_OTP,
  AUTH: { LOGIN, LOGOUT, REGISTER, REFRESH_TOKEN, FORGOT_PASSWORD },
} = Endpoints;

// create the createApi
const authApi = createApi({
  baseQuery,
  tagTypes: ['Auth'],
  reducerPath: 'authApi',
  refetchOnReconnect: true,
  endpoints: builder => ({
    registerUser: builder.mutation<TokensResponse, RegisterUserPayload>({
      query: body => ({ body, method: 'POST', url: REGISTER.USER }),
      invalidatesTags: ['Auth'],
    }),
    registerAdmin: builder.mutation<TokensResponse, RegisterAdminPayload>({
      query: body => ({ body, method: 'POST', url: REGISTER.ADMIN }),
      invalidatesTags: ['Auth'],
    }),
    login: builder.mutation<LoginResponse, LoginPayload>({
      query: body => ({ body, method: 'POST', url: LOGIN }),
      invalidatesTags: ['Auth'],
    }),
    sendOtp: builder.query<NullResponse, SendOtpPayload>({
      query: body => ({ body, method: 'POST', url: SEND_OTP }),
      keepUnusedDataFor: 180,
    }),
    registerVerifyOtp: builder.mutation<NullResponse, VerifyOtpPayload>({
      query: body => ({ body, method: 'POST', url: REGISTER.VERIFY }),
    }),
    refreshTokens: builder.query<TokensResponse, RefreshTokenPayload>({
      query: body => ({ body, method: 'POST', url: REFRESH_TOKEN }),
      providesTags: ['Auth'],
      keepUnusedDataFor: 0,
    }),
    forgotPassword: builder.mutation<NullResponse, ForgotPasswordPayload>({
      query: body => ({
        body,
        method: 'POST',
        url: FORGOT_PASSWORD.INITIATE,
      }),
    }),
    forgotVerifyOtp: builder.mutation<ForgotVerifyOtpResponse, VerifyOtpPayload>({
      query: body => ({ body, method: 'POST', url: FORGOT_PASSWORD.VERIFY }),
    }),
    resetPassword: builder.mutation<NullResponse, ResetPasswordPayload>({
      query: body => ({ body, method: 'POST', url: FORGOT_PASSWORD.RESET }),
    }),
    logout: builder.mutation<NullResponse, void>({
      query: () => {
        const tokens = AppStorage.get<Tokens>(STORAGE_KEYS.AUTH, true);
        const refreshToken = tokens?.refreshToken ?? '';

        return { body: { refreshToken }, url: LOGOUT, method: 'POST' };
      },
      invalidatesTags: ['Auth'],
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useLazySendOtpQuery,
  useRegisterUserMutation,
  useRegisterAdminMutation,
  useResetPasswordMutation,
  useLazyRefreshTokensQuery,
  useForgotPasswordMutation,
  useForgotVerifyOtpMutation,
  useRegisterVerifyOtpMutation,
} = authApi;

export default authApi;
