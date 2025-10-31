import { useCallback } from 'react';
import { Subject } from '@mui/icons-material';
import { Paper, TableRow, TableBody, TableCell, TableFooter } from '@mui/material';

import type { Column } from '../user-elections';
import { PATHS } from '../../routes/PathConstants';
import { useHandleReduxQueryError } from '../../hooks';
import { UserElectionTab, Loading, LinkButton, Table, TableHead } from '../../components';
import {
  useGetUserElectionsQuery,
  useGetUserVotedElectionsQuery,
} from '../../services/apis/electionApi';

const { ELECTIONS } = PATHS;
const columns: readonly Column[] = [
  { id: 'name', label: 'Election Name', maxWidth: 170 },
  { id: 'startTime', label: 'Starts at', minWidth: 30 },
  { id: 'endTime', label: 'Ends at', minWidth: 30 },
];

const Dashboard = () => {
  const {
    data: getElectionsData,
    refetch: refetchElections,
    error: getElectionsError,
    isError: isGetElectionsError,
    isLoading: isGetElectionsLoading,
  } = useGetUserElectionsQuery({});
  const {
    data: getVotedElectionsData,
    error: getVotedElectionsError,
    refetch: refetchVotedElections,
    isError: isGetVotedElectionsError,
    isLoading: isGetVotedElectionsLoading,
  } = useGetUserVotedElectionsQuery();

  useHandleReduxQueryError({
    error: getElectionsError,
    refetch: refetchElections,
    isError: isGetElectionsError,
  });

  useHandleReduxQueryError({
    error: getVotedElectionsError,
    refetch: refetchVotedElections,
    isError: isGetVotedElectionsError,
  });

  const hasVoted = useCallback(
    (electionID: string) => {
      return getVotedElectionsData?.data.some(({ election }) => election === electionID);
    },
    [getVotedElectionsData]
  );

  return (
    <div className='pb-10'>
      <h1 className='mt-10 text-4xl font-medium mb-5'>Your Elections</h1>

      <section>
        {isGetElectionsLoading || isGetVotedElectionsLoading ? (
          <Loading />
        ) : !getVotedElectionsData || !getElectionsData || getElectionsData.data.totalDocs === 0 ? (
          <Paper className='p-8 flex flex-col gap-2 items-center justify-center'>
            <Subject sx={{ fontSize: 60 }} />
            <p className='text-xl font-semibold'>No Elections found</p>
          </Paper>
        ) : (
          <Paper>
            <Table ariaLabel='elections'>
              <TableHead columns={columns} isSortDisabled>
                <TableCell role='columnheader' style={{ minWidth: 5 }} />
                <TableCell role='columnheader' style={{ minWidth: 5 }} />
              </TableHead>

              <TableBody>
                {getElectionsData.data.docs.map(election => (
                  <UserElectionTab
                    columns={columns}
                    key={election._id}
                    election={election}
                    hasVoted={hasVoted(election._id)}
                  />
                ))}
              </TableBody>

              <TableFooter className='w-full'>
                <TableRow>
                  <TableCell colSpan={5}>
                    <LinkButton
                      variant='contained'
                      to={ELECTIONS.FETCH}
                      className='!block !ml-auto w-30'
                    >
                      see more
                    </LinkButton>
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </Paper>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
