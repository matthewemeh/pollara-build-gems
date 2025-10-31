import { useCallback } from 'react';
import SassyDatePicker from 'sassy-datepicker';

import Overlay from '../Overlay';
import '../../styles/date-picker.css';

interface Props {
  maxDate?: Date;
  minDate?: Date;
  visible?: boolean;
  datePickerID?: string;
  extraClassNames?: string;
  selectedDate?: Date | undefined;
  onDateChange?: (date: Date) => void;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
}

const DatePicker: React.FC<Props> = ({
  visible,
  minDate,
  maxDate,
  setVisible,
  onDateChange,
  datePickerID,
  extraClassNames,
  setSelectedDate,
  selectedDate = new Date(),
}) => {
  const onChange = useCallback(
    (date: Date) => {
      setSelectedDate(date);
      setVisible(false);
      onDateChange?.(date);
    },
    [setSelectedDate, setVisible, onDateChange]
  );

  return (
    <>
      <Overlay
        visible={visible}
        extraClassNames='z-1250'
        onClick={e => {
          setVisible(false);
          e.stopPropagation();
        }}
      />
      <SassyDatePicker
        autoFocus
        id={datePickerID}
        maxDate={maxDate}
        minDate={minDate}
        hidden={!visible}
        onChange={onChange}
        value={selectedDate}
        onPointerEnterCapture={null}
        onPointerLeaveCapture={null}
        className={`fixed z-1300 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-2xl font-normal ${extraClassNames}`}
      />
    </>
  );
};

export default DatePicker;
