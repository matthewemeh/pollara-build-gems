import { TableContainer, Table as MuiTable } from '@mui/material';

interface Props {
  ariaLabel?: string;
  children?: React.ReactNode;
}

const Table: React.FC<Props> = ({ ariaLabel, children }) => {
  return (
    <TableContainer className='rounded-3xl'>
      <MuiTable stickyHeader aria-label={ariaLabel} className='relative'>
        {children}
      </MuiTable>
    </TableContainer>
  );
};

export default Table;
