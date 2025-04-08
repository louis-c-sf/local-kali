import { createQueryKeys } from '@lukemorales/query-key-factory';
import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  UseQueryOptions,
} from '@tanstack/react-query';
import { isAxiosError } from 'axios';

import { axiosClient, useAxios } from '@/api/axiosClient';
import { FeatureType } from '@/api/ipWhitelists';
import {
  ApiErrorResponseTemplate,
  ApiSuccessResponseTemplate,
  RbacDefaultRole,
} from '@/api/types';
import type { SortOrder } from '@/pages/Settings/SettingsRoles/types';
import { queryClient } from '@/utils/queryClient';

import { auth0AccountKeys } from './auth0Account/keys';
import { useCompany } from './company';

export type ExperimentalFeature = {
  sleekflow_company_id: string;
  sleekflow_staff_id: string;
  created_at: string;
  updated_at: string;
  feature_id: string;
  id: string;
  sys_type_name: string;
  is_enabled: boolean;
};

export interface UserWorkspace {
  is_default: boolean;
  server_location: string;
  sleekflow_company_id: string;
}

export const tenentHubKeys = createQueryKeys('tenant-hub', {
  getUserWorkspaces: null,
  experimentalFeatures: null,
  enabledExperimentalFeatures: null,
  allRoles: (companyId: string) => [companyId],
  usersByRole: (
    roleId: string,
    companyId: string,
    sort_order?: SortOrder,
    sort_by?: string,
    search_query?: string,
  ) => [roleId, companyId, sort_order, sort_by, search_query],
});

interface UseUserWorkspacesOptions<T>
  extends Omit<UseQueryOptions<UserWorkspace[], Error, T>, 'queryKey'> {
  select?: (data: UserWorkspace[]) => T;
}

const getUserWorkspacesQueryOptions = {
  queryKey: tenentHubKeys.getUserWorkspaces,
  queryFn: async () => {
    try {
      const result = await axiosClient.post<
        ApiSuccessResponseTemplate<{
          user_workspaces: UserWorkspace[];
        }>
      >(
        '/v1/tenant-hub/UserWorkspaces/GetUserWorkspaces',
        {},
        { baseURL: import.meta.env.VITE_SLEEKFLOW_API_BASE_URL },
      );

      return result.data.data.user_workspaces;
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 500) {
        queryClient.invalidateQueries({
          queryKey: auth0AccountKeys.getAuth0AccountIsCompanyRegistered,
        });
      }

      throw error;
    }
  },
  staleTime: Infinity,
  gcTime: Infinity,
  throwOnError: false,
};

export const useUserWorkspaces = <T = UserWorkspace[]>(
  options: UseUserWorkspacesOptions<T> = {},
) => {
  return useQuery({
    ...getUserWorkspacesQueryOptions,
    ...options,
  });
};

const findDefaultWorkspace = (workspaces: UserWorkspace[]) =>
  workspaces.find((w) => w.is_default) || workspaces[0];

export const getUserDefaultWorkspace = async () => {
  const userWorkspaces = await queryClient.ensureQueryData(
    getUserWorkspacesQueryOptions,
  );
  return findDefaultWorkspace(userWorkspaces);
};

export const useUserDefaultWorkspace = () =>
  useUserWorkspaces({ select: findDefaultWorkspace });

export function useUpsertStaffExperimentalFeatures() {
  const axios = useAxios();

  return useMutation({
    mutationFn: async (data: {
      staff_experimental_features: {
        feature_id: string;
        is_enabled: boolean;
      }[];
    }) => {
      const result = await axios.post<
        | ApiSuccessResponseTemplate<{
            company_features: ExperimentalFeature[];
            user_features: ExperimentalFeature[];
          }>
        | ApiErrorResponseTemplate
      >(
        '/v1/tenant-hub/authorized/ExperimentalFeatures/UpsertStaffExperimentalFeatures',
        data,
        {
          baseURL: import.meta.env.VITE_SLEEKFLOW_API_BASE_URL,
        },
      );

      if (!result.data.success) {
        throw new Error(result.data.message);
      }

      return result.data;
    },
  });
}

