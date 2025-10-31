import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

import { PATHS } from './PathConstants';

const {
  LOGIN,
  REGISTER_USER,
  REGISTER_ADMIN,
  RESET_PASSWORD,
  FORGOT_PASSWORD,
  VERIFY_OTP_PASSWORD,
} = PATHS.AUTH;

const Login = lazy(() => import('../pages/auth/Login'));
const ResetPassword = lazy(() => import('../pages/auth/ResetPassword'));
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'));
const RegisterUser = lazy(() => import('../pages/auth/register/RegisterUser'));
const VerifyOtpPassword = lazy(() => import('../pages/auth/VerifyOtpPassword'));
const RegisterAdmin = lazy(() => import('../pages/auth/register/RegisterAdmin'));

const authRoutes: RouteObject[] = [
  { path: LOGIN, index: true, element: <Login /> },
  { path: REGISTER_USER, element: <RegisterUser /> },
  { path: REGISTER_ADMIN, element: <RegisterAdmin /> },
  { path: RESET_PASSWORD, element: <ResetPassword /> },
  { path: FORGOT_PASSWORD, element: <ForgotPassword /> },
  { path: VERIFY_OTP_PASSWORD, element: <VerifyOtpPassword /> },
];

export default authRoutes;
