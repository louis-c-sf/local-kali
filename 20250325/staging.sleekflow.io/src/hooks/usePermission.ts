import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCookie } from 'react-use';

import { useAxios } from '@/api/axiosClient';
import { useGetStaffById, useSuspenseGetStaffById } from '@/api/company';
import {
  PermissionListResponse,
  settingsKeys,
  useGetIsRbacEnabledQuery,
  useGetIsRbacEnabledSuspenseQuery,
  useGetPermissionListByRoleNameQueries,
  useGetPermissionListByRoleNameSuspenseQueries,
} from '@/api/settings';
import { PERMISSION_DICT, PermissionKey } from '@/constants/permissions';
import { getUserId } from '@/utils/user';

import { useAuth } from './useAuth';

export function usePermission(options?: {
  isEnabledRbac?: boolean;
  suspense?: boolean;
}): {
  isLoading: boolean;
  check: (permissions: PermissionKey[]) => boolean[];
  setEnabled: (enabled: boolean) => void;
} {
  const { isEnabledRbac, suspense } = options || {};
  const { user } = useAuth();
  const userId = getUserId({ user });
  const getStaffById = suspense ? useSuspenseGetStaffById : useGetStaffById;
  const { data: staff } = getStaffById({
    userId,
    select: (data) => data[0],
  });
  const [enabled, setEnabled] = useState(isEnabledRbac || false);
  const rbacRoles = staff?.rbacRoles || [];
  const getPermissionListByRoleName = suspense
    ? useGetPermissionListByRoleNameSuspenseQueries
    : useGetPermissionListByRoleNameQueries;
  const results = getPermissionListByRoleName({
    roleNames: rbacRoles.map((role) => role.role_name),
    enabled: rbacRoles.length > 0 && enabled,
  });
  const axios = useAxios();
  const check = useCallback(
    (permissions: PermissionKey[]) => {
      const enabledPermissionsKeysFromServer = [
        ...new Set(results.flatMap((role) => role.data?.permissions || [])),
      ];

      const allowedPermission = permissions.map((key) => PERMISSION_DICT[key]);
      axios.interceptors.request.use(async (config) => {
        config.headers.set('X-Sleekflow-Rbac-Key', allowedPermission.flat());
        return config;
      });
      return allowedPermission.map((currentResource) =>
        currentResource?.every((item) =>
          enabledPermissionsKeysFromServer.includes(item),
        ),
      );
    },
    [results, axios],
  );

  return {
    isLoading: results.some((item) => item.isLoading),
    setEnabled,
    check,
  };
}

// the oldAccessControls should be the same length as the permissions, and if the oldAccessControls is undefined, it will be set to true
export type CheckWrapper = (
  permissions: PermissionKey[],
  oldAccessControls?: boolean[],
) => boolean[];

export function usePermissionWrapper(options?: { suspense?: boolean }) {
  const { suspense } = options || {};
  const getIsRbacEnabled = suspense
    ? useGetIsRbacEnabledSuspenseQuery
    : useGetIsRbacEnabledQuery;
  const { data, isLoading: isEnabledLoading } = getIsRbacEnabled({});
  const { check, setEnabled, isLoading } = usePermission({
    isEnabledRbac: !!data?.is_enabled,
    suspense,
  });

  useEffect(() => {
    if (data) {
      setEnabled(data.is_enabled);
    }
  }, [data, setEnabled]);

  const checkWrapper: CheckWrapper = useCallback(
    (permissions, oldAccessControls) => {
      if (data?.is_enabled) {
        return check(permissions);
      } else {
        return permissions.map((_, index) => {
          return oldAccessControls ? !!oldAccessControls?.[index] : true;
        });
      }
    },
    [check, data],
  );

  return {
    check: checkWrapper,
    isLoading: isEnabledLoading || isLoading,
    isEnabledRbac: !!data?.is_enabled,
  };
}

const SLEEP = 'sleep';

function flatPermissions(
  permissionArray: (undefined | PermissionListResponse)[],
) {
  const flatPermission = permissionArray
    .flatMap((item) => item?.permissions)
    .filter(Boolean);
  return [...new Set(flatPermission)].sort();
}

function compareOldAndNewPermissions(
  oldPermissionsArray: (undefined | PermissionListResponse)[],
  newPermissionsArray: (undefined | PermissionListResponse)[],
) {
  const oldPermissions = flatPermissions(oldPermissionsArray);
  const newPermissions = flatPermissions(newPermissionsArray);
  return oldPermissions.join() === newPermissions.join();
}

export function useRefetchPermission() {
  const navigate = useNavigate();
  const [value, updateCookie] = useCookie('sleeper');
  const { user } = useAuth();
  const userId = getUserId({ user });
  const { data: staff } = useGetStaffById({
    userId,
    select: (data) => data[0],
    throwOnError: false,
  });
  const rbacRoles = staff?.rbacRoles || [];
  const queryClient = useQueryClient();
  const previousPermissions = useRef(
    rbacRoles.map(
      (role) =>
        queryClient.getQueryData(
          settingsKeys.getPermissionListByRoleName(role.role_name),
        ) as PermissionListResponse,
    ),
  );

  const { data: isEnabledRbac } = useGetIsRbacEnabledQuery({
    throwOnError: false,
  });
  const permissionQueries = useGetPermissionListByRoleNameQueries({
    roleNames: rbacRoles.map((role) => role.role_name),
    throwOnError: false,
    enabled: false,
  });

  const refetch = useCallback(async () => {
    if (value === SLEEP || !isEnabledRbac?.is_enabled) {
      return;
    }
    const latestPermissions = await Promise.all(
      permissionQueries.map(async (result) => {
        return await result.refetch();
      }),
    );
    const inTenSec = new Date(new Date().getTime() + 10 * 1000);
    updateCookie(SLEEP, { expires: inTenSec });
    const isSame = compareOldAndNewPermissions(
      previousPermissions.current,
      latestPermissions.map((item) => item.data),
    );
    if (!isSame) {
      previousPermissions.current = latestPermissions
        .map((item) => item.data)
        .filter((item): item is PermissionListResponse => !!item?.permissions);
      navigate(0);
    }
  }, [
    isEnabledRbac?.is_enabled,
    navigate,
    permissionQueries,
    updateCookie,
    value,
  ]);

  return {
    isLoading: permissionQueries.some((item) => item.isLoading),
    refetch,
  };
}
