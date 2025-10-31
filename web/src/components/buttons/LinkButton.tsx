import { Link, type To } from 'react-router-dom';
import { Button, type ButtonOwnProps } from '@mui/material';

interface Props extends ButtonOwnProps {
  to: To;
  className?: string;
}

const LinkButton: React.FC<Props> = props => {
  return <Button component={Link} {...props} />;
};

export default LinkButton;
