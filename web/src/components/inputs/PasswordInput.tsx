import { useState } from 'react';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
  InputLabel,
  IconButton,
  FormControl,
  OutlinedInput,
  InputAdornment,
  FormHelperText,
} from '@mui/material';

interface Props {
  id?: string;
  name: string;
  value?: string;
  error?: string;
  touched?: boolean;
  disabled?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  autoCorrect?: boolean;
  inputClassName?: string;
  containerClassName?: string;
  label?: string | React.ReactElement;
  variant?: 'outlined' | 'standard' | 'filled';
  onBlur: {
    (e: React.FocusEvent<any>): void;
    <T = any>(fieldOrEvent: T): T extends string ? (e: any) => void : void;
  };
  onChange: {
    (e: React.ChangeEvent<any>): void;
    <T = string | React.ChangeEvent<any>>(field: T): T extends React.ChangeEvent<any>
      ? void
      : (e: string | React.ChangeEvent<any>) => void;
  };
  autoComplete?:
    | 'additional-name'
    | 'address-line1'
    | 'address-line2'
    | 'birthdate-day'
    | 'birthdate-full'
    | 'birthdate-month'
    | 'birthdate-year'
    | 'cc-csc'
    | 'cc-exp'
    | 'cc-exp-day'
    | 'cc-exp-month'
    | 'cc-exp-year'
    | 'cc-number'
    | 'cc-name'
    | 'cc-given-name'
    | 'cc-middle-name'
    | 'cc-family-name'
    | 'cc-type'
    | 'country'
    | 'current-password'
    | 'email'
    | 'family-name'
    | 'gender'
    | 'given-name'
    | 'honorific-prefix'
    | 'honorific-suffix'
    | 'name'
    | 'name-family'
    | 'name-given'
    | 'name-middle'
    | 'name-middle-initial'
    | 'name-prefix'
    | 'name-suffix'
    | 'new-password'
    | 'nickname'
    | 'one-time-code'
    | 'organization'
    | 'organization-title'
    | 'password'
    | 'password-new'
    | 'postal-address'
    | 'postal-address-country'
    | 'postal-address-extended'
    | 'postal-address-extended-postal-code'
    | 'postal-address-locality'
    | 'postal-address-region'
    | 'postal-code'
    | 'street-address'
    | 'sms-otp'
    | 'tel'
    | 'tel-country-code'
    | 'tel-national'
    | 'tel-device'
    | 'url'
    | 'username'
    | 'username-new'
    | 'off';
}

const PasswordInput: React.FC<Props> = ({
  id,
  name,
  label,
  value,
  error,
  onBlur,
  touched,
  required,
  disabled,
  onChange,
  autoFocus,
  autoComplete,
  inputClassName,
  containerClassName,
  autoCorrect = false,
  variant = 'outlined',
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const handleToggleShowPassword = () => setShowPassword(show => !show);

  return (
    <FormControl variant={variant} className={containerClassName} error={touched && !!error}>
      <InputLabel htmlFor={id}>{label}</InputLabel>
      <OutlinedInput
        className={inputClassName}
        autoCorrect={autoCorrect ? 'on' : 'off'}
        type={showPassword ? 'text' : 'password'}
        {...{
          id,
          name,
          label,
          value,
          onBlur,
          onChange,
          required,
          disabled,
          autoFocus,
          autoComplete,
        }}
        endAdornment={
          <InputAdornment position='end'>
            <IconButton
              edge='end'
              onClick={handleToggleShowPassword}
              aria-label={showPassword ? 'hide password' : 'show password'}
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        }
      />
      <FormHelperText error={touched && !!error}>{touched && error}</FormHelperText>
    </FormControl>
  );
};

export default PasswordInput;
