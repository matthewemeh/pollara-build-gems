import { v4 as uuidv4 } from 'uuid';
import { styled } from '@mui/material/styles';
import { useCallback, useState } from 'react';
import { Formik, Form, FieldArray } from 'formik';
import { isEmpty, isEqual, cloneDeep } from 'lodash';
import { Delete, DeleteOutline, Notes, Add, AddPhotoAlternate } from '@mui/icons-material';
import {
  Card,
  Button,
  Tooltip,
  TextField,
  IconButton,
  Typography,
  CardContent,
} from '@mui/material';

import constants from '../constants';
import { AlertDialog, Switch } from './index';
import { fileToBase64, showAlert } from '../utils';
import { updatePollSchema } from '../schemas/form.schema';
import { useHandleReduxQueryError, useHandleReduxQuerySuccess } from '../hooks';
import { useUpdatePollMutation, useDeletePollMutation } from '../services/apis/formApi';

const { SUPPORTED_FORMATS, SUPPORTED_MIME_TYPES, FILE_SIZE } = constants;

const VisuallyHiddenInput = styled('input')({
  inset: 0,
  opacity: 0,
  cursor: 'pointer',
  position: 'absolute',
});

interface Props {
  poll: Poll;
  hasFormStarted?: boolean;
  onPollUpdated?: () => void;
  onPollDeleted?: () => void;
}

