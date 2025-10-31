import IconButton from '@mui/material/IconButton';
import { KeyboardBackspaceRounded } from '@mui/icons-material';

interface Props {
  disabled?: boolean;
  onClick?: () => void;
}

const BackButton: React.FC<Props> = props => {
  return (
    <IconButton
      {...props}
      aria-label='back'
      className='size-10 !absolute -left-2 -top-10 sm:-left-16 sm:top-2'
    >
      <KeyboardBackspaceRounded />
    </IconButton>
  );
};

export default BackButton;
