import moment from 'moment';
import { isEmpty } from 'lodash';
import { LiaVoteYeaSolid } from 'react-icons/lia';
import { TbFaceId, TbFaceIdError } from 'react-icons/tb';
import { Button, Paper, TablePagination } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { detectSingleFace, euclideanDistance, fetchImage } from 'face-api.js';
import {
  Poll,
  Refresh,
  ContentCopy,
  VideocamOff,
  FaceRetouchingOff,
  AssignmentTurnedIn,
} from '@mui/icons-material';

import { PATHS } from '../../routes/PathConstants';
import { useLazyFetchFaceQuery } from '../../services/apis/faceApi';
import { log, warn, error as errorLog } from '../../utils/log.utils';
import { copyToClipboard, loadFaceModels, showAlert } from '../../utils';
import { useGetFormQuery, useLazyGetPollsQuery } from '../../services/apis/formApi';
import { useAddVoteTokenMutation, useCastVoteMutation } from '../../services/apis/voteApi/form';
import { useAppSelector, useHandleReduxQueryError, useHandleReduxQuerySuccess } from '../../hooks';
import {
  Modal,
  Loading,
  EmptyList,
  PollInput,
  BackButton,
  LoadingPaper,
  TablePaginationActions,
} from '../../components';

const FACE_VERIFICATION_THRESHOLD = Number(import.meta.env.VITE_FACE_VERIFICATION_THRESHOLD || 0.6);

