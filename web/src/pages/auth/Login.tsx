import { Formik } from 'formik';
import { useState } from 'react';
import { Link } from 'react-router-dom';
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

import { PATHS } from '../../routes/PathConstants';
import { loginSchema } from '../../schemas/auth.schema';
import { useLoginMutation } from '../../services/apis/authApi';
import { useHandleReduxQueryError, useHandleReduxQuerySuccess } from '../../hooks';

const { REGISTER_USER, REGISTER_ADMIN, FORGOT_PASSWORD } = PATHS.AUTH;

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword(show => !show);
  const [login, { error, isError, isLoading, isSuccess, data }] = useLoginMutation();

  useHandleReduxQueryError({ error, isError });
  useHandleReduxQuerySuccess({ isSuccess, response: data });

  return (
    <div className='right-aside'>
      <div className='form-header'>
        <p className='form-heading'>Login</p>
        <p className='form-sub-heading'>Jump right back in</p>
      </div>

      <Formik
        validationSchema={loginSchema}
        onSubmit={values => login(values)}
        initialValues={{ email: '', password: '' }}
      >
        {({ values, errors, touched, handleBlur, handleChange, handleSubmit }) => (
          <form className='form' onSubmit={handleSubmit}>
            <TextField
              id='email'
              type='email'
              name='email'
              label='Email'
              onBlur={handleBlur}
              onChange={handleChange}
              autoComplete='username'
              value={values.email}
              error={touched.email && !!errors.email}
              helperText={touched.email && errors.email}
              className='form-field'
            />

            <FormControl
              variant='outlined'
              className='form-field'
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
                autoComplete='password'
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

            <Link
              to={FORGOT_PASSWORD}
              className='text-primary-500 block w-fit ml-auto -mt-3 text-sm -tracking-[1%]'
            >
              Forgot password?
            </Link>

            <Button type='submit' variant='contained' loading={isLoading} className='!mt-3'>
              Login
            </Button>

            <div className='text-center text-gull-gray font-medium text-base -tracking-[0.5%]'>
              <p>Don't have an account?&nbsp;</p>

              <div className='flex flex-col gap-1'>
                <Link to={REGISTER_USER} className='text-primary-700'>
                  Sign up as User
                </Link>
                <Link to={REGISTER_ADMIN} className='text-primary-700'>
                  Sign up as Admin
                </Link>
              </div>
            </div>
          </form>
        )}
      </Formik>
    </div>
  );
};

export default Login;
