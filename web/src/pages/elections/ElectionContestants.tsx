import moment from 'moment';
import { isEmpty } from 'lodash';
import { Refresh } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Paper, Button, TableBody, TableCell, type TableCellProps } from '@mui/material';

import { PATHS } from '../../routes/PathConstants';
import { useHandleReduxQueryError } from '../../hooks';
import {
  useGetContestantsQuery,
  useGetElectionContestantsQuery,
} from '../../services/apis/contestantApi';
import {
  Table,
  TableHead,
  EmptyList,
  TableFooter,
  LoadingPaper,
  ContestantFilters,
  ElectionContestantTab,
} from '../../components';

export interface Column extends TableCellProps {
  label: string;
  maxWidth?: number;
  minWidth?: number;
  id: keyof Contestant | 'fullName';
  format?: (value: number) => string;
}

const columns: readonly Column[] = [
  { id: 'profileImageUrl', label: '', maxWidth: 50 },
  { id: 'fullName', label: 'Full Name', minWidth: 170 },
  { id: 'gender', label: 'Gender', minWidth: 10 },
  { id: 'stateOfOrigin', label: 'State of Origin', minWidth: 10 },
  { id: 'party', label: 'Party', minWidth: 10 },
];

const Contestants = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const election: Election = useMemo(
    () => JSON.parse(sessionStorage.getItem('election') ?? '{}'),
    []
  );

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
  const [filters, setFilters] = useState<GetContestantsPayload['params']>({});
  const {
    data: getContestantsData,
    error: getContestantsError,
    refetch: refetchContestants,
    isError: isGetContestantsError,
    isLoading: isGetContestantsLoading,
  } = useGetContestantsQuery({
    params: {
      page,
      limit: rowsPerPage,
      sortBy: JSON.stringify(isEmpty(sortBy) ? { lastName: 1 } : sortBy),
      ...filters,
      ...queryParams,
    },
  });
  const {
    data: getElectionContestantsData,
    error: getElectionContestantsError,
    refetch: refetchElectionContestants,
    isError: isGetElectionContestantsError,
  } = useGetElectionContestantsQuery(election._id);

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
          if (id === 'fullName') {
            // @ts-ignore
            delete newSortBy['lastName'];
          } else {
            // @ts-ignore
            delete newSortBy[id];
          }

          return newSortBy;
        });
      } else {
        setSortBy(prevSortBy => {
          if (id === 'fullName') {
            return { ...prevSortBy, lastName: newSort };
          }

          return { ...prevSortBy, [id]: newSort };
        });
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

  useEffect(() => {
    const election = sessionStorage.getItem('election');
    if (!election) navigate(-1);
  }, []);

  useHandleReduxQueryError({
    isError: isGetContestantsError,
    error: getContestantsError,
    refetch: refetchContestants,
  });

  useHandleReduxQueryError({
    isError: isGetElectionContestantsError,
    error: getElectionContestantsError,
    refetch: refetchElectionContestants,
  });

  if (isGetContestantsLoading) {
    return <LoadingPaper />;
  } else if (!getContestantsData || getContestantsData.data.totalDocs === 0) {
    return (
      <EmptyList
        url={PATHS.CONTESTANTS.ADD}
        addText='Add new contestant'
        emptyText='No contestants found'
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
    <div className='mb-5'>
      <header className='mb-4'>
        <h2 className='text-2xl font-bold'>{election.name}</h2>
        <span>Starts at {moment(election.startTime).format('LLL')}</span>
      </header>

      <Paper className='table-wrapper !h-[unset]'>
        <Table ariaLabel='contestants'>
          <TableHead
            columns={columns}
            // @ts-ignore
            handleSortClick={handleSortClick}
            isSortDisabled={id =>
              id === 'profileImageUrl' || id === 'party' || isGetContestantsLoading
            }
          >
            <TableCell role='columnheader' style={{ minWidth: 10 }} />
          </TableHead>

          <TableBody>
            {getElectionContestantsData &&
              getContestantsData.data.docs.map(contestant => {
                const electionContestant = getElectionContestantsData.data.find(
                  ({ contestant: c }) => c._id === contestant._id
                );
                const party = electionContestant ? electionContestant.party : contestant.party;

                return (
                  <ElectionContestantTab
                    party={party}
                    columns={columns}
                    key={contestant._id}
                    contestant={contestant}
                    isAdded={!!electionContestant}
                  />
                );
              })}
          </TableBody>
        </Table>

        <TableFooter
          isFiltersOn={isFiltersOn}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          rowsPerPageOptions={[10, 25, 50]}
          paginatedData={getContestantsData}
          handleFilterClick={handleFilterClick}
          onRowsPerPageChange={handleRowsPerPageChange}
          infoButtonTitle="Contestants' information takes about 5 minutes to reflect any changes you make"
        />

        <ContestantFilters
          open={filterAlertOpen}
          setFilters={setFilters}
          setOpen={setFilterAlertOpen}
        />
      </Paper>
    </div>
  );
};

export default Contestants;
