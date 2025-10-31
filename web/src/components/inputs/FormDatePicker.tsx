import moment from 'moment';
import { TextField } from '@mui/material';
import { useEffect, useState } from 'react';

import DatePicker from './DatePicker';

interface Props {
  id?: string;
  name?: string;
  error?: string;
  maxDate?: Date;
  minDate?: Date;
  touched?: boolean;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  dateFormat?: string;
  initialValue?: string;
  label?: React.ReactNode;
  onDateChange?: (date: Date) => void;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

const FormDatePicker: React.FC<Props> = ({
  id,
  name,
  label,
  error,
  onBlur,
  maxDate,
  minDate,
  touched,
  onChange,
  disabled,
  required,
  className,
  dateFormat,
  initialValue,
  onDateChange,
}) => {
  const [date, setDate] = useState<Date>();
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  useEffect(() => {
    setDate(initialValue ? moment(initialValue).toDate() : undefined);
  }, [initialValue]);

  return (
    <>
      <TextField
        autoComplete='off'
        error={touched && !!error}
        helperText={touched && error}
        onClick={() => setDatePickerVisible(true)}
        value={date ? moment(date).format(dateFormat) : initialValue}
        {...{ id, name, label, className, required, onBlur, onChange, disabled }}
      />
      <DatePicker
        maxDate={maxDate}
        minDate={minDate}
        selectedDate={date}
        setSelectedDate={setDate}
        onDateChange={onDateChange}
        visible={datePickerVisible}
        setVisible={setDatePickerVisible}
      />
    </>
  );
};

export default FormDatePicker;
