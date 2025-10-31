import moment from 'moment';
import { Link } from 'react-router-dom';
import { FaCircleInfo } from 'react-icons/fa6';
import { Tooltip, TableRow, TableCell } from '@mui/material';

import type { Column } from '../../pages/logs';

interface Props {
  log: Log;
  columns: readonly Column[];
  onInfoClick: (log: Log) => void;
}

const LogTab: React.FC<Props> = ({ columns, log, onInfoClick }) => {
  return (
    <TableRow hover role='row' tabIndex={-1}>
      {columns.map(({ align, id, minWidth, maxWidth }) => {
        let value: React.ReactNode;

        if (id === 'fullName') {
          value = `${log.user.lastName} ${log.user.firstName}`;
        } else if (id === 'email') {
          value = log.user.email.value;
        } else if (id === 'createdAt') {
          value = moment(log.createdAt).fromNow();
        } else {
          value = log[id] as string;
        }

        let actionClass = '';
        if (id === 'action') {
          if (log[id].includes('UPDATE')) {
            actionClass = '!text-blue-600 !bg-blue-200';
          } else if (log[id].includes('ADD')) {
            actionClass = '!text-green-600 !bg-green-200';
          } else if (log[id].search(/(delete|remove)\w*/i) !== -1) {
            actionClass = '!text-red-600 !bg-red-200';
          } else if (log[id].includes('CONVERT')) {
            actionClass = '!text-purple-600 !bg-purple-200';
          } else if (log[id].includes('INVITE')) {
            actionClass = '!text-orange-600 !bg-orange-200';
          }
        }

        return (
          <TableCell key={id} role='cell' align={align} style={{ minWidth, maxWidth }}>
            {id === 'email' ? (
              <Link
                target='_blank'
                rel='noopener noreferrer'
                to={`mailto:${value}?subject=Pollara&body=Hello%20${log.user.lastName}%20${log.user.firstName}`}
              >
                {value}
              </Link>
            ) : id === 'action' ? (
              <span className={`p-2 rounded-sm ${actionClass}`}>{value}</span>
            ) : (
              value
            )}
          </TableCell>
        );
      })}
      <TableCell role='cell' style={{ minWidth: 5 }} onClick={() => onInfoClick(log)}>
        <Tooltip title='Log Event details' className='cursor-pointer'>
          <FaCircleInfo className='text-primary-500' />
        </Tooltip>
      </TableCell>
    </TableRow>
  );
};

export default LogTab;
