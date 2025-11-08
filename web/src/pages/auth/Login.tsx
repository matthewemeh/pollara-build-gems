import { Formik } from 'formik';
import { Link } from 'react-router-dom';
import { Button, TextField } from '@mui/material';

import { PasswordInput } from '../../components';
import { PATHS } from '../../routes/PathConstants';
import { loginSchema } from '../../schemas/auth.schema';
import { useLoginMutation } from '../../services/apis/authApi';
import { useHandleReduxQueryError, useHandleReduxQuerySuccess } from '../../hooks';

const { REGISTER_USER, REGISTER_ADMIN, FORGOT_PASSWORD } = PATHS.AUTH;

const Login = () => {
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

            <PasswordInput
              id='password'
              name='password'
              label='Password'
              onBlur={handleBlur}
              autoComplete='password'
              error={errors.password}
              onChange={handleChange}
              value={values.password}
              touched={touched.password}
              containerClassName='form-field'
            />

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
