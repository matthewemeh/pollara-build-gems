import { useCallback, useState } from 'react';
import {
  Box,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormHelperText,
  type SelectChangeEvent,
} from '@mui/material';

interface Props {
  id?: string;
  name?: string;
  label: string;
  value?: string;
  error?: boolean;
  labelID?: string;
  required?: boolean;
  disabled?: boolean;
  menuItems: ListItem[];
  defaultValue?: string;
  helperText?: React.ReactNode;
  onItemChange?: (listItem?: ListItem) => void;
  onChange?: (event: SelectChangeEvent) => void;
  onBlur?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
}

const DropdownInput: React.FC<Props> = ({
  id,
  name,
  label,
  error,
  value,
  onBlur,
  labelID,
  disabled,
  onChange,
  required,
  menuItems,
  helperText,
  onItemChange,
  defaultValue,
}) => {
  const [selectedItem, setSelectedItem] = useState<ListItem>();

  const handleChange = useCallback(
    (event: SelectChangeEvent) => {
      const newSelectedItem = menuItems.find(({ value }) => value === event.target.value);
      setSelectedItem(newSelectedItem);
      onChange?.(event);
      onItemChange?.(newSelectedItem);
    },
    [onChange, onItemChange, menuItems]
  );

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth required={required} disabled={disabled} error={error}>
        <InputLabel>{label}</InputLabel>
        <Select
          id={id}
          name={name}
          label={label}
          onBlur={onBlur}
          labelId={labelID}
          onChange={handleChange}
          defaultValue={defaultValue}
          value={value ?? selectedItem?.value}
        >
          {menuItems.map(({ name, value }) => (
            <MenuItem key={value} value={value}>
              {name}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>{helperText}</FormHelperText>
      </FormControl>
    </Box>
  );
};

export default DropdownInput;
