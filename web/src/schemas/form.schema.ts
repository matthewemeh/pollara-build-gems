import { boolean, object, string, number, array, mixed } from 'yup';

import constants from '../constants';

const { VISIBILITY, SUPPORTED_FORMATS, SUPPORTED_MIME_TYPES, FILE_SIZE } = constants;

export const addFormSchema = object({
  identityCheck: boolean(),
  name: string().trim().required('Please enter the form name'),
  endTime: string().datetime().required('Please select form end time'),
  startTime: string().datetime().required('Please select form start time'),
  visibility: string().oneOf(Object.values(VISIBILITY), 'Please select a valid visibility'),
});

export const updateFormSchema = object({
  name: string().trim(),
  identityCheck: boolean(),
  endTime: string().datetime(),
  startTime: string().datetime(),
  visibility: string().oneOf(Object.values(VISIBILITY), 'Please select a valid visibility'),
});

export const addPollSchema = object({
  optionsImageEnabled: boolean(),
  question: string().trim().required('Question is required'),
  maxSelectableOptions: number()
    .min(1, 'At least 1 option must be selectable')
    .max(10, 'At most 10 options can be selected'),
  options: array()
    .of(
      object({
        id: string().trim().required(),
        name: string().trim().required('Option name is required'),
        image: object({
          preview: string(),
          file: mixed<File>()
            .nullable()
            .test(
              'fileType',
              `File format must be one of: ${SUPPORTED_FORMATS.toString()}`,
              value => !value || SUPPORTED_MIME_TYPES.includes(value.type)
            )
            .test(
              'fileSize',
              'File size must be less than 500 KB',
              value => !value || value.size <= FILE_SIZE.IMAGE
            ),
        }),
      })
    )
    .min(2, 'At least 2 options are required')
    .max(10, 'At most 10 options allowed'),
});

export const updatePollSchema = object({
  question: string().trim().required('Question is required'),
  maxSelectableOptions: number()
    .min(1, 'At least 1 option must be selectable')
    .max(10, 'At most 10 options can be selected'),
  options: array()
    .of(
      object({
        id: string().trim().required(),
        name: string().trim().required('Option name is required'),
        image: object({
          preview: string(),
          file: mixed<File>()
            .nullable()
            .test(
              'fileType',
              `File format must be one of: ${SUPPORTED_FORMATS.toString()}`,
              value => !value || SUPPORTED_MIME_TYPES.includes(value.type)
            )
            .test(
              'fileSize',
              'File size must be less than 500 KB',
              value => !value || value.size <= FILE_SIZE.IMAGE
            ),
        }),
      })
    )
    .min(2, 'At least 2 options are required')
    .max(10, 'At most 10 options allowed'),
});
