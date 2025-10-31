import moment from 'moment';
import { groupBy } from 'lodash';
import { LiaVoteYeaSolid } from 'react-icons/lia';
import { useEffect, useMemo, useState } from 'react';
import { TbFaceId, TbFaceIdError } from 'react-icons/tb';
import { useNavigate, useParams } from 'react-router-dom';
import { Avatar, Button, IconButton, Tooltip } from '@mui/material';
import { detectSingleFace, euclideanDistance, fetchImage } from 'face-api.js';
import { FaceRetouchingOff, HowToVote, InfoRounded, VideocamOff } from '@mui/icons-material';

import { PATHS } from '../../routes/PathConstants';
import { loadFaceModels, showAlert } from '../../utils';
import { useLazyFetchFaceQuery } from '../../services/apis/faceApi';
import { log, warn, error as errorLog } from '../../utils/log.utils';
import { useGetElectionContestantsQuery } from '../../services/apis/contestantApi';
import { AlertDialog, EmptyList, Loading, LoadingPaper, Modal } from '../../components';
import { useAddVoteTokenMutation, useCastVoteMutation } from '../../services/apis/voteApi';
import { useAppSelector, useHandleReduxQueryError, useHandleReduxQuerySuccess } from '../../hooks';

const FACE_VERIFICATION_THRESHOLD = Number(import.meta.env.VITE_FACE_VERIFICATION_THRESHOLD || 0.6);

