import { isEmpty } from 'lodash';
import { useSearchParams } from 'react-router-dom';
import { useCallback, useMemo, useState } from 'react';
import { Paper, TableBody, TableCell, type TableCellProps } from '@mui/material';

import { useHandleReduxQueryError } from '../../hooks';
import { useGetTokensQuery } from '../../services/apis/userApi';
import { Table, TokenTab, TableHead, EmptyList, TableFooter, LoadingPaper } from '../../components';

export interface Column extends TableCellProps {
  label: string;
  maxWidth?: number;
  minWidth?: number;
  format?: (value: number) => string;
  id: keyof AdminToken | 'fullName' | 'email' | 'rightsStatus';
}

const columns: readonly Column[] = [
  { id: 'fullName', label: 'Admin Full Name', minWidth: 200 },
  { id: 'email', label: 'Email', minWidth: 150 },
  { id: 'rightsStatus', label: 'Rights Status', minWidth: 150 },
  { id: 'expiresAt', label: 'Expires At', minWidth: 150 },
];

const Tokens = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const queryParams = useMemo(() => {
    const params: Record<string, string> = {};
    for (const [key, value] of searchParams.entries()) {
      params[key] = value;
    }
    return params;
  }, [searchParams]);

  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState({});
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const {
    refetch,
    data: getData,
    error: getError,
    isError: isGetError,
    isLoading: isGetLoading,
  } = useGetTokensQuery({
    params: {
      page,
      limit: rowsPerPage,
      sortBy: JSON.stringify(isEmpty(sortBy) ? { createdAt: -1 } : sortBy),
      ...queryParams,
    },
  });

  const handleRowsPerPageChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newRowsPerPage = +event.target.value;
      setRowsPerPage(newRowsPerPage);
      setPage(1);
    },
    []
  );

  const handlePageChange = useCallback(
    (_: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
      setPage(newPage + 1);
    },
    []
  );

  const handleSortClick = (id: Column['id'], isSortDisabled: boolean) => {
    return (e: React.MouseEvent<HTMLTableCellElement>) => {
      if (isSortDisabled) return;

      if (searchParams.get('sortBy')) {
        const params: Record<string, string> = {};
        for (const [key, value] of searchParams.entries()) {
          if (key !== 'sortBy') {
            params[key] = value;
          }
        }
        setSearchParams(params);
      }

      const sorts = [0, 1, -1];

      const lastSortIndex = +e.currentTarget.dataset['sort']!;
      const newSortIndex = (lastSortIndex + 1) % sorts.length;
      e.currentTarget.dataset['sort'] = newSortIndex.toString();

      const newSort = sorts[newSortIndex];

      if (newSort === 0) {
        setSortBy(prevSortBy => {
          const newSortBy = { ...prevSortBy };
          // @ts-ignore
          delete newSortBy[id];

          return newSortBy;
        });
      } else {
        setSortBy(prevSortBy => ({ ...prevSortBy, [id]: newSort }));
      }
    };
  };

  useHandleReduxQueryError({ isError: isGetError, error: getError, refetch });

  if (isGetLoading) {
    return <LoadingPaper />;
  } else if (!getData || getData.data.totalDocs === 0) {
    return <EmptyList emptyText='No tokens found' />;
  }

  return (
    <Paper className='table-wrapper'>
      <Table ariaLabel='logs'>
        <TableHead
          columns={columns}
          isSortDisabled={isGetLoading}
          // @ts-ignore
          handleSortClick={handleSortClick}
        >
          <TableCell role='columnheader' style={{ minWidth: 10 }} />
        </TableHead>

        <TableBody>
          {getData.data.docs.map(token => (
            <TokenTab token={token} key={token._id} columns={columns} onInviteSuccess={refetch} />
          ))}
        </TableBody>
      </Table>

      <TableFooter
        filterHidden
        paginatedData={getData}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        rowsPerPageOptions={[10, 25, 50]}
        onRowsPerPageChange={handleRowsPerPageChange}
        infoButtonTitle="Tokens' information takes about 5 minutes to reflect any changes you make"
      />
    </Paper>
  );
};

export default Tokens;
