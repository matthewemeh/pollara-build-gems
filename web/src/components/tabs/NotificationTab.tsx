import moment from 'moment';
import { TableRow, TableCell } from '@mui/material';

import type { Column } from '../../pages/notifications';

interface Props {
  columns: readonly Column[];
  notification: Notification_;
}

const NotificationTab: React.FC<Props> = ({ columns, notification }) => {
  return (
    <TableRow hover role='row' tabIndex={-1}>
      {columns.map(({ align, id, minWidth, maxWidth }) => {
        let value: React.ReactNode;

        if (id === 'createdAt') {
          value = moment(notification.createdAt).format('lll');
        } else {
          value = notification[id] as string;
        }

        return (
          <TableCell key={id} role='cell' align={align} style={{ minWidth, maxWidth }}>
            {value}
          </TableCell>
        );
      })}
    </TableRow>
  );
};

export default NotificationTab;
