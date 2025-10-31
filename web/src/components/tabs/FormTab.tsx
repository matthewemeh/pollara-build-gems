import moment from 'moment';
import { PollOutlined } from '@mui/icons-material';
import { Tooltip, TableRow, TableCell } from '@mui/material';
import { TbReportMedical, TbCheckupList } from 'react-icons/tb';

import { LinkButton } from '../index';
import { type Column } from '../../pages/forms';
import { PATHS } from '../../routes/PathConstants';

interface Props {
  form: Form;
  hasFilledForm?: boolean;
  columns: readonly Column[];
}

const FormTab: React.FC<Props> = ({ form, columns, hasFilledForm }) => {
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
        <Tooltip
          title={
            hasFilledForm
              ? 'You have already filled this form'
              : form.hasEnded
              ? `Form ended ${moment(form.endTime).fromNow()}`
              : form.hasStarted
              ? 'Fill this form'
              : `Form opens ${moment(form.startTime).fromNow()} from now`
          }
        >
          <span>
            <LinkButton
              variant='contained'
              aria-label='fill form'
              className='cursor-pointer'
              to={PATHS.FORMS.FILL.replace(':id', form._id)}
              disabled={hasFilledForm || !form.hasStarted || form.hasEnded}
              startIcon={hasFilledForm ? <TbCheckupList /> : <TbReportMedical />}
            >
              {hasFilledForm ? 'Filled' : 'Fill'}
            </LinkButton>
          </span>
        </Tooltip>
      </TableCell>

      <TableCell role='cell' style={{ minWidth: 10 }}>
        <Tooltip
          title={
            form.hasStarted
              ? 'Check Form Result'
              : `Form opens ${moment(form.startTime).fromNow()} from now`
          }
        >
          <span>
            <LinkButton
              variant='outlined'
              aria-label='check result'
              className='cursor-pointer'
              disabled={!form.hasStarted}
              startIcon={<PollOutlined />}
              to={PATHS.RESULTS.FORM.RESULT.replace(':id', form._id)}
            >
              Result
            </LinkButton>
          </span>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
};

export default FormTab;
