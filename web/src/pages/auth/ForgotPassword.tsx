import { object, string } from 'yup';
import { Form, Formik } from 'formik';
import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { Button, TextField } from '@mui/material';

import { LinkButton } from '../../components';
import { PATHS } from '../../routes/PathConstants';
import { useForgotPasswordMutation } from '../../services/apis/authApi';
import { updateUser, updateAuthStore } from '../../services/apis/authApi/store';
import { useAppDispatch, useHandleReduxQueryError, useHandleReduxQuerySuccess } from '../../hooks';

const { LOGIN, VERIFY_OTP_PASSWORD } = PATHS.AUTH;

const ForgotPassword = () => {
  const email = useRef('');
  const dispatch = useAppDispatch();
  const [forgotPassword, { error, isError, isLoading, isSuccess, data }] =
    useForgotPasswordMutation();

  useEffect(() => {
    dispatch(updateUser({ email: '' }));
    dispatch(updateAuthStore({ resetToken: '' }));
  }, []);

  useHandleReduxQueryError({ error, isError });
  useHandleReduxQuerySuccess({
    isSuccess,
    response: data,
    onSuccess: () => dispatch(updateUser({ email: email.current })),
  });

  if (isSuccess) {
    return (
      <div className='right-aside'>
        <div className='mx-auto size-35 rounded-half bg-center bg-no-repeat bg-[url(../assets/icons/mail-sent.svg)]' />
        <div className='form-header'>
          <p className='form-heading'>Check your email</p>
          <p className='form-sub-heading'>
            An OTP code has been sent to&nbsp;
            <span className='font-bold text-primary-700'>{email.current}</span>. Check your email to
            get the code
          </p>
        </div>
        <LinkButton to={VERIFY_OTP_PASSWORD} variant='contained'>
          Next
        </LinkButton>
      </div>
    );
  }

  return (
    <div className='right-aside'>
      <div className='form-header'>
        <p className='form-heading'>Forgot Password</p>
        <p className='form-sub-heading'>
          Enter your email and we'll send you a mail on how to reset your password.
        </p>
      </div>

      <Formik
        initialValues={{ email: '' }}
        validationSchema={object({
          email: string().trim().email().required('Please enter your email'),
        })}
        onSubmit={(values: ForgotPasswordPayload) => {
          email.current = values.email;
          forgotPassword(values);
        }}
      >
        {({ values, errors, touched, handleBlur, handleChange, handleSubmit }) => (
          <Form className='form' onSubmit={handleSubmit}>
            <TextField
              required
              id='email'
              type='email'
              name='email'
              label='Email'
              inputMode='email'
              onBlur={handleBlur}
              onChange={handleChange}
              autoComplete='username'
              value={values.email}
              error={touched.email && !!errors.email}
              helperText={touched.email && errors.email}
              className='form-field'
            />

            <Button type='submit' className='!mt-3' variant='contained' loading={isLoading}>
              Send email
            </Button>

            <p className='text-center text-gull-gray font-medium text-base -tracking-[0.5%]'>
              Or&nbsp;
              <Link to={LOGIN} className='text-primary-700'>
                Login
              </Link>
            </p>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ForgotPassword;
