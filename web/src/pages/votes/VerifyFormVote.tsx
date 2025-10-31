import moment from 'moment';
import { Form, Formik } from 'formik';
import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { Button, TextField } from '@mui/material';

import { AlertDialog } from '../../components';
import { PATHS } from '../../routes/PathConstants';
import { verifyVoteSchema } from '../../schemas/vote.schema';
import { useVerifyVoteMutation } from '../../services/apis/voteApi/form';
import { useAppSelector, useHandleReduxQueryError, useHandleReduxQuerySuccess } from '../../hooks';

const VerifyFormVote = () => {
  const [alertOpen, setAlertOpen] = useState(false);
  const { isAuthenticated } = useAppSelector(state => state.authStore);
  const [voteData, setVoteData] = useState<VerifyFormVoteResponse['data']>();
  const [verifyVote, { error, isError, isLoading, isSuccess, data, originalArgs }] =
    useVerifyVoteMutation();

  const handleVerifySuccess = (voteInfo: VerifyFormVoteResponse['data']) => {
    setVoteData(voteInfo);
    setAlertOpen(true);
  };

  const dialogContent: React.ReactNode = useMemo(() => {
    if (!voteData) return <></>;

    const { form, message, status, voteTimestamp } = voteData;

    return (
      <div className='grid grid-cols-[40%_60%] gap-2'>
        <p className='card-info__tag'>Form Name</p>
        <p className='card-info__text capitalize'>{form.name}</p>

        <p className='card-info__tag'>Form Vote Status</p>
        <p
          className={`card-info__text capitalize p-2 rounded-sm w-fit flex items-center gap-2 ${
            status === 'success' ? 'text-green-600 bg-green-200' : 'text-red-600 bg-red-200'
          }`}
        >
          <span
            className={`size-2 rounded-full ${
              status === 'success' ? 'bg-green-600' : 'bg-red-600'
            }`}
          />
          {status}
        </p>

        <p className='card-info__tag'>Message</p>
        <p className='card-info__text'>{message}</p>

        <p className='card-info__tag'>Timestamp</p>
        <p className='card-info__text'>{moment(voteTimestamp).format('lll')}</p>
      </div>
    );
  }, [voteData]);

  useHandleReduxQuerySuccess({
    isSuccess,
    response: data,
    onSuccess: () => {
      if (data) handleVerifySuccess(data.data);
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
    <div className='right-aside sm:!px-[30%] !animate-none'>
      <div className='form-header'>
        <p className='form-heading'>Verify Vote</p>
        <p className='form-sub-heading'>Check the integrity of your filled form</p>
      </div>

      <Formik
        initialValues={{ voteID: '' }}
        validationSchema={verifyVoteSchema}
        onSubmit={values => verifyVote(values)}
      >
        {({ values, errors, touched, handleBlur, handleChange, handleSubmit }) => (
          <Form className='form' onSubmit={handleSubmit}>
            <TextField
              id='voteID'
              type='text'
              name='voteID'
              label='Form Vote ID'
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.voteID}
              error={touched.voteID && !!errors.voteID}
              helperText={touched.voteID && errors.voteID}
              className='form-field'
            />

            <Button type='submit' variant='contained' loading={isLoading} className='!mt-3'>
              Verify
            </Button>

            {isAuthenticated && (
              <div className='text-center text-gull-gray font-medium text-base -tracking-[0.5%]'>
                <p>
                  Didn't receive an email from us with your Vote ID? Check your&nbsp;
                  <Link to={PATHS.NOTIFICATIONS} className='text-primary-700 inline-block'>
                    notifications
                  </Link>
                </p>
              </div>
            )}
          </Form>
        )}
      </Formik>

      <AlertDialog
        affirmationOnly
        open={alertOpen}
        setOpen={setAlertOpen}
        affirmativeText='Close'
        dialogContent={dialogContent}
        dialogTitle='Form Vote Details'
        onClose={() => setVoteData(undefined)}
      />
    </div>
  );
};

export default VerifyFormVote;
