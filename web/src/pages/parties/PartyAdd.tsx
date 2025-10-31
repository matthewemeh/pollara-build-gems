import { useRef, useState } from 'react';
import { FaUserPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Button, TextField } from '@mui/material';

import constants from '../../constants';
import { showAlert } from '../../utils';
import { PATHS } from '../../routes/PathConstants';
import { BackButton, FileUploadInput } from '../../components';
import { useAddPartyMutation } from '../../services/apis/partyApi';
import { useHandleReduxQueryError, useHandleReduxQuerySuccess } from '../../hooks';

const { FILE_SIZE, PARTY_IMAGE_KEY, SUPPORTED_FORMATS } = constants;

const PartyAdd = () => {
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [payload, setPayload] = useState<Partial<AddPartyPayload>>({});
  const [
    addParty,
    {
      originalArgs,
      data: partyData,
      error: addPartyError,
      isError: isAddPartyError,
      isLoading: isAddPartyLoading,
      isSuccess: isAddPartySuccess,
    },
  ] = useAddPartyMutation();

  const goBack = () => navigate(PATHS.PARTIES.FETCH);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    setPayload(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addParty(payload as AddPartyPayload);
  };

  useHandleReduxQueryError({
    error: addPartyError,
    isError: isAddPartyError,
    refetch: () => {
      if (originalArgs) addParty(originalArgs);
    },
  });
  useHandleReduxQuerySuccess({
    response: partyData,
    isSuccess: isAddPartySuccess,
    onSuccess: () => {
      formRef.current?.reset();
      setPayload({});
    },
  });

  return (
    <section className='mx-auto flex flex-col gap-4 pt-8 sm:max-w-md max-sm:px-6 max-sm:w-full'>
      <div className='form-header mb-6'>
        <BackButton onClick={goBack} />
        <p className='form-heading'>Add Party</p>
        <p className='form-subheading'>Please fill in party details</p>
      </div>

      <form ref={formRef} className='form -mt-4 !mb-5' onSubmit={handleSubmit}>
        <TextField
          required
          type='text'
          id='longName'
          name='longName'
          label='Long Name'
          className='form-field'
          onChange={handleChange}
        />

        <TextField
          required
          type='text'
          id='shortName'
          name='shortName'
          label='Short Name'
          className='form-field'
          onChange={handleChange}
        />

        <TextField
          type='text'
          id='motto'
          name='motto'
          label='Motto'
          className='form-field'
          onChange={handleChange}
        />

        <FileUploadInput
          ref={fileInputRef}
          accept={SUPPORTED_FORMATS}
          onChange={handleFileChange}
          inputName={PARTY_IMAGE_KEY}
          buttonText={payload.partyImage?.name || 'Add Party Image'}
        />

        <Button
          type='submit'
          className='!mt-3'
          variant='contained'
          startIcon={<FaUserPlus />}
          loading={isAddPartyLoading}
        >
          Add Party
        </Button>
      </form>
    </section>
  );
};

export default PartyAdd;
