import { Formik } from 'formik';
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Button, TextField } from '@mui/material';

import constants from '../../../constants';
import { DropdownInput } from '../../index';
import { PATHS } from '../../../routes/PathConstants';
import { registerUserDetailsSchema } from '../../../schemas/auth.schema';
import { RegisterContext } from '../../../pages/auth/register/RegisterUser';

const { GENDERS } = constants;

const RegisterDetails = () => {
  const { registerPayload, navigateCardSection } = useContext(RegisterContext)!;

  return (
    <Formik
      initialValues={registerPayload.current}
      validationSchema={registerUserDetailsSchema}
      onSubmit={(values, { setSubmitting }) => {
        registerPayload.current = Object.assign(registerPayload.current, values);
        setSubmitting(false);
        navigateCardSection();
      }}
    >
      {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
        <form className='form' onSubmit={handleSubmit}>
          <TextField
            required
            id='email'
            type='email'
            name='email'
            label='Email'
            onBlur={handleBlur}
            onChange={handleChange}
            autoComplete='email'
            value={values.email}
            error={touched.email && !!errors.email}
            helperText={touched.email && errors.email}
            className='form-field'
          />

          <TextField
            required
            type='text'
            id='lastName'
            name='lastName'
            label='Last name'
            onBlur={handleBlur}
            onChange={handleChange}
            autoComplete='family-name'
            value={values.lastName}
            error={touched.lastName && !!errors.lastName}
            helperText={touched.lastName && errors.lastName}
            className='form-field'
          />

          <TextField
            required
            type='text'
            id='firstName'
            name='firstName'
            label='First name'
            onBlur={handleBlur}
            onChange={handleChange}
            autoComplete='given-name'
            value={values.firstName}
            error={touched.firstName && !!errors.firstName}
            helperText={touched.firstName && errors.firstName}
          />

          <TextField
            type='text'
            id='middleName'
            name='middleName'
            label='Middle name'
            onBlur={handleBlur}
            onChange={handleChange}
            autoComplete='additional-name'
            value={values.middleName}
            error={touched.middleName && !!errors.middleName}
            helperText={touched.middleName && errors.middleName}
          />

          <DropdownInput
            required
            id='gender'
            name='gender'
            label='Gender'
            onBlur={handleBlur}
            onChange={handleChange}
            value={values.gender}
            error={touched.gender && !!errors.gender}
            helperText={touched.gender && errors.gender}
            menuItems={Object.entries(GENDERS).map(([key, value]) => ({ value, name: key }))}
          />

          <Button type='submit' variant='contained' loading={isSubmitting} className='!mt-3'>
            Continue
          </Button>

          <p className='text-center text-gull-gray font-medium text-base -tracking-[0.5%]'>
            Already have an account?&nbsp;
            <Link to={PATHS.AUTH.LOGIN} className='text-primary-700'>
              Login
            </Link>
          </p>
        </form>
      )}
    </Formik>
  );
};

export default RegisterDetails;