const PollCard: React.FC<Props> = ({ poll, hasFormStarted, onPollUpdated, onPollDeleted }) => {
  const [alertOpen, setAlertOpen] = useState(false);
  const [updatePoll, updatePollStatus] = useUpdatePollMutation();
  const [deletePoll, deletePollStatus] = useDeletePollMutation();
  const handleDelete = useCallback(() => setAlertOpen(true), []);
  const handleDeleteAffirmation = useCallback(() => deletePoll(poll._id), [poll._id]);

  useHandleReduxQuerySuccess({
    onSuccess: onPollUpdated,
    response: updatePollStatus.data,
    isSuccess: updatePollStatus.isSuccess,
  });

  useHandleReduxQuerySuccess({
    onSuccess: onPollDeleted,
    response: deletePollStatus.data,
    isSuccess: deletePollStatus.isSuccess,
  });

  useHandleReduxQueryError({
    error: updatePollStatus.error,
    isError: updatePollStatus.isError,
    refetch: () => {
      if (updatePollStatus.originalArgs) updatePoll(updatePollStatus.originalArgs);
    },
  });

  useHandleReduxQueryError({
    error: deletePollStatus.error,
    isError: deletePollStatus.isError,
    refetch: () => {
      if (deletePollStatus.originalArgs) deletePoll(deletePollStatus.originalArgs);
    },
  });

  const getChangedFields = (values: any, initialValues: any) => {
    const diff = {};
    for (const key in values) {
      if (!isEqual(values[key], initialValues[key])) {
        // @ts-ignore
        diff[key] = cloneDeep(values[key]);
      }
    }
    return diff;
  };

  const handleOptionImageChange = async (
    file: File | undefined,
    setFieldValue: any,
    optionName: string
  ) => {
    // Helper to reset and show error
    const resetImage = (msg?: string) => {
      setFieldValue(optionName, { file: null, preview: '' });
      if (msg) showAlert({ msg, type: 'error' });
    };

    if (!file) return resetImage();

    if (file.size > FILE_SIZE.IMAGE) return resetImage('File size must be less than 500 KB');

    if (!SUPPORTED_MIME_TYPES.includes(file.type)) {
      return resetImage(`File format must be one of: ${SUPPORTED_FORMATS.toString()}`);
    }

    const preview = await fileToBase64(file);
    setFieldValue(optionName, { file, preview });
  };

  return (
    <Formik
      validationSchema={updatePollSchema}
      initialValues={{
        question: poll.question,
        maxSelectableOptions: poll.maxSelectableOptions,
        options: poll.options.map(option => ({
          id: option.id,
          name: option.name,
          image: { file: null, preview: '' },
        })),
      }}
      onSubmit={async (values, { setSubmitting, resetForm }) => {
        const changedValues = getChangedFields(values, poll);
        if (isEmpty(changedValues)) {
          showAlert({ msg: 'No changes made to update the poll.', type: 'error' });
          setSubmitting(false);
          return;
        }

        const missingOptionImages = values.options.some(
          option => !option.image?.file && !poll.options.find(opt => opt.id === option.id)?.imageUrl
        );

        if (poll.optionsImageEnabled && missingOptionImages) {
          showAlert({ type: 'error', duration: 5000, msg: 'Please upload images for all options' });
          return;
        }

        await updatePoll({ pollID: poll._id, ...changedValues });
        setSubmitting(false);
        resetForm({ values });
      }}
    >
      {({
        values,
        errors,
        touched,
        handleBlur,
        handleSubmit,
        handleChange,
        isSubmitting,
        setFieldValue,
      }) => (
        <Form onSubmit={handleSubmit}>
          <Card component='section' className='!shadow-md rounded-2xl mb-5 duration-400'>
            <CardContent className='flex flex-col gap-4'>
              <div className='flex items-center justify-between'>
                <Typography variant='h6'>Poll {poll.index + 1}</Typography>
                <Tooltip title='Delete Poll'>
                  <IconButton
                    size='small'
                    color='error'
                    onClick={handleDelete}
                    disabled={hasFormStarted}
                  >
                    <Delete />
                  </IconButton>
                </Tooltip>
              </div>

              <TextField
                fullWidth
                id='question'
                name='question'
                label='Question'
                value={values.question}
                disabled={hasFormStarted}
                error={touched.question && !!errors.question}
                helperText={touched.question && errors.question}
                onBlur={handleBlur}
                onChange={handleChange}
              />

              <TextField
                fullWidth
                type='number'
                inputMode='numeric'
                id='maxSelectableOptions'
                disabled={hasFormStarted}
                name='maxSelectableOptions'
                label='Max Selectable Options'
                value={values.maxSelectableOptions}
                error={touched.maxSelectableOptions && !!errors.maxSelectableOptions}
                helperText={touched.maxSelectableOptions && errors.maxSelectableOptions}
                onBlur={handleBlur}
                onChange={handleChange}
              />

              <Tooltip title='Cannot be changed!'>
                <span>
                  <Switch
                    disabled
                    className='!w-fit'
                    label='Options Image Enabled'
                    checked={poll.optionsImageEnabled}
                  />
                </span>
              </Tooltip>

              <FieldArray name='options'>
                {({ push, remove }) => (
                  <div className='flex flex-col gap-3'>
                    {values.options.map((option, index) => (
                      <div
                        key={index}
                        className='flex items-center gap-3 border border-gray-300 p-2 rounded-md'
                      >
                        {poll.optionsImageEnabled && (
                          <div className='size-12 relative'>
                            {hasFormStarted || (
                              <VisuallyHiddenInput
                                type='file'
                                accept={SUPPORTED_FORMATS}
                                id={`options[${index}].image.file`}
                                name={`options[${index}].image.file`}
                                onChange={e =>
                                  handleOptionImageChange(
                                    e.target.files?.[0],
                                    setFieldValue,
                                    `options[${index}].image`
                                  )
                                }
                              />
                            )}
                            {option.image?.preview || poll.options[index]?.imageUrl ? (
                              <img
                                alt={`Option ${index + 1}`}
                                className='size-full object-cover rounded-md'
                                src={option.image?.preview || poll.options[index]?.imageUrl}
                              />
                            ) : (
                              <AddPhotoAlternate className='!size-full' color='primary' />
                            )}
                          </div>
                        )}

                        <TextField
                          fullWidth
                          value={option.name}
                          disabled={hasFormStarted}
                          label={`Option ${index + 1}`}
                          name={`options[${index}].name`}
                          onBlur={handleBlur}
                          onChange={handleChange}
                          error={
                            !!(
                              touched.options?.[index]?.name &&
                              (errors.options?.[index] as any)?.name
                            )
                          }
                          helperText={
                            touched.options?.[index]?.name && (errors.options?.[index] as any)?.name
                          }
                        />

                        {hasFormStarted || values.options.length <= 2 || (
                          <Tooltip title='Remove Option'>
                            <IconButton color='error' onClick={() => remove(index)}>
                              <DeleteOutline fontSize='small' />
                            </IconButton>
                          </Tooltip>
                        )}
                      </div>
                    ))}

                    {hasFormStarted || (
                      <Tooltip
                        title={values.options.length >= 10 && 'Maximum of 10 options reached'}
                      >
                        <span>
                          <Button
                            size='small'
                            variant='outlined'
                            startIcon={<Add />}
                            disabled={values.options.length >= 10}
                            onClick={() =>
                              push({ id: uuidv4(), name: '', image: { file: null, preview: '' } })
                            }
                          >
                            Add Option
                          </Button>
                        </span>
                      </Tooltip>
                    )}
                  </div>
                )}
              </FieldArray>

              {hasFormStarted || (
                <Button
                  type='submit'
                  variant='contained'
                  startIcon={<Notes />}
                  loading={isSubmitting || updatePollStatus.isLoading}
                >
                  Save Poll
                </Button>
              )}
            </CardContent>

            <AlertDialog
              open={alertOpen}
              setOpen={setAlertOpen}
              dialogTitle='Confirm Delete'
              onAffirmed={handleDeleteAffirmation}
              dialogContent={
                <>
                  Are you sure you want to delete&nbsp;
                  <strong>Poll {poll.index + 1}</strong>?
                </>
              }
            />
          </Card>
        </Form>
      )}
    </Formik>
  );
};

export default PollCard;
