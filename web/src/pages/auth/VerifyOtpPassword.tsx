import { Form, Formik } from 'formik';
import { Button } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { PATHS } from '../../routes/PathConstants';
import { secondsToMMSS, showAlert } from '../../utils';
import { OtpInput, BackButton } from '../../components';
import { updateUser, updateAuthStore } from '../../services/apis/authApi/store';
import { useLazySendOtpQuery, useForgotVerifyOtpMutation } from '../../services/apis/authApi';
import {
  useAppDispatch,
  useAppSelector,
  useHandleReduxQueryError,
  useHandleReduxQuerySuccess,
} from '../../hooks';

const OTP_LENGTH = 6;
const THREE_MINUTES = 3 * 60;
const { RESET_PASSWORD, FORGOT_PASSWORD } = PATHS.AUTH;

const VerifyOTP = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [otp, setOtp] = useState('');
  const navigateForgotPassword = () => navigate(FORGOT_PASSWORD);
  const [timeToResend, setTimeToResend] = useState(THREE_MINUTES);
  const { email } = useAppSelector(state => state.authStore.currentUser);
  const [
    verifyOtp,
    {
      data: verifyData,
      error: verifyError,
      isError: isVerifyError,
      isLoading: isVerifyLoading,
      isSuccess: isVerifySuccess,
    },
  ] = useForgotVerifyOtpMutation();

  const [
    sendOtp,
    {
      data: sendOtpData,
      error: sendOtpError,
      isError: isSendOtpError,
      isLoading: isSendOtpLoading,
      isSuccess: isSendOtpSuccess,
    },
  ] = useLazySendOtpQuery();

  useEffect(() => {
    if (timeToResend === 0) return;

    const timer = setInterval(() => setTimeToResend(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeToResend]);

  useHandleReduxQueryError({ error: sendOtpError, isError: isSendOtpError });
  useHandleReduxQuerySuccess({
    response: sendOtpData,
    isSuccess: isSendOtpSuccess,
    onSuccess: () => setTimeToResend(THREE_MINUTES),
  });

  useHandleReduxQueryError({ error: verifyError, isError: isVerifyError });
  useHandleReduxQuerySuccess({
    response: verifyData,
    isSuccess: isVerifySuccess,
    onSuccess: () => {
      if (verifyData) {
        dispatch(updateAuthStore({ resetToken: verifyData.data.resetToken }));
        dispatch(updateUser({ email: verifyData.data.email }));
        navigate(RESET_PASSWORD);
      }
    },
  });

  return (
    <div className='right-aside'>
      <div className='form-header'>
        <BackButton onClick={navigateForgotPassword} />
        <p className='form-heading'>OTP Verification</p>
        <p className='form-sub-heading'>
          Please enter the one-time password (OTP) sent to&nbsp;
          <span className='font-bold text-primary-700'>{email}</span>
        </p>
      </div>

      <Formik
        initialValues={{ email }}
        onSubmit={() => {
          if (otp.length < OTP_LENGTH) {
            return showAlert({ msg: 'Please fill in OTP completely' });
          }
          verifyOtp({ otp, email });
        }}
      >
        {({ handleSubmit }) => (
          <Form className='form' onSubmit={handleSubmit}>
            <OtpInput otp={otp} setOtp={setOtp} numberOfDigits={OTP_LENGTH} />

            <Button type='submit' className='!mt-3' variant='contained' loading={isVerifyLoading}>
              Confirm OTP
            </Button>

            <p className='mt-5 text-center text-gull-gray font-medium text-base -tracking-[0.5%]'>
              Didn't get a code?&nbsp;
              <button
                type='button'
                className='text-primary-700'
                disabled={timeToResend > 0 || isSendOtpLoading}
                onClick={() => sendOtp({ email, subject: 'Pollara: OTP Verification' })}
              >
                Resend{timeToResend > 0 && ` in ${secondsToMMSS(timeToResend)}`}
              </button>
            </p>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default VerifyOTP;
