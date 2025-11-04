interface BaseResponse {
  meta?: object;
  message: string;
  success: boolean;
}

interface PaginatedResponse<T> extends BaseResponse {
  data: {
    docs: T[];
    page: number;
    limit: number;
    totalDocs: number;
    totalPages: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    pagingCounter: number;
    prevPage: number | null;
    nextPage: number | null;
  };
}

interface NullResponse extends BaseResponse {
  data: null;
}

interface BaseErrorResponse extends BaseResponse {
  errors?: object | null;
  errorCode?: ErrorCode | null;
}

interface LoginResponse extends BaseResponse {
  data: {
    tokens: Tokens;
    user: CurrentUser;
  };
}

interface TokensResponse extends BaseResponse {
  data: Tokens;
}

interface ForgotVerifyOtpResponse extends BaseResponse {
  data: {
    email: string;
    resetToken: string;
  };
}

interface FormResponse extends BaseResponse {
  data: Form;
}

interface ElectionResultResponse extends BaseResponse {
  data: {
    createdAt: string;
    updatedAt: string;
    totalVotes: number;
    results: ElectionResult[];
    election: Omit<MinifiedElection, '_id'>;
  };
}

interface FormResultResponse extends BaseResponse {
  data: {
    createdAt: string;
    updatedAt: string;
    results: PollResult[];
    form: { name: string };
  };
}

interface FaceIdResponse extends BaseResponse {
  data: { signedUrl: string };
}

interface VoteResponse extends BaseResponse {
  data: { voteID: string };
}

interface VotedElectionsResponse extends BaseResponse {
  data: VotedElection[];
}

interface VotedFormsResponse extends BaseResponse {
  data: VotedForm[];
}

interface VerifyElectionVoteResponse extends BaseResponse {
  data: {
    message: string;
    voteTimestamp: number;
    status: VoteVerifyStatus;
    election: MinifiedElection;
  };
}

interface VerifyFormVoteResponse extends BaseResponse {
  data: {
    message: string;
    form: MinifiedForm;
    voteTimestamp: number;
    status: VoteVerifyStatus;
  };
}

interface AddVoteTokenResponse extends BaseResponse {
  data: { token: string };
}

interface AddContestantResponse extends BaseResponse {
  data: Contestant;
}

interface AddPartyResponse extends BaseResponse {
  data: Party;
}

interface AddElectionResponse extends BaseResponse {
  data: Election;
}

interface AddFormResponse extends BaseResponse {
  data: Form;
}

interface GetPartiesResponse extends BaseResponse {
  data: MinifiedParty[] | PaginatedResponse<Party>;
}

interface GetElectionContestantsResponse extends BaseResponse {
  data: ElectionContestant[];
}
