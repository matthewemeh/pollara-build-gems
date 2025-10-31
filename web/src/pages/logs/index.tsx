import { isEmpty } from 'lodash';
import { Refresh } from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Paper, Button, TableBody, TableCell, type TableCellProps } from '@mui/material';

import { useHandleReduxQueryError } from '../../hooks';
import { useGetLogsQuery } from '../../services/apis/notificationApi/log';
import {
  Table,
  LogTab,
  TableHead,
  EmptyList,
  LogFilters,
  TableFooter,
  AlertDialog,
  LoadingPaper,
} from '../../components';

export interface Column extends TableCellProps {
  label: string;
  maxWidth?: number;
  minWidth?: number;
  format?: (value: number) => string;
  id: keyof Log | 'fullName' | 'email';
}

const columns: readonly Column[] = [
  { id: 'action', label: 'Action', minWidth: 170 },
  { id: 'fullName', label: 'Admin Full Name', minWidth: 200 },
  { id: 'email', label: 'Email', minWidth: 170 },
  { id: 'createdAt', label: 'Date', minWidth: 170 },
];

const Logs = () => {
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
  const [alertOpen, setAlertOpen] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isFiltersOn, setIsFiltersOn] = useState(false);
  const [filterAlertOpen, setFilterAlertOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [filters, setFilters] = useState<GetLogsPayload['params']>({});
  const {
    refetch,
    data: getData,
    error: getError,
    isError: isGetError,
    isLoading: isGetLoading,
  } = useGetLogsQuery({
    params: {
      page,
      limit: rowsPerPage,
      sortBy: JSON.stringify(isEmpty(sortBy) ? { createdAt: -1 } : sortBy),
      ...filters,
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

  const handleInfoClick = useCallback((log: Log) => {
    setSelectedLog(log);
    setAlertOpen(true);
  }, []);

  const handleFilterClick = useCallback(() => setFilterAlertOpen(true), []);

  useEffect(() => {
    setPage(1);
    if (isEmpty(filters as object)) {
      setIsFiltersOn(false);
    } else {
      setIsFiltersOn(true);

      // clear any existing search params
      if (searchParams.size > 0) setSearchParams({});
    }
  }, [filters]);

  const dialogContent: React.ReactNode = useMemo(() => {
    if (!selectedLog) return '';

    const { message } = selectedLog;
    if (!message.includes('|')) return message;

    return (
      <>
        {message.split('|').map((content, index) => (
          <p key={index}>{content}</p>
        ))}
      </>
    );
  }, [selectedLog]);

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
    return (
      <EmptyList
        emptyText='No logs found'
        addComponent={
          isFiltersOn && (
            <div className='flex items-center gap-2'>
              Empty filtered results?
              <Button variant='contained' startIcon={<Refresh />} onClick={() => setFilters({})}>
                Reset Filters
              </Button>
            </div>
          )
        }
      />
    );
  }

  return (
    <Paper className='table-wrapper'>
      <Table ariaLabel='logs'>
        <TableHead
          columns={columns}
          // @ts-ignore
          handleSortClick={handleSortClick}
          isSortDisabled={id => id !== 'createdAt' || isGetLoading}
        >
          <TableCell role='columnheader' style={{ minWidth: 10 }} />
        </TableHead>

        <TableBody>
          {getData.data.docs.map(log => (
            <LogTab
              log={log}
              key={log._id}
              columns={columns}
              onInfoClick={log => handleInfoClick(log)}
            />
          ))}
        </TableBody>
      </Table>

      <TableFooter
        paginatedData={getData}
        isFiltersOn={isFiltersOn}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        rowsPerPageOptions={[10, 25, 50]}
        handleFilterClick={handleFilterClick}
        onRowsPerPageChange={handleRowsPerPageChange}
        infoButtonTitle='Logs shown here are less than 30 days old. Older logs (if any) have been deleted'
      />

      <LogFilters open={filterAlertOpen} setFilters={setFilters} setOpen={setFilterAlertOpen} />

      <AlertDialog
        affirmationOnly
        open={alertOpen}
        setOpen={setAlertOpen}
        affirmativeText='Close'
        dialogTitle='Log Details'
        dialogContent={dialogContent}
      />
    </Paper>
  );
};

export default Logs;
