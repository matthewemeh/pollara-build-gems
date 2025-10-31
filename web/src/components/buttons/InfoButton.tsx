import { Tooltip } from '@mui/material';
import { InfoRounded } from '@mui/icons-material';

interface Props {
  title: React.ReactNode;
  extraContainerClass?: string;
}

const InfoButton: React.FC<Props> = ({ extraContainerClass, title }) => {
  return (
    <Tooltip title={title} className={`cursor-pointer ${extraContainerClass}`}>
      <InfoRounded className='text-primary-500' />
    </Tooltip>
  );
};

export default InfoButton;
