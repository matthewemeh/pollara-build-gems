import { isEmpty } from 'lodash';
import { FaUserEdit } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Button, TextField } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';

import constants from '../../constants';
import { showAlert } from '../../utils';
import { PATHS } from '../../routes/PathConstants';
import { BackButton, FileUploadInput } from '../../components';
import { useUpdatePartyMutation } from '../../services/apis/partyApi';
import { useHandleReduxQueryError, useHandleReduxQuerySuccess } from '../../hooks';

const { FILE_SIZE, PARTY_IMAGE_KEY, SUPPORTED_FORMATS } = constants;

const PartyUpdate = () => {
  const navigate = useNavigate();
  const goBack = () => navigate(PATHS.PARTIES.FETCH);

  const partyToUpdate: Party | undefined = useMemo(() => {
    const party = localStorage.getItem('partyToUpdate');
    if (!party) return;

    localStorage.removeItem('partyToUpdate');
    return JSON.parse(party) as Party;
  }, []);

  useEffect(() => {
    if (!partyToUpdate) goBack();
  }, [partyToUpdate]);
  if (!partyToUpdate) return;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [payload, setPayload] = useState<UpdatePartyPayload>({ id: partyToUpdate._id });
  const [
    updateParty,
    {
      originalArgs,
      data: partyData,
      error: updatePartyError,
      isError: isUpdatePartyError,
      isLoading: isUpdatePartyLoading,
      isSuccess: isUpdatePartySuccess,
    },
  ] = useUpdatePartyMutation();

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

    const { id, ...mainPayload } = payload;
    if (isEmpty(mainPayload)) {
      return showAlert({ msg: 'You have not made any changes', duration: 5000 });
    }

    updateParty(payload);
  };

  useHandleReduxQueryError({
    error: updatePartyError,
    isError: isUpdatePartyError,
    refetch: () => {
      if (originalArgs) updateParty(originalArgs);
    },
  });
  useHandleReduxQuerySuccess({
    response: partyData,
    isSuccess: isUpdatePartySuccess,
    onSuccess: goBack,
  });

  return (
    <section className='form-section'>
      <div className='form-header mb-6'>
        <BackButton onClick={goBack} />
        <p className='form-heading'>Update Party</p>
        <p className='form-subheading'>Please fill in party details</p>
      </div>

      <form className='form -mt-4 !mb-5' onSubmit={handleSubmit}>
        <TextField
          id='longName'
          type='text'
          name='longName'
          label='Long Name'
          className='form-field'
          onChange={handleChange}
          defaultValue={partyToUpdate.longName}
        />

        <TextField
          id='shortName'
          type='text'
          name='shortName'
          label='Short Name'
          className='form-field'
          onChange={handleChange}
          defaultValue={partyToUpdate.shortName}
        />

        <TextField
          id='motto'
          type='text'
          name='motto'
          label='Motto'
          className='form-field'
          onChange={handleChange}
          defaultValue={partyToUpdate.motto}
        />

        <FileUploadInput
          ref={fileInputRef}
          accept={SUPPORTED_FORMATS}
          onChange={handleFileChange}
          inputName={PARTY_IMAGE_KEY}
          buttonText={payload.partyImage?.name || 'Update Party Image'}
        />

        <Button
          type='submit'
          className='!mt-3'
          variant='contained'
          startIcon={<FaUserEdit />}
          loading={isUpdatePartyLoading}
        >
          Update Party
        </Button>
      </form>
    </section>
  );
};

export default PartyUpdate;
