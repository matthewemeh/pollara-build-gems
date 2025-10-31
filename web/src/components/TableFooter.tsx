import { TablePagination } from '@mui/material';

import { type TableActionProps } from './TableActions';
import { TablePaginationActions, TableActions } from './index';

interface Props extends TableActionProps {
  rowsPerPage: number;
  rowsPerPageOptions?: number[];
  paginatedData: PaginatedResponse<any>;
  component?: keyof React.JSX.IntrinsicElements;
  onPageChange: (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const TableFooter: React.FC<Props> = ({
  rowsPerPage,
  onPageChange,
  paginatedData,
  component = 'div',
  onRowsPerPageChange,
  rowsPerPageOptions = [10, 25, 50],
  ...tableActionProps
}) => {
  return (
    <>
      <TableActions {...tableActionProps} />

      <TablePagination
        component={component}
        rowsPerPage={rowsPerPage}
        onPageChange={onPageChange}
        page={paginatedData.data.page - 1}
        count={paginatedData.data.totalDocs}
        rowsPerPageOptions={rowsPerPageOptions}
        ActionsComponent={TablePaginationActions}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    </>
  );
};

export default TableFooter;
