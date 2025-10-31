import { omitBy } from 'lodash';
import { useCallback } from 'react';
import { Formik, Form } from 'formik';
import { TextField } from '@mui/material';

import Switch from '../inputs/Switch';
import constants from '../../constants';
import AlertDialog from '../AlertDialog';
import FilterActions from './FilterActions';
import DropdownInput from '../inputs/DropdownInput';
import { useHandleReduxQueryError } from '../../hooks';
import { useGetPartiesQuery } from '../../services/apis/partyApi';

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setFilters: React.Dispatch<React.SetStateAction<GetContestantsPayload['params']>>;
}

const { GENDERS } = constants;

const ContestantFilters: React.FC<Props> = ({ open, setOpen, setFilters }) => {
  const {
    data: partiesData,
    error: getPartiesError,
    refetch: refetchParties,
    isError: isGetPartiesError,
  } = useGetPartiesQuery({});

  const handleNegation = useCallback(
    (resetForm: any) => {
      resetForm();
      setFilters({});
      setOpen(false);
    },
    [setFilters]
  );

  useHandleReduxQueryError({
    error: getPartiesError,
    refetch: refetchParties,
    isError: isGetPartiesError,
  });

  return (
    <Formik
      initialValues={{
        party: '',
        gender: '',
        lastName: '',
        firstName: '',
        isDeleted: undefined,
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
          dialogTitle='Contestant Filters'
          dialogContent={
            <Form className='form mt-4 !mb-0' onSubmit={handleSubmit}>
              <TextField
                type='text'
                id='lastName'
                name='lastName'
                label='Last Name'
                className='form-field'
                value={values.lastName}
                onBlur={handleBlur}
                onChange={handleChange}
              />

              <TextField
                type='text'
                id='firstName'
                name='firstName'
                label='First Name'
                className='form-field'
                value={values.firstName}
                onBlur={handleBlur}
                onChange={handleChange}
              />

              <DropdownInput
                id='gender'
                name='gender'
                label='Gender'
                onBlur={handleBlur}
                value={values.gender}
                onChange={handleChange}
                menuItems={Object.values(GENDERS).map(value => ({
                  value,
                  name: `${value[0]}${value.slice(1).toLowerCase()}`,
                }))}
              />

              {partiesData && Array.isArray(partiesData.data) && (
                <DropdownInput
                  id='party'
                  name='party'
                  label='Party'
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.party}
                  menuItems={partiesData.data.map(({ logoUrl, shortName, longName, _id }) => ({
                    value: _id,
                    name: (
                      <span className='party'>
                        <img src={logoUrl} alt={longName} className='party__img' />
                        <span>{shortName}</span>
                      </span>
                    ),
                  }))}
                />
              )}

              <Switch
                id='isDeleted'
                label='Deleted'
                name='isDeleted'
                className='!w-fit'
                onBlur={handleBlur}
                onChange={handleChange}
                checked={values.isDeleted}
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

export default ContestantFilters;