const Election = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAppSelector(state => state.authStore);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceModalOpen, setFaceModalOpen] = useState(false);
  const [voteModalOpen, setVoteModalOpen] = useState(false);
  const [voteDialogOpen, setVoteDialogOpen] = useState(false);
  const [selectedParty, setSelectedParty] = useState<Party>();
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [contestantAlertOpen, setContestantAlertOpen] = useState(false);
  const [selectedContestant, setSelectedContestant] = useState<Contestant | null>(null);

  const goBack = () => navigate(PATHS.ELECTIONS.FETCH);

  const electionToVote: Election | undefined = useMemo(() => {
    const election = sessionStorage.getItem('election');
    if (!election) return;

    sessionStorage.removeItem('election');
    return JSON.parse(election) as Election;
  }, []);

  useEffect(() => {
    if (!electionToVote) goBack();
  }, [electionToVote]);
  if (!electionToVote) return;

  const {
    data: getContestantsData,
    error: getContestantsError,
    refetch: refetchContestants,
    isError: isGetContestantsError,
    isLoading: isGetContestantsLoading,
  } = useGetElectionContestantsQuery(id!);

  const [
    addVoteToken,
    {
      data: addTokenData,
      error: addTokenError,
      isError: isAddTokenError,
      isLoading: isAddTokenLoading,
      isSuccess: isAddTokenSuccess,
    },
  ] = useAddVoteTokenMutation();

  const [
    castVote,
    {
      data: castVoteData,
      error: castVoteError,
      isError: isCastVoteError,
      isLoading: isCastVoteLoading,
      isSuccess: isCastVoteSuccess,
      originalArgs: castVoteOriginalArgs,
    },
  ] = useCastVoteMutation();

  const [
    fetchFaceID,
    {
      data: getFaceData,
      error: getFaceError,
      isError: isGetFaceError,
      isSuccess: isGetFaceSuccess,
    },
  ] = useLazyFetchFaceQuery();

  const voteMessage = useMemo(() => {
    if (isCastVoteSuccess) {
      return { type: 'success', message: 'Vote cast successfully' };
    } else if (isCastVoteLoading) {
      return { type: 'loading', message: 'Processing Vote' };
    } else if (isAddTokenSuccess) {
      return { type: 'success', message: 'Vote Token generated successfully' };
    } else if (isAddTokenLoading) {
      return { type: 'loading', message: 'Generating Vote Token' };
    }

    return { type: '', message: '' };
  }, [isAddTokenLoading, isAddTokenSuccess, isCastVoteLoading, isCastVoteSuccess]);

  const groupedContestants = useMemo(() => {
    if (!getContestantsData) return {};

    return groupBy(getContestantsData.data, ({ party }) => party?._id);
  }, [getContestantsData]);

  const isModalOpen = useMemo(
    () => voteModalOpen || isAddTokenLoading || isCastVoteLoading || isCastVoteSuccess,
    [voteModalOpen, isAddTokenLoading, isCastVoteLoading, isCastVoteSuccess]
  );

  const releaseWebcam = () => {
    const video = document.querySelector('video');
    if (!video) return;

    const stream = video.srcObject as MediaStream | null;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      video.srcObject = null;
    }
  };

  const accessWebcam = () => {
    navigator.mediaDevices
      .getUserMedia({
        video: {
          width: { max: 640 },
          height: { max: 480 },
          frameRate: { ideal: 15 },
        },
      })
      .then(stream => {
        const video = document.querySelector('video')!;
        video.srcObject = stream;
        setIsPermissionGranted(true);

        // Monitor for track end (could be due to revocation)
        stream.getVideoTracks()[0].onended = () => {
          warn('Video track ended, possibly permission revoked.');
          handlePageRefresh();
        };
      })
      .catch(err => {
        errorLog(err);
        showAlert({ msg: 'Please grant access to Camera', duration: 5000 });
      });
  };

  const handleVoteConfirmation = (party?: Party) => {
    setSelectedParty(party);
    isPermissionGranted ? setVoteDialogOpen(true) : accessWebcam();
  };

  const handleVoteAffirmation = () => setFaceModalOpen(true);

  const handleVoteNegation = () => setSelectedParty(undefined);

  const handleInfoClick = (contestant: Contestant) => {
    setSelectedContestant(contestant);
    setContestantAlertOpen(true);
  };

  const handlePageRefresh = () => {
    // store election again to prevent user from being forced off this page after window reload
    sessionStorage.setItem('election', JSON.stringify(electionToVote));
    window.location.reload();
  };

  const handleVoteModalClose = () => {
    if (isCastVoteSuccess) goBack();
  };

  const captureAndCompareFaces = async () => {
    if (!getFaceData || !modelsLoaded) {
      showAlert({ msg: 'An error has occurred. Please try again later' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Load stored face
      const faceID = await fetchImage(getFaceData.data.signedUrl);
      const det1 = await detectSingleFace(faceID).withFaceLandmarks().withFaceDescriptor();

      // Capture live face directly from <video>
      const video = document.querySelector('video')!;
      const det2 = await detectSingleFace(video).withFaceLandmarks().withFaceDescriptor();

      if (!det1 || !det2) {
        showAlert({ msg: 'Face not detected. Please try again', duration: 5000 });
        log('det1', det1, 'det2', det2);
        return;
      }

      // Compare
      const distance = euclideanDistance(det1.descriptor, det2.descriptor);
      const confidence = 1 - distance;
      const match = confidence > FACE_VERIFICATION_THRESHOLD;

      if (match) {
        showAlert({ msg: 'Face Verification successful' });
        setFaceModalOpen(false);
        setVoteModalOpen(true);
        addVoteToken();
      } else {
        showAlert({ msg: 'Face Verification failed! Please try again later', duration: 5000 });
        fetchFaceID();
      }
      log(`Match: ${match ? '✅ Yes' : '❌ No'} (Confidence: ${confidence.toFixed(4)})`);
    } catch (error) {
      showAlert({ msg: 'An error has occurred. Please refresh and try again' });
      errorLog(error);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  // contestants response handler
  useHandleReduxQueryError({
    error: getContestantsError,
    refetch: refetchContestants,
    isError: isGetContestantsError,
  });

  // cast vote response handlers
  useHandleReduxQuerySuccess({
    response: castVoteData,
    onSuccess: releaseWebcam,
    isSuccess: isCastVoteSuccess,
  });
  useHandleReduxQueryError({
    error: castVoteError,
    isError: isCastVoteError,
    onError: () => {
      if (isCastVoteError && castVoteError && 'status' in castVoteError) {
        const { data } = castVoteError;

        if (data && typeof data === 'object' && !Array.isArray(data)) {
          const { errorCode } = data as BaseErrorResponse;

          switch (errorCode) {
            case 'E009':
              // vote token expired
              addVoteToken();
              break;

            case 'E010':
              // double voting attempt
              releaseWebcam();
              goBack();
              break;
          }
        }
      }
    },
    refetch: () => {
      if (castVoteOriginalArgs) castVote(castVoteOriginalArgs);
    },
  });

  // vote token response handlers
  useHandleReduxQuerySuccess({
    response: addTokenData,
    showSuccessMessage: false,
    isSuccess: isAddTokenSuccess,
    onSuccess: () => {
      if (selectedParty && addTokenData) {
        castVote({
          electionID: id!,
          partyID: selectedParty._id,
          voteToken: addTokenData.data.token,
        });
      }
    },
  });
  useHandleReduxQueryError({
    error: addTokenError,
    refetch: addVoteToken,
    isError: isAddTokenError,
  });

  // face api response handlers
  useHandleReduxQueryError({ isError: isGetFaceError, error: getFaceError, refetch: fetchFaceID });

  useEffect(() => {
    if (!currentUser.faceID) {
      showAlert({ msg: 'Please register your Face ID first' });
      navigate(PATHS.FACE_ID_REGISTER);
      return;
    }

    fetchFaceID();
    loadFaceModels(() => setModelsLoaded(true));

    // release webcam on component unmount
    return releaseWebcam;
  }, []);

  useEffect(() => {
    if (isPermissionGranted) setVoteDialogOpen(true);
  }, [isPermissionGranted]);

  if (isGetContestantsLoading) {
    return <LoadingPaper />;
  } else if (!getContestantsData || getContestantsData.data.length === 0) {
    return <EmptyList emptyText='No contestants found' />;
  }

  return (
    <main className='pb-10'>
      <header className='mb-5 text-xl'>
        <h1>
          Election Name: <span className='font-semibold'>{electionToVote.name}</span>
        </h1>
        <p>
          Started at:&nbsp;
          <span className='font-semibold'>
            {moment(electionToVote.startTime).format('LLL')}&nbsp;
            {electionToVote.hasStarted && '(ongoing)'}
          </span>
        </p>
        <p>
          Ends at:&nbsp;
          <span className='font-semibold'>{moment(electionToVote.endTime).format('LLL')}</span>
        </p>
      </header>

      <div className='flex flex-col gap-10'>
        {Object.entries(groupedContestants).map(([partyID, contestants]) => (
          <section
            key={partyID}
            className='relative min-h-80 flex flex-col gap-5 overflow-hidden px-5 pb-5 rounded-lg border border-[rgba(0,0,0,0.15)]'
          >
            <div
              className='-z-1 absolute right-0 opacity-50 size-70 top-10 rounded-full'
              style={{
                background: `url(${contestants[0].party?.logoUrl}) 0px 0px/contain no-repeat`,
              }}
            />

            <p className='text-white text-xl h-10 py-2 -mx-5 px-5 bg-linear-90 from-primary-600 to-primary-700'>
              <span className='font-bold'>{contestants[0].party?.longName}</span> (
              {contestants[0].party?.shortName})
            </p>

            <div className='flex gap-5 flex-wrap'>
              {contestants.map(({ contestant, party }) => (
                <div
                  key={contestant._id}
                  className='relative w-42.5 h-46 rounded p-4 flex flex-col gap-2 border border-[rgba(0,0,0,0.15)]'
                >
                  <Avatar src={contestant.profileImageUrl} className='!w-full !h-30 !rounded-xs' />
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
                      onClick={() => handleInfoClick({ ...contestant, party })}
                    >
                      <InfoRounded className='!size-[inherit] text-primary-500' />
                    </IconButton>
                  </Tooltip>
                </div>
              ))}
            </div>

            <div className='flex justify-end'>
              <Button
                variant='contained'
                endIcon={<HowToVote />}
                onClick={() => handleVoteConfirmation(contestants[0].party)}
                disabled={isAddTokenLoading || isCastVoteLoading || isCastVoteSuccess}
              >
                Vote
              </Button>
            </div>
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

      <AlertDialog
        open={voteDialogOpen}
        dialogTitle='Confirm Vote'
        setOpen={setVoteDialogOpen}
        onNegated={handleVoteNegation}
        onAffirmed={handleVoteAffirmation}
        dialogContent={
          selectedParty && (
            <div>
              <p>
                Are you sure you want to vote the contestant(s) under&nbsp;
                <span className='font-bold'>
                  {selectedParty.longName} ({selectedParty.shortName})
                </span>
                &nbsp;for&nbsp;<span className='font-bold'>{electionToVote.name}</span> ?
              </p>
              <ul className='list-disc list-inside'>
                {groupedContestants[selectedParty._id].map(
                  ({ contestant: { _id, firstName, lastName } }) => (
                    <li key={_id}>
                      {firstName} {lastName}
                    </li>
                  )
                )}
              </ul>
            </div>
          )
        }
      />

      <Modal
        keepMounted
        open={faceModalOpen}
        setOpen={setFaceModalOpen}
        extraModalBoxStyle={{ maxHeight: '100dvh' }}
      >
        {isGetFaceSuccess ? (
          <section className='text-center'>
            {isPermissionGranted ? (
              <TbFaceId className='scan-face-icon' />
            ) : (
              <TbFaceIdError className='scan-face-icon' />
            )}
            <h1 className='relative text-2xl font-bold sm:text-3xl'>Face Verification</h1>
            <p className='text-md opacity-70'>Please look directly at the camera</p>

            <div className='relative my-10 sm:my-5'>
              <div
                hidden={isPermissionGranted}
                className='absolute z-1 inset-0 flex flex-col items-center justify-center gap-2'
              >
                <VideocamOff fontSize='large' className='text-primary-500 !size-15' />
                <p className='text-lg text-center'>
                  Please grant access to your Camera and&nbsp;
                  <span
                    onClick={handlePageRefresh}
                    className='underline cursor-pointer text-primary-600'
                  >
                    refresh the page
                  </span>
                </p>
              </div>

              <video muted autoPlay playsInline className='mx-auto size-60 sm:w-80 sm:h-70' />
            </div>

            <Button
              variant='contained'
              loading={isSubmitting}
              disabled={!isPermissionGranted}
              onClick={captureAndCompareFaces}
              className='base-btn !text-lg w-full'
            >
              Take Photo
            </Button>
          </section>
        ) : (
          <div className='flex flex-col gap-4'>
            <FaceRetouchingOff />
            <p>Failed to load Face ID</p>
          </div>
        )}
      </Modal>

      <Modal
        open={isModalOpen}
        setOpen={setVoteModalOpen}
        onClose={handleVoteModalClose}
        extraModalBoxStyle={{ maxHeight: '100dvh' }}
      >
        <div className='flex flex-col items-center justify-center gap-4'>
          {voteMessage.type === 'loading' && <Loading />}
          {isCastVoteSuccess && <LiaVoteYeaSolid className='size-20 text-primary-600' />}
          <p>{voteMessage.message}</p>
          <Button variant='contained' disabled={!isCastVoteSuccess} onClick={handleVoteModalClose}>
            Close
          </Button>
        </div>
      </Modal>
    </main>
  );
};

export default Election;
