import { Subject } from '@mui/icons-material';
import { useCallback, useMemo, useState } from 'react';
import { Paper, TableRow, TableBody, TableCell, TableFooter } from '@mui/material';

import type { Column } from '../logs';
import { PATHS } from '../../routes/PathConstants';
import { useHandleReduxQueryError } from '../../hooks';
import { useGetLogsQuery } from '../../services/apis/notificationApi/log';
import { Loading, AlertDialog, LogTab, LinkButton, Table, TableHead } from '../../components';

const { LOGS } = PATHS;
const columns: readonly Column[] = [
  { id: 'action', label: 'Action', minWidth: 170 },
  { id: 'fullName', label: 'Admin Full Name', minWidth: 200 },
  { id: 'email', label: 'Email', minWidth: 170 },
  { id: 'createdAt', label: 'Date', minWidth: 170 },
];

const Dashboard = () => {
  const [alertOpen, setAlertOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<Log>();
  const { isError, error, isLoading, data, refetch } = useGetLogsQuery({});

  const handleInfoClick = useCallback((log: Log) => {
    setSelectedLog(log);
    setAlertOpen(true);
  }, []);

  const dialogContent: React.ReactNode = useMemo(() => {
    if (!selectedLog) return '';

    const { message } = selectedLog;
    if (!message.includes('|')) return message;

    return (
      <>
        {message.split('|').map((content, index) => (
          <p key={index}>{content}</p>
        ))}
      </>
    );
  }, [selectedLog]);

  useHandleReduxQueryError({ isError, error, refetch });

  return (
    <div className='pb-10'>
      <h1 className='mt-10 text-4xl font-medium mb-5'>Logs</h1>

      <section>
        {isLoading ? (
          <Loading />
        ) : !data || data.data.totalDocs === 0 ? (
          <Paper className='p-8 flex flex-col gap-2 items-center justify-center'>
            <Subject sx={{ fontSize: 60 }} />
            <p className='text-xl font-semibold'>No Logs found</p>
          </Paper>
        ) : (
          <Paper>
            <Table ariaLabel='logs'>
              <TableHead columns={columns} isSortDisabled>
                <TableCell role='columnheader' style={{ minWidth: 5 }} />
              </TableHead>

              <TableBody>
                {data.data.docs.map(log => (
                  <LogTab
                    log={log}
                    key={log._id}
                    columns={columns}
                    onInfoClick={log => handleInfoClick(log)}
                  />
                ))}
              </TableBody>

              <TableFooter className='w-full'>
                <TableRow>
                  <TableCell colSpan={5}>
                    <LinkButton to={LOGS} variant='contained' className='!block !ml-auto w-30'>
                      see more
                    </LinkButton>
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </Paper>
        )}
      </section>

      <AlertDialog
        affirmationOnly
        open={alertOpen}
        setOpen={setAlertOpen}
        affirmativeText='Close'
        dialogContent={dialogContent}
        dialogTitle='Log Event Details'
        onClose={() => setSelectedLog(undefined)}
      />
    </div>
  );
};

export default Dashboard;
