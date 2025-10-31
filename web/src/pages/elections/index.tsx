import { isEmpty } from 'lodash';
import { Add, Refresh } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Fab,
  Paper,
  Button,
  Tooltip,
  TableBody,
  TableCell,
  type TableCellProps,
} from '@mui/material';

import { PATHS } from '../../routes/PathConstants';
import { useHandleReduxQueryError } from '../../hooks';
import { useGetElectionsQuery } from '../../services/apis/electionApi';
import {
  Table,
  TableHead,
  EmptyList,
  TableFooter,
  ElectionTab,
  LoadingPaper,
  ElectionFilters,
} from '../../components';

export interface Column extends TableCellProps {
  label: string;
  maxWidth?: number;
  minWidth?: number;
  id: keyof Election;
  format?: (value: number) => string;
}

const columns: readonly Column[] = [
  { id: 'name', label: 'Election Name', maxWidth: 170 },
  { id: 'delimitationCode', label: 'Delimitation', minWidth: 20 },
  { id: 'startTime', label: 'Start Time', minWidth: 30 },
  { id: 'endTime', label: 'End Time', minWidth: 30 },
];

const Elections = () => {
  const navigate = useNavigate();
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
  const [filters, setFilters] = useState<GetElectionsPayload['params']>({});
  const {
    refetch,
    data: getData,
    error: getError,
    isError: isGetError,
    isLoading: isGetLoading,
  } = useGetElectionsQuery({
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
        url={PATHS.ELECTIONS.ADD}
        addText='Add new election'
        emptyText='No elections found'
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
      <Table ariaLabel='elections'>
        <TableHead
          columns={columns}
          isSortDisabled={isGetLoading}
          // @ts-ignore
          handleSortClick={handleSortClick}
        >
          <TableCell role='columnheader' style={{ minWidth: 10 }} />
          <TableCell role='columnheader' style={{ minWidth: 10 }} />
          <TableCell role='columnheader' style={{ minWidth: 10 }} />
        </TableHead>
        <TableBody>
          {getData.data.docs.map(election => (
            <ElectionTab columns={columns} key={election._id} election={election} />
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
        infoButtonTitle="Elections' information takes about 5 minutes to reflect any changes you make"
      />

      <ElectionFilters
        open={filterAlertOpen}
        setFilters={setFilters}
        setOpen={setFilterAlertOpen}
      />

      <Tooltip
        title='Add more elections'
        className={`add-fab ${getData.data.totalDocs === 0 && '!hidden'}`}
      >
        <Fab
          color='primary'
          aria-label='add more elections'
          onClick={() => navigate(PATHS.ELECTIONS.ADD)}
        >
          <Add />
        </Fab>
      </Tooltip>
    </Paper>
  );
};

export default Elections;
