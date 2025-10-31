import { Formik } from 'formik';
import { string, object } from 'yup';
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

import constants from '../../../constants';
import { PATHS } from '../../../routes/PathConstants';
import { useRegisterAdminMutation } from '../../../services/apis/authApi';
import { RegisterContext } from '../../../pages/auth/register/RegisterAdmin';
import { useHandleReduxQueryError, useHandleReduxQuerySuccess } from '../../../hooks';

const { REGEX_RULES } = constants;

const RegisterPassword = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword(show => !show);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword(show => !show);
  const { registerPayload, navigateOtpSection, navigateDetailsSection } =
    useContext(RegisterContext)!;
  const { email, password } = registerPayload.current;
  const [registerAdmin, { data, error, isError, isLoading, isSuccess }] =
    useRegisterAdminMutation();

  useHandleReduxQueryError({
    error,
    isError,
    onError: () => {
      if (isError && error && 'status' in error) {
        if (error.data) {
          if (typeof error.data === 'object' && !Array.isArray(error.data)) {
            const { errorCode } = error.data as BaseErrorResponse;

            if (errorCode === 'E006') {
              // user already exists on platform
              navigate(PATHS.AUTH.LOGIN);
            } else if (errorCode === 'E007') {
              // a failed registration of a super admin
              navigateDetailsSection();
            }
          }
        }
      }
    },
  });
  useHandleReduxQuerySuccess({ isSuccess, response: data, onSuccess: navigateOtpSection });

  return (
    <Formik
      initialValues={{ password, confirmPassword: '' }}
      validationSchema={object({
        password: string()
          .min(8, 'Password must be a minimum of 8 characters')
          .max(20, 'Password must be a maximum of 20 characters')
          .matches(
            REGEX_RULES.PASSWORD,
            'Password must have: UPPERCASE and lowercase letters, digits and special characters'
          )
          .required('Please enter your password'),
        confirmPassword: string()
          .test(
            'test-password-match',
            'Passwords do not match',
            (confirmPassword, context) => confirmPassword === context.parent.password
          )
          .required('Please re-type your password'),
      })}
      onSubmit={values => {
        registerPayload.current = Object.assign(registerPayload.current, {
          password: values.password,
        });
        registerAdmin(registerPayload.current);
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
            <FormHelperText error>{touched.password && errors.password}</FormHelperText>
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
            <FormHelperText error>
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
