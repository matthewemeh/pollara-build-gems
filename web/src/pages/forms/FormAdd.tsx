import moment from 'moment';
import { Form, Formik } from 'formik';
import { useNavigate } from 'react-router-dom';
import { PostAdd, Poll } from '@mui/icons-material';
import { Button, Paper, TextField } from '@mui/material';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';

import constants from '../../constants';
import { PATHS } from '../../routes/PathConstants';
import { AppContext } from '../../contexts/AppContext';
import { addFormSchema } from '../../schemas/form.schema';
import { useAddFormMutation } from '../../services/apis/formApi';
import { useHandleReduxQueryError, useHandleReduxQuerySuccess } from '../../hooks';
import { BackButton, DropdownInput, FormDatePicker, LinkButton, Switch } from '../../components';

const { VISIBILITY } = constants;

const TIME_TO_SHOW = 10; // seconds

const FormAdd = () => {
  const navigate = useNavigate();
  const todayDate = moment().toDate();
  const [timeToShow, setTimeToShow] = useState(0);
  const { setFormToPopulate } = useContext(AppContext)!;
  const [addForm, addFormStatus] = useAddFormMutation();
  const formikResetRef = useRef<(() => void) | null>(null);

  const goBack = useCallback(() => navigate(PATHS.FORMS.USER), []);

  useEffect(() => {
    if (timeToShow === 0) return;

    const timer = setInterval(() => setTimeToShow(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeToShow]);

  useHandleReduxQueryError({
    error: addFormStatus.error,
    isError: addFormStatus.isError,
    refetch: () => {
      if (addFormStatus.originalArgs) addForm(addFormStatus.originalArgs);
    },
  });
  useHandleReduxQuerySuccess({
    showSuccessMessage: false,
    response: addFormStatus.data,
    isSuccess: addFormStatus.isSuccess,
    onSuccess: () => {
      formikResetRef.current?.();
      setFormToPopulate(addFormStatus.data?.data || null);
      setTimeToShow(TIME_TO_SHOW);
    },
  });

  return (
    <section className='form-section'>
      <div className='form-header mb-6'>
        <BackButton onClick={goBack} />
        <p className='form-heading'>Add Form</p>
        <p className='form-subheading'>Please fill in form details</p>
      </div>

      <Formik
        validationSchema={addFormSchema}
        initialValues={{
          name: '',
          endTime: '',
          startTime: '',
          identityCheck: true,
          visibility: VISIBILITY.PRIVATE,
        }}
        onSubmit={(values, { setSubmitting, resetForm }) => {
          formikResetRef.current = resetForm;
          // @ts-ignore
          addForm(values);
          setSubmitting(false);
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
          <Form className='form -mt-4 !mb-5' onSubmit={handleSubmit}>
            <TextField
              required
              id='name'
              name='name'
              label='Form Name'
              value={values.name}
              error={touched.name && !!errors.name}
              helperText={touched.name && errors.name}
              onBlur={handleBlur}
              onChange={handleChange}
            />

            <FormDatePicker
              required
              id='startTime'
              dateFormat='LL'
              name='startTime'
              label='Start Time'
              minDate={todayDate}
              error={errors.startTime}
              touched={touched.startTime}
              initialValue={values.startTime}
              onBlur={handleBlur}
              onChange={handleChange}
              onDateChange={date => setFieldValue('startTime', date.toISOString())}
            />

            <FormDatePicker
              required
              id='endTime'
              dateFormat='LL'
              name='endTime'
              label='End Time'
              minDate={todayDate}
              error={errors.endTime}
              touched={touched.endTime}
              initialValue={values.endTime}
              onBlur={handleBlur}
              onChange={handleChange}
              onDateChange={date => setFieldValue('endTime', date.toISOString())}
            />

            <DropdownInput
              id='visibility'
              name='visibility'
              label='Visibility'
              value={values.visibility}
              onBlur={handleBlur}
              onChange={handleChange}
              menuItems={Object.entries(VISIBILITY).map(([key, value]) => ({
                value,
                name: key,
              }))}
            />

            <Switch
              className='!w-fit'
              id='identityCheck'
              name='identityCheck'
              onBlur={handleBlur}
              onChange={handleChange}
              checked={values.identityCheck}
              label='Identity check required'
            />

            <Button
              type='submit'
              className='!mt-3'
              variant='contained'
              startIcon={<PostAdd />}
              loading={isSubmitting || addFormStatus.isLoading}
            >
              Add Form
            </Button>
          </Form>
        )}
      </Formik>

      <Paper
        className={`w-[90vw] fixed z-2 left-1/2 -translate-x-1/2 px-5 py-2 flex items-center justify-between !transition-[bottom] !duration-400 !ease-in-out max-phones:flex-col phones:w-150 ${
          timeToShow > 0 ? 'bottom-8' : '-bottom-32'
        }`}
      >
        <p className='font-semibold'>Let's get that form populated!</p>
        <LinkButton to={PATHS.FORMS.POPULATE} startIcon={<Poll />} variant='contained'>
          Add Polls
        </LinkButton>
      </Paper>
    </section>
  );
};

export default FormAdd;
