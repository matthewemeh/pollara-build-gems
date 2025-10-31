import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa6';
import { TableRow, TableCell, type TableCellProps, TableHead as MuiTableHead } from '@mui/material';

interface Column extends TableCellProps {
  id: string;
  label: string;
  maxWidth?: number;
  minWidth?: number;
  format?: (value: number) => string;
}

interface Props {
  children?: React.ReactNode;
  columns: readonly Column[];
  isSortDisabled: boolean | ((id: string) => boolean);
  handleSortClick?: (
    id: string,
    isSortDisabled: boolean
  ) => (e: React.MouseEvent<HTMLTableCellElement>) => void;
}

const TableHead: React.FC<Props> = ({ children, columns, handleSortClick, isSortDisabled }) => {
  return (
    <MuiTableHead>
      <TableRow role='row'>
        {columns.map(({ id, label, align, minWidth, maxWidth }) => {
          const sortDisabled =
            typeof isSortDisabled === 'boolean' ? isSortDisabled : isSortDisabled(id);

          return (
            <TableCell
              key={id}
              data-sort='0'
              align={align}
              role='columnheader'
              style={{ minWidth, maxWidth }}
              className='!font-semibold !text-base'
              onClick={handleSortClick?.(id, sortDisabled)}
            >
              {label}
              <FaSort className={`unsorted ${sortDisabled && '!hidden'}`} />
              <FaSortUp className={`sort-up ${sortDisabled && '!hidden'}`} />
              <FaSortDown className={`sort-down ${sortDisabled && '!hidden'}`} />
            </TableCell>
          );
        })}

        {children}
      </TableRow>
    </MuiTableHead>
  );
};
export default TableHead;
