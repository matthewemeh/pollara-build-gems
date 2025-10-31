import { isEmpty } from 'lodash';
import { Add } from '@mui/icons-material';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Fab, Paper, Tooltip, TableBody, TableCell, type TableCellProps } from '@mui/material';

import { PATHS } from '../../routes/PathConstants';
import { useHandleReduxQueryError } from '../../hooks';
import { useGetPartiesQuery } from '../../services/apis/partyApi';
import {
  Table,
  PartyTab,
  TableHead,
  EmptyList,
  AlertDialog,
  TableFooter,
  LoadingPaper,
} from '../../components';

export interface Column extends TableCellProps {
  label: string;
  id: keyof Party;
  maxWidth?: number;
  minWidth?: number;
  format?: (value: number) => string;
}

const columns: readonly Column[] = [
  { id: 'logoUrl', label: '', maxWidth: 50 },
  { id: 'shortName', label: 'Party Alias', minWidth: 10 },
  { id: 'longName', label: 'Party Name', minWidth: 170 },
];

const Parties = () => {
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
  const [alertOpen, setAlertOpen] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  const {
    refetch,
    data: getData,
    error: getError,
    isError: isGetError,
    isLoading: isGetLoading,
  } = useGetPartiesQuery({
    params: {
      page,
      limit: rowsPerPage,
      sortBy: JSON.stringify(isEmpty(sortBy) ? { longName: 1 } : sortBy),
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

  const handleInfoClick = useCallback((party: Party) => {
    setSelectedParty(party);
    setAlertOpen(true);
  }, []);

  const paginatedData = useMemo(() => {
    return getData as PaginatedResponse<Party> | undefined;
  }, [getData]);

  const dialogContent: React.ReactNode = useMemo(() => {
    if (!selectedParty) return <></>;

    const { logoUrl, longName, shortName, motto } = selectedParty;

    return (
      <div className='grid grid-cols-[40%_60%] gap-2'>
        <p className='card-info__tag'>Party Name</p>
        <p className='card-info__text capitalize'>{longName}</p>

        <p className='card-info__tag'>Party Alias</p>
        <p className='card-info__text capitalize'>{shortName}</p>

        <p className='card-info__tag'>Party Motto</p>
        <p className='card-info__text capitalize'>{motto ?? 'Unavailable'}</p>

        <p className='card-info__tag'>Party Logo</p>
        <div className='card-info__text capitalize'>
          <img src={logoUrl} alt={longName} className='party__img !rounded' />
        </div>
      </div>
    );
  }, [selectedParty]);

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
  } else if (!paginatedData || paginatedData.data.totalDocs === 0) {
    return (
      <EmptyList url={PATHS.PARTIES.ADD} addText='Add new party' emptyText='No parties found' />
    );
  }

  return (
    <Paper className='table-wrapper'>
      <Table ariaLabel='parties'>
        <TableHead
          columns={columns}
          // @ts-ignore
          handleSortClick={handleSortClick}
          isSortDisabled={id => id === 'logoUrl' || isGetLoading}
        >
          <TableCell role='columnheader' style={{ minWidth: 10 }} />
          <TableCell role='columnheader' style={{ minWidth: 10 }} />
        </TableHead>

        <TableBody>
          {paginatedData.data.docs.map(party => (
            <PartyTab
              party={party}
              key={party._id}
              columns={columns}
              onInfoClick={party => handleInfoClick(party)}
            />
          ))}
        </TableBody>
      </Table>

      <TableFooter
        filterHidden
        component='div'
        rowsPerPage={rowsPerPage}
        paginatedData={paginatedData}
        onPageChange={handlePageChange}
        rowsPerPageOptions={[10, 25, 50]}
        onRowsPerPageChange={handleRowsPerPageChange}
        infoButtonTitle="Parties' information takes about 5 minutes to reflect any changes you make"
      />

      <AlertDialog
        affirmationOnly
        open={alertOpen}
        setOpen={setAlertOpen}
        affirmativeText='Close'
        dialogTitle='Party Details'
        dialogContent={dialogContent}
      />

      <Tooltip
        title='Add more parties'
        className={`add-fab ${paginatedData.data.totalDocs === 0 && '!hidden'}`}
      >
        <Fab
          color='primary'
          aria-label='add more parties'
          onClick={() => navigate(PATHS.PARTIES.ADD)}
        >
          <Add />
        </Fab>
      </Tooltip>
    </Paper>
  );
};

export default Parties;
