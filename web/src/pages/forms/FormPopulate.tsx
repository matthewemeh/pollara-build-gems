import { v4 as uuidv4 } from 'uuid';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, FieldArray } from 'formik';
import { Add, Delete, Poll } from '@mui/icons-material';
import { useRef, useContext, useEffect, useCallback } from 'react';
import { Button, TextField, IconButton, Tooltip } from '@mui/material';

import constants from '../../constants';
import { PATHS } from '../../routes/PathConstants';
import { showAlert, fileToBase64 } from '../../utils';
import { AppContext } from '../../contexts/AppContext';
import { addPollSchema } from '../../schemas/form.schema';
import { useAddPollMutation } from '../../services/apis/formApi';
import { BackButton, FileUploadInput, Switch } from '../../components';
import { useHandleReduxQueryError, useHandleReduxQuerySuccess } from '../../hooks';

const { SUPPORTED_FORMATS } = constants;

const FormPopulate = () => {
  const navigate = useNavigate();
  const [addPoll, addPollStatus] = useAddPollMutation();
  const formikResetRef = useRef<(() => void) | null>(null);
  const { formToPopulate, setFormToPopulate, setFormToPreview } = useContext(AppContext)!;

  const goBack = useCallback(() => {
    setFormToPopulate(null);
    navigate(PATHS.FORMS.USER);
  }, []);

  const handleOptionImageChange = useCallback(
    async (file: File | undefined, setFieldValue: any, optionName: string) => {
      // Helper to reset and show error
      const resetImage = (msg?: string) => {
        setFieldValue(optionName, { file: null, preview: '' });
        if (msg) showAlert({ msg, type: 'error' });
      };

      if (!file) return resetImage('Please select an option image');

      const preview = await fileToBase64(file);
      setFieldValue(optionName, { file, preview });
    },
    []
  );

  useEffect(() => {
    if (!formToPopulate) goBack();
    else setFormToPreview(formToPopulate);
  }, [formToPopulate]);

  useHandleReduxQueryError({
    error: addPollStatus.error,
    isError: addPollStatus.isError,
    refetch: () => {
      if (addPollStatus.originalArgs) addPoll(addPollStatus.originalArgs);
    },
  });

  useHandleReduxQuerySuccess({
    response: addPollStatus.data,
    isSuccess: addPollStatus.isSuccess,
    onSuccess: () => {
      formikResetRef.current?.();
    },
  });

  if (!formToPopulate) return;

  return (
    <section className='mx-auto flex flex-col gap-4 pt-8 sm:max-w-md max-sm:px-6 max-sm:w-full'>
      <div className='form-header mb-6'>
        <BackButton onClick={goBack} />
        <p className='form-heading'>Populate Form</p>
        <p className='form-subheading'>
          Add polls to&nbsp;
          <Link to={PATHS.FORMS.PREVIEW} className='text-primary-500 font-semibold hover:underline'>
            {formToPopulate.name}
          </Link>
        </p>
      </div>

      <Formik
        validationSchema={addPollSchema}
        initialValues={{
          question: '',
          maxSelectableOptions: 1,
          optionsImageEnabled: false,
          options: [
            { id: uuidv4(), name: '', image: { file: null, preview: '' } },
            { id: uuidv4(), name: '', image: { file: null, preview: '' } },
          ],
        }}
        onSubmit={(values, { setSubmitting, resetForm }) => {
          formikResetRef.current = resetForm;
          setSubmitting(false);

          if (values.optionsImageEnabled && values.options.some(option => !option.image?.file)) {
            showAlert({
              type: 'error',
              duration: 5000,
              msg: 'Please upload images for all options or disable option images.',
            });
            return;
          } else if (!values.optionsImageEnabled) {
            // discard option images if not enabled
            values.options.forEach(option => {
              option.image = { file: null, preview: '' };
            });
          }

          addPoll({ formID: formToPopulate._id, ...values });
        }}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
          isSubmitting,
          setFieldValue,
        }) => (
          <Form className='form -mt-4 !mb-5' onSubmit={handleSubmit}>
            <TextField
              required
              id='question'
              name='question'
              label='Question'
              value={values.question}
              error={touched.question && !!errors.question}
              helperText={touched.question && errors.question}
              onBlur={handleBlur}
              onChange={handleChange}
            />

            <TextField
              type='number'
              inputMode='numeric'
              id='maxSelectableOptions'
              name='maxSelectableOptions'
              label='Max Selectable Options'
              value={values.maxSelectableOptions}
              error={touched.maxSelectableOptions && !!errors.maxSelectableOptions}
              helperText={touched.maxSelectableOptions && errors.maxSelectableOptions}
              onBlur={handleBlur}
              onChange={handleChange}
            />

            <Tooltip title='Cannot be changed after poll has been added!'>
              <span>
                <Switch
                  className='!w-fit'
                  id='optionsImageEnabled'
                  name='optionsImageEnabled'
                  label='Enable image for options'
                  checked={values.optionsImageEnabled}
                  onBlur={handleBlur}
                  onChange={handleChange}
                />
              </span>
            </Tooltip>

            <FieldArray name='options'>
              {({ remove, push }) => (
                <div className='flex flex-col gap-3 mt-3'>
                  {values.options.map((option, index) => (
                    <div
                      key={option.id}
                      className='flex flex-col gap-2 border border-[rgba(0,0,0,0.2)] p-2 rounded-md shadow'
                    >
                      <div className='flex items-center gap-2'>
                        <TextField
                          fullWidth
                          value={option.name}
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
                        {values.options.length > 2 && (
                          <Tooltip title='Delete option'>
                            <IconButton color='error' onClick={() => remove(index)} size='small'>
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        )}
                      </div>

                      {values.optionsImageEnabled && (
                        <div className='flex items-center justify-between gap-2'>
                          <FileUploadInput
                            accept={SUPPORTED_FORMATS}
                            buttonText='Add Option Image'
                            required={values.optionsImageEnabled}
                            inputID={`options[${index}].image.file`}
                            inputName={`options[${index}].image.file`}
                            touched={touched.options?.[index]?.image?.file}
                            error={(errors.options?.[index] as any)?.image?.file}
                            onBlur={handleBlur}
                            onChange={e =>
                              handleOptionImageChange(
                                e.target.files?.[0],
                                setFieldValue,
                                `options[${index}].image`
                              )
                            }
                          />
                          {option.image?.preview && (
                            <img
                              alt='option preview'
                              src={option.image.preview}
                              className='size-12 object-cover rounded-md z-1 border border-[rgba(0,0,0,0.2)] shadow duration-300 hover:scale-200'
                            />
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  <Tooltip title={values.options.length >= 10 && 'Maximum of 10 options reached'}>
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
                </div>
              )}
            </FieldArray>

            <Button
              type='submit'
              className='!mt-4'
              variant='contained'
              startIcon={<Poll />}
              loading={isSubmitting || addPollStatus.isLoading}
            >
              Add Poll
            </Button>
          </Form>
        )}
      </Formik>
    </section>
  );
};

export default FormPopulate;
