import { Button } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { detectSingleFace } from 'face-api.js';
import { VideocamOff } from '@mui/icons-material';
import { TbFaceId, TbFaceIdError } from 'react-icons/tb';

import { PATHS } from '../routes/PathConstants';
import { Modal, OtpInput } from '../components';
import { updateUser } from '../services/apis/authApi/store';
import { useLazySendOtpQuery } from '../services/apis/authApi';
import { log, warn, error as errorLog } from '../utils/log.utils';
import { useRegisterFaceMutation } from '../services/apis/faceApi';
import { showAlert, loadFaceModels, secondsToMMSS } from '../utils';
import {
  useAppDispatch,
  useAppSelector,
  useHandleReduxQueryError,
  useHandleReduxQuerySuccess,
} from '../hooks';

const THREE_MINUTES = 3 * 60;

const FaceRegister = () => {
  const navigate = useNavigate();

  const dispatch = useAppDispatch();
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [timeToResend, setTimeToResend] = useState(THREE_MINUTES);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const { email } = useAppSelector(state => state.authStore.currentUser);
  const [
    registerFace,
    {
      data: registerData,
      error: registerError,
      isError: isRegisterError,
      isLoading: isRegisterLoading,
      isSuccess: isRegisterSuccess,
      originalArgs: registerOriginalArgs,
    },
  ] = useRegisterFaceMutation();

  const [
    sendOTP,
    {
      data: otpData,
      reset: resetOTP,
      error: otpError,
      isError: isOtpError,
      isLoading: isOtpLoading,
      isSuccess: isOtpSuccess,
      originalArgs: otpOriginalArgs,
    },
  ] = useLazySendOtpQuery();

  const handlePageRefresh = () => window.location.reload();

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

  const releaseWebcam = () => {
    const video = document.querySelector('video');
    if (!video) return;

    const stream = video.srcObject as MediaStream | null;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      video.srcObject = null;
    }
  };

  // captures user's face and sends OTP to user (for validation)
  const captureFace = async () => {
    if (!modelsLoaded) {
      showAlert({ msg: 'An error has occurred. Please try again later' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Capture live face directly from <video>
      const video = document.querySelector('video')!;
      const detection = await detectSingleFace(video).withFaceLandmarks().withFaceDescriptor();

      if (!detection) {
        showAlert({ msg: 'Face not detected. Please try again', duration: 5000 });
        log('detection', detection);
        return;
      }

      // Store captured face
      const canvas = document.querySelector('canvas')!;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // send OTP if it is being sent for the first time, otherwise when timer is zero
      if (!otpOriginalArgs || timeToResend === 0) {
        log('OTP sent');
        resetOTP();
        sendOTP({ email, subject: 'POLLARA: Face Registration Confirmation' });
      } else {
        log('OTP ignored');
        setIsOtpModalOpen(true);
      }
    } catch (error) {
      showAlert({ msg: 'An error has occurred. Please refresh and try again' });
      errorLog(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadImage = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsOtpModalOpen(false);

    // Convert canvas → Blob → File
    const canvas = document.querySelector('canvas')!;
    const blob: Blob = await new Promise(resolve => canvas.toBlob(resolve as any, 'image/png'));
    const file = new File([blob], 'face-capture.png', { type: 'image/png' });
    registerFace({ otp, image: file });
  };

  useEffect(() => {
    accessWebcam();
    loadFaceModels(() => setModelsLoaded(true));

    // release webcam on component unmount
    return releaseWebcam;
  }, []);

  useEffect(() => {
    // timer starts counting only when OTP has been sent at least once
    // also, timer ends once it's zero
    if (timeToResend === 0 || !otpOriginalArgs) return;

    const timer = setInterval(() => setTimeToResend(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeToResend, otpOriginalArgs]);

  useHandleReduxQuerySuccess({
    response: registerData,
    isSuccess: isRegisterSuccess,
    onSuccess: () => {
      dispatch(updateUser({ faceID: true }));
      navigate(PATHS.DASHBOARD);
    },
  });
  useHandleReduxQueryError({
    error: registerError,
    isError: isRegisterError,
    onError: () => setOtp(''),
    refetch: () => {
      if (registerOriginalArgs) registerFace(registerOriginalArgs);
    },
  });

  useHandleReduxQuerySuccess({
    response: otpData,
    isSuccess: isOtpSuccess,
    onSuccess: () => {
      log('onSuccess');
      setIsOtpModalOpen(true);
      setTimeToResend(THREE_MINUTES);
    },
  });
  useHandleReduxQueryError({
    error: otpError,
    isError: isOtpError,
    refetch: () => {
      if (otpOriginalArgs) sendOTP(otpOriginalArgs);
    },
  });

  return (
    <main className='pb-10'>
      <section className='w-fit mx-auto text-center'>
        {isPermissionGranted ? (
          <TbFaceId className='scan-face-icon' />
        ) : (
          <TbFaceIdError className='scan-face-icon' />
        )}
        <h1 className='relative text-2xl font-bold sm:text-3xl'>Face ID Registration</h1>
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
          <canvas className='hidden' />
        </div>

        <Modal open={isOtpModalOpen} setOpen={setIsOtpModalOpen}>
          <form className='text-center flex flex-col gap-4' onSubmit={uploadImage}>
            <p>
              Enter the OTP sent to <span className='font-bold text-primary-700'>{email}</span>
            </p>
            <OtpInput otp={otp} setOtp={setOtp} />
            <Button type='submit' variant='contained'>
              Submit
            </Button>

            <p className='mt-5 text-center text-gull-gray font-medium text-base -tracking-[0.5%]'>
              Didn't get a code?&nbsp;
              <button
                type='button'
                className='text-primary-700'
                disabled={timeToResend > 0 || isOtpLoading}
                onClick={() => {
                  resetOTP();
                  sendOTP({ email, subject: 'POLLARA: Face Registration Confirmation' });
                }}
              >
                Resend{timeToResend > 0 && ` in ${secondsToMMSS(timeToResend)}`}
              </button>
            </p>
          </form>
        </Modal>

        <Button
          variant='contained'
          onClick={captureFace}
          disabled={!isPermissionGranted}
          className='base-btn !text-lg w-full'
          loading={isSubmitting || isRegisterLoading || isOtpLoading}
        >
          Take Photo
        </Button>
      </section>
    </main>
  );
};

export default FaceRegister;
