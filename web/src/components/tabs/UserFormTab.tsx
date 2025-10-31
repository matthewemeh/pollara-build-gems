import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { useCallback, useContext, useState } from 'react';
import { Tooltip, TableRow, TableCell, IconButton } from '@mui/material';
import {
  Share,
  Preview,
  EditNote,
  DeleteOutline,
  DriveFileRenameOutline,
} from '@mui/icons-material';

import { AlertDialog } from '../index';
import { type Column } from '../../pages/forms';
import { PATHS } from '../../routes/PathConstants';
import { AppContext } from '../../contexts/AppContext';
import { copyToClipboard, showAlert } from '../../utils';
import { useDeleteFormMutation } from '../../services/apis/formApi';
import { useHandleReduxQueryError, useHandleReduxQuerySuccess } from '../../hooks';

interface Props {
  form: Form;
  onDeleted?: () => void;
  columns: readonly Column[];
}

const UserFormTab: React.FC<Props> = ({ form, columns, onDeleted }) => {
  const navigate = useNavigate();
  const [alertOpen, setAlertOpen] = useState(false);
  const [deleteForm, deleteFormStatus] = useDeleteFormMutation();
  const { setFormToUpdate, setFormToPopulate, setFormToPreview } = useContext(AppContext)!;

  const navigateEditPage = useCallback(() => {
    setFormToUpdate(form);
    navigate(PATHS.FORMS.EDIT);
  }, [form._id]);

  const navigateFormPopulatePage = useCallback(() => {
    setFormToPopulate(form);
    navigate(PATHS.FORMS.POPULATE);
  }, [form._id]);

  const navigatePreviewPage = useCallback(() => {
    setFormToPreview(form);
    navigate(PATHS.FORMS.PREVIEW);
  }, [form._id]);

  const handleDelete = useCallback(() => setAlertOpen(true), []);

  const handleDeleteAffirmation = useCallback(() => deleteForm(form._id), [form._id]);

  useHandleReduxQuerySuccess({
    response: deleteFormStatus.data,
    isSuccess: deleteFormStatus.isSuccess,
    onSuccess: onDeleted,
  });
  useHandleReduxQueryError({
    error: deleteFormStatus.error,
    isError: deleteFormStatus.isError,
    refetch: () => {
      if (deleteFormStatus.originalArgs) deleteForm(deleteFormStatus.originalArgs);
    },
  });

  return (
    <TableRow hover role='row' tabIndex={-1}>
      {columns.map(({ align, id, minWidth, maxWidth }) => {
        let value: React.ReactNode;

        if (id === 'startTime' || id === 'endTime') {
          value = moment(form[id]).format('LL');
        } else {
          // @ts-ignore
          value = form[id] || 'Unavailable';
        }

        return (
          <TableCell key={id} role='cell' align={align} style={{ minWidth, maxWidth }}>
            {value}
          </TableCell>
        );
      })}

      <TableCell role='cell' style={{ minWidth: 10 }}>
        <Tooltip title='Share Form Link'>
          <IconButton
            aria-label='share'
            className='cursor-pointer'
            onClick={() =>
              copyToClipboard({
                text: `${window.location.origin}${PATHS.FORMS.FILL.replace(':id', form._id)}`,
                onSuccess: () => showAlert({ msg: 'Form link copied to clipboard' }),
              })
            }
          >
            <Share />
          </IconButton>
        </Tooltip>
      </TableCell>

      <TableCell role='cell' style={{ minWidth: 10 }}>
        <Tooltip title={form.hasEnded ? 'Cannot edit closed form' : 'Edit Form details'}>
          <span>
            <IconButton
              aria-label='edit'
              className='cursor-pointer'
              onClick={navigateEditPage}
              disabled={form.hasEnded}
            >
              <DriveFileRenameOutline />
            </IconButton>
          </span>
        </Tooltip>
      </TableCell>

      <TableCell role='cell' style={{ minWidth: 10 }}>
        <Tooltip title={form.hasStarted ? 'Cannot populate opened form' : 'Populate Form'}>
          <span>
            <IconButton
              aria-label='populate'
              className='cursor-pointer'
              disabled={form.hasStarted}
              onClick={navigateFormPopulatePage}
            >
              <EditNote />
            </IconButton>
          </span>
        </Tooltip>
      </TableCell>

      <TableCell role='cell' style={{ minWidth: 10 }}>
        <Tooltip title='Preview Form'>
          <span>
            <IconButton
              aria-label='preview'
              className='cursor-pointer'
              onClick={navigatePreviewPage}
            >
              <Preview />
            </IconButton>
          </span>
        </Tooltip>
      </TableCell>

      <TableCell role='cell' style={{ minWidth: 10 }}>
        <Tooltip
          title={
            form.hasStarted
              ? 'Cannot deleted opened form'
              : deleteFormStatus.isSuccess
              ? 'Form deleted'
              : deleteFormStatus.isLoading
              ? 'Deleting Form'
              : 'Delete Form'
          }
        >
          <span>
            <IconButton
              aria-label='delete'
              onClick={handleDelete}
              disabled={form.hasStarted || deleteFormStatus.isLoading || deleteFormStatus.isSuccess}
            >
              <DeleteOutline />
            </IconButton>
          </span>
        </Tooltip>
      </TableCell>

      <AlertDialog
        open={alertOpen}
        setOpen={setAlertOpen}
        dialogTitle='Confirm Delete'
        onAffirmed={handleDeleteAffirmation}
        dialogContent={
          <>
            Are you sure you want to delete <strong>{form.name}</strong> ?
          </>
        }
      />
    </TableRow>
  );
};

export default UserFormTab;
