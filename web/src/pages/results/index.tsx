import { isEmpty } from 'lodash';
import { Refresh } from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Paper, Button, TableBody, TableCell, type TableCellProps } from '@mui/material';

import { useHandleReduxQueryError } from '../../hooks';
import { useGetResultsQuery } from '../../services/apis/resultApi';
import {
  Table,
  TableHead,
  EmptyList,
  TableFooter,
  LoadingPaper,
  ResultFilters,
  ElectionResultTab,
} from '../../components';

export interface Column extends TableCellProps {
  label: string;
  maxWidth?: number;
  minWidth?: number;
  id: keyof ElectionResultData;
  format?: (value: number) => string;
}

const columns: readonly Column[] = [
  { id: 'election', label: 'Election Name', maxWidth: 170 },
  { id: 'updatedAt', label: 'Last updated at', minWidth: 50 },
  {
    minWidth: 100,
    id: 'totalVotes',
    label: 'Total Votes',
    format: (value: number) => value.toLocaleString(),
  },
];

const ElectionResults = () => {
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
  const [isFiltersOn, setIsFiltersOn] = useState(false);
  const [filterAlertOpen, setFilterAlertOpen] = useState(false);
  const [filters, setFilters] = useState<GetResultsPayload['params']>({});
  const {
    refetch,
    data: getData,
    error: getError,
    isError: isGetError,
    isLoading: isGetLoading,
  } = useGetResultsQuery({
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

  const handleFilterClick = useCallback(() => setFilterAlertOpen(true), []);

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

  useHandleReduxQueryError({ isError: isGetError, error: getError, refetch });

  if (isGetLoading) {
    return <LoadingPaper />;
  } else if (!getData || getData.data.totalDocs === 0) {
    return (
      <EmptyList
        emptyText='No results found'
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
      <Table ariaLabel='results'>
        <TableHead
          columns={columns}
          // @ts-ignore
          handleSortClick={handleSortClick}
          isSortDisabled={id => ['election', 'totalVotes'].includes(id) || isGetLoading}
        >
          <TableCell role='columnheader' style={{ minWidth: 10, maxWidth: 120 }} />
          <TableCell role='columnheader' style={{ minWidth: 10, maxWidth: 120 }} />
        </TableHead>

        <TableBody>
          {getData.data.docs.map(result => (
            <ElectionResultTab columns={columns} key={result._id} result={result} />
          ))}
        </TableBody>
      </Table>

      <TableFooter
        infoHidden
        paginatedData={getData}
        isFiltersOn={isFiltersOn}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        rowsPerPageOptions={[10, 25, 50]}
        handleFilterClick={handleFilterClick}
        onRowsPerPageChange={handleRowsPerPageChange}
      />

      <ResultFilters open={filterAlertOpen} setFilters={setFilters} setOpen={setFilterAlertOpen} />
    </Paper>
  );
};

export default ElectionResults;
