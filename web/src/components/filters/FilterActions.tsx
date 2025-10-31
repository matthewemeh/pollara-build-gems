import { Button } from '@mui/material';

interface Props {
  onClear?: () => void;
  isSubmitting?: boolean;
}

const FilterActions: React.FC<Props> = ({ isSubmitting, onClear }) => {
  return (
    <div className='flex items-center gap-2 justify-end'>
      <Button type='button' onClick={onClear}>
        Clear
      </Button>
      <Button variant='contained' type='submit' loading={isSubmitting}>
        Confirm
      </Button>
    </div>
  );
};

export default FilterActions;