export function useUpsertCompanyExperimentalFeatures() {
  const axios = useAxios();

  return useMutation({
    mutationFn: async (data: {
      company_experimental_features: {
        feature_id: string;
        is_enabled: boolean;
      }[];
    }) => {
      const result = await axios.post<
        ApiSuccessResponseTemplate<{
          company_features: ExperimentalFeature[];
          user_features: ExperimentalFeature[];
        }>
      >(
        '/v1/tenant-hub/authorized/ExperimentalFeatures/UpsertCompanyExperimentalFeatures',
        data,
        {
          baseURL: import.meta.env.VITE_SLEEKFLOW_API_BASE_URL,
        },
      );

      return result.data;
    },
  });
}

export function useGetExperimentalFeatures() {
  const axios = useAxios();

  return useQuery({
    queryKey: tenentHubKeys.experimentalFeatures,
    queryFn: async () => {
      const result = await axios.post<
        ApiSuccessResponseTemplate<{
          company_features: FeatureType[];
          staff_features: FeatureType[];
        }>
      >(
        '/v1/tenant-hub/authorized/ExperimentalFeatures/GetExperimentalFeatures',
        {},
        {
          baseURL: import.meta.env.VITE_SLEEKFLOW_API_BASE_URL,
        },
      );

      return result.data;
    },
  });
}

export function useGetEnabledExperimentalFeatures() {
  const axios = useAxios();
  return useQuery({
    queryKey: tenentHubKeys.enabledExperimentalFeatures,
    queryFn: async () => {
      const result = await axios.post<
        ApiSuccessResponseTemplate<{
          enabled_company_features: ExperimentalFeature[];
          enabled_staff_features: ExperimentalFeature[];
        }>
      >(
        '/v1/tenant-hub/authorized/ExperimentalFeatures/GetEnabledExperimentalFeatures',
        {},
        {
          baseURL: import.meta.env.VITE_SLEEKFLOW_API_BASE_URL,
        },
      );
      return result.data;
    },
  });
}

type SharedInvitationAcceptParams = {
  username: string;
  lastName: string;
  firstName: string;
  displayName: string;
  position: string;
  timeZoneInfoId: string;
  phoneNumber: string;
  password: string;
};
type LinkInvitationRequest = {
  shareableId: string;
  invite_shared_user_object: SharedInvitationAcceptParams & {
    email: string;
    confirmPassword: string;
  };
  location: string;
};
export type LinkInvitationResponse = {
  data: null;
  date_time: string;
  error_code: number;
  error_context: {
    Code: number;
    InnerException: null;
  };
  http_status_code: number;
  message: string;
  request_id: string;
  success: boolean;
};

export function useCompleteLinkInvitation({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: LinkInvitationResponse) => void;
  onError?: (error: Error) => void;
}) {
  const axios = useAxios();

  return useMutation({
    mutationFn: async (data: LinkInvitationRequest) => {
      const result = await axios.post(
        '/v1/tenant-hub/invite/CompleteLinkInvitation',
        data,
        {
          baseURL: import.meta.env.VITE_SLEEKFLOW_API_BASE_URL,
        },
      );

      if (!result.data.success) {
        throw new Error(result.data.message);
      }

      return result.data;
    },
    onSuccess,
    onError,
  });
}

type EmailInvitationRequest = {
  username: string;
  sleekflow_user_id: string | null;
  tenanthub_user_id: string | null;
  displayName: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  password: string;
  token: string | null;
  position: string;
  timeZoneInfoId: string;
  location: string | null;
};

export type EmailInvitationResponse = {
  success: boolean;
  data: {
    message: string;
  };
  message: string;
  date_time: string;
  http_status_code: number;
  error_code: number;
  error_context: {};
  request_id: string;
};

export default function useCompleteEmailInvitation({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: EmailInvitationResponse) => void;
  onError?: (error: Error) => void;
}) {
  const axios = useAxios();

  return useMutation({
    mutationFn: async (data: EmailInvitationRequest) => {
      const result = await axios.post(
        '/v1/tenant-hub/invite/CompleteEmailInvitation',
        {
          ...data,
          location: data.location || 'eastasia',
        },
        {
          baseURL: import.meta.env.VITE_SLEEKFLOW_API_BASE_URL,
        },
      );

      if (!result.data.success) {
        throw new Error(result.data.message);
      }

      return result.data;
    },
    onSuccess,
    onError,
  });
}

