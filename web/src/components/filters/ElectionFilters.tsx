import { omitBy } from 'lodash';
import { useCallback } from 'react';
import { Formik, Form } from 'formik';
import { TextField } from '@mui/material';

import AlertDialog from '../AlertDialog';
import FilterActions from './FilterActions';
import FormDatePicker from '../inputs/FormDatePicker';

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setFilters: React.Dispatch<React.SetStateAction<GetElectionsPayload['params']>>;
}

const ElectionFilters: React.FC<Props> = ({ setFilters, open, setOpen }) => {
  const handleNegation = useCallback(
    (resetForm: any) => {
      resetForm();
      setFilters({});
      setOpen(false);
    },
    [setFilters]
  );

  return (
    <Formik
      initialValues={{
        endTime: '',
        startTime: '',
        delimitationCode: undefined,
      }}
      onSubmit={(values, { setSubmitting }) => {
        const newFilters = omitBy(
          values,
          (value, key) => value === '' && key !== 'delimitationCode'
        );
        setOpen;
        setFilters({ ...newFilters });
        setSubmitting(false);
      }}
    >
      {({
        values,
        resetForm,
        handleBlur,
        handleChange,
        handleSubmit,
        isSubmitting,
        setFieldValue,
      }) => (
        <AlertDialog
          open={open}
          hideActions
          setOpen={setOpen}
          dialogTitle='Election Filters'
          dialogContent={
            <Form className='form mt-4 !mb-0' onSubmit={handleSubmit}>
              <TextField
                type='text'
                id='delimitationCode'
                className='form-field'
                name='delimitationCode'
                label='Delimitation Code'
                value={values.delimitationCode}
                onBlur={handleBlur}
                onChange={handleChange}
              />

              <FormDatePicker
                id='startTime'
                name='startTime'
                dateFormat='ll'
                label='Start Date'
                initialValue={values.startTime}
                onDateChange={date => setFieldValue('startTime', date.toISOString())}
              />

              <FormDatePicker
                id='endTime'
                name='endTime'
                dateFormat='ll'
                label='End Date'
                initialValue={values.endTime}
                onDateChange={date => setFieldValue('endTime', date.toISOString())}
              />

              <FilterActions
                isSubmitting={isSubmitting}
                onClear={() => handleNegation(resetForm)}
              />
            </Form>
          }
        />
      )}
    </Formik>
  );
};

export default ElectionFilters;
