import { createQueryKeys } from '@lukemorales/query-key-factory';
import {
  queryOptions,
  useMutation,
  useQueries,
  useQuery,
  useSuspenseQueries,
  useSuspenseQuery,
} from '@tanstack/react-query';
import dayjs from 'dayjs';

import { axiosClient, useAxios } from '@/api/axiosClient';
import { PermissionKeyFromServer } from '@/api/permissionKeyFromServer';
import {
  SUBSCRIPTION_NAME,
  SUBSCRIPTION_TIER_FREE,
  SubscriptionPeriod,
} from '@/constants/subscription-plans';
import { isNotFoundError } from '@/errors/NotFoundError';
import { useMyProfile } from '@/hooks/useMyProfile';

import {
  AddOnsStatusDictType,
  AddOnsTypeDictType,
} from '../pages/Settings/SettingsAddOns/types';
import { useCompany } from './company';
import {
  ApiErrorResponseTemplate,
  ApiSuccessResponseTemplate,
  LegacyApiResponseTemplate,
  RoleType,
  ServiceTypes,
  SubscriptionPlansResponseType,
  SupportServiceResponseType,
  WorkingHours,
  WorkingHoursResponse,
} from './types';

export interface StaffValues {
  firstName?: string;
  lastName?: string;
  userName?: string;
  phoneNumber?: string;
  staffRole?: string;
  staffName?: string;
  position?: string;
  timeZoneInfoId?: string;
  message?: string;
  teamIds?: number[];
}

interface QrCode {
  qrcodeBase64: string;
  url: string;
  qrcodeUrl?: string;
}

interface ResetPasswordLink {
  url: string;
}

interface IsFeatureEnabledForRole {
  data: {
    is_feature_enabled: boolean;
  };
}

export const twoFactorAuthFeatureName = '2FA';
type TwoFactorAuthFeatureName = typeof twoFactorAuthFeatureName;
export const ipWhitelistFeatureName = 'IpWhitelist';
type IpWhitelistFeatureName = typeof ipWhitelistFeatureName;

export type IsFeatureEnabled = {
  is_feature_enabled_for_company: boolean;
  is_feature_enabled_for_roles_dict: {
    Admin: boolean;
    Staff: boolean;
    TeamAdmin: boolean;
  };
};

type WebVersion = {
  version: string;
};

type SwitchFeatureResponse = LegacyApiResponseTemplate<Record<string, never>>;
type IsFeatureEnabledResponse = LegacyApiResponseTemplate<IsFeatureEnabled>;

export interface Timezone {
  id: string;
  displayName: string;
}

export const settingsKeys = createQueryKeys('settings', {
  getStaffQrCodeById: (staffId) => [staffId],
  generateResetPasswordLinkById: (staffId) => [staffId],
  getIsFeatureEnabledForRole: ({ featureName, roleType }) => [
    {
      featureName,
      roleType,
    },
  ],
  getTimezoneList: null,
  getDefaultTimezone: null,
  getIsFeatureEnabled: ({
    featureName,
  }: {
    featureName: TwoFactorAuthFeatureName;
  }) => [featureName],
  getWebVersion: null,
  getSubscriptionAddOns: null,
  getSubscriptionAddOnsPurchase: (addOnsType) => [addOnsType],
  getSupportServices: null,
  getSubscriptionPlans: null,
  getSubscribeAvailableAddOns: (planId) => [planId],
  getMfaListById: (userId) => [userId],
  getMigrationSubscriptionPlanId: null,
  getCheckIsRoleNameExist: (roleName) => [roleName],
  getPermissionListByRoleName: (roleName) => [roleName],
  getRoleDetail: (roleId) => [roleId],
  getIsRbacEnabled: null,
  getBusinessHourConfig: null,
});

export const useStaffMutation = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const axiosClient = useAxios();
  return useMutation({
    mutationFn: async ({
      staffId,
      staff,
    }: {
      staffId: string;
      staff: StaffValues;
    }) => {
      const url = `/Company/Staff/${staffId}`;
      const response = await axiosClient.post(url, staff);
      return response.data;
    },
    onSuccess,
    onError,
  });
};

type DeleteStaff = {
  staff_id: string;
  user_id: string;
};