export type Role = {
  id: string;
  name: RbacDefaultRole | string;
  description: string;
  user_count: number;
  is_default: boolean;
};

type GetAllRoles = {
  roles: Role[];
};
export type GetAllRolesResponse = ApiSuccessResponseTemplate<GetAllRoles>;

export function useGetAllRolesQuery<T = GetAllRoles>({
  companyId,
  enabled,
  select,
}: {
  companyId: string;
  enabled?: boolean;
  select?: (data: GetAllRoles) => T;
}) {
  const axios = useAxios();
  return useQuery({
    queryKey: tenentHubKeys.allRoles(companyId),
    queryFn: async () => {
      const result = await axios.post<
        GetAllRolesResponse | ApiErrorResponseTemplate
      >(
        '/v1/tenant-hub/authorized/Rbac/GetAllRolesInCompany',
        { company_id: companyId },
        {
          baseURL: import.meta.env.VITE_SLEEKFLOW_API_BASE_URL,
        },
      );

      if (!result.data.success) {
        throw new Error(result.data.message);
      }
      return result.data.data;
    },
    enabled,
    select,
  });
}

export const useDeleteRoleMutation = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}) => {
  const axiosClient = useAxios();
  const { data: companyId } = useCompany({
    select: (data) => data.id,
  });
  return useMutation({
    mutationFn: async ({ roleId }: { roleId: string }) => {
      const url = '/v1/tenant-hub/authorized/Rbac/removeRole';
      const response = await axiosClient.post(
        url,
        { company_id: companyId, role_id: roleId },
        {
          baseURL: import.meta.env.VITE_SLEEKFLOW_API_BASE_URL,
        },
      );

      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      return response.data;
    },
    onSuccess,
    onError,
  });
};

export type User = {
  created_at: string;
  display_name: string | null;
  email: string;
  first_name: string | null;
  id: string;
  last_name: string | null;
  metadata: Record<string, unknown>;
  phone_number: string | null;
  profile_picture_url: string | null;
  updated_at: string;
  user_workspaces: {
    additional_permissions: string[];
    is_default: boolean;
    metadata: Record<string, unknown>;
    sleekflow_company_id: string;
    sleekflow_role_ids: string[];
    sleekflow_staff_id: string;
    sleekflow_team_ids: string[];
    sleekflow_user_id: string;
  }[];
  username: string;
};

export type GetUsersByRoleResponse = {
  page_number: number;
  page_size: number;
  total_count: number;
  users: User[];
};

export function useGetUsersByRoleInfiniteQuery<T = GetUsersByRoleResponse>({
  roleId,
  companyId,
  page_size = 15,
  sort_order,
  sort_by,
  search_query,
  enabled = true,
  select,
}: {
  roleId: string;
  companyId: string;
  page_size?: number;
  sort_order?: SortOrder;
  sort_by?: string;
  search_query?: string;
  enabled?: boolean;
  select?: (data: InfiniteData<GetUsersByRoleResponse>) => InfiniteData<T>;
}) {
  const axios = useAxios();
  return useInfiniteQuery<GetUsersByRoleResponse, Error, InfiniteData<T>>({
    queryKey: tenentHubKeys.usersByRole(
      roleId,
      companyId,
      sort_order,
      sort_by,
      search_query,
    ),
    queryFn: async ({ pageParam = 1 }) => {
      const result = await axios.post<
        | ApiSuccessResponseTemplate<GetUsersByRoleResponse>
        | ApiErrorResponseTemplate
      >(
        '/v1/tenant-hub/authorized/Rbac/GetUsersByRole',
        {
          role_id: roleId,
          company_id: companyId,
          page_number: pageParam,
          page_size,
          sort_order,
          sort_by,
          search_query,
        },
        {
          baseURL: import.meta.env.VITE_SLEEKFLOW_API_BASE_URL,
        },
      );

      if (!result.data.success) {
        throw new Error(result.data.message);
      }

      return result.data.data;
    },
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.total_count / page_size);
      const nextPage = lastPage.page_number + 1;
      return nextPage <= totalPages ? nextPage : undefined;
    },
    initialPageParam: 1,
    select,
    enabled,
  });
}

