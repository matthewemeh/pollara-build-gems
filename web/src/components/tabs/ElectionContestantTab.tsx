import { useCallback, useMemo, useState } from 'react';
import { PersonAdd, PersonRemove } from '@mui/icons-material';
import { Avatar, Tooltip, TableRow, TableCell, IconButton } from '@mui/material';

import { type Column } from '../../pages/contestants';
import { useHandleReduxQueryError, useHandleReduxQuerySuccess } from '../../hooks';
import {
  useAddElectionContestantMutation,
  useRemoveElectionContestantMutation,
} from '../../services/apis/electionApi';

interface Props {
  party?: Party;
  isAdded?: boolean;
  contestant: Contestant;
  columns: readonly Column[];
}

const ElectionContestantTab: React.FC<Props> = ({ party, columns, isAdded, contestant }) => {
  const [isContestantAdded, setIsContestantAdded] = useState(isAdded);
  const election: Election = useMemo(
    () => JSON.parse(sessionStorage.getItem('election') ?? '{}'),
    []
  );

  const [
    addElectionContestant,
    {
      data: addData,
      error: addError,
      isError: isAddError,
      isLoading: isAddLoading,
      isSuccess: isAddSuccess,
      originalArgs: addOriginalArgs,
    },
  ] = useAddElectionContestantMutation();

  const [
    removeElectionContestant,
    {
      data: removeData,
      error: removeError,
      isError: isRemoveError,
      isLoading: isRemoveLoading,
      isSuccess: isRemoveSuccess,
      originalArgs: removeOriginalArgs,
    },
  ] = useRemoveElectionContestantMutation();

  const handleRemoveContestant = useCallback(() => {
    removeElectionContestant({ contestantID: contestant._id, electionID: election._id });
  }, [contestant._id, election._id]);

  const handleAddContestant = useCallback(() => {
    addElectionContestant({ contestantID: contestant._id, electionID: election._id });
  }, [contestant._id, election._id]);

  useHandleReduxQuerySuccess({
    response: addData,
    isSuccess: isAddSuccess,
    onSuccess: () => setIsContestantAdded(true),
  });
  useHandleReduxQueryError({
    error: addError,
    isError: isAddError,
    refetch: () => {
      if (addOriginalArgs) addElectionContestant(addOriginalArgs);
    },
  });

  useHandleReduxQuerySuccess({
    response: removeData,
    isSuccess: isRemoveSuccess,
    onSuccess: () => setIsContestantAdded(false),
  });
  useHandleReduxQueryError({
    error: removeError,
    isError: isRemoveError,
    refetch: () => {
      if (removeOriginalArgs) removeElectionContestant(removeOriginalArgs);
    },
  });

  return (
    <TableRow hover role='row' tabIndex={-1}>
      {columns.map(({ align, id, minWidth, maxWidth }) => {
        let value: React.ReactNode;

        if (id === 'fullName') {
          value = `${contestant.lastName} ${contestant.firstName}`;
        } else if (id === 'party') {
          value = party ? (
            <span className='party'>
              <img className='party__img' src={party.logoUrl} alt={party.longName} />
              <span>{party.shortName}</span>
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

      {isContestantAdded ? (
        <TableCell role='cell' style={{ minWidth: 10 }}>
          <Tooltip
            title={
              election.hasStarted
                ? 'Cannot remove contestant from commenced election'
                : `${isRemoveLoading ? 'Removing' : 'Remove'} Contestant from ${election.name}`
            }
          >
            <span>
              <IconButton
                aria-label='remove'
                onClick={handleRemoveContestant}
                disabled={election.hasStarted || isRemoveLoading}
              >
                <PersonRemove />
              </IconButton>
            </span>
          </Tooltip>
        </TableCell>
      ) : (
        <TableCell role='cell' style={{ minWidth: 10 }}>
          <Tooltip
            title={
              party
                ? election.hasStarted
                  ? 'Cannot add contestant to commenced election'
                  : `${isAddLoading ? 'Adding' : 'Add'} Contestant to ${election.name}`
                : 'Assign Contestant to a party before adding to Election'
            }
          >
            <span>
              <IconButton
                aria-label='add'
                onClick={handleAddContestant}
                disabled={!party || election.hasStarted || isAddLoading}
              >
                <PersonAdd />
              </IconButton>
            </span>
          </Tooltip>
        </TableCell>
      )}
    </TableRow>
  );
};

export default ElectionContestantTab;
