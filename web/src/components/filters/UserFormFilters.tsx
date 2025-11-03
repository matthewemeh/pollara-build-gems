import moment from 'moment';
import { omitBy } from 'lodash';
import { useCallback } from 'react';
import { Formik, Form } from 'formik';
import { TextField } from '@mui/material';

import constants from '../../constants';
import { AlertDialog, FilterActions, DropdownInput, FormDatePicker, Switch } from '../index';

const { VISIBILITY } = constants;

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setFilters: React.Dispatch<React.SetStateAction<GetUserFormsPayload['params']>>;
}

const UserFormFilters: React.FC<Props> = ({ open, setOpen, setFilters }) => {
  const handleNegation = useCallback(
    (resetForm: any) => {
      resetForm();
      setFilters({});
      setOpen(false);
    },
    [setFilters, setOpen]
  );

  return (
    <Formik
      initialValues={{
        name: '',
        endTime: '',
        startTime: '',
        visibility: '',
        identityCheck: undefined,
      }}
      onSubmit={(values, { setSubmitting }) => {
        const newFilters = omitBy(values, value => value === '' || value === undefined);
        setOpen(false);
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
          dialogTitle='Form Filters'
          dialogContent={
            <Form className='form mt-4 !mb-0' onSubmit={handleSubmit}>
              <TextField
                id='name'
                name='name'
                label='Form Name'
                value={values.name}
                className='form-field'
                onBlur={handleBlur}
                onChange={handleChange}
              />

              <FormDatePicker
                id='startTime'
                dateFormat='LL'
                name='startTime'
                label='Start Time'
                initialValue={values.startTime}
                onDateChange={date => setFieldValue('startTime', moment(date).format('LL'))}
              />

              <FormDatePicker
                id='endTime'
                dateFormat='LL'
                name='endTime'
                label='End Time'
                initialValue={values.endTime}
                onDateChange={date => setFieldValue('endTime', moment(date).format('LL'))}
              />

              <DropdownInput
                id='visibility'
                name='visibility'
                label='Visibility'
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.visibility}
                menuItems={Object.entries(VISIBILITY).map(([key, value]) => ({
                  value,
                  name: key,
                }))}
              />

              <Switch
                className='!w-fit'
                id='identityCheck'
                name='identityCheck'
                checked={values.identityCheck}
                label='Identity check required'
                onBlur={handleBlur}
                onChange={handleChange}
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

export default UserFormFilters;