export function useAssignUserToRoleMutation() {
  const axios = useAxios();

  return useMutation({
    mutationFn: async ({
      companyId,
      roleId,
      userId,
    }: {
      companyId: string;
      roleId: string;
      userId: string;
    }) => {
      const result = await axios.post<
        | ApiSuccessResponseTemplate<{ assignment_successful: boolean }>
        | ApiErrorResponseTemplate
      >(
        '/v1/tenant-hub/authorized/Rbac/AssignUserToRole',
        {
          company_id: companyId,
          role_id: roleId,
          user_id: userId,
        },
        {
          baseURL: import.meta.env.VITE_SLEEKFLOW_API_BASE_URL,
        },
      );

      if (!result.data.success) {
        throw new Error(result.data.message);
      }

      return result.data.data;
    },
  });
}

interface DuplicateRoleResponse {
  duplicated_rbac_role: {
    created_at: string;
    created_by: string | null;
    default_role_id: string;
    description: string;
    id: string;
    is_enabled: boolean;
    name: string;
    sleekflow_company_id: string;
    sys_type_name: string;
    updated_at: string;
    updated_by: string | null;
  };
}

export function useDuplicateRoleMutation({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: DuplicateRoleResponse) => void;
  onError?: (error: Error) => void;
}) {
  const axiosClient = useAxios();
  return useMutation({
    mutationFn: async ({
      companyId,
      roleId,
    }: {
      companyId: string;
      roleId: string;
    }) => {
      const url = '/v1/tenant-hub/authorized/Rbac/DuplicateRole';
      const result = await axiosClient.post<
        | ApiSuccessResponseTemplate<DuplicateRoleResponse>
        | ApiErrorResponseTemplate
      >(
        url,
        {
          company_id: companyId,
          role_id: roleId,
        },
        {
          baseURL: import.meta.env.VITE_SLEEKFLOW_API_BASE_URL,
        },
      );

      if (!result.data.success) {
        throw new Error(result.data.message);
      }
      return result.data.data;
    },
    onSuccess,
    onError,
  });
}

export function useRemoveUserFromRoleMutation() {
  const axios = useAxios();

  return useMutation({
    mutationFn: async ({
      userId,
      companyId,
      roleId,
    }: {
      companyId: string;
      roleId: string;
      userId: string;
    }) => {
      const result = await axios.post<
        | ApiSuccessResponseTemplate<{ removal_successful: boolean }>
        | ApiErrorResponseTemplate
      >(
        '/v1/tenant-hub/authorized/Rbac/RemoveUserFromRole',
        {
          company_id: companyId,
          role_id: roleId,
          user_id: userId,
        },
        {
          baseURL: import.meta.env.VITE_SLEEKFLOW_API_BASE_URL,
        },
      );

      if (!result.data.success) {
        throw new Error(result.data.message);
      }

      return result.data.data;
    },
  });
}

export function useResendInvitationEmailMutation({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: { success: boolean }) => void;
  onError?: (error: Error) => void;
}) {
  const axios = useAxios();

  return useMutation({
    mutationFn: async ({
      userId,
      location,
    }: {
      userId: string;
      location: string;
    }) => {
      const result = await axios.post<
        | ApiSuccessResponseTemplate<{ success: boolean }>
        | ApiErrorResponseTemplate
      >(
        '/v1/tenant-hub/authorized/Companies/ResendInvitationEmail',
        {
          sleekflowUserId: userId,
          location,
        },
        {
          baseURL: import.meta.env.VITE_SLEEKFLOW_API_BASE_URL,
        },
      );

      if (!result.data.success) {
        throw new Error(result.data.message);
      }

      return result.data.data;
    },
    onSuccess,
    onError,
  });
}
