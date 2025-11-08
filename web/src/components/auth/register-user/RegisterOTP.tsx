import { Formik } from 'formik';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useCallback, useContext, useEffect, useState } from 'react';

import { OtpInput } from '../../index';
import { PATHS } from '../../../routes/PathConstants';
import { secondsToMMSS, showAlert } from '../../../utils';
import { updateUser } from '../../../services/apis/authApi/store';
import { RegisterContext } from '../../../pages/auth/register/RegisterUser';
import {
  useLogoutMutation,
  useLazySendOtpQuery,
  useRegisterVerifyOtpMutation,
} from '../../../services/apis/authApi';
import {
  useAppDispatch,
  useAppSelector,
  useHandleReduxQueryError,
  useHandleReduxQuerySuccess,
} from '../../../hooks';

const OTP_LENGTH = 6;
const THREE_MINUTES = 3 * 60;
const {
  DASHBOARD,
  AUTH: { LOGIN },
} = PATHS;

const RegisterOTP = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [otp, setOtp] = useState('');
  const { registerPayload } = useContext(RegisterContext)!;
  const [timeToResend, setTimeToResend] = useState(THREE_MINUTES);
  const { isAuthenticated } = useAppSelector(state => state.authStore);
  const { email } = registerPayload.current;
  const [
    verifyOtp,
    {
      data: verifyData,
      error: verifyError,
      isError: isVerifyError,
      isLoading: isVerifyLoading,
      isSuccess: isVerifySuccess,
    },
  ] = useRegisterVerifyOtpMutation();
  const [
    sendOtp,
    {
      data: sendData,
      error: sendError,
      isError: isSendError,
      isLoading: isSendLoading,
      isSuccess: isSendSuccess,
    },
  ] = useLazySendOtpQuery();

  const [
    logout,
    {
      data: logoutData,
      error: logoutError,
      isError: isLogoutError,
      isLoading: isLogoutLoading,
      isSuccess: isLogoutSuccess,
    },
  ] = useLogoutMutation();

  const resendOtp = useCallback(() => sendOtp({ email, subject: 'Pollara: OTP Verification' }), []);

  useEffect(() => {
    if (timeToResend === 0) return;

    const timer = setInterval(() => setTimeToResend(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeToResend]);

  useHandleReduxQueryError({ error: sendError, isError: isSendError });
  useHandleReduxQuerySuccess({
    response: sendData,
    isSuccess: isSendSuccess,
    onSuccess: () => setTimeToResend(THREE_MINUTES),
  });

  useHandleReduxQueryError({ error: verifyError, isError: isVerifyError });
  useHandleReduxQuerySuccess({
    response: verifyData,
    isSuccess: isVerifySuccess,
    onSuccess: () => {
      dispatch(updateUser({ emailVerified: true }));
      isAuthenticated ? navigate(DASHBOARD) : navigate(LOGIN);
    },
  });

  useHandleReduxQueryError({ error: logoutError, isError: isLogoutError });
  useHandleReduxQuerySuccess({
    response: logoutData,
    isSuccess: isLogoutSuccess,
    onSuccess: () => navigate(LOGIN),
  });

  return (
    <Formik
      initialValues={{}}
      onSubmit={() => {
        if (otp.length < OTP_LENGTH) {
          return showAlert({ msg: 'Please fill in OTP completely' });
        }
        verifyOtp({ otp, email });
      }}
    >
      {({ handleSubmit }) => (
        <form className='form' onSubmit={handleSubmit}>
          <OtpInput otp={otp} setOtp={setOtp} numberOfDigits={OTP_LENGTH} />

          <Button type='submit' variant='contained' loading={isVerifyLoading} className='!mt-3'>
            Confirm OTP
          </Button>

          <p className='mt-5 text-center text-gull-gray font-medium text-base -tracking-[0.5%]'>
            Didn't get a code?&nbsp;
            <button
              type='button'
              onClick={resendOtp}
              disabled={timeToResend > 0 || isSendLoading}
              className='text-primary-700 disabled:!cursor-default'
            >
              Resend{timeToResend > 0 && ` in ${secondsToMMSS(timeToResend)}`}
            </button>
          </p>

          <button
            type='button'
            onClick={() => logout()}
            hidden={!isAuthenticated}
            disabled={isLogoutLoading}
            className='font-medium text-primary-700 disabled:!cursor-default'
          >
            Logout
          </button>
        </form>
      )}
    </Formik>
  );
};

export default RegisterOTP;
