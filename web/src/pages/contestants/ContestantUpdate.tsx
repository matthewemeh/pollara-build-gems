import { isEmpty } from 'lodash';
import { FaUserEdit } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, TextField, type SelectChangeEvent } from '@mui/material';

import constants from '../../constants';
import { showAlert } from '../../utils';
import { PATHS } from '../../routes/PathConstants';
import { useGetPartiesQuery } from '../../services/apis/partyApi';
import { BackButton, DropdownInput, FileUploadInput } from '../../components';
import { useUpdateContestantMutation } from '../../services/apis/contestantApi';
import { useHandleReduxQueryError, useHandleReduxQuerySuccess } from '../../hooks';

const { GENDERS, FILE_SIZE, SUPPORTED_FORMATS, CONTESTANT_IMAGE_KEY } = constants;

const ContestantUpdate = () => {
  const navigate = useNavigate();
  const goBack = () => navigate(PATHS.CONTESTANTS.FETCH);

  const contestantToUpdate: Contestant | undefined = useMemo(() => {
    const contestant = localStorage.getItem('contestantToUpdate');
    if (!contestant) return;

    localStorage.removeItem('contestantToUpdate');
    return JSON.parse(contestant) as Contestant;
  }, []);

  useEffect(() => {
    if (!contestantToUpdate) goBack();
  }, [contestantToUpdate]);
  if (!contestantToUpdate) return;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [payload, setPayload] = useState<UpdateContestantPayload>({ id: contestantToUpdate._id });
  const [
    updateContestant,
    {
      originalArgs,
      data: contestantData,
      error: updateContestantError,
      isError: isUpdateContestantError,
      isLoading: isUpdateContestantLoading,
      isSuccess: isUpdateContestantSuccess,
    },
  ] = useUpdateContestantMutation();

  const {
    data: partiesData,
    error: getPartiesError,
    refetch: refetchParties,
    isError: isGetPartiesError,
  } = useGetPartiesQuery({});

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

    const { id, ...mainPayload } = payload;
    if (isEmpty(mainPayload)) {
      return showAlert({ msg: 'You have not made any changes', duration: 5000 });
    }

    updateContestant(payload);
  };

  useHandleReduxQueryError({
    error: getPartiesError,
    refetch: refetchParties,
    isError: isGetPartiesError,
  });

  useHandleReduxQueryError({
    error: updateContestantError,
    isError: isUpdateContestantError,
    refetch: () => {
      if (originalArgs) updateContestant(originalArgs);
    },
  });
  useHandleReduxQuerySuccess({
    response: contestantData,
    isSuccess: isUpdateContestantSuccess,
    onSuccess: goBack,
  });

  return (
    <section className='form-section'>
      <div className='form-header mb-6'>
        <BackButton onClick={goBack} />
        <p className='form-heading'>Update Contestant</p>
        <p className='form-subheading'>Please fill in contestant details</p>
      </div>

      <form className='form -mt-4 !mb-5' onSubmit={handleSubmit}>
        <TextField
          id='lastName'
          type='text'
          name='lastName'
          label='Last Name'
          className='form-field'
          autoComplete='family-name'
          onChange={handleChange}
          defaultValue={contestantToUpdate.lastName}
        />

        <TextField
          id='firstName'
          type='text'
          name='firstName'
          label='First Name'
          className='form-field'
          autoComplete='given-name'
          onChange={handleChange}
          defaultValue={contestantToUpdate.firstName}
        />

        <TextField
          id='middleName'
          type='text'
          name='middleName'
          label='Middle Name'
          className='form-field'
          autoComplete='additional-name'
          onChange={handleChange}
          defaultValue={contestantToUpdate.middleName}
        />

        <DropdownInput
          id='gender'
          name='gender'
          label='Gender'
          onChange={handleSelectChange}
          defaultValue={contestantToUpdate.gender}
          menuItems={Object.values(GENDERS).map(value => ({
            value,
            name: `${value[0]}${value.slice(1).toLowerCase()}`,
          }))}
        />

        <TextField
          id='stateOfOrigin'
          type='text'
          name='stateOfOrigin'
          label='State Of Origin'
          className='form-field'
          onChange={handleChange}
          defaultValue={contestantToUpdate.stateOfOrigin}
        />

        {partiesData && Array.isArray(partiesData.data) && (
          <DropdownInput
            id='party'
            name='party'
            label='Party'
            onChange={handleSelectChange}
            defaultValue={contestantToUpdate.party?._id || ''}
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
          buttonText={payload.contestantImage?.name || 'Update Contestant Image'}
        />

        <Button
          type='submit'
          className='!mt-3'
          variant='contained'
          startIcon={<FaUserEdit />}
          loading={isUpdateContestantLoading}
        >
          Update Contestant
        </Button>
      </form>
    </section>
  );
};

export default ContestantUpdate;
