import { IconButton, Tooltip } from '@mui/material';
import { FilterAlt, FilterAltOff } from '@mui/icons-material';

interface Props {
  onClick?: () => void;
  isFiltersOn?: boolean;
  extraContainerClass?: string;
}

const FilterButton: React.FC<Props> = ({ extraContainerClass, onClick, isFiltersOn }) => {
  return (
    <Tooltip
      title={isFiltersOn ? 'Filters ON' : 'Filters OFF'}
      className={`cursor-pointer ${extraContainerClass}`}
    >
      <IconButton aria-label='apply filters' className='!text-primary-500' onClick={onClick}>
        {isFiltersOn ? <FilterAlt /> : <FilterAltOff />}
      </IconButton>
    </Tooltip>
  );
};

export default FilterButton;
