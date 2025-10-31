import { isEmpty } from 'lodash';
import { Refresh } from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Paper, Button, TableBody, TableCell, type TableCellProps } from '@mui/material';

import { PATHS } from '../../routes/PathConstants';
import { useHandleReduxQueryError } from '../../hooks';
import { useGetFormsQuery, useGetUserVotedFormsQuery } from '../../services/apis/formApi';
import {
  Table,
  FormTab,
  TableHead,
  EmptyList,
  FormFilters,
  TableFooter,
  LoadingPaper,
} from '../../components';

export interface Column extends TableCellProps {
  label: string;
  id: keyof Form;
  maxWidth?: number;
  minWidth?: number;
  format?: (value: number) => string;
}

const columns: readonly Column[] = [
  { id: 'name', label: 'Form name', minWidth: 150 },
  { id: 'startTime', label: 'Start Time', minWidth: 150 },
  { id: 'endTime', label: 'End Time', minWidth: 150 },
];

const Forms = () => {
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
  const [filters, setFilters] = useState<GetFormsPayload['params']>({});
  const {
    data: getFormsData,
    error: getFormsError,
    refetch: refetchForms,
    isError: isGetFormsError,
    isLoading: isGetFormsLoading,
  } = useGetFormsQuery({
    params: {
      page,
      sortBy: JSON.stringify(sortBy),
      limit: rowsPerPage,
      ...filters,
      ...queryParams,
    },
  });

  const {
    data: getVotedFormsData,
    error: getVotedFormsError,
    refetch: refetchVotedForms,
    isError: isGetVotedFormsError,
    isLoading: isGetVotedElectionsLoading,
  } = useGetUserVotedFormsQuery();

  const hasFilledForm = useCallback(
    (formID: string) => {
      return getVotedFormsData?.data.some(({ form }) => form === formID);
    },
    [getVotedFormsData]
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
    error: getFormsError,
    refetch: refetchForms,
    isError: isGetFormsError,
  });

  useHandleReduxQueryError({
    error: getVotedFormsError,
    refetch: refetchVotedForms,
    isError: isGetVotedFormsError,
  });

  if (isGetFormsLoading || isGetVotedElectionsLoading) {
    return <LoadingPaper />;
  } else if (!getVotedFormsData || !getFormsData || getFormsData.data.totalDocs === 0) {
    return (
      <EmptyList
        url={PATHS.FORMS.ADD}
        emptyText='No Forms found'
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
      <Table ariaLabel='forms'>
        <TableHead
          columns={columns}
          // @ts-ignore
          handleSortClick={handleSortClick}
          isSortDisabled={isGetFormsLoading}
        >
          <TableCell role='columnheader' style={{ minWidth: 10 }} />
          <TableCell role='columnheader' style={{ minWidth: 10 }} />
        </TableHead>

        <TableBody>
          {getFormsData.data.docs.map(form => (
            <FormTab
              form={form}
              key={form._id}
              columns={columns}
              hasFilledForm={hasFilledForm(form._id)}
            />
          ))}
        </TableBody>
      </Table>

      <FormFilters open={filterAlertOpen} setFilters={setFilters} setOpen={setFilterAlertOpen} />

      <TableFooter
        infoHidden
        isFiltersOn={isFiltersOn}
        rowsPerPage={rowsPerPage}
        paginatedData={getFormsData}
        onPageChange={handlePageChange}
        handleFilterClick={handleFilterClick}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </Paper>
  );
};

export default Forms;
