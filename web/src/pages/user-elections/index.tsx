import { isEmpty } from 'lodash';
import { Refresh } from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Paper, Button, TableBody, TableCell, type TableCellProps } from '@mui/material';

import { useHandleReduxQueryError } from '../../hooks';
import {
  useGetUserElectionsQuery,
  useGetUserVotedElectionsQuery,
} from '../../services/apis/electionApi';
import {
  Table,
  TableHead,
  EmptyList,
  TableFooter,
  LoadingPaper,
  UserElectionTab,
  UserElectionFilters,
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
  { id: 'startTime', label: 'Starts at', minWidth: 30 },
  { id: 'endTime', label: 'Ends at', minWidth: 30 },
];

const Elections = () => {
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
    data: getElectionsData,
    error: getElectionsError,
    refetch: refetchElections,
    isError: isGetElectionsError,
    isLoading: isGetElectionsLoading,
  } = useGetUserElectionsQuery({
    params: {
      page,
      limit: rowsPerPage,
      sortBy: JSON.stringify(isEmpty(sortBy) ? { startTime: -1 } : sortBy),
      ...filters,
      ...queryParams,
    },
  });

  const {
    data: getVotedElectionsData,
    error: getVotedElectionsError,
    refetch: refetchVotedElections,
    isError: isGetVotedElectionsError,
    isLoading: isGetVotedElectionsLoading,
  } = useGetUserVotedElectionsQuery();

  const hasVoted = useCallback(
    (electionID: string) => {
      return getVotedElectionsData?.data.some(({ election }) => election === electionID);
    },
    [getVotedElectionsData]
  );

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

  useHandleReduxQueryError({
    error: getElectionsError,
    refetch: refetchElections,
    isError: isGetElectionsError,
  });

  useHandleReduxQueryError({
    error: getVotedElectionsError,
    refetch: refetchVotedElections,
    isError: isGetVotedElectionsError,
  });

  if (isGetElectionsLoading || isGetVotedElectionsLoading) {
    return <LoadingPaper />;
  } else if (!getVotedElectionsData || !getElectionsData || getElectionsData.data.totalDocs === 0) {
    return (
      <EmptyList
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
          // @ts-ignore
          handleSortClick={handleSortClick}
          isSortDisabled={isGetElectionsLoading}
        >
          <TableCell role='columnheader' style={{ minWidth: 10 }} />
          <TableCell role='columnheader' style={{ minWidth: 10 }} />
        </TableHead>

        <TableBody>
          {getElectionsData.data.docs.map(election => (
            <UserElectionTab
              columns={columns}
              key={election._id}
              election={election}
              hasVoted={hasVoted(election._id)}
            />
          ))}
        </TableBody>
      </Table>

      <TableFooter
        isFiltersOn={isFiltersOn}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        paginatedData={getElectionsData}
        rowsPerPageOptions={[10, 25, 50]}
        handleFilterClick={handleFilterClick}
        onRowsPerPageChange={handleRowsPerPageChange}
        infoButtonTitle="Elections' information takes about 5 minutes to reflect any changes you make"
      />

      <UserElectionFilters
        open={filterAlertOpen}
        setFilters={setFilters}
        setOpen={setFilterAlertOpen}
      />
    </Paper>
  );
};

export default Elections;
