import { Formik } from 'formik';
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
  Button,
  TextField,
  IconButton,
  InputLabel,
  FormControl,
  OutlinedInput,
  InputAdornment,
  FormHelperText,
} from '@mui/material';

import { PATHS } from '../../../routes/PathConstants';
import { passwordSchema } from '../../../schemas/auth.schema';
import { useRegisterUserMutation } from '../../../services/apis/authApi';
import { RegisterContext } from '../../../pages/auth/register/RegisterUser';
import { useHandleReduxQueryError, useHandleReduxQuerySuccess } from '../../../hooks';

const RegisterPassword = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword(show => !show);
  const { registerPayload, navigateOtpSection } = useContext(RegisterContext)!;
  const handleClickShowConfirmPassword = () => setShowConfirmPassword(show => !show);
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

          <FormControl
            required
            variant='outlined'
            className='form-field !mb-5'
            error={touched.password && !!errors.password}
          >
            <InputLabel htmlFor='password'>Password</InputLabel>
            <OutlinedInput
              id='password'
              name='password'
              label='Password'
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.password}
              autoComplete='new-password'
              type={showPassword ? 'text' : 'password'}
              endAdornment={
                <InputAdornment position='end'>
                  <IconButton
                    edge='end'
                    onClick={handleClickShowPassword}
                    aria-label={showPassword ? 'hide the password' : 'display the password'}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
            />
            <FormHelperText error={touched.password && !!errors.password}>
              {touched.password && errors.password}
            </FormHelperText>
          </FormControl>

          <FormControl
            required
            variant='outlined'
            className='form-field'
            error={touched.confirmPassword && !!errors.confirmPassword}
          >
            <InputLabel htmlFor='confirmPassword'>Confirm Password</InputLabel>
            <OutlinedInput
              id='confirmPassword'
              name='confirmPassword'
              label='Confirm Password'
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.confirmPassword}
              autoComplete='new-password'
              type={showConfirmPassword ? 'text' : 'password'}
              endAdornment={
                <InputAdornment position='end'>
                  <IconButton
                    edge='end'
                    onClick={handleClickShowConfirmPassword}
                    aria-label={showConfirmPassword ? 'hide the password' : 'display the password'}
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
            />
            <FormHelperText error={touched.confirmPassword && !!errors.confirmPassword}>
              {touched.confirmPassword && errors.confirmPassword}
            </FormHelperText>
          </FormControl>

          <Button type='submit' variant='contained' loading={isLoading} className='!mt-3'>
            Continue
          </Button>
        </form>
      )}
    </Formik>
  );
};

export default RegisterPassword;
