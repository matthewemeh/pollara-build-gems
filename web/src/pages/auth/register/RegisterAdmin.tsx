import { useNavigate, useSearchParams } from 'react-router-dom';
import { createContext, useRef, useState, useEffect, useCallback } from 'react';

import { PATHS } from '../../../routes/PathConstants';
import { useLazySendOtpQuery } from '../../../services/apis/authApi';
import { useHandleReduxQueryError, useAppSelector } from '../../../hooks';
import {
  BackButton,
  StepTracker,
  RegisterAdminOTP,
  RegisterAdminDetails,
  RegisterAdminPassword,
} from '../../../components';

type StageProp = {
  form: React.ReactNode;
  title: React.ReactNode;
  subtitle: React.ReactNode;
};

export enum Stage {
  BASIC_INFO = 0,
  PASSWORD = 1,
  OTP = 2,
}

export const RegisterContext = createContext<RegisterAdminContext | null>(null);

const checkpoints: Checkpoint[] = [
  { title: 'Your details', subtitle: 'Please provide your name and email' },
  { title: 'Create your password', subtitle: 'Must be at least 8 characters' },
  { title: 'Verify your email address', subtitle: 'Increase your account security' },
];

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const registerPayload = useRef<RegisterAdminPayload>({
    email: '',
    lastName: '',
    password: '',
    role: 'ADMIN',
    firstName: '',
  });
  const [stage, setStage] = useState(Stage.BASIC_INFO);
  const [sendOtp, { error, isError }] = useLazySendOtpQuery();
  const {
    isAuthenticated,
    currentUser: { email },
  } = useAppSelector(state => state.authStore);

  const navigateOtpSection = useCallback(() => setStage(Stage.OTP), []);

  const navigateDetailsSection = useCallback(() => setStage(Stage.BASIC_INFO), []);

  const navigatePasswordSection = useCallback(() => {
    stageProps.current[2].subtitle = (
      <>
        Please enter the one-time password (OTP) sent to&nbsp;
        <span className='font-bold text-primary-700'>{registerPayload.current.email}</span>
      </>
    );
    setStage(Stage.PASSWORD);
  }, [registerPayload.current.email]);

  const goBack = useCallback(() => {
    if (stage === 0) {
      navigate(PATHS.AUTH.LOGIN);
      return;
    }
    setStage(prev => prev - 1);
  }, [stage]);

  const stageProps = useRef<StageProp[]>([
    {
      title: 'Your details',
      subtitle: 'Please provide your name and email',
      form: <RegisterAdminDetails />,
    },
    {
      title: 'Create your password',
      subtitle: 'Your password should be strong and easy to remember',
      form: <RegisterAdminPassword />,
    },
    {
      title: 'Verify your email address',
      subtitle: <></>,
      form: <RegisterAdminOTP />,
    },
  ]);

  useEffect(() => {
    // user was re-directed here (register page) after a successful login because email hasn't been verified
    if (searchParams.get('stage') === `${Stage.OTP}` && email) {
      sendOtp({ email, subject: ': OTP Verification' });
      registerPayload.current.email = email;
      stageProps.current[2].subtitle = (
        <>
          Please enter the one-time password (OTP) sent to&nbsp;
          <span className='font-bold text-primary-700'>{email}</span>
        </>
      );
      navigateOtpSection();
    }
  }, [searchParams]);

  useHandleReduxQueryError({ error, isError });

  return (
    <RegisterContext.Provider
      value={{
        registerPayload,
        navigateOtpSection,
        navigateDetailsSection,
        navigatePasswordSection,
      }}
    >
      <StepTracker checkpoints={checkpoints} currentStep={stage} />
      <div className='right-aside'>
        <div className='form-header'>
          <BackButton disabled={isAuthenticated} onClick={goBack} />
          <p className='form-heading'>{stageProps.current[stage].title}</p>
          <p className='form-sub-heading'>{stageProps.current[stage].subtitle}</p>
        </div>
        {stageProps.current[stage].form}
      </div>
    </RegisterContext.Provider>
  );
};

export default Register;
