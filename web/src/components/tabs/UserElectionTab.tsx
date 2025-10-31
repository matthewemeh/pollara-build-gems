import moment from 'moment';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tooltip, TableRow, TableCell, Button } from '@mui/material';

import { LinkButton } from '../index';
import { showAlert } from '../../utils';
import { useAppSelector } from '../../hooks';
import { PATHS } from '../../routes/PathConstants';
import { type Column } from '../../pages/elections';

interface Props {
  election: Election;
  hasVoted?: boolean;
  columns: readonly Column[];
}

const UserElectionTab: React.FC<Props> = ({ election, columns, hasVoted }) => {
  const navigate = useNavigate();
  const { currentUser } = useAppSelector(state => state.authStore);

  const navigateElectionPage = useCallback(() => {
    if (!currentUser.faceID) {
      showAlert({ msg: 'Please register your Face ID first' });
      navigate(PATHS.FACE_ID_REGISTER);
      return;
    }

    sessionStorage.setItem('election', JSON.stringify(election));
    navigate(PATHS.ELECTIONS.ELECTION.replace(':id', election._id));
  }, [currentUser.faceID, election._id]);

  return (
    <TableRow hover role='row' tabIndex={-1}>
      {columns.map(({ align, id, minWidth, maxWidth }) => {
        let value: React.ReactNode;

        if (id === 'startTime' || id === 'endTime') {
          value = moment(election[id]).format('LLL');
        } else if (id === 'delimitationCode') {
          value = election.delimitationCode;
        } else {
          value = election[id] || 'Unavailable';
        }

        return (
          <TableCell key={id} role='cell' align={align} style={{ minWidth, maxWidth }}>
            {value}
          </TableCell>
        );
      })}

      <TableCell role='cell' style={{ minWidth: 10 }}>
        <Tooltip
          title={
            hasVoted
              ? 'You have already voted in this election'
              : election.hasEnded
              ? `Election ended ${moment(election.endTime).fromNow()}`
              : election.hasStarted
              ? 'Cast your vote'
              : `Election starts ${moment(election.startTime).fromNow()} from now`
          }
        >
          <span>
            <Button
              variant='contained'
              aria-label='cast vote'
              className='cursor-pointer'
              onClick={navigateElectionPage}
              disabled={hasVoted || !election.hasStarted || election.hasEnded}
            >
              Vote
            </Button>
          </span>
        </Tooltip>
      </TableCell>

      <TableCell role='cell' style={{ minWidth: 10 }}>
        <Tooltip
          title={
            election.hasStarted
              ? 'Check Election Result'
              : `Election starts ${moment(election.startTime).fromNow()} from now`
          }
        >
          <span>
            <LinkButton
              variant='outlined'
              aria-label='check result'
              className='cursor-pointer'
              disabled={!election.hasStarted}
              to={PATHS.RESULTS.ELECTION.RESULT.replace(':id', election._id)}
            >
              Result
            </LinkButton>
          </span>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
};

export default UserElectionTab;
