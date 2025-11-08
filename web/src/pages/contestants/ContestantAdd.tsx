import { useRef, useState } from 'react';
import { FaUserPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, type SelectChangeEvent } from '@mui/material';

import constants from '../../constants';
import { showAlert } from '../../utils';
import { PATHS } from '../../routes/PathConstants';
import { useGetPartiesQuery } from '../../services/apis/partyApi';
import { useAddContestantMutation } from '../../services/apis/contestantApi';
import { BackButton, DropdownInput, FileUploadInput } from '../../components';
import { useHandleReduxQueryError, useHandleReduxQuerySuccess } from '../../hooks';

const { GENDERS, FILE_SIZE, CONTESTANT_IMAGE_KEY, SUPPORTED_FORMATS } = constants;

const ContestantAdd = () => {
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [payload, setPayload] = useState<Partial<AddContestantPayload>>({});
  const [
    addContestant,
    {
      originalArgs,
      data: contestantData,
      error: addContestantError,
      isError: isAddContestantError,
      isLoading: isAddContestantLoading,
      isSuccess: isAddContestantSuccess,
    },
  ] = useAddContestantMutation();

  const {
    data: partiesData,
    error: getPartiesError,
    refetch: refetchParties,
    isError: isGetPartiesError,
  } = useGetPartiesQuery({});

  const goBack = () => navigate(PATHS.CONTESTANTS.FETCH);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = event.currentTarget;

    if (!event.target.files?.[0]) {
      setPayload(prev => {
        const newPayload = { ...prev };
        // @ts-ignore
        delete newPayload[name];

        return newPayload;
      });
      return showAlert({ msg: 'No image selected' });
    } else if (event.target.files[0].size > FILE_SIZE.IMAGE) {
      setPayload(prev => {
        const newPayload = { ...prev };
        // @ts-ignore
        delete newPayload[name];

        return newPayload;
      });
      fileInputRef.current!.value = '';
      return showAlert({ msg: 'Maximum file size is 500 KB', duration: 5000 });
    }

    setPayload(prev => ({ ...prev, [name]: event.target.files?.[0] }));
  };

  const handleSelectChange = (event: SelectChangeEvent) => {
    const { name, value } = event.target;
    setPayload(prev => ({ ...prev, [name]: value }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    setPayload(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addContestant(payload as AddContestantPayload);
  };

  useHandleReduxQueryError({
    error: getPartiesError,
    refetch: refetchParties,
    isError: isGetPartiesError,
  });

  useHandleReduxQueryError({
    error: addContestantError,
    isError: isAddContestantError,
    refetch: () => {
      if (originalArgs) addContestant(originalArgs);
    },
  });
  useHandleReduxQuerySuccess({
    response: contestantData,
    isSuccess: isAddContestantSuccess,
    onSuccess: () => {
      formRef.current?.reset();
      setPayload({});
    },
  });

  return (
    <section className='form-section'>
      <div className='form-header mb-6'>
        <BackButton onClick={goBack} />
        <p className='form-heading'>Add Contestant</p>
        <p className='form-subheading'>Please fill in contestant details</p>
      </div>

      <form ref={formRef} className='form -mt-4 !mb-5' onSubmit={handleSubmit}>
        <TextField
          required
          type='text'
          id='lastName'
          name='lastName'
          label='Last Name'
          className='form-field'
          autoComplete='family-name'
          onChange={handleChange}
        />

        <TextField
          required
          type='text'
          id='firstName'
          name='firstName'
          label='First Name'
          className='form-field'
          autoComplete='given-name'
          onChange={handleChange}
        />

        <TextField
          type='text'
          id='middleName'
          name='middleName'
          label='Middle Name'
          className='form-field'
          autoComplete='additional-name'
          onChange={handleChange}
        />

        <DropdownInput
          required
          id='gender'
          name='gender'
          label='Gender'
          key={payload.gender}
          value={payload.gender || ''}
          onChange={handleSelectChange}
          menuItems={Object.values(GENDERS).map(value => ({
            value,
            name: `${value[0]}${value.slice(1).toLowerCase()}`,
          }))}
        />

        <TextField
          required
          type='text'
          id='stateOfOrigin'
          name='stateOfOrigin'
          label='State Of Origin'
          className='form-field'
          onChange={handleChange}
        />

        {partiesData && Array.isArray(partiesData.data) && (
          <DropdownInput
            id='party'
            name='party'
            label='Party'
            key={payload.party}
            value={payload.party || ''}
            onChange={handleSelectChange}
            menuItems={partiesData.data.map(({ _id, logoUrl, longName, shortName }) => ({
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

        <FileUploadInput
          ref={fileInputRef}
          accept={SUPPORTED_FORMATS}
          onChange={handleFileChange}
          inputName={CONTESTANT_IMAGE_KEY}
          buttonText={payload.contestantImage?.name || 'Add Contestant Image'}
        />

        <Button
          type='submit'
          className='!mt-3'
          variant='contained'
          startIcon={<FaUserPlus />}
          loading={isAddContestantLoading}
        >
          Add Contestant
        </Button>
      </form>
    </section>
  );
};

export default ContestantAdd;