export const useDeleteStaffMutation = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const axiosClient = useAxios();
  return useMutation({
    mutationFn: async ({
      companyId,
      deleteStaff,
    }: {
      companyId: string;
      deleteStaff: DeleteStaff[];
    }) => {
      const url = `/v1/tenant-hub/authorized/Companies/DeleteCompanyStaffCompletely`;
      const response = await axiosClient.post(
        url,
        { company_id: companyId, staffs: deleteStaff },
        {
          baseURL: import.meta.env.VITE_SLEEKFLOW_API_BASE_URL,
        },
      );
      return response.data;
    },
    onSuccess,
    onError,
  });
};

export const useStaffQrCodeMutation = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const axiosClient = useAxios();
  return useMutation({
    mutationFn: async ({
      userId,
      qrCodeIdentity,
    }: {
      userId: string;
      qrCodeIdentity: string;
    }) => {
      const url = `/Company/Staff/Qrcode/${userId}`;
      const response = await axiosClient.post(url, { qrCodeIdentity });
      return response.data;
    },
    onSuccess,
    onError,
  });
};

export const useGetStaffByQrCodeByIdQuery = (
  {
    userId,
  }: {
    userId?: string;
  },
  options?: {
    enabled?: boolean;
  },
) => {
  const { enabled } = options || {};
  const axiosClient = useAxios();
  return useQuery({
    queryKey: settingsKeys.getStaffQrCodeById(userId),
    queryFn: async () => {
      const url = `/Company/Staff/Qrcode/${userId}`;
      const response = await axiosClient.get<QrCode>(url);
      return {
        ...response.data,
        qrcodeBase64: `data:image/png;base64, ${response.data.qrcodeBase64}`,
      };
    },
    enabled,
  });
};

export const useGenerateResetPasswordLinkByIdQuery = ({
  userId,
  enabled,
}: {
  userId: string;
  enabled?: boolean;
}) => {
  const axiosClient = useAxios();
  return useQuery({
    queryKey: settingsKeys.generateResetPasswordLinkById(userId),
    queryFn: async () => {
      const url = `/Company/Staff/Auth0/ResetPasswordLink`;
      const response = await axiosClient.post<ResetPasswordLink>(url, {
        staff_identity_id: userId,
      });
      return response.data;
    },
    enabled,
  });
};

export const useSendResetPasswordLinkMutation = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}) => {
  const axiosClient = useAxios();
  return useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      const url = '/auth0/account/RequestPasswordReset';
      const response = await axiosClient.post(url, { email });
      return response.data;
    },
    onSuccess,
    onError,
  });
};

export const useDeleteStaffProfilePictureMutation = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: any) => void;
  onError?: (error: unknown) => void;
}) => {
  const axiosClient = useAxios();
  return useMutation({
    mutationFn: async ({ staffId }: { staffId: string }) => {
      const url = `/Company/Staff/ProfilePicture/${staffId}`;
      const response = await axiosClient.delete(url);
      return response.data;
    },
    onSuccess,
    onError,
  });
};

