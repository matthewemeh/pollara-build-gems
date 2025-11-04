type Checkpoint = {
  title: string;
  subtitle: string;
};

type StorageType = 'localStorage' | 'sessionStorage';

type VoteVerifyStatus = 'success' | 'failed';

type Visibility = 'PRIVATE' | 'PUBLIC';

type AdminRole = 'ADMIN' | 'SUPER_ADMIN';

type Role = 'USER' | AdminRole;

type Gender = 'MALE' | 'FEMALE';

type AdminTokenStatus = 'REVOKED' | 'ACTIVE';

type MinifiedElection = Omit<
  Election,
  Exclude<keyof Election, 'name' | 'delimitationCode' | '_id'>
>;

type MinifiedForm = Omit<Form, Exclude<keyof Form, 'name' | '_id'>>;

type MinifiedParty = Omit<Party, 'motto' | 'createdAt' | 'updatedAt'>;

type MinifiedContestant = Omit<Contestant, 'party' | 'isDeleted' | 'createdAt' | 'updatedAt'>;

/**
 * Represents specific error codes used throughout the application.
 *
 * - `'E001'`: Indicates that user session has expired.
 * - `'E002'`: Indicates that refresh token has expired.
 * - `'E003'`: Indicates that Authorization was missing in latest request headers.
 * - `'E004'`: Indicates that `refreshToken` field was empty (or missing) in latest logout request body.
 * - `'E005'`: Indicates that `refreshToken` was provided in latest logout request body but is invalid (not found in database).
 * - `'E006'`: Indicates an attempt to register a duplicate user.
 * - `'E007'`: Indicates a failed super admin registration.
 * - `'E008'`: Indicates an invalid Vote Token was used to cast a vote.
 * - `'E009'`: Indicates an expired Vote Token was used to cast a vote.
 * - `'E010'`: Indicates a double (duplicate) vote attempt by a user.
 * - `'E011'`: Indicates an attempt by the SUPER ADMIN to delete his/her account
 * - `'E012'`: Indicates an idle server/service
 *
 * @remarks
 * Use this type to strongly type error codes and provide context-specific error handling.
 */
type ErrorCode =
  | 'E001'
  | 'E002'
  | 'E003'
  | 'E004'
  | 'E005'
  | 'E006'
  | 'E007'
  | 'E008'
  | 'E009'
  | 'E010'
  | 'E011'
  | 'E012';
