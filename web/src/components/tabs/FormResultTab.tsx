import moment from 'moment';
import { Tooltip, TableRow, TableCell } from '@mui/material';

import { LinkButton } from '../index';
import { PATHS } from '../../routes/PathConstants';
import { type Column } from '../../pages/results/FormResults';

interface Props {
  result: FormResultData;
  columns: readonly Column[];
}

const FormResultTab: React.FC<Props> = ({ result, columns }) => {
  const { form, updatedAt } = result;

  return (
    <TableRow hover role='row' tabIndex={-1}>
      {columns.map(({ align, id, minWidth, maxWidth }) => {
        let value: React.ReactNode;

        if (id === 'form') {
          value = form.name;
        } else if (id === 'updatedAt') {
          value = moment(updatedAt).format('lll');
        }

        return (
          <TableCell key={id} role='cell' align={align} style={{ minWidth, maxWidth }}>
            {value}
          </TableCell>
        );
      })}

      <TableCell role='cell' style={{ minWidth: 10, maxWidth: 120 }}>
        <Tooltip title='View Form votes'>
          <LinkButton
            variant='contained'
            aria-label='check votes'
            className='cursor-pointer'
            to={PATHS.VOTES.FORM.FETCH.replace(':id', form._id)}
          >
            Votes
          </LinkButton>
        </Tooltip>
      </TableCell>

      <TableCell role='cell' style={{ minWidth: 10, maxWidth: 120 }}>
        <Tooltip title='View Form result'>
          <LinkButton
            variant='outlined'
            aria-label='check result'
            className='cursor-pointer'
            to={PATHS.RESULTS.FORM.RESULT.replace(':id', form._id)}
          >
            Result
          </LinkButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
};

export default FormResultTab;
