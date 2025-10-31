import { object, string } from 'yup';

import constants from '../constants';

const { REGEX_RULES } = constants;

export const verifyVoteSchema = object({
  voteID: string()
    .matches(REGEX_RULES.ID, 'Please enter a valid Vote ID')
    .required('Please enter a Vote ID'),
});
