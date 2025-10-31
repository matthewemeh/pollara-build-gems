import { useCallback } from 'react';
import { FaCircleInfo } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import { DriveFileRenameOutline } from '@mui/icons-material';
import { Avatar, Tooltip, TableRow, TableCell, IconButton } from '@mui/material';

import { type Column } from '../../pages/parties';
import { PATHS } from '../../routes/PathConstants';

interface Props {
  party: Party;
  columns: readonly Column[];
  onInfoClick: (party: Party) => void;
}

const PartyTab: React.FC<Props> = ({ party, columns, onInfoClick }) => {
  const navigate = useNavigate();

  const navigateEditPage = useCallback(() => {
    localStorage.setItem('partyToUpdate', JSON.stringify(party));
    navigate(PATHS.PARTIES.EDIT);
  }, [party._id]);

  return (
    <TableRow hover role='row' tabIndex={-1}>
      {columns.map(({ align, id, minWidth, maxWidth }) => {
        let value: React.ReactNode;

        if (id === 'logoUrl') {
          value = <Avatar className='avatar-image' src={party.logoUrl} />;
        } else if (id === 'shortName' || id === 'longName') {
          value = <p className='uppercase'>{party[id]}</p>;
        } else {
          value = party[id] || 'Unavailable';
        }

        return (
          <TableCell key={id} role='cell' align={align} style={{ minWidth, maxWidth }}>
            {value}
          </TableCell>
        );
      })}

      <TableCell role='cell' style={{ minWidth: 10 }}>
        <Tooltip title='Edit Party details'>
          <IconButton aria-label='edit' className='cursor-pointer' onClick={navigateEditPage}>
            <DriveFileRenameOutline />
          </IconButton>
        </Tooltip>
      </TableCell>

      <TableCell role='cell' style={{ minWidth: 10 }}>
        <Tooltip className='cursor-pointer' title='View Full Party details'>
          <FaCircleInfo className='text-primary-500' onClick={() => onInfoClick(party)} />
        </Tooltip>
      </TableCell>
    </TableRow>
  );
};

export default PartyTab;
