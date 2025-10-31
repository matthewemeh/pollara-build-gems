import { object, string } from 'yup';

import constants from '../constants';

const { GENDERS, REGEX_RULES, ROLES } = constants;

export const registerAdminDetailsSchema = object({
  email: string().trim().email('Please enter a valid email').required('Please enter your email'),
  lastName: string()
    .trim()
    .min(2, 'Last name must be at least 2 characters')
    .max(64, 'Last name must be at most 64 characters')
    .required('Please enter your last name'),
  firstName: string()
    .trim()
    .min(2, 'First name must be at least 2 characters')
    .max(64, 'First name must be at most 64 characters')
    .required('Please enter your first name'),
  middleName: string()
    .trim()
    .min(2, 'Middle name must be at least 2 characters')
    .max(64, 'Middle name must be at most 64 characters'),
  role: string().oneOf(Object.values(ROLES), 'Role must be ADMIN or SUPER_ADMIN').required(),
});

export const registerUserCardDetailsSchema = object({
  vin: string().trim().required('Please enter your VIN'),
  address: string().trim().required('Please enter your address'),
  dateOfBirth: string().required('Please select your Date of Birth'),
  occupation: string().trim().required('Please enter your occupation'),
  delimitationCode: string().trim().required('Please enter your delimitation code'),
});

export const registerUserDetailsSchema = object({
  email: string().trim().email('Please enter a valid email').required('Please enter your email'),
  lastName: string()
    .trim()
    .min(2, 'Last name must be at least 2 characters')
    .max(64, 'Last name must be at most 64 characters')
    .required('Please enter your last name'),
  firstName: string()
    .trim()
    .min(2, 'First name must be at least 2 characters')
    .max(64, 'First name must be at most 64 characters')
    .required('Please enter your first name'),
  middleName: string()
    .trim()
    .min(2, 'Middle name must be at least 2 characters')
    .max(64, 'Middle name must be at most 64 characters'),
  gender: string()
    .oneOf(Object.values(GENDERS), 'Please select a valid gender')
    .required('Please select your gender'),
});

export const passwordSchema = object({
  password: string()
    .min(8, 'Password must be a minimum of 8 characters')
    .max(20, 'Password must be a maximum of 20 characters')
    .matches(
      REGEX_RULES.PASSWORD,
      'Password must have: UPPERCASE and lowercase letters, digits and special characters'
    )
    .required('Please enter your password'),
  confirmPassword: string()
    .test(
      'test-password-match',
      'Passwords do not match',
      (confirmPassword, context) => confirmPassword === context.parent.password
    )
    .required('Please re-type your password'),
});

export const loginSchema = object({
  email: string().trim().email().required('Please enter your email'),
  password: string().required('Please enter your password'),
});
