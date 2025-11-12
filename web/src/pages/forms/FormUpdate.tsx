import moment from 'moment';
import { Form, Formik } from 'formik';
import { isEmpty, omitBy } from 'lodash';
import { useContext, useEffect } from 'react';
import { PostAdd } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Button, TextField } from '@mui/material';

import constants from '../../constants';
import { showAlert } from '../../utils';
import { PATHS } from '../../routes/PathConstants';
import { AppContext } from '../../contexts/AppContext';
import { updateFormSchema } from '../../schemas/form.schema';
import { useUpdateFormMutation } from '../../services/apis/formApi';
import { useHandleReduxQueryError, useHandleReduxQuerySuccess } from '../../hooks';
import { BackButton, DropdownInput, FormDatePicker, Switch } from '../../components';

const { VISIBILITY } = constants;

const FormUpdate = () => {
  const navigate = useNavigate();
  const todayDate = moment().toDate();
  const { formToUpdate, setFormToUpdate } = useContext(AppContext)!;
  const goBack = () => {
    setFormToUpdate(null);
    navigate(PATHS.FORMS.USER);
  };

  useEffect(() => {
    if (!formToUpdate) goBack();
  }, [formToUpdate]);

  const [
    updateForm,
    {
      originalArgs,
      data: formData,
      error: updateFormError,
      isError: isUpdateFormError,
      isLoading: isUpdateFormLoading,
      isSuccess: isUpdateFormSuccess,
    },
  ] = useUpdateFormMutation();

  useHandleReduxQueryError({
    error: updateFormError,
    isError: isUpdateFormError,
    refetch: () => {
      if (originalArgs) updateForm(originalArgs);
    },
  });
  useHandleReduxQuerySuccess({
    response: formData,
    isSuccess: isUpdateFormSuccess,
    onSuccess: goBack,
  });

  if (!formToUpdate) return;

  return (
    <section className='form-section'>
      <div className='form-header mb-6'>
        <BackButton onClick={goBack} />
        <p className='form-heading'>Update Form</p>
        <p className='form-subheading'>Please fill in form details</p>
      </div>

      <Formik
        validationSchema={updateFormSchema}
        initialValues={{
          name: '',
          endTime: '',
          startTime: '',
          visibility: '',
          identityCheck: undefined,
        }}
        onSubmit={(values, { setSubmitting }) => {
          const payload = omitBy(values, value => value === '' || value === undefined);
          if (isEmpty(payload)) {
            showAlert({ msg: 'No changes made to update' });
            return;
          }

          updateForm({ formID: formToUpdate._id, ...payload });
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
              id='name'
              name='name'
              label='Form Name'
              disabled={formToUpdate.hasStarted}
              error={touched.name && !!errors.name}
              value={values.name || formToUpdate.name}
              helperText={touched.name && errors.name}
              onBlur={handleBlur}
              onChange={handleChange}
            />

            <FormDatePicker
              id='startTime'
              dateFormat='LL'
              name='startTime'
              label='Start Time'
              minDate={todayDate}
              error={errors.startTime}
              touched={touched.startTime}
              disabled={formToUpdate.hasStarted}
              initialValue={values.startTime || moment(formToUpdate.startTime).toISOString()}
              onBlur={handleBlur}
              onChange={handleChange}
              onDateChange={date => setFieldValue('startTime', date.toISOString())}
            />

            <FormDatePicker
              id='endTime'
              dateFormat='LL'
              name='endTime'
              label='End Time'
              minDate={todayDate}
              error={errors.endTime}
              touched={touched.endTime}
              disabled={formToUpdate.hasEnded}
              initialValue={values.endTime || moment(formToUpdate.endTime).toISOString()}
              onBlur={handleBlur}
              onChange={handleChange}
              onDateChange={date => setFieldValue('endTime', date.toISOString())}
            />

            <DropdownInput
              id='visibility'
              name='visibility'
              label='Visibility'
              value={values.visibility || formToUpdate.visibility}
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
              label='Identity check required'
              defaultChecked={formToUpdate.identityCheck}
              checked={values.identityCheck ?? formToUpdate.identityCheck}
            />

            <Button
              type='submit'
              className='!mt-3'
              variant='contained'
              startIcon={<PostAdd />}
              loading={isSubmitting || isUpdateFormLoading}
            >
              Update Form
            </Button>
          </Form>
        )}
      </Formik>
    </section>
  );
};

export default FormUpdate;
