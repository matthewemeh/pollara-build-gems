interface ParameterizedPayload<Keys> {
  params?: Partial<Record<Keys, any>>;
}

interface AddContestantPayload {
  party?: string;
  gender: Gender;
  lastName: string;
  firstName: string;
  middleName?: string;
  stateOfOrigin: string;
  contestantImage: File;
}

interface UpdateContestantPayload extends Partial<AddContestantPayload> {
  id: string;
  isDeleted?: boolean;
}

type GetContestantsPayload = ParameterizedPayload<GetContestantsParameters>;

interface AddElectionPayload {
  name: string;
  endTime: string;
  startTime: string;
  delimitationCode?: string;
}

interface UpdateElectionPayload extends Partial<AddElectionPayload> {
  id: string;
}

type GetElectionsPayload = ParameterizedPayload<GetElectionsParameters>;

type GetUserElectionsPayload = ParameterizedPayload<GetUserElectionsParameters>;

interface ElectionContestantPayload {
  electionID: string;
  contestantID: string;
}

interface AddPartyPayload {
  motto?: string;
  longName: string;
  shortName: string;
  partyImage: File;
}

interface UpdatePartyPayload extends Partial<AddPartyPayload> {
  id: string;
}

type GetPartiesPayload = ParameterizedPayload<GetPartiesParameters>;

interface AddFormPayload {
  name: string;
  endTime: string;
  startTime: string;
  visibility?: Visibility;
  identityCheck?: boolean;
}

interface UpdateFormPayload extends Partial<AddFormPayload> {
  formID: string;
}

type GetFormsPayload = ParameterizedPayload<GetFormsParameters>;

type GetUserFormsPayload = ParameterizedPayload<GetUserFormsParameters>;

interface AddPollPayload {
  formID: string;
  question: string;
  options: OptionPayload[];
  optionsImageEnabled?: boolean;
  maxSelectableOptions?: number;
}

interface UpdatePollPayload
  extends Partial<Omit<AddPollPayload, 'formID' | 'optionsImageEnabled'>> {
  pollID: string;
  options?: Partial<OptionPayload>[];
}

interface GetPollsPayload extends ParameterizedPayload<GetPollsParameters> {
  formID: string;
}

interface RegisterFacePayload {
  image: File;
  otp: string;
}

interface RegisterAdminPayload {
  email: string;
  role: AdminRole;
  password: string;
  lastName: string;
  firstName: string;
  middleName?: string;
}

interface RegisterUserPayload {
  vin: string;
  email: string;
  gender?: Gender;
  address: string;
  password: string;
  lastName: string;
  firstName: string;
  occupation: string;
  middleName?: string;
  dateOfBirth: string;
  delimitationCode: string;
}

interface SendOtpPayload {
  email: string;
  subject: string;
  duration?: number;
}

interface VerifyOtpPayload {
  otp: string;
  email: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface ForgotPasswordPayload {
  email: string;
}

interface ResetPasswordPayload {
  email: string;
  password: string;
  resetToken: string;
}

interface RefreshTokenPayload {
  refreshToken: string;
}

interface AdminInvitePayload {
  userID: string;
  expiresAt?: string;
}

interface ModifyTokenPayload {
  tokenID: string;
  expiresAt?: number;
  statusCode?: AdminTokenStatus;
}

interface ElectionVotePayload {
  partyID: string;
  voteToken: string;
  electionID: string;
}

interface PollVote {
  pollID: string;
  optionIDs: string[];
}

interface FormVotePayload {
  formID: string;
  voteToken?: string;
  pollVotes: PollVote[];
}

interface VerifyVotePayload {
  voteID: string;
}

interface GetVotesPayload extends ParameterizedPayload<GetVotesParameters> {
  id: string;
}

type GetLogsPayload = ParameterizedPayload<GetLogsParameters>;

type GetUsersPayload = ParameterizedPayload<GetUsersParameters>;

type GetTokensPayload = ParameterizedPayload<GetTokensParameters>;

type GetResultsPayload = ParameterizedPayload<GetResultsParameters>;

type GetNotificationsPayload = ParameterizedPayload<GetNotificationsParameters>;
