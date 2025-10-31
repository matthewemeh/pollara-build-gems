export const PATHS = {
  AUTH: {
    LOGIN: '/auth',
    REGISTER_USER: '/auth/register',
    REGISTER_ADMIN: '/auth/register/admin',
    RESET_PASSWORD: '/auth/reset-password',
    FORGOT_PASSWORD: '/auth/forgot-password',
    VERIFY_OTP_PASSWORD: '/auth/forgot-password/verify-otp',
  },
  DASHBOARD: '/',
  LOGS: '/logs',
  USERS: '/users',
  TOKENS: '/tokens',
  PRIVACY_POLICY: '/privacy',
  CONTESTANTS: {
    FETCH: '/contestants',
    ADD: '/contestants/add',
    EDIT: '/contestants/edit',
  },
  PARTIES: {
    FETCH: '/parties',
    ADD: '/parties/add',
    EDIT: '/parties/edit',
  },
  ELECTIONS: {
    FETCH: '/elections',
    ADD: '/elections/add',
    EDIT: '/elections/edit',
    ELECTION: '/elections/:id',
    CONTESTANTS: '/elections/contestants',
  },
  FORMS: {
    FETCH: '/forms',
    USER: '/my-forms',
    ADD: '/my-forms/add',
    EDIT: '/my-forms/edit',
    FILL: '/forms/fill/:id',
    PREVIEW: '/my-forms/preview',
    POPULATE: '/my-forms/populate',
  },
  RESULTS: {
    ELECTION: {
      FETCH: '/results/election',
      RESULT: '/results/election/:id',
    },
    FORM: {
      FETCH: '/results/form',
      RESULT: '/results/form/:id',
    },
  },
  VOTES: {
    ELECTION: {
      FETCH: '/votes/election/:id',
      VERIFY: '/verify-vote/election',
    },
    FORM: {
      FETCH: '/votes/form/:id',
      VERIFY: '/verify-vote/form',
    },
  },
  NOTIFICATIONS: '/notifications',
  FACE_ID_REGISTER: '/face-id/register',
} as const;
