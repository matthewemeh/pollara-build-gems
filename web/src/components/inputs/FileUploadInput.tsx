import { forwardRef } from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import { FormHelperText } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

interface Props {
  error?: string;
  accept?: string;
  inputID?: string;
  touched?: boolean;
  required?: boolean;
  inputName?: string;
  buttonText: string;
  multiple?: boolean;
  className?: string;
  value?: string | number | readonly string[];
  variant?: 'text' | 'outlined' | 'contained';
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

// Forward ref to internal <input />
const FileUploadInput = forwardRef<HTMLInputElement, Props>(
  (
    {
      value,
      error,
      onBlur,
      accept,
      variant,
      touched,
      inputID,
      required,
      multiple,
      onChange,
      inputName,
      className,
      buttonText,
    },
    ref
  ) => {
    return (
      <div>
        <Button
          component='label'
          variant={variant}
          className={className}
          startIcon={<CloudUpload />}
        >
          {buttonText}
          <VisuallyHiddenInput
            ref={ref}
            type='file'
            id={inputID}
            value={value}
            onBlur={onBlur}
            accept={accept}
            name={inputName}
            required={required}
            multiple={multiple}
            onChange={onChange}
          />
        </Button>
        <FormHelperText error={touched && !!error}>{touched && error}</FormHelperText>
      </div>
    );
  }
);

export default FileUploadInput;
