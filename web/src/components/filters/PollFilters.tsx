import { omitBy } from 'lodash';
import { useCallback } from 'react';
import { Form, Formik } from 'formik';

import { AlertDialog, FilterActions, Switch } from '../index';

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setFilters: React.Dispatch<React.SetStateAction<GetPollsPayload['params']>>;
}

const PollFilters: React.FC<Props> = ({ open, setOpen, setFilters }) => {
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
      initialValues={{ optionsImageEnabled: undefined }}
      onSubmit={(values, { setSubmitting }) => {
        const newFilters = omitBy(values, value => value === undefined);
        setOpen(false);
        setFilters({ ...newFilters });
        setSubmitting(false);
      }}
    >
      {({ values, resetForm, handleBlur, handleChange, handleSubmit, isSubmitting }) => (
        <AlertDialog
          open={open}
          hideActions
          setOpen={setOpen}
          dialogTitle='Form Filters'
          dialogContent={
            <Form className='form mt-4 !mb-0' onSubmit={handleSubmit}>
              <Switch
                className='!w-fit'
                id='optionsImageEnabled'
                name='optionsImageEnabled'
                label='Options Image Enabled'
                checked={values.optionsImageEnabled}
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

export default PollFilters;
