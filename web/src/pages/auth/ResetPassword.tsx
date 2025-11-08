import { Formik } from 'formik';
import { useEffect } from 'react';
import { Button, TextField } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

import { PATHS } from '../../routes/PathConstants';
import { passwordSchema } from '../../schemas/auth.schema';
import { BackButton, PasswordInput } from '../../components';
import { useResetPasswordMutation } from '../../services/apis/authApi';
import { updateUser, updateAuthStore } from '../../services/apis/authApi/store';
import {
  useAppDispatch,
  useAppSelector,
  useHandleReduxQueryError,
  useHandleReduxQuerySuccess,
} from '../../hooks';

const { REGISTER_ADMIN, REGISTER_USER, LOGIN, FORGOT_PASSWORD } = PATHS.AUTH;

const ResetPassword = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {
    resetToken,
    currentUser: { email },
  } = useAppSelector(state => state.authStore);

  const navigateForgotPassword = () => navigate(FORGOT_PASSWORD);
  const [resetPassword, { error, isError, isLoading, isSuccess, data }] =
    useResetPasswordMutation();

  useEffect(() => {
    if (!resetToken || !email) navigate(LOGIN);
  }, [resetToken, email]);

  useHandleReduxQueryError({ error, isError });
  useHandleReduxQuerySuccess({
    isSuccess,
    response: data,
    onSuccess: () => {
      dispatch(updateAuthStore({ resetToken: '' }));
      dispatch(updateUser({ email: '' }));
      navigate(LOGIN);
    },
  });

  return (
    <div className='right-aside'>
      <div className='form-header'>
        <BackButton onClick={navigateForgotPassword} />
        <p className='form-heading'>Reset Password</p>
        <p className='form-sub-heading'>Set your new password</p>
      </div>

      <Formik
        validationSchema={passwordSchema}
        initialValues={{ password: '', confirmPassword: '' }}
        onSubmit={values => resetPassword({ resetToken, email, password: values.password })}
      >
        {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
          <form className='form' onSubmit={handleSubmit}>
            <TextField
              type='email'
              name='email'
              value={email}
              className='!hidden'
              autoComplete='username'
            />

            <PasswordInput
              id='password'
              name='password'
              label='Password'
              onBlur={handleBlur}
              error={errors.password}
              onChange={handleChange}
              value={values.password}
              touched={touched.password}
              autoComplete='new-password'
              containerClassName='form-field'
            />

            <PasswordInput
              id='confirmPassword'
              name='confirmPassword'
              label='Confirm Password'
              onBlur={handleBlur}
              error={errors.confirmPassword}
              onChange={handleChange}
              value={values.confirmPassword}
              touched={touched.confirmPassword}
              autoComplete='new-password'
              containerClassName='form-field'
            />

            <Button type='submit' variant='contained' loading={isLoading} className='!mt-3'>
              Reset
            </Button>

            <div className='text-center text-gull-gray font-medium text-base -tracking-[0.5%]'>
              <p>Or</p>
              <div className='flex flex-col gap-1'>
                <Link to={REGISTER_USER} className='text-primary-700'>
                  Create new user account.
                </Link>
                <Link to={REGISTER_ADMIN} className='text-primary-700'>
                  Create new admin account.
                </Link>
              </div>
            </div>
          </form>
        )}
      </Formik>
    </div>
  );
};

export default ResetPassword;
