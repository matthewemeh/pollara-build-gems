import { InfoButton, FilterButton } from './index';

export interface TableActionProps {
  infoHidden?: boolean;
  isFiltersOn?: boolean;
  filterHidden?: boolean;
  extraClassNames?: string;
  infoButtonTitle?: string;
  handleFilterClick?: () => void;
}

const TableActions: React.FC<TableActionProps> = ({
  infoHidden,
  isFiltersOn,
  filterHidden,
  extraClassNames,
  infoButtonTitle,
  handleFilterClick,
}) => {
  return (
    <div
      className={`flex items-center justify-between gap-10 absolute left-5 bottom-0.5 z-100 phones:bottom-4 ${extraClassNames}`}
    >
      {infoHidden || <InfoButton title={infoButtonTitle} />}

      {filterHidden || <FilterButton isFiltersOn={isFiltersOn} onClick={handleFilterClick} />}
    </div>
  );
};

export default TableActions;