const FormFill = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [voteModalOpen, setVoteModalOpen] = useState(false);
  const [faceModalOpen, setFaceModalOpen] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [pollVotes, setPollVotes] = useState<PollVote[]>([]);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const { currentUser, isAuthenticated } = useAppSelector(state => state.authStore);

  const goBack = useCallback(() => navigate(PATHS.FORMS.FETCH), []);

  const handleRowsPerPageChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newRowsPerPage = +event.target.value;
      setRowsPerPage(newRowsPerPage);
      setPage(1);
    },
    []
  );

  const handlePageChange = useCallback(
    (_: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
      setPage(newPage + 1);
    },
    []
  );

  const releaseWebcam = useCallback(() => {
    const video = document.querySelector('video');
    if (!video) return;

    const stream = video.srcObject as MediaStream | null;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      video.srcObject = null;
    }
  }, []);

  const accessWebcam = useCallback(() => {
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
        };
      })
      .catch(err => {
        errorLog(err);
        showAlert({ msg: 'Please grant access to Camera', duration: 5000 });
      });
  }, []);

  const handlePageRefresh = useCallback(() => navigate(0), []);

  const {
    data: formData,
    error: formError,
    isError: isFormError,
    refetch: refetchForm,
    isLoading: isGetFormLoading,
  } = useGetFormQuery(id!);

  const [
    getPolls,
    {
      error: pollsError,
      data: getPollsData,
      isError: isPollsError,
      isLoading: isGetPollsLoading,
      originalArgs: pollsOriginalArgs,
    },
  ] = useLazyGetPollsQuery();

  const [
    fetchFaceID,
    {
      data: getFaceData,
      error: getFaceError,
      isError: isGetFaceError,
      isSuccess: isGetFaceSuccess,
    },
  ] = useLazyFetchFaceQuery();

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

  const captureAndCompareFaces = useCallback(async () => {
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
        showAlert({ msg: 'Face Verification failed! Please try again', duration: 5000 });
      }
      log(`Match: ${match ? '✅ Yes' : '❌ No'} (Confidence: ${confidence.toFixed(4)})`);
    } catch (error) {
      // the most likely cause of error here is an expired face id image url
      fetchFaceID();
      showAlert({ msg: 'An error has occurred. Please try again' });
      errorLog(error);
    } finally {
      setIsSubmitting(false);
    }
  }, [getFaceData, modelsLoaded]);

  const handleSubmitForm = useCallback(() => {
    if (
      getPollsData &&
      (pollVotes.length < getPollsData.data.totalDocs ||
        pollVotes.some(({ optionIDs }) => isEmpty(optionIDs)))
    ) {
      showAlert({ msg: 'Please fill form completely', type: 'error' });
      return;
    }

    if (!formData?.data.identityCheck) {
      setVoteModalOpen(true);
      castVote({ formID: id!, pollVotes });
    } else if (isPermissionGranted) {
      setFaceModalOpen(true);
    } else {
      accessWebcam();
    }
  }, [isPermissionGranted, formData, pollVotes, getPollsData]);

  const handleVoteModalClose = useCallback(() => {
    if (!formData?.data.identityCheck) setVoteModalOpen(false);
    else if (isCastVoteSuccess) goBack();
  }, [formData, isCastVoteSuccess]);

  useEffect(() => setFaceModalOpen(isPermissionGranted), [isPermissionGranted]);

  useEffect(() => {
    if (isCastVoteSuccess && !formData?.data.identityCheck) setInfoModalOpen(true);
  }, [formData, isCastVoteSuccess]);

  const voteMessage = useMemo(() => {
    if (isCastVoteSuccess) {
      return { type: 'success', message: 'Form filled successfully' };
    } else if (isCastVoteLoading) {
      return { type: 'loading', message: 'Processing Submitted Form' };
    } else if (isAddTokenSuccess) {
      return { type: 'success', message: 'Form Token generated successfully' };
    } else if (isAddTokenLoading) {
      return { type: 'loading', message: 'Generating Form Token' };
    }

    return { type: '', message: '' };
  }, [isAddTokenLoading, isAddTokenSuccess, isCastVoteLoading, isCastVoteSuccess]);

  const isVoteModalOpen = useMemo(
    () =>
      voteModalOpen ||
      isAddTokenLoading ||
      isCastVoteLoading ||
      (!!formData?.data.identityCheck && isCastVoteSuccess),
    [voteModalOpen, isAddTokenLoading, isCastVoteLoading, isCastVoteSuccess, formData]
  );

  const isSubmitDisabled = useMemo(
    () =>
      getPollsData?.data.hasNextPage || isAddTokenLoading || isCastVoteLoading || isCastVoteSuccess,
    [getPollsData, isAddTokenLoading, isCastVoteLoading, isCastVoteSuccess]
  );

  useEffect(() => {
    if (!formData) return;

    if (formData.data.hasStarted && !formData.data.hasEnded) {
      getPolls({ formID: id!, params: { page, limit: rowsPerPage } });
    }

    if (!formData.data.identityCheck) return;

    if (!isAuthenticated) {
      showAlert({ msg: 'This form requires you to be signed in' });
      navigate({ pathname: PATHS.AUTH.LOGIN, search: `?external-intent=${pathname}` });
      return;
    } else if (!currentUser.faceID) {
      showAlert({ msg: 'Please register your Face ID first' });
      navigate(PATHS.FACE_ID_REGISTER);
      return;
    }

    fetchFaceID();
    loadFaceModels(() => setModelsLoaded(true));

    // release webcam on component unmount
    return releaseWebcam;
  }, [formData]);

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
      if (addTokenData) castVote({ formID: id!, voteToken: addTokenData.data.token, pollVotes });
    },
  });
  useHandleReduxQueryError({
    error: addTokenError,
    refetch: addVoteToken,
    isError: isAddTokenError,
  });

  // face api response handlers
  useHandleReduxQueryError({ isError: isGetFaceError, error: getFaceError, refetch: fetchFaceID });

  // form api response handlers
  useHandleReduxQueryError({ error: formError, isError: isFormError, refetch: refetchForm });

  // polls api response handlers
  useHandleReduxQueryError({
    error: pollsError,
    isError: isPollsError,
    refetch: () => {
      if (pollsOriginalArgs) getPolls(pollsOriginalArgs);
    },
  });

  if (isGetFormLoading || isGetPollsLoading) {
    return <LoadingPaper />;
  } else if (!formData) {
    return (
      <EmptyList
        startIcon={<Poll />}
        url={PATHS.FORMS.FETCH}
        addText='Check other forms'
        emptyText='Form does not exist'
      />
    );
  } else if (!formData.data.hasStarted) {
    return (
      <EmptyList
        emptyText='Form is not open yet'
        addComponent={
          <Button variant='contained' startIcon={<Refresh />} onClick={handlePageRefresh}>
            Refresh
          </Button>
        }
      />
    );
  } else if (formData.data.hasEnded) {
    return (
      <EmptyList
        startIcon={<Poll />}
        url={PATHS.FORMS.FETCH}
        addText='Check other forms'
        emptyText={`Form ended ${moment(formData.data.endTime).fromNow()}`}
      />
    );
  } else if (!getPollsData || getPollsData.data.totalDocs === 0) {
    return (
      <EmptyList
        startIcon={<Poll />}
        url={PATHS.FORMS.FETCH}
        emptyText='No Polls found'
        addText='Check other forms'
      />
    );
  }

  return (
    <section className='form-layout'>
      <div className='form-header mb-4'>
        <BackButton onClick={goBack} />
        <p className='form-heading'>Fill Form: {formData.data.name}</p>
        <p className='form-subheading font-semibold'>
          {/* @ts-ignore */}
          Created by {formData.data.author!.firstName} {formData.data.author!.lastName}
        </p>
      </div>

      {getPollsData.data.docs.map(poll => (
        <PollInput key={poll._id} poll={poll} pollVotes={pollVotes} setPollVotes={setPollVotes} />
      ))}

      <Button
        variant='contained'
        onClick={handleSubmitForm}
        disabled={isSubmitDisabled}
        startIcon={<AssignmentTurnedIn />}
      >
        Submit
      </Button>

      <Paper className='hover-pagination-controls !justify-center'>
        <TablePagination
          component='div'
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          page={getPollsData.data.page - 1}
          rowsPerPageOptions={[10, 25, 50]}
          count={getPollsData.data.totalDocs}
          ActionsComponent={TablePaginationActions}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </Paper>

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
          <div className='flex flex-col items-center gap-4'>
            <FaceRetouchingOff className='!size-12' />
            <p>Failed to load Face ID</p>
            <Button variant='contained' startIcon={<Refresh />} onClick={handlePageRefresh}>
              Refresh
            </Button>
          </div>
        )}
      </Modal>

      <Modal
        open={isVoteModalOpen}
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

      <Modal open={infoModalOpen} setOpen={setInfoModalOpen}>
        {castVoteData ? (
          <div className='text-center'>
            <span>Here's your Form Vote ID</span>
            <Button
              startIcon={<ContentCopy />}
              className='whitespace-nowrap !ml-1'
              onClick={() =>
                copyToClipboard({
                  text: castVoteData.data.voteID,
                  onSuccess: () => showAlert({ msg: 'Copied to clipboard' }),
                })
              }
            >
              {castVoteData?.data.voteID}
            </Button>
            <p>
              You can verify your filled form&nbsp;
              <Link
                target='_blank'
                to={PATHS.VOTES.FORM.VERIFY}
                className='text-primary-500 hover:underline'
              >
                here
              </Link>
            </p>
            <p>
              You can monitor results&nbsp;
              <Link
                target='_blank'
                className='text-primary-500 hover:underline'
                to={PATHS.RESULTS.FORM.RESULT.replace(':id', id!)}
              >
                here
              </Link>
            </p>
          </div>
        ) : (
          <Loading />
        )}
      </Modal>
    </section>
  );
};

export default FormFill;
