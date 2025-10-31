import { FormControlLabel, Switch as MuiSwitch } from '@mui/material';

interface Props {
  id?: string;
  name?: string;
  label?: string;
  disabled?: boolean;
  checked?: boolean;
  className?: string;
  defaultChecked?: boolean;
  onBlur?: React.FocusEventHandler<HTMLButtonElement>;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

const Switch: React.FC<Props> = ({
  id,
  name,
  label,
  onBlur,
  checked,
  onChange,
  disabled,
  className,
  defaultChecked,
}) => {
  return (
    <FormControlLabel
      {...{ className, defaultChecked, label, disabled }}
      control={
        <MuiSwitch
          {...{ id, name, onBlur, checked }}
          onChange={(event, checkedValue) => {
            const syntheticEvent = {
              ...event,
              target: {
                ...event.target,
                name,
                value: checkedValue,
              },
            } as unknown as React.ChangeEvent<HTMLInputElement>;

            onChange?.(syntheticEvent);
          }}
        />
      }
    />
  );
};

export default Switch;
