interface MongoProps {
  _id: string;
  __v: number;
  createdAt: string;
  updatedAt: string;
}

interface ListItem {
  data?: any;
  value: string;
  name: React.ReactNode;
}

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

interface Email {
  value: string;
  verified: boolean;
}

interface User extends Omit<MongoProps, '__v' | 'updatedAt'> {
  role: Role;
  email: Email;
  lastName: string;
  firstName: string;
  middleName?: string;
  isInvited?: boolean;
}

interface MinifiedUser {
  lastName: string;
  firstName: string;
  middleName?: string;
  email: { value: string };
}

interface CurrentUser {
  role: Role;
  email: string;
  faceID?: boolean;
  lastName: string;
  firstName: string;
  middleName?: string;
  emailVerified: boolean;
}

interface AuthStore {
  resetToken: string;
  isAuthenticated: boolean;
  prefersDarkMode: boolean;
  currentUser: CurrentUser;
}

interface Election {
  _id: string;
  name: string;
  endTime: string;
  startTime: string;
  hasEnded: boolean;
  hasStarted: boolean;
  delimitationCode: string;
}

interface VotedElection {
  election: string;
  createdAt: string;
}

interface VotedForm {
  form: string;
  createdAt: string;
}

interface Notification_ {
  _id: string;
  message: string;
  createdAt: string;
}

interface Log {
  user: MinifiedUser;
  _id: string;
  action: string;
  message: string;
  createdAt: string;
}

interface Party {
  _id: string;
  motto?: string;
  logoUrl: string;
  longName: string;
  shortName: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Form {
  _id: string;
  name: string;
  endTime: string;
  startTime: string;
  hasEnded: boolean;
  createdAt?: string;
  updatedAt?: string;
  hasStarted: boolean;
  visibility: Visibility;
  identityCheck: boolean;
  author?: string | Partial<User>;
}

interface Option {
  id: string;
  name: string;
  imageUrl?: string;
}

interface OptionPayload {
  id: string;
  name: string;
  image: { file: File | null; preview: string };
}

interface Poll {
  _id: string;
  index: number;
  question: string;
  createdAt?: string;
  updatedAt?: string;
  options: Option[];
  maxSelectableOptions: number;
  optionsImageEnabled: boolean;
  form: string | Partial<Form>;
}

interface Contestant {
  _id: string;
  party?: Party;
  gender: string;
  lastName: string;
  firstName: string;
  updatedAt?: string;
  createdAt?: string;
  middleName?: string;
  stateOfOrigin: string;
  profileImageUrl: string;
}

interface ElectionContestant {
  party: Party;
  contestant: Contestant;
}

interface ElectionResult extends Omit<MongoProps, '__v'> {
  party: Party;
  votes: number;
  contestants: MinifiedContestant[];
}

interface PollResult {
  totalVotes: number;
  options: { optionID: string; votes: number }[];
  poll: Omit<Poll, Exclude<keyof Poll, 'index' | 'options' | 'question'>>;
}

interface ElectionResultData extends Omit<MongoProps, '__v' | 'createdAt'> {
  totalVotes: number;
  election: MinifiedElection;
  results: { votes: number }[];
}

interface FormResultData extends Omit<MongoProps, '__v' | 'createdAt'> {
  form: { name: string; _id: string };
  results: { options: { votes: number }[]; totalVotes: number }[];
}

interface Vote {
  _id: string;
  hash: string;
  index: string;
  timestamp: string;
  isInvalid?: boolean;
}

interface AdminToken extends Omit<MongoProps, '__v'> {
  user: MinifiedUser;
  isActive: boolean;
  expiresAt?: string;
  hasExpired: boolean;
  statusCode?: AdminTokenStatus;
}
