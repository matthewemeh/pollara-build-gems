import { omitBy } from 'lodash';
import { useCallback } from 'react';
import { Form, Formik } from 'formik';
import { TextField } from '@mui/material';

import constants from '../../constants';
import AlertDialog from '../AlertDialog';
import FilterActions from './FilterActions';
import DropdownInput from '../inputs/DropdownInput';

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setFilters: React.Dispatch<React.SetStateAction<GetUsersPayload['params']>>;
}

const { ROLES } = constants;

const UserFilters: React.FC<Props> = ({ setFilters, open, setOpen }) => {
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
        role: '',
        email: '',
        lastName: '',
        firstName: '',
      }}
      onSubmit={(values, { setSubmitting }) => {
        const newFilters = omitBy(values, value => value === '');
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
          dialogTitle='User Filters'
          dialogContent={
            <Form className='form mt-4 !mb-0' onSubmit={handleSubmit}>
              <TextField
                id='lastName'
                name='lastName'
                label='Last Name'
                className='form-field'
                value={values.lastName}
                onBlur={handleBlur}
                onChange={handleChange}
              />

              <TextField
                id='firstName'
                name='firstName'
                label='First Name'
                className='form-field'
                value={values.firstName}
                onBlur={handleBlur}
                onChange={handleChange}
              />

              <TextField
                id='email'
                type='email'
                name='email'
                label='Email'
                inputMode='email'
                value={values.email}
                className='form-field'
                onBlur={handleBlur}
                onChange={handleChange}
              />

              <DropdownInput
                id='role'
                name='role'
                label='Role'
                value={values.role}
                onBlur={handleBlur}
                onChange={handleChange}
                menuItems={Object.entries(ROLES)
                  .filter(([_, value]) => value !== 'SUPER_ADMIN')
                  .map(([key, value]) => ({
                    value,
                    name: key.replaceAll('_', ' '),
                  }))}
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

export default UserFilters;
