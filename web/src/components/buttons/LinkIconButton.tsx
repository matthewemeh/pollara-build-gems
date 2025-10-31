import { Link, type To } from 'react-router-dom';
import { IconButton, type ButtonOwnProps } from '@mui/material';

interface Props extends ButtonOwnProps {
  to: To;
  className?: string;
}

const LinkIconButton: React.FC<Props> = props => {
  return <IconButton component={Link} {...props} />;
};

export default LinkIconButton;
