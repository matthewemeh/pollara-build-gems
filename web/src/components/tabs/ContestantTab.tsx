import { useCallback } from 'react';
import { FaCircleInfo } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import { DeleteOutline, DriveFileRenameOutline } from '@mui/icons-material';
import { Avatar, Tooltip, TableRow, TableCell, IconButton } from '@mui/material';

import { PATHS } from '../../routes/PathConstants';
import { type Column } from '../../pages/contestants';
import { useDeleteContestantMutation } from '../../services/apis/contestantApi';
import { useHandleReduxQueryError, useHandleReduxQuerySuccess } from '../../hooks';

interface Props {
  contestant: Contestant;
  columns: readonly Column[];
  onInfoClick?: (contestant: Contestant) => void;
}

const ContestantTab: React.FC<Props> = ({ columns, contestant, onInfoClick }) => {
  const navigate = useNavigate();

  const [
    deleteContestant,
    {
      data: deleteData,
      error: deleteError,
      isError: isDeleteError,
      isLoading: isDeleteLoading,
      isSuccess: isDeleteSuccess,
      originalArgs: deleteOriginalArgs,
    },
  ] = useDeleteContestantMutation();

  const navigateEditPage = useCallback(() => {
    localStorage.setItem('contestantToUpdate', JSON.stringify(contestant));
    navigate(PATHS.CONTESTANTS.EDIT);
  }, [contestant._id]);

  const handleDelete = useCallback(() => deleteContestant(contestant._id), [contestant._id]);

  useHandleReduxQuerySuccess({ response: deleteData, isSuccess: isDeleteSuccess });
  useHandleReduxQueryError({
    error: deleteError,
    isError: isDeleteError,
    refetch: () => {
      if (deleteOriginalArgs) deleteContestant(deleteOriginalArgs);
    },
  });

  return (
    <TableRow hover role='row' tabIndex={-1}>
      {columns.map(({ align, id, minWidth, maxWidth }) => {
        let value: React.ReactNode;

        if (id === 'fullName') {
          value = `${contestant.lastName} ${contestant.firstName}`;
        } else if (id === 'party') {
          value = contestant.party ? (
            <span className='party'>
              <img
                className='party__img'
                src={contestant.party.logoUrl}
                alt={contestant.party.longName}
              />
              <span>{contestant.party.shortName}</span>
            </span>
          ) : (
            'Unavailable'
          );
        } else if (id === 'profileImageUrl') {
          value = <Avatar className='avatar-image' src={contestant.profileImageUrl} />;
        } else {
          value = contestant[id] || 'Unavailable';
        }

        return (
          <TableCell key={id} role='cell' align={align} style={{ minWidth, maxWidth }}>
            {value}
          </TableCell>
        );
      })}

      <TableCell role='cell' style={{ minWidth: 10 }}>
        <Tooltip title='Edit Contestant details'>
          <IconButton aria-label='edit' className='cursor-pointer' onClick={navigateEditPage}>
            <DriveFileRenameOutline />
          </IconButton>
        </Tooltip>
      </TableCell>

      <TableCell role='cell' style={{ minWidth: 10 }}>
        <Tooltip
          title={
            isDeleteSuccess
              ? 'Deleted Contestant'
              : isDeleteLoading
              ? 'Deleting Contestant'
              : 'Delete Contestant'
          }
        >
          <span>
            <IconButton
              aria-label='delete'
              onClick={handleDelete}
              disabled={isDeleteLoading || isDeleteSuccess}
            >
              <DeleteOutline />
            </IconButton>
          </span>
        </Tooltip>
      </TableCell>

      <TableCell role='cell' style={{ minWidth: 10 }}>
        <Tooltip className='cursor-pointer' title='View Full Contestant details'>
          <FaCircleInfo className='text-primary-500' onClick={() => onInfoClick?.(contestant)} />
        </Tooltip>
      </TableCell>
    </TableRow>
  );
};

export default ContestantTab;
