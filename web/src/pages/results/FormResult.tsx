import moment from 'moment';
import { useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { PATHS } from '../../routes/PathConstants';
import { useAppSelector, useHandleReduxQueryError } from '../../hooks';
import { useGetResultQuery } from '../../services/apis/resultApi/form';
import { BackButton, EmptyList, LoadingPaper, PollResult } from '../../components';

const REFETCH_TIME = 5 * 60 * 1000;

const FormResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector(state => state.authStore);

  const goBack = useCallback(() => navigate(PATHS.RESULTS.FORM.FETCH), []);

  const {
    data: getResultData,
    error: getResultError,
    refetch: refetchResult,
    isError: isGetResultError,
    isLoading: isGetResultLoading,
  } = useGetResultQuery(id!);

  useHandleReduxQueryError({
    error: getResultError,
    refetch: refetchResult,
    isError: isGetResultError,
  });

  useEffect(() => {
    const timer = setInterval(refetchResult, REFETCH_TIME);
    return () => clearInterval(timer);
  }, []);

  if (isGetResultLoading) {
    return <LoadingPaper />;
  } else if (!getResultData || getResultData.data.results.length === 0) {
    return <EmptyList emptyText='No results found' />;
  }

  const { form, updatedAt, results } = getResultData.data;

  return (
    <section className='form-layout'>
      <div className='form-header mb-4'>
        <BackButton disabled={!isAuthenticated} onClick={goBack} />
        <p className='form-heading'>Form Results: {form.name}</p>
        <p className='form-subheading font-semibold'>
          Last updated at {moment(updatedAt).format('LLL')}
        </p>
      </div>

      {results.map(result => (
        <PollResult key={result.poll.index} pollResult={result} />
      ))}
    </section>
  );
};

export default FormResult;