export const useUploadStaffProfilePictureMutation = ({
  onMutate,
  onSuccess,
  onError,
  onSettled,
}: {
  onMutate?: () => void;
  onSuccess?: (data: any, variables: any, context: unknown) => void;
  onError?: (error: unknown, variables: any, context: any) => void;
  onSettled?: () => void;
}) => {
  const axiosClient = useAxios();
  return useMutation({
    mutationFn: async ({ staffId, file }: { staffId: string; file: File }) => {
      const url = `/Company/Staff/ProfilePicture/${staffId}`;
      const formData = new FormData();
      formData.append('files', file);
      const response = await axiosClient.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onMutate,
    onSuccess,
    onError,
    onSettled,
  });
};

export const useGetIsFeatureEnabledForRoleQuery = ({
  featureName,
  roleType,
}: {
  featureName: TwoFactorAuthFeatureName;
  roleType: string;
}) => {
  const axiosClient = useAxios();
  return useQuery({
    queryKey: settingsKeys.getIsFeatureEnabledForRole({
      featureName,
      roleType,
    }),
    queryFn: async () => {
      const url = '/TenantHub/EnabledFeatures/IsFeatureEnabledForRole';
      const response = await axiosClient.post<IsFeatureEnabledForRole>(url, {
        feature_name: featureName,
        role_name: roleType,
      });
      return response.data.data;
    },
  });
};

export const useGetTimezoneListQuery = <T = Timezone[]>({
  select,
}: {
  select?: (data: Timezone[]) => T;
}) => {
  const axiosClient = useAxios();
  return useQuery({
    queryKey: settingsKeys.getTimezoneList,
    queryFn: async () => {
      const url = '/company/timezone';
      const response = await axiosClient.get<Timezone[]>(url);
      return response.data;
    },
    select,
  });
};

export const useGetDefaultTimezoneQuery = <T = Timezone>({
  select,
}: {
  select?: (data: Timezone) => T;
}) => {
  const axiosClient = useAxios();
  return useQuery({
    queryKey: settingsKeys.getDefaultTimezone,
    queryFn: async () => {
      const url = '/timezone-v2';
      const response = await axiosClient.get<Timezone>(url);
      return response.data;
    },
    select,
  });
};

export const useGetFeatureEnablementQuery = <T = IsFeatureEnabled>({
  featureName,
  select,
}: {
  featureName: TwoFactorAuthFeatureName;
  select?: (data: IsFeatureEnabled) => T;
}) => {
  const axiosClient = useAxios();
  return useQuery({
    queryKey: settingsKeys.getIsFeatureEnabledForRole({
      featureName,
    }),
    queryFn: async () => {
      const url = '/TenantHub/EnabledFeatures/GetFeatureEnablements';
      const response = await axiosClient.post<IsFeatureEnabledResponse>(url, {
        feature_name: featureName,
      });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message);
    },
    select,
  });
};

const isFulfilled = <T>(
  input: PromiseSettledResult<T>,
): input is PromiseFulfilledResult<T> => input.status === 'fulfilled';

export const useSwitchFeatureForCompanyMutation = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const axiosClient = useAxios();
  return useMutation({
    mutationFn: async ({
      featureName,
      isEnabledForCompany,
    }: {
      featureName: TwoFactorAuthFeatureName | IpWhitelistFeatureName;
      isEnabledForCompany: boolean;
    }) => {
      const enableCompanyUrl =
        '/TenantHub/EnabledFeatures/EnableFeatureForCompany';
      const disableCompanyUrl =
        '/TenantHub/EnabledFeatures/DisableFeatureForCompany';
      const response = await axiosClient.post<SwitchFeatureResponse>(
        isEnabledForCompany ? enableCompanyUrl : disableCompanyUrl,
        {
          feature_name: featureName,
        },
      );
      return response.data;
    },
    onSuccess,
    onError,
  });
};
export const useSwitchFeatureForRolesMutation = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const axiosClient = useAxios();
  return useMutation({
    mutationFn: async ({
      featureName,
      enableRoles,
    }: {
      featureName: TwoFactorAuthFeatureName;
      enableRoles: { [key in RoleType]: boolean | undefined };
    }) => {
      const enableRoleUrl = '/TenantHub/EnabledFeatures/EnableFeatureForRole';
      const disableRoleUrl = '/TenantHub/EnabledFeatures/DisableFeatureForRole';
      const roleRequests = Object.entries(enableRoles)
        .filter(([_roleName, isEnable]) => isEnable !== undefined)
        .map(([roleName, isEnable]) => {
          return axiosClient.post<SwitchFeatureResponse>(
            isEnable ? enableRoleUrl : disableRoleUrl,
            {
              feature_name: featureName,
              role_name: roleName,
            },
          );
        });

      const response = await Promise.allSettled(roleRequests);

      return response.map((item) => {
        if (isFulfilled(item)) {
          return item.value?.data;
        }
        throw new Error('roleUpdateFailed');
      });
    },
    onSuccess,
    onError,
  });
};

type MfaSetting = {
  mfa_id: string;
  mfa_type: 'totp';
  confirmed: boolean;
  created_at: string;
};

type MfaSettingResponse = MfaSetting[] | object;

