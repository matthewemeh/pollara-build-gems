export default {
  USER_IMAGE_KEY: 'image',
  PARTY_IMAGE_KEY: 'partyImage',
  CONTESTANT_IMAGE_KEY: 'contestantImage',
  GENDERS: { MALE: 'MALE', FEMALE: 'FEMALE' },
  ADMIN_TOKEN_STATUSES: { REVOKED: 'REVOKED', ACTIVE: 'ACTIVE' },
  ROLES: { USER: 'USER', ADMIN: 'ADMIN', SUPER_ADMIN: 'SUPER_ADMIN' },
  FILE_SIZE: {
    IMAGE: 512_000, // 500 KB
  },
  SUPPORTED_FORMATS: '.png, .jpeg, .jpg',
  SUPPORTED_MIME_TYPES: ['image/png', 'image/jpeg', 'image/jpg'],
  REGEX_RULES: {
    ID: /^[a-f0-9]{24}$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,20}$/,
  },
  VISIBILITY: { PRIVATE: 'PRIVATE', PUBLIC: 'PUBLIC' },
  COLORS: {
    ERROR: '#ed3237',
    PRIMARY: {
      50: '#f2f8fd',
      100: '#e4f0fa',
      200: '#c2e0f5',
      300: '#8cc7ed',
      400: '#4faae1',
      500: '#2990ce',
      600: '#1a72af',
      700: '#165b8e',
      800: '#164d76',
      900: '#143752',
      950: '#102a41',
      dark: '#2c2c2c',
    },
  },
};
