import moment from 'moment';
import { Button, Paper } from '@mui/material';

import { useVerifyVoteMutation } from '../services/apis/voteApi';
import { useHandleReduxQueryError, useHandleReduxQuerySuccess } from '../hooks';

interface Props {
  vote: Vote;
  onVerifySuccess?: (voteInfo: VerifyElectionVoteResponse['data']) => void;
}

const ElectionVoteBubble: React.FC<Props> = ({ vote, onVerifySuccess }) => {
  const [verifyVote, { error, isError, isLoading, isSuccess, data, originalArgs }] =
    useVerifyVoteMutation();

  const handleVerifyVote = () => verifyVote({ voteID: vote._id });

  useHandleReduxQuerySuccess({
    isSuccess,
    response: data,
    onSuccess: () => {
      if (data) onVerifySuccess?.(data.data);
    },
  });
  useHandleReduxQueryError({
    error,
    isError,
    refetch: () => {
      if (originalArgs) verifyVote(originalArgs);
    },
  });

  return (
    <div
      className={`group relative cursor-pointer size-20 rounded-full text-white text-4xl font-bold flex items-center justify-center after:absolute after:bg-linear-180 after:from-primary-400 after:to-primary-600 after:w-1 after:h-14 after:top-[calc(100%+4px)] after:left-1/2 after:-translate-x-1/2 last:after:hidden ${
        vote.isInvalid || data?.data.status === 'failed'
          ? 'bg-red-600'
          : 'bg-linear-120 from-primary-400 to-primary-600'
      }`}
    >
      <span
        hidden={!vote.isInvalid}
        className='absolute -z-1 size-full rounded-full bg-red-600 opacity-75 animate-ping'
      />

      {vote.index + 1}

      <Paper className='cursor-default w-fit bg-white text-base text-black font-normal border border-[rgba(0,0,0,0.15)] shadow absolute left-[calc(100%+16px)] top-0 p-4 rounded flex flex-col gap-1 opacity-0 duration-300 group-hover:opacity-100'>
        <p className='whitespace-nowrap'>
          Casted at: <span className='font-semibold'>{moment(vote.timestamp).format('lll')}</span>
        </p>
        <p className='whitespace-nowrap'>
          Hash: <span className='font-semibold'>{vote.hash}</span>
        </p>
        <Button
          className='!mt-4'
          variant='outlined'
          loading={isLoading}
          onClick={handleVerifyVote}
          disabled={vote.isInvalid || data?.data.status === 'failed'}
        >
          Verify
        </Button>
      </Paper>
    </div>
  );
};

export default ElectionVoteBubble;
