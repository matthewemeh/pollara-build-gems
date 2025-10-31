type PaginationParameters = 'page' | 'limit';

type SortParameters = 'sortBy';

type TimeParameters = 'startTime' | 'endTime';

type GetContestantsParameters =
  | PaginationParameters
  | SortParameters
  | 'party'
  | 'gender'
  | 'lastName'
  | 'firstName'
  | 'isDeleted';

type GetUserElectionsParameters = PaginationParameters | SortParameters | TimeParameters;

type GetElectionsParameters = GetUserElectionsParameters | 'delimitationCode';

type GetPartiesParameters = PaginationParameters | SortParameters;

type GetUserFormsParameters =
  | PaginationParameters
  | SortParameters
  | TimeParameters
  | 'name'
  | 'visibility'
  | 'identityCheck';

type GetPollsParameters = PaginationParameters | SortParameters | 'optionsImageEnabled';

type GetFormsParameters = PaginationParameters | SortParameters | TimeParameters | 'name';

type GetUsersParameters =
  | PaginationParameters
  | SortParameters
  | 'role'
  | 'email'
  | 'lastName'
  | 'firstName'
  | 'delimitationCode';

type GetVotesParameters = PaginationParameters | SortParameters;

type GetTokensParameters = PaginationParameters | SortParameters;

type GetLogsParameters = PaginationParameters | SortParameters | TimeParameters;

type GetResultsParameters = PaginationParameters | SortParameters | TimeParameters;

type GetNotificationsParameters = PaginationParameters | SortParameters | TimeParameters;