export const useGetMfaSettingListByIdQuery = <T = MfaSettingResponse>(
  { userId }: { userId: string },
  {
    enabled,
    select,
  }: { enabled?: boolean; select?: (data: MfaSettingResponse) => T },
) => {
  const axiosClient = useAxios();
  return useQuery({
    queryKey: settingsKeys.getMfaListById(userId),
    queryFn: async () => {
      const url = `/auth0/account/GetMfaList`;
      const response = await axiosClient.post<MfaSettingResponse>(url, {
        user_id: userId,
      });
      return response.data;
    },
    enabled,
    select,
  });
};

export const useRevokeTwoFactorAuthMutation = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const axiosClient = useAxios();
  return useMutation({
    mutationFn: async ({
      userId,
      mfaId,
    }: {
      userId: string;
      mfaId: string;
    }) => {
      const url = '/auth0/account/ResetMfa';
      const response = await axiosClient.post(url, {
        user_id: userId,
        mfa_id: mfaId,
      });
      return response.data;
    },
    onSuccess,
    onError,
  });
};

export const useGetWebVersionQuery = (
  { staffId }: { staffId?: string },
  { enabled }: { enabled?: boolean },
) => {
  const axiosClient = useAxios();
  return useQuery({
    queryKey: settingsKeys.getWebVersion,
    queryFn: async () => {
      const url = `/webapp/version/${staffId}`;
      const response = await axiosClient.get<WebVersion>(url);
      if (response.data) {
        return response.data;
      }
    },
    enabled,
  });
};

export const useUpdateWebVersionMutation = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const axiosClient = useAxios();
  return useMutation({
    mutationFn: async ({
      staffId,
      version,
    }: {
      staffId: string;
      version: WebVersion;
    }) => {
      const url = `/webapp/version/${staffId}`;
      const response = await axiosClient.post(url, version);
      if (response.data) {
        return response.data;
      }
    },
    onSuccess,
    onError,
  });
};

export type AddOnsResponseType = {
  amount: number;
  currency: string;
  id: string;
  purchasedQuantity: number;
  status: AddOnsStatusDictType;
  type: AddOnsTypeDictType;
  baseQuantity?: number;
};

export const useGetSubscriptionAddOnsQuery = (options?: {
  enabled?: boolean;
}) => {
  const axiosClient = useAxios();
  return useQuery({
    queryKey: settingsKeys.getSubscriptionAddOns,
    queryFn: async () => {
      const url = '/subscription/add-ons';
      const response = await axiosClient.get<AddOnsResponseType[]>(url);
      if (response.data) {
        return response.data;
      }
    },
    enabled: options?.enabled,
  });
};

export const useGetSupportServicesQuery = () => {
  const axiosClient = useAxios();
  return useQuery({
    queryKey: settingsKeys.getSupportServices,
    queryFn: async () => {
      const url = '/subscription/support-services';
      const response = await axiosClient.get<SupportServiceResponseType[]>(url);
      if (response.data) {
        return response.data;
      }

      throw new Error('useGetSupportServicesQuery error');
    },
  });
};

type OptionsType = {
  id: string;
  quantityPerUnit: number;
  purchasableUnit: number;
  amount: number;
};

export type AddOnsPurchasedResponseType = {
  type: AddOnsTypeDictType;
  totalQuantity: number;
  basePlanIncludedQuantity: number;
  purchasedQuantity: number;
  currency: string;
  currentUsageCycle: {
    from: string;
    to: string;
  };
  currentCycleUsage: number;
  options: OptionsType[];
};

export const useGetSubscriptionAddOnsPurchaseOptionsQuery = ({
  addOnsType,
  enabled,
}: {
  addOnsType: AddOnsTypeDictType;
  enabled?: boolean;
}) => {
  const axiosClient = useAxios();
  return useQuery({
    queryKey: settingsKeys.getSubscriptionAddOnsPurchase(addOnsType),
    queryFn: async () => {
      const url = `/subscription/add-ons/${addOnsType}/purchase-options`;
      const response = await axiosClient.get<AddOnsPurchasedResponseType>(url);
      if (response.data) {
        return response.data;
      }
    },
    enabled,
  });
};

export const transferPlanTierFreeToStartup = (planTier: string) => {
  if (planTier === SUBSCRIPTION_TIER_FREE) {
    return SUBSCRIPTION_NAME.startup;
  }
  return planTier;
};

