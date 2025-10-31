import { isEmpty } from 'lodash';
import { useNavigate } from 'react-router-dom';
import { Add, Refresh } from '@mui/icons-material';
import { useCallback, useContext, useEffect, useState } from 'react';
import { Button, Fab, Tooltip, TablePagination, Paper } from '@mui/material';

import { PATHS } from '../../routes/PathConstants';
import { AppContext } from '../../contexts/AppContext';
import { useHandleReduxQueryError } from '../../hooks';
import { useGetPollsQuery } from '../../services/apis/formApi';
import {
  PollCard,
  EmptyList,
  BackButton,
  PollFilters,
  LoadingPaper,
  TableActions,
  TablePaginationActions,
} from '../../components';

const FormPreview = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isFiltersOn, setIsFiltersOn] = useState(false);
  const [filterAlertOpen, setFilterAlertOpen] = useState(false);
  const [filters, setFilters] = useState<GetPollsPayload['params']>({});
  const { formToPreview, setFormToPopulate, setFormToPreview } = useContext(AppContext)!;

  const goBack = useCallback(() => {
    setFormToPreview(null);
    navigate(PATHS.FORMS.USER);
  }, []);

  useEffect(() => {
    if (!formToPreview) goBack();
    else setFormToPopulate(formToPreview);
  }, [formToPreview]);

  const {
    error: pollsError,
    data: getPollsData,
    refetch: refetchPolls,
    isError: isPollsError,
    isLoading: isGetPollsLoading,
  } = useGetPollsQuery({
    formID: formToPreview?._id || '',
    params: { page, limit: rowsPerPage, ...filters },
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

  const addMorePolls = useCallback(() => navigate(PATHS.FORMS.POPULATE), []);

  useEffect(() => {
    setPage(1);
    setIsFiltersOn(!isEmpty(filters as object));
  }, [filters]);

  useHandleReduxQueryError({ error: pollsError, isError: isPollsError, refetch: refetchPolls });

  if (!formToPreview) return;

  if (isGetPollsLoading) {
    return <LoadingPaper />;
  } else if (!getPollsData || getPollsData.data.totalDocs === 0) {
    return (
      <EmptyList
        addText='Add new poll'
        emptyText='No Polls found'
        url={PATHS.FORMS.POPULATE}
        addButtonDisabled={formToPreview.hasStarted}
        addButtonTooltipText="Polls can't be added to open forms"
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
    <section className='form-layout'>
      <div className='form-header mb-4'>
        <BackButton onClick={goBack} />
        <p className='form-heading'>Preview Form</p>
        <p className='form-subheading'>
          Preview of <strong>{formToPreview.name}</strong>
        </p>
      </div>

      {getPollsData.data.docs.map(poll => (
        <PollCard
          poll={poll}
          key={poll._id}
          onPollUpdated={refetchPolls}
          onPollDeleted={refetchPolls}
          hasFormStarted={formToPreview.hasStarted}
        />
      ))}

      <PollFilters open={filterAlertOpen} setFilters={setFilters} setOpen={setFilterAlertOpen} />

      <Paper className='hover-pagination-controls'>
        <TableActions
          isFiltersOn={isFiltersOn}
          handleFilterClick={handleFilterClick}
          extraClassNames='static max-phones:w-full'
          infoButtonTitle={
            formToPreview.hasStarted
              ? 'Form polls cannot be edited once it is open'
              : 'Ensure you save each edited poll before navigating to other polls or another page'
          }
        />

        <TablePagination
          component='div'
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          page={getPollsData.data.page - 1}
          rowsPerPageOptions={[10, 25, 50]}
          count={getPollsData.data.totalDocs}
          ActionsComponent={TablePaginationActions}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </Paper>

      {formToPreview.hasStarted || (
        <Tooltip
          className='add-fab'
          title='Add more polls'
          hidden={getPollsData.data.totalDocs === 0}
        >
          <Fab color='primary' onClick={addMorePolls} aria-label='add more polls'>
            <Add />
          </Fab>
        </Tooltip>
      )}
    </section>
  );
};

export default FormPreview;
