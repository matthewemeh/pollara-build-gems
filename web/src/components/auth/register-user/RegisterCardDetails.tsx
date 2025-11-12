import moment from 'moment';
import { Form, Formik } from 'formik';
import { Link } from 'react-router-dom';
import { useContext, useMemo } from 'react';
import { Button, TextField } from '@mui/material';

import { FormDatePicker } from '../../index';
import { PATHS } from '../../../routes/PathConstants';
import { RegisterContext } from '../../../pages/auth/register/RegisterUser';
import { registerUserCardDetailsSchema } from '../../../schemas/auth.schema';

const RegisterCardDetails = () => {
  const todayDate = useMemo(() => new Date(), []);
  const { registerPayload, navigatePasswordSection } = useContext(RegisterContext)!;

  return (
    <Formik
      initialValues={registerPayload.current}
      validationSchema={registerUserCardDetailsSchema}
      onSubmit={(values, { setSubmitting }) => {
        registerPayload.current = Object.assign(registerPayload.current, values);
        setSubmitting(false);
        navigatePasswordSection();
      }}
    >
      {({
        values,
        errors,
        touched,
        handleBlur,
        handleChange,
        handleSubmit,
        isSubmitting,
        setFieldValue,
      }) => (
        <Form className='form' onSubmit={handleSubmit}>
          <TextField
            required
            autoFocus
            id='vin'
            type='vin'
            name='vin'
            label='VIN'
            onBlur={handleBlur}
            onChange={handleChange}
            value={values.vin}
            error={touched.vin && !!errors.vin}
            helperText={touched.vin && errors.vin}
          />

          <TextField
            required
            type='text'
            id='address'
            name='address'
            label='Address'
            value={values.address}
            error={touched.address && !!errors.address}
            helperText={touched.address && errors.address}
            onBlur={handleBlur}
            onChange={handleChange}
          />

          <TextField
            required
            type='text'
            id='occupation'
            name='occupation'
            label='Occupation'
            value={values.occupation}
            error={touched.occupation && !!errors.occupation}
            helperText={touched.occupation && errors.occupation}
            onBlur={handleBlur}
            onChange={handleChange}
          />

          <FormDatePicker
            required
            id='dateOfBirth'
            name='dateOfBirth'
            maxDate={todayDate}
            label='Date of Birth'
            dateFormat='DD-MM-YYYY'
            error={errors.dateOfBirth}
            touched={touched.dateOfBirth}
            initialValue={values.dateOfBirth}
            onDateChange={date => setFieldValue('dateOfBirth', moment(date).format('DD-MM-YYYY'))}
          />

          <TextField
            required
            type='text'
            id='delimitationCode'
            name='delimitationCode'
            label='Delimitation Code'
            value={values.delimitationCode}
            error={touched.delimitationCode && !!errors.delimitationCode}
            helperText={touched.delimitationCode && errors.delimitationCode}
            onBlur={handleBlur}
            onChange={handleChange}
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

export default RegisterCardDetails;
