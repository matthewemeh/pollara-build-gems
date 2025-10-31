import moment from 'moment';
import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { AdminPanelSettingsOutlined } from '@mui/icons-material';
import { useModifyTokenMutation } from '../../services/apis/userApi';
import { Tooltip, TableRow, TableCell, FormGroup, TextField, IconButton } from '@mui/material';

import constants from '../../constants';
import { showAlert } from '../../utils';
import type { Column } from '../../pages/tokens';
import { AlertDialog, DatePicker, DropdownInput, Switch } from '../index';
import { useHandleReduxQueryError, useHandleReduxQuerySuccess } from '../../hooks';

interface Props {
  token: AdminToken;
  columns: readonly Column[];
  onInviteSuccess?: () => void;
}

const TokenTab: React.FC<Props> = ({ columns, token, onInviteSuccess }) => {
  const { ADMIN_TOKEN_STATUSES } = constants;
  const todayDate = useMemo(() => new Date(), []);
  const [alertOpen, setAlertOpen] = useState(false);
  const [expiryDate, setExpiryDate] = useState<Date>();
  const [canExpire, setCanExpire] = useState(token.expiresAt !== undefined);
  const [expiryDatePickerVisible, setExpiryDatePickerVisible] = useState(false);
  const [tokenStatus, setTokenStatus] = useState<AdminTokenStatus | undefined>();
  const [modifyToken, { data, error, isError, isLoading, isSuccess, originalArgs }] =
    useModifyTokenMutation();

  const handleInviteAffirmation = () => {
    const payload: ModifyTokenPayload = { tokenID: token._id };

    if (!canExpire) {
      payload.expiresAt = -1;
    } else if (expiryDate !== undefined) {
      payload.expiresAt = expiryDate.getTime();
    }

    if (tokenStatus !== undefined) {
      payload.statusCode = tokenStatus;
    }
    if (Object.keys(payload).length === 1) {
      return showAlert({ msg: 'No changes made', zIndex: '1400' });
    }

    modifyToken(payload);
  };

  useHandleReduxQueryError({
    isError: isError,
    error: error,
    refetch: () => {
      if (originalArgs) modifyToken(originalArgs);
    },
  });
  useHandleReduxQuerySuccess({
    isSuccess: isSuccess,
    response: data,
    onSuccess: onInviteSuccess,
  });

  return (
    <TableRow hover role='row' tabIndex={-1}>
      {columns.map(({ align, id, minWidth, maxWidth }) => {
        let value: React.ReactNode;

        if (id === 'fullName') {
          value = `${token.user.lastName} ${token.user.firstName}`;
        } else if (id === 'email') {
          value = token.user.email.value;
        } else if (id === 'createdAt') {
          value = moment(token.createdAt).format('LL');
        } else if (id === 'rightsStatus') {
          if (token.statusCode === ADMIN_TOKEN_STATUSES.REVOKED) {
            value = ADMIN_TOKEN_STATUSES.REVOKED;
          } else {
            value = token.hasExpired ? 'EXPIRED' : token.statusCode || 'Unavailable';
          }
        } else if (id === 'expiresAt') {
          value = token.expiresAt ? moment(token.expiresAt).format('LL') : 'Never Expires';
        } else {
          value = token[id] as string;
        }

        let dotClass = '';
        let statusClass = '';
        if (id === 'rightsStatus') {
          if (value === ADMIN_TOKEN_STATUSES.REVOKED) {
            statusClass = '!text-red-600 !bg-red-200';
            dotClass = '!bg-red-600';
          } else if (token.hasExpired) {
            statusClass = '!text-orange-600 !bg-orange-200';
            dotClass = '!bg-orange-600';
          } else if (value === ADMIN_TOKEN_STATUSES.ACTIVE) {
            statusClass = '!text-green-600 !bg-green-200';
            dotClass = '!bg-green-600';
          }
        }

        return (
          <TableCell key={id} role='cell' align={align} style={{ minWidth, maxWidth }}>
            {id === 'email' ? (
              <Link
                target='_blank'
                rel='noopener noreferrer'
                to={`mailto:${value}?subject=Pollara&body=Hello%20${token.user.lastName}%20${token.user.firstName}`}
              >
                {value}
              </Link>
            ) : id === 'rightsStatus' ? (
              <span className={`p-2 rounded-sm flex w-fit items-center gap-2 ${statusClass}`}>
                <span className={`size-2 rounded-full ${dotClass}`} />
                {value}
              </span>
            ) : (
              value
            )}
          </TableCell>
        );
      })}

      <TableCell role='cell' style={{ minWidth: 10 }}>
        <Tooltip title={isLoading ? 'Modifying Admin Rights' : 'Modify Admin Rights'}>
          <span>
            <IconButton
              disabled={isLoading}
              aria-label='modify admin rights'
              onClick={() => setAlertOpen(true)}
            >
              <AdminPanelSettingsOutlined />
            </IconButton>
          </span>
        </Tooltip>
      </TableCell>

      {alertOpen && (
        <AlertDialog
          open
          negationText='Cancel'
          setOpen={setAlertOpen}
          affirmativeText='Confirm'
          dialogTitle='Modify Admin Rights'
          onAffirmed={handleInviteAffirmation}
          dialogContent={
            <div className='form mt-4 !mb-0'>
              <TextField
                label='Name'
                spellCheck={false}
                className='form-field'
                value={`${token.user.lastName} ${token.user.firstName}`}
              />

              <DropdownInput
                label='Admin Token Status'
                defaultValue={token.statusCode}
                // @ts-ignore
                onChange={e => setTokenStatus(e.target.value)}
                menuItems={Object.entries(ADMIN_TOKEN_STATUSES).map(([key, value]) => ({
                  value,
                  name: key.replaceAll('_', ' '),
                }))}
              />

              <FormGroup>
                <Switch
                  className='!w-fit'
                  label='Can Expire'
                  checked={canExpire}
                  onChange={e => setCanExpire(e.target.checked)}
                />
                <TextField
                  type='text'
                  autoComplete='off'
                  className='!mt-5'
                  disabled={!canExpire}
                  label='Admin Rights Expiration'
                  onClick={() => setExpiryDatePickerVisible(true)}
                  value={
                    expiryDate
                      ? moment(expiryDate).format('LL')
                      : canExpire
                      ? moment(token.expiresAt!).format('LL')
                      : ''
                  }
                />
              </FormGroup>

              <DatePicker
                minDate={todayDate}
                selectedDate={
                  expiryDate ?? (token.expiresAt ? new Date(token.expiresAt) : undefined)
                }
                setSelectedDate={setExpiryDate}
                visible={expiryDatePickerVisible}
                setVisible={setExpiryDatePickerVisible}
              />
            </div>
          }
        />
      )}
    </TableRow>
  );
};

export default TokenTab;
