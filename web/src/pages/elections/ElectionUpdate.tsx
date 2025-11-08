import moment from 'moment';
import { isEmpty } from 'lodash';
import { FaUserEdit } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { Button, TextField, type SelectChangeEvent } from '@mui/material';

import { PATHS } from '../../routes/PathConstants';
import { generateTimeSlots, showAlert } from '../../utils';
import { BackButton, DatePicker, DropdownInput } from '../../components';
import { useUpdateElectionMutation } from '../../services/apis/electionApi';
import { useHandleReduxQueryError, useHandleReduxQuerySuccess } from '../../hooks';

const ElectionUpdate = () => {
  const navigate = useNavigate();
  const goBack = () => navigate(PATHS.ELECTIONS.FETCH);

  const todayDate = useMemo(() => new Date(), []);
  const [endDatePickerVisible, setEndDatePickerVisible] = useState(false);
  const [startDatePickerVisible, setStartDatePickerVisible] = useState(false);
  const timeSlots: ListItem[] = useMemo(() => {
    const slots = generateTimeSlots(30).map(slot => ({ name: slot, value: slot }));
    return slots;
  }, [generateTimeSlots]);

  const electionToUpdate: Election | undefined = useMemo(() => {
    const election = localStorage.getItem('electionToUpdate');
    if (!election) return;

    localStorage.removeItem('electionToUpdate');
    return JSON.parse(election) as Election;
  }, []);

  useEffect(() => {
    if (!electionToUpdate) goBack();
  }, [electionToUpdate]);
  if (!electionToUpdate) return;

  const [startDate, setStartDate] = useState<Date | undefined>(
    electionToUpdate.startTime ? new Date(electionToUpdate.startTime) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    electionToUpdate.endTime ? new Date(electionToUpdate.endTime) : undefined
  );
  const [startTime, setStartTime] = useState<string>(
    startDate ? moment(startDate).format('HH:mm') : ''
  );
  const [endTime, setEndTime] = useState<string>(endDate ? moment(endDate).format('HH:mm') : '');

  const [payload, setPayload] = useState<UpdateElectionPayload>({ id: electionToUpdate._id });
  const [
    updateElection,
    {
      originalArgs,
      data: electionData,
      error: updateElectionError,
      isError: isUpdateElectionError,
      isLoading: isUpdateElectionLoading,
      isSuccess: isUpdateElectionSuccess,
    },
  ] = useUpdateElectionMutation();

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

    if (payload.startTime) {
      const newStartDate = moment(payload.startTime).format('YYYY-MM-DD');
      payload.startTime = `${newStartDate}T${startTime}:00`;
    }

    if (payload.endTime) {
      const newEndDate = moment(payload.endTime).format('YYYY-MM-DD');
      payload.endTime = `${newEndDate}T${endTime}:00`;
    }

    updateElection(payload);
  };

  const handleStartDateChange = (date: Date) => {
    setPayload(prev => ({ ...prev, startTime: date.toISOString() }));
  };

  const handleEndDateChange = (date: Date) => {
    setPayload(prev => ({ ...prev, endTime: date.toISOString() }));
  };

  const handleStartTimeChange = (event: SelectChangeEvent) => {
    setStartTime(event.target.value);
    setPayload(prev => ({ ...prev, startTime: payload.startTime ?? electionToUpdate.startTime }));
  };

  const handleEndTimeChange = (event: SelectChangeEvent) => {
    setEndTime(event.target.value);
    setPayload(prev => ({ ...prev, endTime: payload.endTime ?? electionToUpdate.endTime }));
  };

  useHandleReduxQueryError({
    error: updateElectionError,
    isError: isUpdateElectionError,
    refetch: () => {
      if (originalArgs) updateElection(originalArgs);
    },
  });
  useHandleReduxQuerySuccess({
    response: electionData,
    isSuccess: isUpdateElectionSuccess,
    onSuccess: goBack,
  });

  return (
    <section className='form-section'>
      <div className='form-header mb-6'>
        <BackButton onClick={goBack} />
        <p className='form-heading'>Update Election</p>
        <p className='form-subheading'>Please fill in election details</p>
      </div>

      <form className='form -mt-4 !mb-5' onSubmit={handleSubmit}>
        <TextField
          id='name'
          type='text'
          name='name'
          label='Election Name'
          className='form-field'
          onChange={handleChange}
          defaultValue={electionToUpdate.name}
          disabled={electionToUpdate.hasStarted}
        />

        <TextField
          type='text'
          id='delimitationCode'
          name='delimitationCode'
          label='Delimitation Code'
          className='form-field'
          onChange={handleChange}
          defaultValue={electionToUpdate.delimitationCode}
          disabled={electionToUpdate.hasStarted}
        />

        <div className='grid grid-cols-[2fr_1fr] gap-2'>
          <p className='col-start-1 col-end-3 mb-1'>Election Start Period</p>
          <TextField
            type='text'
            id='startDate'
            name='startDate'
            label='Start Date'
            autoComplete='off'
            disabled={electionToUpdate.hasStarted}
            onClick={() => setStartDatePickerVisible(true)}
            value={startDate ? moment(startDate).format('ll') : ''}
          />
          <DropdownInput
            id='startTime'
            name='startTime'
            value={startTime}
            label='Start Time'
            menuItems={timeSlots}
            onChange={handleStartTimeChange}
            disabled={electionToUpdate.hasStarted}
          />
        </div>
        <DatePicker
          minDate={todayDate}
          selectedDate={startDate}
          setSelectedDate={setStartDate}
          visible={startDatePickerVisible}
          onDateChange={handleStartDateChange}
          setVisible={setStartDatePickerVisible}
        />

        <div className='grid grid-cols-[2fr_1fr] gap-2'>
          <p className='col-start-1 col-end-3 mb-1'>Election End Period</p>
          <TextField
            type='text'
            id='endDate'
            name='endDate'
            label='End Date'
            autoComplete='off'
            onClick={() => setEndDatePickerVisible(true)}
            value={endDate ? moment(endDate).format('ll') : ''}
          />
          <DropdownInput
            id='endTime'
            name='endTime'
            value={endTime}
            label='End Time'
            menuItems={timeSlots}
            onChange={handleEndTimeChange}
          />
        </div>
        <DatePicker
          minDate={todayDate}
          selectedDate={endDate}
          setSelectedDate={setEndDate}
          visible={endDatePickerVisible}
          onDateChange={handleEndDateChange}
          setVisible={setEndDatePickerVisible}
        />

        <Button
          type='submit'
          className='!mt-3'
          variant='contained'
          startIcon={<FaUserEdit />}
          loading={isUpdateElectionLoading}
        >
          Update Election
        </Button>
      </form>
    </section>
  );
};

export default ElectionUpdate;