export const useGetSubscriptionPlansQuery = () => {
  const axiosClient = useAxios();
  return useQuery({
    queryKey: settingsKeys.getSubscriptionPlans,
    queryFn: async () => {
      const url = '/subscription/plans';
      const response =
        await axiosClient.get<SubscriptionPlansResponseType>(url);
      if (response.data) {
        return {
          ...response.data,
          currentSubscriptionPlanTier: transferPlanTierFreeToStartup(
            response.data.currentSubscriptionPlanTier,
          ),
        };
      }
    },
  });
};

export const useUpdateSubscriptionPlanMutation = ({
  onError,
}: {
  onError?: (error: Error) => void;
}) => {
  const axiosClient = useAxios();
  return useMutation({
    mutationFn: async ({
      stripeId,
      successUrl,
      cancelUrl,
    }: {
      stripeId: string;
      successUrl: string;
      cancelUrl: string;
    }) => {
      const url = '/subscription/subscribe-plans';
      const response = await axiosClient.post(url, {
        baseSubscriptionPlanId: stripeId,
        addOns: [],
        successUrl,
        cancelUrl,
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.redirectUrl) {
        window.location.replace(data.redirectUrl);
      }
    },
    onError,
  });
};

export interface SubscriptionAddOn<T = ServiceTypes | AddOnsTypeDictType> {
  currency: string;
  id: string;
  subscriptionInterval: SubscriptionPeriod;
  type: T;
  multipleAddOnOptions?: { planId: string; quantity: number; amount: number }[];
  defaultPurchaseUnit: number;
  options: {
    amount: number;
    id: string;
    purchasableUnit: number;
    quantityPerUnit: number;
  }[];
}

type SubscriptionAddOnResponse = {
  availableAddOns: SubscriptionAddOn[];
};

export const useGetSubscribeAvailableAddOnsQuery = ({
  subscriptionPlanId,
  enabled,
}: {
  subscriptionPlanId: string;
  enabled?: boolean;
}) => {
  const axiosClient = useAxios();

  return useQuery({
    queryKey: settingsKeys.getSubscribeAvailableAddOns(subscriptionPlanId),
    queryFn: async () => {
      const url = `/subscription/plans/subscribe/${subscriptionPlanId}/add-ons`;
      const response = await axiosClient.get<SubscriptionAddOnResponse>(url);
      return response.data;
    },
    enabled,
  });
};

export type CancelPlanSurvey = {
  reason: string;
  additionalComment: string;
};

export const useCancelPlanSurveyMutation = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const axiosClient = useAxios();
  return useMutation({
    mutationFn: async ({ surveyData }: { surveyData: CancelPlanSurvey }) => {
      const url = '/subscription/submit-cancellation-survey';
      const response = await axiosClient.post(url, surveyData);
      return response.data;
    },
    onSuccess,
    onError,
  });
};

