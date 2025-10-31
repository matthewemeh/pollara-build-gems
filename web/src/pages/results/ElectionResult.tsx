import moment from 'moment';
import { useParams } from 'react-router-dom';
import { InfoRounded } from '@mui/icons-material';
import { useEffect, useMemo, useState } from 'react';
import { Avatar, IconButton, Tooltip } from '@mui/material';

import { useHandleReduxQueryError } from '../../hooks';
import { useGetResultQuery } from '../../services/apis/resultApi';
import { AlertDialog, EmptyList, LoadingPaper } from '../../components';

const REFETCH_TIME = 5 * 60 * 1000;

const ElectionResult = () => {
  const { id } = useParams();
  const [contestantAlertOpen, setContestantAlertOpen] = useState(false);
  const [selectedContestant, setSelectedContestant] = useState<Contestant | null>(null);

  const {
    data: getResultData,
    error: getResultError,
    refetch: refetchResult,
    isError: isGetResultError,
    isLoading: isGetResultLoading,
  } = useGetResultQuery(id!);

  const handleInfoClick = (contestant: Contestant) => {
    setSelectedContestant(contestant);
    setContestantAlertOpen(true);
  };

  useHandleReduxQueryError({
    error: getResultError,
    refetch: refetchResult,
    isError: isGetResultError,
  });

  useEffect(() => {
    const timer = setInterval(refetchResult, REFETCH_TIME);
    return () => clearInterval(timer);
  }, []);

  const dialogContent: React.ReactNode = useMemo(() => {
    if (!selectedContestant) return <></>;

    const { gender, lastName, firstName, middleName, party, stateOfOrigin } = selectedContestant;

    return (
      <div className='grid grid-cols-[40%_60%] gap-2'>
        <p className='card-info__tag'>Name</p>
        <p className='card-info__text capitalize'>
          {firstName} {middleName} {lastName}
        </p>

        <p className='card-info__tag'>Party</p>
        <div className='card-info__text capitalize'>
          {party ? (
            <div className='party'>
              <img src={party.logoUrl} alt={party.longName} className='party__img !rounded' />
              <span>{party.longName}</span>
            </div>
          ) : (
            'Unavailable'
          )}
        </div>

        <p className='card-info__tag'>Gender</p>
        <p className='card-info__text capitalize'>{gender.toLowerCase()}</p>

        <p className='card-info__tag'>State of Origin</p>
        <p className='card-info__text capitalize'>{stateOfOrigin || 'Unavailable'}</p>
      </div>
    );
  }, [selectedContestant]);

  if (isGetResultLoading) {
    return <LoadingPaper />;
  } else if (!getResultData || getResultData.data.results.length === 0) {
    return <EmptyList emptyText='No results found' />;
  }

  const { election, results, totalVotes, updatedAt } = getResultData.data;

  return (
    <main className='pb-10'>
      <header className='mb-5 text-xl'>
        <h1>
          Election Name: <span className='font-semibold'>{election.name}</span>
        </h1>
        <p>
          Total Votes: <span className='font-semibold'>{totalVotes.toLocaleString()}</span>
        </p>
        <p>
          Last updated: <span className='font-semibold'>{moment(updatedAt).format('LLL')}</span>
        </p>
      </header>

      <div className='flex flex-col gap-10'>
        {results
          .toSorted((a, b) => b.votes - a.votes)
          .map(({ contestants, party, votes }, index) => (
            <section
              key={index}
              className='relative min-h-80 flex flex-col gap-5 overflow-hidden px-5 pb-5 rounded-lg border border-[rgba(0,0,0,0.15)]'
            >
              <div
                className='-z-1 absolute right-0 opacity-50 size-70 top-10 rounded-full'
                style={{
                  background: `url(${party.logoUrl}) 0px 0px/contain no-repeat`,
                }}
              />

              <p className='text-white text-xl h-10 py-2 -mx-5 px-5 bg-linear-90 from-primary-600 to-primary-700'>
                <span className='font-bold'>{party.longName}</span> ({party.shortName})
              </p>

              <div className='flex gap-5 flex-wrap'>
                {contestants.map((contestant, idx) => (
                  <div
                    key={idx}
                    className='relative w-42.5 h-46 rounded p-4 flex flex-col gap-2 border border-[rgba(0,0,0,0.15)]'
                  >
                    <Avatar
                      src={contestant.profileImageUrl}
                      className='!w-full !h-30 !rounded-xs'
                    />
                    <Tooltip title={`${contestant.firstName} ${contestant.lastName}`}>
                      <p className='whitespace-nowrap overflow-hidden text-ellipsis text-center'>
                        {contestant.firstName} {contestant.lastName}
                      </p>
                    </Tooltip>
                    <Tooltip
                      className='!absolute !bottom-1 !right-1'
                      title='View detailed Contestant information'
                    >
                      <IconButton
                        className='!size-4'
                        onClick={() =>
                          handleInfoClick({ ...contestant, party, _id: contestant._id })
                        }
                      >
                        <InfoRounded className='!size-[inherit] text-primary-500' />
                      </IconButton>
                    </Tooltip>
                  </div>
                ))}
              </div>

              <p className='flex items-end gap-1 text-lg'>
                <span className='text-4xl font-semibold'>{votes.toLocaleString()}</span> vote
                {votes !== 1 && 's'}
              </p>
            </section>
          ))}
      </div>

      <AlertDialog
        affirmationOnly
        affirmativeText='Close'
        open={contestantAlertOpen}
        dialogContent={dialogContent}
        dialogTitle='Contestant Details'
        setOpen={setContestantAlertOpen}
        onClose={() => setSelectedContestant(null)}
      />
    </main>
  );
};

export default ElectionResult;
