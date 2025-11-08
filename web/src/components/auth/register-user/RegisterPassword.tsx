import { Formik } from 'formik';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField } from '@mui/material';

import { PasswordInput } from '../../index';
import { PATHS } from '../../../routes/PathConstants';
import { passwordSchema } from '../../../schemas/auth.schema';
import { useRegisterUserMutation } from '../../../services/apis/authApi';
import { RegisterContext } from '../../../pages/auth/register/RegisterUser';
import { useHandleReduxQueryError, useHandleReduxQuerySuccess } from '../../../hooks';

const RegisterPassword = () => {
  const navigate = useNavigate();

  const { registerPayload, navigateOtpSection } = useContext(RegisterContext)!;
  const { email, password } = registerPayload.current;
  const [registerUser, { data, error, isError, isLoading, isSuccess }] = useRegisterUserMutation();

  useHandleReduxQueryError({
    error,
    isError,
    onError: () => {
      if (isError && error && 'status' in error) {
        const { data } = error;

        if (data && typeof data === 'object' && !Array.isArray(data)) {
          const { errorCode } = data as BaseErrorResponse;

          switch (errorCode) {
            case 'E006':
              // user already exists on platform
              navigate(PATHS.AUTH.LOGIN);
              break;
          }
        }
      }
    },
  });
  useHandleReduxQuerySuccess({ isSuccess, response: data, onSuccess: navigateOtpSection });

  return (
    <Formik
      validationSchema={passwordSchema}
      initialValues={{ password, confirmPassword: '' }}
      onSubmit={values => {
        registerPayload.current = Object.assign(registerPayload.current, {
          password: values.password,
        });
        registerUser(registerPayload.current);
      }}
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
            required
            autoFocus
            id='password'
            name='password'
            label='Password'
            onBlur={handleBlur}
            value={values.password}
            onChange={handleChange}
            error={errors.password}
            touched={touched.password}
            autoComplete='new-password'
            containerClassName='form-field !mb-5'
          />

          <PasswordInput
            required
            onBlur={handleBlur}
            id='confirmPassword'
            name='confirmPassword'
            onChange={handleChange}
            label='Confirm Password'
            autoComplete='new-password'
            error={errors.confirmPassword}
            value={values.confirmPassword}
            containerClassName='form-field'
            touched={touched.confirmPassword}
          />

          <Button type='submit' variant='contained' loading={isLoading} className='!mt-3'>
            Continue
          </Button>
        </form>
      )}
    </Formik>
  );
};

export default RegisterPassword;
