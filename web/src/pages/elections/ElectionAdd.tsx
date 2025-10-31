import moment from 'moment';
import { FaUserPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Button, TextField } from '@mui/material';
import { useMemo, useRef, useState } from 'react';

import { PATHS } from '../../routes/PathConstants';
import { generateTimeSlots, showAlert } from '../../utils';
import { BackButton, DatePicker, DropdownInput } from '../../components';
import { useAddElectionMutation } from '../../services/apis/electionApi';
import { useHandleReduxQueryError, useHandleReduxQuerySuccess } from '../../hooks';

const ElectionAdd = () => {
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  const [endDate, setEndDate] = useState<Date>();
  const todayDate = useMemo(() => new Date(), []);
  const [startDate, setStartDate] = useState<Date>();
  const [endTime, setEndTime] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('');
  const [payload, setPayload] = useState<Partial<AddElectionPayload>>({});
  const [endDatePickerVisible, setEndDatePickerVisible] = useState(false);
  const [startDatePickerVisible, setStartDatePickerVisible] = useState(false);
  const timeSlots: ListItem[] = useMemo(() => {
    const slots = generateTimeSlots(30).map(slot => ({ name: slot, value: slot }));
    return slots;
  }, [generateTimeSlots]);

  const [
    addElection,
    {
      originalArgs,
      data: electionData,
      error: addElectionError,
      isError: isAddElectionError,
      isLoading: isAddElectionLoading,
      isSuccess: isAddElectionSuccess,
    },
  ] = useAddElectionMutation();

  const goBack = () => navigate(PATHS.ELECTIONS.FETCH);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    setPayload(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!startDate) {
      return showAlert({ msg: 'Start Date is required' });
    } else if (!startTime) {
      return showAlert({ msg: 'Start Time is required' });
    } else if (!endDate) {
      return showAlert({ msg: 'End Date is required' });
    } else if (!endTime) {
      return showAlert({ msg: 'End Time is required' });
    }

    const startDatePart = moment(startDate).format('YYYY-MM-DD');
    const endDatePart = moment(endDate).format('YYYY-MM-DD');
    payload.startTime = `${startDatePart}T${startTime}:00`;
    payload.endTime = `${endDatePart}T${endTime}:00`;

    addElection(payload as AddElectionPayload);
  };

  useHandleReduxQueryError({
    error: addElectionError,
    isError: isAddElectionError,
    refetch: () => {
      if (originalArgs) addElection(originalArgs);
    },
  });
  useHandleReduxQuerySuccess({
    response: electionData,
    isSuccess: isAddElectionSuccess,
    onSuccess: () => {
      formRef.current?.reset();
      setPayload({});
      setStartDate(undefined);
      setEndDate(undefined);
      setStartTime('');
      setEndTime('');
    },
  });

  return (
    <section className='mx-auto flex flex-col gap-4 pt-8 sm:max-w-md max-sm:px-6 max-sm:w-full'>
      <div className='form-header mb-6'>
        <BackButton onClick={goBack} />
        <p className='form-heading'>Add Election</p>
        <p className='form-subheading'>Please fill in election details</p>
      </div>

      <form ref={formRef} className='form -mt-4 !mb-5' onSubmit={handleSubmit}>
        <TextField
          required
          type='text'
          id='name'
          name='name'
          label='Election Name'
          className='form-field'
          onChange={handleChange}
        />

        <TextField
          type='text'
          id='delimitationCode'
          name='delimitationCode'
          label='Delimitation Code'
          className='form-field'
          onChange={handleChange}
        />

        <div className='grid grid-cols-[2fr_1fr] gap-2'>
          <p className='col-start-1 col-end-3 mb-1'>Election Start Period</p>
          <TextField
            required
            type='text'
            id='startDate'
            name='startDate'
            label='Start Date'
            autoComplete='off'
            key={startDate?.toString()}
            onClick={() => setStartDatePickerVisible(true)}
            value={startDate ? moment(startDate).format('ll') : ''}
          />
          <DropdownInput
            required
            id='startTime'
            name='startTime'
            value={startTime}
            label='Start Time'
            menuItems={timeSlots}
            onChange={e => setStartTime(e.target.value)}
          />
        </div>
        <DatePicker
          minDate={todayDate}
          selectedDate={startDate}
          setSelectedDate={setStartDate}
          visible={startDatePickerVisible}
          setVisible={setStartDatePickerVisible}
        />

        <div className='grid grid-cols-[2fr_1fr] gap-2'>
          <p className='col-start-1 col-end-3 mb-1'>Election End Period</p>
          <TextField
            required
            type='text'
            id='endDate'
            name='endDate'
            label='End Date'
            autoComplete='off'
            key={endDate?.toString()}
            onClick={() => setEndDatePickerVisible(true)}
            value={endDate ? moment(endDate).format('ll') : ''}
          />
          <DropdownInput
            required
            id='endTime'
            name='endTime'
            label='End Time'
            value={endTime}
            menuItems={timeSlots}
            onChange={e => setEndTime(e.target.value)}
          />
        </div>
        <DatePicker
          minDate={todayDate}
          selectedDate={endDate}
          setSelectedDate={setEndDate}
          visible={endDatePickerVisible}
          setVisible={setEndDatePickerVisible}
        />

        <Button
          type='submit'
          className='!mt-3'
          variant='contained'
          startIcon={<FaUserPlus />}
          loading={isAddElectionLoading}
        >
          Add Election
        </Button>
      </form>
    </section>
  );
};

export default ElectionAdd;
