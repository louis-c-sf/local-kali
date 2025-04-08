import type { User } from '@auth0/auth0-react';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { defaultShouldDehydrateQuery, QueryKey } from '@tanstack/react-query';
import { PersistQueryClientOptions } from '@tanstack/react-query-persist-client';
import { del, get, set } from 'idb-keyval';

import { auth0AccountKeys } from '@/api/auth0Account/keys';
import { companyKeys } from '@/api/company';
import { settingsKeys } from '@/api/settings';
import { tenentHubKeys } from '@/api/tenantHub';
import { getUserId } from './user';

/**
// https://github.com/tanstack/query/blob/main/packages/query-core/src/utils.ts
 * Checks if key `b` partially matches with key `a`.
 */
export function partialMatchKey(a: QueryKey, b: QueryKey): boolean;
export function partialMatchKey(a: any, b: any): boolean {
  if (a === b) {
    return true;
  }

  if (typeof a !== typeof b) {
    return false;
  }

  if (a && b && typeof a === 'object' && typeof b === 'object') {
    return !Object.keys(b).some((key) => !partialMatchKey(a[key], b[key]));
  }

  return false;
}

export const queryKeysToPersist: QueryKey[] = [
  companyKeys.company,
  companyKeys.getStaffById._def,
  companyKeys.getTeamList._def,
  tenentHubKeys.getUserWorkspaces,
  auth0AccountKeys.getAuth0AccountIsCompanyRegistered,
  settingsKeys.getIsRbacEnabled,
  settingsKeys.getPermissionListByRoleName._def,
  companyKeys.getCompanyUsage,
];

const ONE_WEEK = 1000 * 60 * 60 * 24 * 7;

export const createPersistOptions = (
  user: User | undefined,
): Omit<PersistQueryClientOptions, 'queryClient'> => ({
  persister: createAsyncStoragePersister({
    key: `query-client-${getUserId({ user }) || 'guest'}`,
    storage: {
      getItem: (key: string) => get(key),
      setItem: (key: string, value: string) => set(key, value),
      removeItem: (key: string) => del(key),
    },
  }),
  maxAge: ONE_WEEK,
  hydrateOptions: {
    defaultOptions: {
      queries: {
        gcTime: ONE_WEEK,
      },
    },
  },
  dehydrateOptions: {
    shouldDehydrateQuery: (query) =>
      defaultShouldDehydrateQuery(query) &&
      queryKeysToPersist.some((key) => partialMatchKey(query.queryKey, key)),
    shouldDehydrateMutation: () => false,
  },
});
