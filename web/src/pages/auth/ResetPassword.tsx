import { Formik } from 'formik';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

import { BackButton } from '../../components';
import { PATHS } from '../../routes/PathConstants';
import { passwordSchema } from '../../schemas/auth.schema';
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    resetToken,
    currentUser: { email },
  } = useAppSelector(state => state.authStore);

  const navigateForgotPassword = () => navigate(FORGOT_PASSWORD);
  const handleClickShowPassword = () => setShowPassword(show => !show);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword(show => !show);
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

            <FormControl
              required
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
                      aria-label={
                        showConfirmPassword ? 'hide the password' : 'display the password'
                      }
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
