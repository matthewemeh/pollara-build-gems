import { omitBy } from 'lodash';
import { Form, Formik } from 'formik';
import { useCallback, useMemo } from 'react';

import { AlertDialog, FilterActions, FormDatePicker } from '../index';

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setFilters: React.Dispatch<React.SetStateAction<GetNotificationsPayload['params']>>;
}

const NotificationFilters: React.FC<Props> = ({ setFilters, open, setOpen }) => {
  const todayDate = useMemo(() => new Date(), []);

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
      initialValues={{ endTime: '', startTime: '' }}
      onSubmit={(values, { setSubmitting }) => {
        const newFilters = omitBy(values, value => !value);
        setOpen(false);
        setFilters({ ...newFilters });
        setSubmitting(false);
      }}
    >
      {({ values, resetForm, handleSubmit, isSubmitting, setFieldValue }) => (
        <AlertDialog
          open={open}
          hideActions
          setOpen={setOpen}
          dialogTitle='Notification Filters'
          dialogContent={
            <Form className='form mt-4 !mb-0' onSubmit={handleSubmit}>
              <FormDatePicker
                id='startTime'
                name='startTime'
                dateFormat='ll'
                label='From Date'
                maxDate={todayDate}
                initialValue={values.startTime}
                onDateChange={date => setFieldValue('startTime', date.toISOString())}
              />

              <FormDatePicker
                id='endTime'
                name='endTime'
                dateFormat='ll'
                label='To Date'
                maxDate={todayDate}
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

export default NotificationFilters;
