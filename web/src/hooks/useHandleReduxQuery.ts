import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import { showAlert } from '../utils';
import { PATHS } from '../routes/PathConstants';
import { useAppDispatch } from './useRootStorage';
import { error as errorLog } from '../utils/log.utils';
import { logout } from '../services/apis/authApi/store';
import { AppStorage, STORAGE_KEYS } from '../utils/storage.utils';
import { useLazyRefreshTokensQuery } from '../services/apis/authApi';

const services = [
  import.meta.env.VITE_IDENTITY_SERVICE_URL,
  import.meta.env.VITE_ELECTION_SERVICE_URL,
  import.meta.env.VITE_VOTE_SERVICE_URL,
  import.meta.env.VITE_RESULTS_SERVICE_URL,
  import.meta.env.VITE_FACE_ID_SERVICE_URL,
  import.meta.env.VITE_NOTIFICATION_SERVICE_URL,
];

const triggerWarm = async (serviceUrl: string) => {
  try {
    await fetch(`${serviceUrl}/warmup`, {
      method: 'GET',
      headers: { 'x-internal': import.meta.env.VITE_WARMUP_SERVICE_KEY },
    });
  } catch (err) {
    console.error(err);
  }
};

interface HandleReduxQueryErrorProps {
  isError: boolean;
  refetch?: () => any;
  onError?: () => void;
  error?: FetchBaseQueryError | SerializedError;
}

interface HandleReduxQuerySuccessProps {
  isSuccess: boolean;
  onSuccess?: () => void;
  onFailure?: () => void;
  response?: BaseResponse;
  showErrorMessage?: boolean;
  showSuccessMessage?: boolean;
}

export const useHandleReduxQueryError = ({
  error,
  isError,
  onError,
  refetch,
}: HandleReduxQueryErrorProps) => {
  const { AUTH } = PATHS;

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [
    refreshTokens,
    {
      data: refreshData,
      error: refreshError,
      isError: isRefreshError,
      isSuccess: isRefreshSuccess,
    },
  ] = useLazyRefreshTokensQuery();

  useEffect(() => {
    if (!(isError && error && 'status' in error)) return;

    if (error.status === 'FETCH_ERROR') {
      showAlert({ msg: 'Server unreachable. Please try again later', type: 'error' });
      // Try warming up services
      for (const serviceUrl of services) {
        triggerWarm(serviceUrl);
      }
    } else if (error.status === 'TIMEOUT_ERROR') {
      showAlert({ msg: 'Check your internet connection and try again', type: 'error' });
    } else if (error.status === 'PARSING_ERROR') {
      showAlert({ msg: 'An error has occurred. Please try again', type: 'error' });
    } else if (error.data) {
      // we expect erroneous data response to be either a string or an object
      if (typeof error.data === 'object' && !Array.isArray(error.data)) {
        const { message, errorCode, meta } = error.data as BaseErrorResponse;

        if (errorCode === 'E012') {
          if (meta) {
            // warm idle service up
            const { originalService } = meta as any;
            triggerWarm(originalService);
          }
        } else if (errorCode === 'E001') {
          // Session has expired: try refreshing the user's tokens
          const tokens = AppStorage.get<Tokens>(STORAGE_KEYS.AUTH, true);
          if (!tokens) {
            showAlert({ msg: 'Your session has expired' });
            dispatch(logout());
            return;
          }

          const { refreshToken } = tokens;
          refreshTokens({ refreshToken });
        } else if (errorCode === 'E003' || errorCode === 'E004' || errorCode === 'E005') {
          // - `E003` indicates that last request was sent without Authorization: this means there's no `auth` key-value in the localStorage
          // - `E004` indicates that last logout request was sent without a `refreshToken` in the body: this means there's no `auth` key-value in the localStorage
          // - `E005` indicates that an invalid `refreshToken` was provided in logout request body
          dispatch(logout());
          navigate(AUTH.LOGIN);
        } else {
          showAlert({ msg: message, type: 'error' });
        }
      } else if (typeof error.data === 'string') {
        showAlert({ msg: error.data, type: 'error' });
      }
    } else {
      showAlert({ msg: 'An error has occurred. Please try again', type: 'error' });
    }
    errorLog('Redux API error:', error);
    onError?.();
  }, [isError, error]);

  useEffect(() => {
    if (!(isRefreshError && refreshError && 'status' in refreshError)) return;

    if (refreshError.status === 'FETCH_ERROR') {
      showAlert({ msg: 'Server unreachable. Please try again later', type: 'error' });
    } else if (refreshError.status === 'TIMEOUT_ERROR') {
      showAlert({ msg: 'Check your internet connection and try again', type: 'error' });
    } else if (refreshError.status === 'PARSING_ERROR') {
      showAlert({ msg: 'An error has occurred. Please try again', type: 'error' });
    } else if (refreshError.data) {
      // we expect erroneous data response to be either a string or an object
      if (typeof refreshError.data === 'object' && !Array.isArray(refreshError.data)) {
        const { message, errorCode } = refreshError.data as BaseErrorResponse;

        if (errorCode === 'E002' || errorCode === 'E005') {
          // Refresh Token is invalid or has expired: log user out
          showAlert({ msg: 'Your session has expired. Please log in again' });
          dispatch(logout());
        } else {
          showAlert({ msg: message, type: 'error' });
        }
      } else if (typeof refreshError.data === 'string') {
        showAlert({ msg: refreshError.data, type: 'error' });
      }
    } else {
      showAlert({ msg: 'An error has occurred. Please try again', type: 'error' });
    }
    errorLog('Refresh error:', refreshError);
  }, [isRefreshError, refreshError]);

  useEffect(() => {
    if (isRefreshSuccess) refetch?.();
  }, [isRefreshSuccess, refreshData]);
};

export const useHandleReduxQuerySuccess = ({
  response,
  isSuccess,
  onFailure,
  onSuccess,
  showErrorMessage = true,
  showSuccessMessage = true,
}: HandleReduxQuerySuccessProps) => {
  useEffect(() => {
    if (!response) return;

    if (isSuccess) {
      if (response.success) {
        showSuccessMessage && showAlert({ msg: response.message });
        onSuccess?.();
      } else {
        showErrorMessage && showAlert({ msg: response.message, type: 'error' });
        onFailure?.();
      }
    }
  }, [isSuccess, response]);
};
