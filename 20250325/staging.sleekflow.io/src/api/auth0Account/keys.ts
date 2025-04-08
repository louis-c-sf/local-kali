import { createQueryKeys } from '@lukemorales/query-key-factory';

export const auth0AccountKeys = createQueryKeys('auth0Account', {
  getAuth0AccountIsCompanyRegistered: null,
  getAuth0EmailVerified: null,
});
