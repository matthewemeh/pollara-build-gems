import { useContext } from 'react';
import { Form, Formik } from 'formik';
import { Link } from 'react-router-dom';
import { Button, TextField } from '@mui/material';

import constants from '../../../constants';
import { DropdownInput } from '../../index';
import { PATHS } from '../../../routes/PathConstants';
import { registerAdminDetailsSchema } from '../../../schemas/auth.schema';
import { RegisterContext } from '../../../pages/auth/register/RegisterAdmin';

const { ROLES } = constants;

const RegisterDetails = () => {
  const { registerPayload, navigatePasswordSection } = useContext(RegisterContext)!;

  return (
    <Formik
      initialValues={registerPayload.current}
      validationSchema={registerAdminDetailsSchema}
      onSubmit={(values, { setSubmitting }) => {
        registerPayload.current = Object.assign(registerPayload.current, values);
        setSubmitting(false);
        navigatePasswordSection();
      }}
    >
      {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
        <Form className='form' onSubmit={handleSubmit}>
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
            autoComplete='given-name'
            value={values.middleName}
            error={touched.middleName && !!errors.middleName}
            helperText={touched.middleName && errors.middleName}
          />

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

          <DropdownInput
            required
            id='role'
            name='role'
            onBlur={handleBlur}
            onChange={handleChange}
            value={values.role}
            label='Role'
            error={touched.role && !!errors.role}
            helperText={touched.role && errors.role}
            menuItems={Object.entries(ROLES)
              .filter(([_, value]) => value !== 'USER')
              .map(([key, value]) => ({
                value,
                name: key.replaceAll('_', ' '),
              }))}
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
        </Form>
      )}
    </Formik>
  );
};

export default RegisterDetails;