export const useInviteUserByEmailMutation = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const axiosClient = useAxios();
  const { data: myProfile } = useMyProfile();
  const userWorkspaces = myProfile?.userWorkspaces;

  return useMutation({
    mutationFn: async ({
      emails,
      role,
      teams,
    }: {
      emails: string[];
      role: string;
      teams: string[];
    }) => {
      const url = '/v1/tenant-hub/authorized/Companies/InviteUserByEmail';
      const inviteUsers = emails.map((email) => ({
        email,
        userRole: role,
      }));
      const response = await axiosClient.post(
        url,
        {
          invite_users: inviteUsers,
          team_ids: teams.map((team) => Number(team)),
          location: userWorkspaces?.[0]?.server_location || 'eastasia',
        },
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

interface InviteUserByLinkResponse {
  invitation_id: string;
}

export const useInviteUserByLinkMutation = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const axiosClient = useAxios();
  const { data: myProfile } = useMyProfile();
  const userWorkspaces = myProfile?.userWorkspaces;
  const location = userWorkspaces?.[0]?.server_location || 'eastasia';

  return useMutation({
    mutationFn: async ({
      expireDays,
      role,
      teams,
    }: {
      expireDays: number;
      role: string;
      teams: string[];
    }) => {
      const url = '/v1/tenant-hub/authorized/Companies/GenerateInviteLink';

      const response = await axiosClient.post<
        | ApiSuccessResponseTemplate<InviteUserByLinkResponse>
        | ApiErrorResponseTemplate
      >(
        url,
        {
          data: {
            role: role,
            team_ids: teams.map((team) => Number(team)),
            expiration_date: dayjs.utc().add(expireDays, 'days').toISOString(),
          },
          location,
          sleekflow_user_id: myProfile?.userInfo.id || '',
        },
        {
          baseURL: import.meta.env.VITE_SLEEKFLOW_API_BASE_URL,
        },
      );

      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      return `${window.location.origin}/invitation-link/link/${response.data.data.invitation_id}/${location}`; // TODO: replace with route constant
    },
    onSuccess,
    onError,
  });
};

type GetMigrationSubscriptionPlanIdResponse = {
  subscriptionPlanId: string;
};

export const useGetMigrationSubscriptionPlanIdQuery = (options?: {
  enabled?: boolean;
}) => {
  const axiosClient = useAxios();
  return useQuery({
    queryKey: settingsKeys.getMigrationSubscriptionPlanId,
    queryFn: async () => {
      const url = '/subscription/migration/subscription-plan-id';
      try {
        const response =
          await axiosClient.get<GetMigrationSubscriptionPlanIdResponse>(url);
        if (response.data) {
          return response.data;
        }
      } catch (error) {
        console.error('useGetMigrationSubscriptionPlanIdQuery error', error);
      }
    },
    throwOnError: false,
    enabled: options?.enabled,
  });
};

interface CheckIsRoleNameExistResponse {
  exists: boolean;
}

export const useCheckIsRoleNameExistQuery = ({
  roleName,
  enabled,
}: {
  roleName: string;
  enabled?: boolean;
}) => {
  const axiosClient = useAxios();
  const { data: companyId } = useCompany({
    select: (data) => data.id,
  });
  return useQuery({
    queryKey: settingsKeys.getCheckIsRoleNameExist(roleName),
    queryFn: async () => {
      const url = '/v1/tenant-hub/authorized/Rbac/IsTheRoleNameExisted';
      const response = await axiosClient.post<
        | ApiSuccessResponseTemplate<CheckIsRoleNameExistResponse>
        | ApiErrorResponseTemplate
      >(
        url,
        {
          role_name: roleName,
          company_id: companyId,
        },
        {
          baseURL: import.meta.env.VITE_SLEEKFLOW_API_BASE_URL,
        },
      );
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      return response.data.data;
    },
    enabled,
  });
};

export interface PermissionListResponse {
  permissions: PermissionKeyFromServer[];
}

const useGetPermissionListByRoleNameOptions = ({
  roleName,
  enabled,
}: {
  roleName: string;
  enabled?: boolean;
}) => {
  const axiosClient = useAxios();
  const { data: companyId } = useCompany({
    select: (data) => data.id,
  });
  return {
    queryKey: settingsKeys.getPermissionListByRoleName(roleName),
    queryFn: async () => {
      const url = '/v1/tenant-hub/authorized/Rbac/GetCompanyPolicies';
      const response = await axiosClient.post<
        | ApiSuccessResponseTemplate<PermissionListResponse>
        | ApiErrorResponseTemplate
      >(
        url,
        {
          role: roleName,
          company_id: companyId,
        },
        {
          baseURL: import.meta.env.VITE_SLEEKFLOW_API_BASE_URL,
        },
      );
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      return response.data.data;
    },
    enabled,
    staleTime: 120000,
  };
};

export const useGetPermissionListByRoleNameQuery = ({
  roleName,
  enabled,
}: {
  roleName: string;
  enabled?: boolean;
}) => {
  return useQuery(useGetPermissionListByRoleNameOptions({ roleName, enabled }));
};

const getPermissionListByRoleNameSuspenseOptions = <
  T = PermissionListResponse,
>({
  roleName,
  enabled,
  select,
  throwOnError,
  axiosClient,
  companyId,
}: {
  roleName: string;
  enabled?: boolean;
  select?: (data: PermissionListResponse) => T;
  throwOnError?: boolean;
  axiosClient: ReturnType<typeof useAxios>;
  companyId: string;
}) => {
  return {
    queryKey: settingsKeys.getPermissionListByRoleName(roleName),
    queryFn: async () => {
      const url = '/v1/tenant-hub/authorized/Rbac/GetCompanyPolicies';
      const response = await axiosClient.post<
        | ApiSuccessResponseTemplate<PermissionListResponse>
        | ApiErrorResponseTemplate
      >(
        url,
        {
          role: roleName,
          company_id: companyId,
        },
        {
          baseURL: import.meta.env.VITE_SLEEKFLOW_API_BASE_URL,
        },
      );
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      return response.data.data;
    },
    enabled,
    staleTime: 120000,
    gcTime: Infinity,
    select,
    throwOnError,
  };
};

export const useGetPermissionListByRoleNameQueries = <
  T = PermissionListResponse,
>({
  roleNames,
  enabled,
  select,
  throwOnError,
}: {
  roleNames: string[];
  enabled?: boolean;
  select?: (data: PermissionListResponse) => T;
  throwOnError?: boolean;
}) => {
  const axiosClient = useAxios();
  const { data: companyId } = useCompany({
    select: (data) => data.id,
    throwOnError,
  });
  return useQueries({
    queries: roleNames.map((roleName) =>
      getPermissionListByRoleNameSuspenseOptions({
        roleName,
        enabled,
        select,
        throwOnError,
        axiosClient,
        companyId: companyId || '',
      }),
    ),
  });
};

export const useGetPermissionListByRoleNameSuspenseQueries = <
  T = PermissionListResponse,
>({
  roleNames,
  enabled,
  select,
  throwOnError,
}: {
  roleNames: string[];
  enabled?: boolean;
  select?: (data: PermissionListResponse) => T;
  throwOnError?: boolean;
}) => {
  const axiosClient = useAxios();
  const { data: companyId } = useCompany({
    select: (data) => data.id,
    throwOnError,
  });
  return useSuspenseQueries({
    queries: roleNames.map((roleName) =>
      getPermissionListByRoleNameSuspenseOptions({
        roleName,
        enabled,
        select,
        throwOnError,
        axiosClient,
        companyId: companyId || '',
      }),
    ),
  });
};

interface CreateRole {
  roleName: string;
  description?: string;
}

export interface CreateRoleResponse {
  created_rbac_role: {
    description: string | null;
    id: string;
    name: string;
  };
}

export const useCreateRoleMutation = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const axiosClient = useAxios();
  const { data: companyId } = useCompany({
    select: (data) => data.id,
  });
  return useMutation({
    mutationFn: async (createdRole: CreateRole) => {
      const url = '/v1/tenant-hub/authorized/Rbac/CreateCustomRole';
      const response = await axiosClient.post<
        | ApiSuccessResponseTemplate<CreateRoleResponse>
        | ApiErrorResponseTemplate
      >(
        url,
        {
          role_name: createdRole.roleName,
          description: createdRole.description,
          company_id: companyId,
        },
        {
          baseURL: import.meta.env.VITE_SLEEKFLOW_API_BASE_URL,
        },
      );
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      return response.data.data;
    },
    onSuccess,
    onError,
  });
};

interface SaveRolePermission {
  roleName: string;
  permissions: PermissionKeyFromServer[];
  description?: string;
  roleId: string;
}

export interface SaveRolePermissionResponse {
  is_success: boolean;
  permissions: PermissionKeyFromServer[];
}

export const useSaveRolePermissionMutation = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const axiosClient = useAxios();
  const { data: companyId } = useCompany({
    select: (data) => data.id,
  });
  return useMutation({
    mutationFn: async (createdRole: SaveRolePermission) => {
      const url = '/v1/tenant-hub/authorized/Rbac/SaveCompanyPolicies';
      const response = await axiosClient.post<
        | ApiSuccessResponseTemplate<SaveRolePermissionResponse>
        | ApiErrorResponseTemplate
      >(
        url,
        {
          name: createdRole.roleName,
          permissions: createdRole.permissions,
          description: createdRole.description,
          role_id: createdRole.roleId,
          company_id: companyId,
        },
        {
          baseURL: import.meta.env.VITE_SLEEKFLOW_API_BASE_URL,
        },
      );
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      return response.data.data;
    },
    onSuccess,
    onError,
  });
};

interface RoleDetailResponse {
  name: string;
  description: string;
  permissions: PermissionKeyFromServer[];
}

export const useGetRoleDetailQuery = ({
  roleId,
  enabled,
}: {
  roleId: string;
  enabled?: boolean;
}) => {
  const axiosClient = useAxios();
  const { data: companyId } = useCompany({
    select: (data) => data.id,
  });
  return useQuery({
    queryKey: settingsKeys.getRoleDetail(roleId),
    queryFn: async () => {
      const url = '/v1/tenant-hub/authorized/Rbac/GetRolesDetail';
      const response = await axiosClient.post<
        | ApiSuccessResponseTemplate<RoleDetailResponse>
        | ApiErrorResponseTemplate
      >(
        url,
        {
          role_id: roleId,
          company_id: companyId,
        },
        {
          baseURL: import.meta.env.VITE_SLEEKFLOW_API_BASE_URL,
        },
      );
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      return response.data.data;
    },
    enabled,
  });
};

export interface IsRbacEnabledResponse {
  is_enabled: boolean;
}

export const getIsRbacEnabledQueryOptions = queryOptions({
  queryKey: settingsKeys.getIsRbacEnabled,
  gcTime: Infinity,
  staleTime: Infinity,
  queryFn: async () => {
    const url = '/v1/tenant-hub/authorized/Rbac/IsRbacEnabled';
    const response = await axiosClient.post<
      | ApiSuccessResponseTemplate<IsRbacEnabledResponse>
      | ApiErrorResponseTemplate
    >(
      url,
      {},
      {
        baseURL: import.meta.env.VITE_SLEEKFLOW_API_BASE_URL,
      },
    );
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    return response.data.data;
  },
});

export const useGetIsRbacEnabledQuery = (
  overrides: {
    enabled?: boolean;
    throwOnError?: boolean;
    staleTime?: number;
  } = {},
) => {
  return useQuery({
    ...getIsRbacEnabledQueryOptions,
    ...overrides,
  });
};

export const useGetIsRbacEnabledSuspenseQuery = () => {
  return useSuspenseQuery({ ...getIsRbacEnabledQueryOptions });
};

interface UserRole {
  userId: string;
  roleIds: string[];
}

export const useMultipleUpdateUserRoleMutation = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const axiosClient = useAxios();
  const { data: companyId } = useCompany({
    select: (data) => data.id,
  });
  return useMutation({
    mutationFn: async (userRole: UserRole) => {
      const url = '/v1/tenant-hub/authorized/Rbac/AssignUserToMultipleRoles';
      const response = await axiosClient.post<
        ApiSuccessResponseTemplate<any> | ApiErrorResponseTemplate
      >(
        url,
        {
          user_id: userRole.userId,
          role_ids: userRole.roleIds,
          company_id: companyId,
        },
        {
          baseURL: import.meta.env.VITE_SLEEKFLOW_API_BASE_URL,
        },
      );
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      return response.data.data;
    },
    onSuccess,
    onError,
  });
};

export function useGetBusinessHourConfigOptions() {
  const url = '/Company/BusinessHourConfig';
  const axios = useAxios();
  return queryOptions({
    queryKey: settingsKeys.getBusinessHourConfig,
    queryFn: async () => {
      try {
        const response = await axios.get<WorkingHoursResponse>(url);
        return response.data;
      } catch (error) {
        if (isNotFoundError(error)) {
          return null;
        }
      }
    },
  });
}

interface UpdateBusinessHourConfigParams {
  isEnabled: boolean;
  weeklyHours: WorkingHours;
  isCreate?: boolean;
}

export function useUpdateBusinessHourConfigMutation({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}) {
  const axios = useAxios();
  return useMutation({
    mutationFn: async ({
      isEnabled,
      weeklyHours,
      isCreate = false,
    }: UpdateBusinessHourConfigParams) => {
      const url = '/Company/BusinessHourConfig';
      const config = {
        isEnabled,
        weeklyHours,
      };
      if (isCreate) {
        const res = await axios.post(url, config);
        return res.data;
      } else {
        const res = await axios.put(url, config);
        return res.data;
      }
    },
    onSuccess,
    onError,
  });
}
