import { createQueryKeys } from '@lukemorales/query-key-factory';
import type {
  TravisBackendChannelDomainViewModelsGetWhatsApp360DialogTemplateResponse,
  TravisBackendControllersMessageControllersMessagingChannelControllerGetAvailableChannelsResults,
  TravisBackendDataWhatsappCloudApiGetTemplatesResponse,
} from '@sleekflow/sleekflow-core-typescript-rxjs-apis';
import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
  UseQueryResult,
  useSuspenseQuery,
  UseSuspenseQueryOptions,
  UseSuspenseQueryResult,
} from '@tanstack/react-query';
import type { GenericAbortSignal } from 'axios';
import { useTranslation } from 'react-i18next';

import { axiosClient, useAxios } from '@/api/axiosClient';
import type {
  AssignmentRule,
  AutoTopUpMutationParam,
  AutoTopUpOptionsResponse,
  AutoTopUpProfileResponse,
  CloudApiBalanceResponse,
  Company,
  CompanyHashtag,
  CompanyUsageResponse,
  ConnectTelegramResponse,
  ConnectWhatsappCloudApiResponse,
  CustomUserProfileFieldOptions,
  CustomUserProfileFields,
  CustomUserProfileFieldsForEditColumns,
  Delete360ApiChannelRequest,
  DeleteCloudApiChannelRequest,
  DeleteFacebookChannelRequest,
  DeleteInstagramChannelRequest,
  DeleteLineChannelRequest,
  DeleteSmsChannelRequest,
  DeleteTelegramChannelRequest,
  DeleteTwilioChannelRequest,
  DeleteViberChannelRequest,
  DeleteWeChatChannelRequest,
  DeleteWhatsapp360DialogMediaFileRequest,
  DeleteWhatsapp360DialogMediaFileResponse,
  GetWabaChannelsResponse,
  Hashtag,
  Rename360DialogChannelRequest,
  RenameCloudApiChannelRequest,
  RenameFacebookChannelRequest,
  RenameLineChannelRequest,
  RenameSmsChannelRequest,
  RenameTelegramChannelRequest,
  RenameTwilioChannelRequest,
  RenameViberChannelRequest,
  RenameWeChatChannelRequest,
  Staff,
  Team,
  TwilioUsage,
  UploadWhatsapp360DialogMediaFileRequest,
  UploadWhatsapp360DialogMediaFileResponse,
  UploadWhatsappCloudMediaFileRequest,
  UploadWhatsappCloudMediaFileResponse,
  UserPersonalColumnsPreferencesNormalized,
} from '@/api/types';
import type { CloudAPIHeaderType } from '@/pages/Settings/SettingsInvoices/hooks/useGetCloudAPITopUp';
import { CloudAPIInvoiceResponse } from '@/pages/Settings/SettingsInvoices/types/invoiceTypes';
import type { StaffCore } from '@/services/companies/types';
import { getFullName } from '@/utils/formatting';
import { billingKeys } from './channels/whatsapp/queryKeys';

export const companyKeys = createQueryKeys('company', {
  getShopifyStatusList: (params: GetShopifyStatusListParams) => [{ ...params }],
  company: null,
  getAssignmentRules: ({
    offset = 0,
    limit = 500,
    triggerType,
  }: GetAssignmentRulesParams = {}) => [{ offset, limit, triggerType }],
  getStaffById: ({ userId }: { userId: string }) => [{ userId }],
  getCompanyTags: ({
    offset = 0,
    limit = 500,
    keyword,
    hashTagType,
  }: GetCompanyTagsParams = {}) => [{ offset, limit, hashTagType, keyword }],
  getTeamList: ({ offset = 0, limit = 300 }: GetTeamListParams = {}) => [
    { offset, limit },
  ],
  getAllStaffOverview: ({
    offset = 0,
    limit = 1000,
    filterParam,
  }: GetAllStaffParams = {}) => [{ offset, limit, filterParam }],
  getAllStaffOverviewCount: ({ filterParam }: GetAllStaffCountParams = {}) => [
    { filterParam },
  ],
  getAllStaff: ({ offset = 0, limit = 1000 }: GetAllStaffParams = {}) => [
    { offset, limit },
  ],
  getTeamListV1: ({ offset = 0, limit = 300 }: GetTeamListParams = {}) => [
    { offset, limit },
  ],
  getWhatsapp360DialogTemplate: ({
    offset,
    limit,
    whatsapp360DialogConfigId,
  }: Omit<GetWhatsapp360DialogTemplateParams, 'whatsapp360DialogConfigId'> & {
    whatsapp360DialogConfigId: string;
  }) => [
    whatsapp360DialogConfigId,
    ...(limit !== undefined || offset !== undefined ? [{ limit, offset }] : []),
  ],
  getWhatsAppCloudApiTemplate: ({
    wabaId,
    limit,
    offset,
  }: {
    wabaId: string;
    limit?: number;
    offset?: number;
  }) => [
    wabaId,
    ...(limit !== undefined || offset !== undefined ? [{ limit, offset }] : []),
  ],
  getWebHookUrl: (type) => [type],
  getConnectUrl: (type) => [type],
  getWabaChannels: (type) => [type],
  getThreadChannels: (threadId) => [threadId],
  getCompanyUsage: null,
  getCollaborators: ({
    offset = 0,
    limit = 1000,
  }: GetCollaboratorsParams = {}) => [{ offset, limit }],
  getSavedReplies: ({
    offset = 0,
    limit = 300,
    conversationId,
    keyword = '',
  }: {
    offset: number;
    limit: number;
    conversationId: string;
    keyword: string;
  }) => [{ offset, limit, conversationId, keyword }],
  getCloudApiBalance: null,
  getAutoTopProfile: (facebookBusinessId) => [facebookBusinessId],
  getAutoTopUpOptions: null,
  getCloudAPIInvoice: null,
  logo: (id: string) => [id],
  getPersonalColumnsPreferences: null,
  getTwilioUsage: null,
  getTwilioTopUpList: null,
  getImageWithUrls: (url: string) => [url],
  getShopifyDiscountSetting: null,
  getAvailableChannels: null,
});

export function getCompanyOptions<T>(
  overrides: {
    select?: (data: Company) => T;
    enabled?: boolean;
    throwOnError?: boolean;
    staleTime?: number;
  } = {},
) {
  const url = '/Company';

  return {
    queryKey: companyKeys.company,
    queryFn: async ({ signal }: { signal: GenericAbortSignal }) => {
      const response = await axiosClient.get<Company>(url, {
        signal,
      });
      return response.data;
    },
    meta: {
      url,
      description: 'Gets Company information',
    },
    ...overrides,
    gcTime: Infinity,
    staleTime: overrides.staleTime ?? 120000, // Avoid frequent api calls as company data is less change
  };
}

export function useCompany<T = Company>(
  overrides: {
    select?: (data: Company) => T;
    enabled?: boolean;
    throwOnError?: boolean;
    staleTime?: number;
  } = {},
): UseQueryResult<T, unknown> {
  return useQuery(getCompanyOptions<T>(overrides));
}

export function useSuspenseCompany<T = Company>({
  select,
}: {
  select?: (data: Company) => T;
} = {}): UseSuspenseQueryResult<T, unknown> {
  return useSuspenseQuery(getCompanyOptions<T>({ select }));
}

export function useCompanyLogoBase64<T>({
  select,
  enabled,
  params,
}: {
  select?: (data: string) => T;
  enabled?: boolean;
  params: {
    id: string;
  };
}): UseQueryResult<T, unknown> {
  const url = `/company/icon/${params.id}`;
  const axiosClient = useAxios();
  return useQuery({
    queryKey: companyKeys.logo(params.id),
    queryFn: async ({ signal }) => {
      const response = await axiosClient.get<Blob>(url, {
        signal,
        responseType: 'blob',
      });
      const reader = new FileReader();
      return await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(response.data);
      });
    },
    meta: {
      url,
      description: 'Gets Company logo',
    },
    select,
    enabled,
  });
}

export const useUploadComapnyLogo = () => {
  const axios = useAxios();
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      const fileBlob = new Blob([file], { type: file.type });
      formData.append('files', fileBlob, file.name);
      return axios.post('/Company/icon', formData);
    },
  });
};

export const TRIGGER_TYPE = {
  assignment: 0,
  fieldValueChanged: 1,
  messageReceived: 2,
  recurringJob: 3,
  scheduledJob: 4,
  contactAdded: 5,
  webhookTrigger: 6,
  newContactMessage: 7,
  shopifyNewCustomerTrigger: 8,
  shopifyNewOrUpdatedOrderTrigger: 9,
  shopifyNewAbandonedCart: 10,
  qRCodeAssigneeMapping: 11,
  facebookNewLeadgen: 12,
  qRCodeAssignTeamMapping: 13,
  zapierContactUpdated: 14,
  shopifyUpdatedCustomerTrigger: 15,
  facebookPostComment: 112,
  instagramMediaComment: 122,
  facebookIcebreaker: 111,
  instagramIcebreaker: 121,
  crmHubOnEntityCreated: 200,
  crmHubOnEntityFieldsChanged: 201,
  facebookLiveComment: 110,
  instagramLiveComment: 120,
  crmHubContactUpdated: 202,
  zapierNewIncomingMessage: 211,
  outgoingMessageTrigger: 311,
} as const;

type TriggerType = (typeof TRIGGER_TYPE)[keyof typeof TRIGGER_TYPE];

interface GetAssignmentRulesParams {
  offset?: number;
  limit?: number;
  triggerType?: TriggerType;
}

interface GetCompanyTagsParams {
  offset?: number;
  limit?: number;
  hashTagType?: 'Normal' | 'Shopify';
  keyword?: string;
}

export const useAssignmentRule = <T = AssignmentRule[]>(
  { offset = 0, limit = 500, triggerType }: GetAssignmentRulesParams,
  {
    select,
  }: {
    select?: (data: AssignmentRule[]) => T;
  },
) => {
  const axiosClient = useAxios();
  const url = '/Company/AssignmentRule';
  return useQuery({
    queryKey: companyKeys.getAssignmentRules({ offset, limit, triggerType }),
    queryFn: async ({ signal }) => {
      const response = await axiosClient.get<AssignmentRule[]>(url, {
        signal,
        params: { offset, limit, triggerType },
      });
      return response.data;
    },
    select,
    meta: {
      url,
    },
  });
};

export const useDeleteAssignmentRules = ({
  onMutate,
  onSuccess,
  onError,
}: {
  onMutate?: (variables: string[]) => unknown;
  onSuccess?: (data: unknown, variables: string[]) => void;
  onError?: (
    error: unknown,
    variables: string[],
    context: unknown | undefined,
  ) => void;
} = {}) => {
  const axiosClient = useAxios();
  const url = '/Company/AssignmentRule';
  const queryClient = useQueryClient();
  return useMutation<unknown, unknown, string[], unknown>({
    mutationFn: (assignmentRuleIds) => {
      return axiosClient.delete(url, { data: { assignmentRuleIds } });
    },
    onMutate,
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: companyKeys.getAssignmentRules._def,
      });
    },
    onSuccess,
    onError,
  });
};

export const useUndoDeleteAssignmentRules = ({
  onMutate,
}: {
  onMutate?: (variables: string[]) => unknown;
} = {}) => {
  const axiosClient = useAxios();
  const url = '/Company/AssignmentRule/Delete/Undo';
  const queryClient = useQueryClient();
  return useMutation<unknown, unknown, string[], unknown>({
    mutationFn: (assignmentRuleIds) => {
      return axiosClient.post(url, { assignmentRuleIds });
    },
    onMutate,
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: companyKeys.getAssignmentRules._def,
      });
    },
  });
};

function useGetStaffByIdOptions<T>({
  userId,
  ...overrides
}: {
  userId: string;
  select?: (data: Staff[]) => T;
  staleTime?: number;
  enabled?: boolean;
  throwOnError?: boolean;
}) {
  const url = `v2/Company/Staff/${userId}`;
  const axiosClient = useAxios();
  const { t } = useTranslation();

  return {
    queryKey: companyKeys.getStaffById({ userId }),
    queryFn: async ({ signal }: { signal: GenericAbortSignal }) => {
      const response = await axiosClient.get<Staff[]>(url, { signal });
      const result = response.data.map((staff) => ({
        ...staff,
        userInfo: {
          ...staff.userInfo,
          displayName:
            staff.userInfo.displayName?.trim() ||
            getFullName({
              firstName: staff.userInfo.firstName,
              lastName: staff.userInfo.lastName,
              fallback: staff.userInfo.email || t('general.unknown-label'),
            }),
        },
      }));

      return result;
    },
    meta: {
      url,
      description: 'Get staff by userId',
    },
    gcTime: Infinity,
    ...overrides,
  };
}

export function useGetStaffById<T = Staff[]>({
  userId,
  select,
  staleTime = 0,
  enabled = true,
  throwOnError,
}: {
  userId: string;
  select?: (data: Staff[]) => T;
  staleTime?: number;
  enabled?: boolean;
  throwOnError?: boolean;
}) {
  return useQuery(
    useGetStaffByIdOptions<T>({
      userId,
      select,
      staleTime,
      enabled,
      throwOnError,
    }),
  );
}

export function useSuspenseGetStaffById<T = Staff[]>({
  userId,
  select,
  staleTime = 0,
  enabled = true,
  throwOnError,
}: {
  userId: string;
  select?: (data: Staff[]) => T;
  staleTime?: number;
  enabled?: boolean;
  throwOnError?: boolean;
}) {
  return useSuspenseQuery(
    useGetStaffByIdOptions<T>({
      userId,
      select,
      staleTime,
      enabled,
      throwOnError,
    }),
  );
}

export interface FilterParam {
  searchString?: string;
  roles?: string[];
  ExcludeRoles?: string;
  teams?: string[];
  joinDateTime?: string[];
  IsInvitePending?: boolean;
  SortBy?: string;
  IsDesc?: boolean;
}

interface GetAllStaffParams {
  offset?: number;
  limit?: number;
  filterParam?: FilterParam;
}
export function useGetAllStaff<T = Staff[]>({
  offset = 0,
  limit = 1000,
  select,
  enabled,
}: {
  offset?: number;
  limit?: number;
  select?: (data: Staff[]) => T;
  enabled?: boolean;
} = {}) {
  const url = '/Company/Staff';
  const axiosClient = useAxios();
  return useQuery({
    queryKey: companyKeys.getAllStaff({ offset, limit }),
    queryFn: async ({ signal }) => {
      const response = await axiosClient.get<Staff[]>(url, {
        signal,
        params: {
          offset,
          limit,
        },
      });
      const result = response.data.map((staff) => ({
        ...staff,
        name: staff.name?.trim() ? staff.name?.trim() : staff.userInfo.userName,
      }));

      return result;
    },
    meta: {
      url,
      description: 'Get all staff',
    },
    select,
    staleTime: Infinity,
    enabled,
  });
}

interface GetAllStaffCountParams {
  filterParam?: FilterParam;
}

export function useGetStaffOverview<T = StaffCore[]>({
  offset = 0,
  limit = 1000,
  select,
  enabled,
  filterParam,
}: {
  offset?: number;
  limit?: number;
  select?: (data: StaffCore[]) => T;
  enabled?: boolean;
  filterParam?: FilterParam;
} = {}) {
  const url = '/Company/StaffOverviews';
  const axiosClient = useAxios();
  const { t } = useTranslation();

  return useQuery({
    queryKey: companyKeys.getAllStaffOverview({ offset, limit, filterParam }),
    queryFn: async ({ signal }) => {
      const params = new URLSearchParams({
        offset: offset.toString(),
        limit: limit.toString(),
      });

      if (filterParam?.searchString) {
        params.append('searchString', filterParam.searchString);
      }

      if (filterParam?.ExcludeRoles) {
        params.append('ExcludeRoles', filterParam.ExcludeRoles);
      }

      if (filterParam?.IsInvitePending !== undefined) {
        params.append(
          'IsInvitePending',
          filterParam.IsInvitePending.toString(),
        );
      }

      if (filterParam?.SortBy) {
        params.append('SortBy', filterParam.SortBy);
      }

      if (filterParam?.IsDesc !== undefined) {
        params.append('IsDesc', filterParam.IsDesc.toString());
      }

      if (filterParam?.roles) {
        const roles = filterParam.roles.join(',');
        params.append('searchRoles', roles);
      }

      if (filterParam?.teams) {
        filterParam?.teams?.forEach((team) => params.append('teams', team));
      }

      if (filterParam?.joinDateTime && filterParam?.joinDateTime.length > 0) {
        params.append('joinDateTime.from', filterParam.joinDateTime?.[0]);
        params.append('joinDateTime.to', filterParam.joinDateTime?.[1]);
      }

      const response = await axiosClient.get<StaffCore[]>(url, {
        signal,
        params,
      });

      const result = response.data.map((staff) => {
        let pictureUrl = staff.profilePictureUrl;

        pictureUrl = pictureUrl
          ? import.meta.env.VITE_API_BASE_URL + pictureUrl
          : pictureUrl;

        return {
          ...staff,
          displayName:
            staff.displayName?.trim() ||
            getFullName({
              firstName: staff.firstName,
              lastName: staff.lastName,
              fallback: staff.email || t('general.unknown-label'),
            }),
          profilePictureUrl: pictureUrl,
        };
      });

      return result;
    },
    meta: {
      url,
      description: 'Get all staff',
    },
    select,
    staleTime: Infinity,
    enabled,
  });
}

export function useGetStaffOverviewCount<T = number>({
  select,
  enabled,
  filterParam,
}: {
  select?: (data: number) => T;
  enabled?: boolean;
  filterParam?: FilterParam;
} = {}) {
  const url = '/Company/StaffOverviews/Count';
  const axiosClient = useAxios();

  return useQuery({
    queryKey: companyKeys.getAllStaffOverviewCount({ filterParam }),
    queryFn: async ({ signal }) => {
      const params = new URLSearchParams({});
      if (filterParam?.IsInvitePending !== undefined) {
        params.append(
          'IsInvitePending',
          filterParam.IsInvitePending.toString(),
        );
      }

      if (filterParam?.SortBy) {
        params.append('SortBy', filterParam.SortBy);
      }

      if (filterParam?.searchString) {
        params.append('searchString', filterParam.searchString);
      }

      if (filterParam?.roles) {
        const roles = filterParam.roles.join(',');
        params.append('searchRoles', roles);
      }

      if (filterParam?.teams) {
        filterParam?.teams?.forEach((team) => params.append('teams', team));
      }

      if (filterParam?.joinDateTime && filterParam?.joinDateTime.length > 0) {
        params.append('joinDateTime.from', filterParam.joinDateTime?.[0]);
        params.append('joinDateTime.to', filterParam.joinDateTime?.[1]);
      }

      const response = await axiosClient.get<number>(url, {
        signal,
        params,
      });

      return response.data;
    },
    meta: {
      url,
      description: 'Get staff count',
    },
    select,
    staleTime: Infinity,
    enabled,
  });
}

export function useFetchImageWithUrl({ url }: { url: string | undefined }) {
  const axiosClient = useAxios();
  return useQuery({
    enabled: !!url && url.startsWith(import.meta.env.VITE_API_BASE_URL),
    queryKey: companyKeys.getImageWithUrls(url!),
    queryFn: async ({ signal }) => {
      const response = await axiosClient.get(url!, {
        responseType: 'blob',
        signal,
      });
      const imageBlob = new Blob([response.data], {
        type: response.headers['content-type'],
      });
      return URL.createObjectURL(imageBlob);
    },
    meta: {
      url,
      description: 'Get Staff Picture',
    },
    throwOnError: false,
    staleTime: Infinity,
  });
}

export function useCompanyTags<T = CompanyHashtag[]>({
  offset = 0,
  limit = 500,
  keyword,
  hashTagType,
  select,
  enabled = true,
}: GetCompanyTagsParams & {
  select?: (data: CompanyHashtag[]) => T;
  enabled?: boolean;
} = {}) {
  const url = '/Company/Tags';
  const axiosClient = useAxios();
  return useQuery({
    enabled,
    queryKey: companyKeys.getCompanyTags({
      offset,
      limit,
      keyword,
      hashTagType,
    }),
    queryFn: async ({ signal }) => {
      const response = await axiosClient.get<CompanyHashtag[]>(url, {
        signal,
        params: {
          offset,
          limit,
          keyword,
          hashTagType,
        },
      });
      return response.data;
    },
    select,
    meta: {
      url,
      description: 'Get company tags',
    },
  });
}

export const useCompanyTagsMutation = () => {
  const axiosClient = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Hashtag[]) => {
      return await axiosClient.post('/Company/Tags', data);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: companyKeys.getCompanyTags._def,
      });
      queryClient.invalidateQueries({ queryKey: companyKeys.company });
    },
  });
};

export const useCompanyTagDeleteMutation = () => {
  const axiosClient = useAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Hashtag[]) => {
      return await axiosClient.delete('/Company/Tags', { data: data });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: companyKeys.getCompanyTags._def,
      });
      queryClient.invalidateQueries({ queryKey: companyKeys.company });
    },
  });
};

interface GetTeamListParams {
  offset?: number;
  limit?: number;
}

interface GetCollaboratorsParams {
  offset?: number;
  limit?: number;
}

// Note: `members` will always be an empty array
export function useTeamList<T = Team[]>(
  params: GetTeamListParams & {
    select?: (data: Team[]) => T;
    enabled?: boolean;
  } = {},
): UseQueryResult<T> {
  return useQuery(getUseTeamListArgs(params));
}

export function useSuspenseTeamList<T = Team[]>(
  params: GetTeamListParams & {
    select?: (data: Team[]) => T;
    enabled?: boolean;
  } = {},
) {
  return useSuspenseQuery(
    getUseTeamListArgs<T>(params) as UseSuspenseQueryOptions<Team[], any, T>,
  );
}

export function getUseTeamListArgs<T = Team[]>({
  offset = 0,
  limit = 300,
  select,
  enabled,
  staleTime,
}: GetTeamListParams & {
  select?: (data: Team[]) => T;
  enabled?: boolean;
  staleTime?: number;
} = {}): UseQueryOptions<Team[], any, T> {
  const url = '/v2/Company/Team';

  return {
    queryKey: companyKeys.getTeamList({ offset, limit }),
    queryFn: async ({ signal }: { signal: GenericAbortSignal }) => {
      const response = await axiosClient.get<Team[]>(url, {
        signal,
        params: { offset, limit },
      });
      return response.data;
    },
    select,
    enabled,
    staleTime,
    gcTime: Infinity,
  };
}

export function useTeamListV1<T = Team[]>({
  offset = 0,
  limit = 300,
  select,
  enabled,
}: GetTeamListParams & {
  select?: (data: Team[]) => T;
  enabled?: boolean;
} = {}): UseQueryResult<T> {
  const axiosClient = useAxios();
  const url = '/Company/Team';
  return useQuery({
    queryKey: companyKeys.getTeamListV1({ offset, limit }),
    queryFn: async ({ signal }) => {
      const response = await axiosClient.get<Team[]>(url, {
        signal,
        params: { offset, limit },
      });
      return response.data;
    },
    select,
    enabled,
  });
}

export const useDeleteUserProfileField = ({
  onMutate,
  onSuccess,
  onError,
}: {
  onMutate?: (variables: string[]) => unknown;
  onSuccess?: (data: unknown, variables: string[]) => void;
  onError?: (
    error: unknown,
    variables: string[],
    context: unknown | undefined,
  ) => void;
} = {}) => {
  const axiosClient = useAxios();
  const url = '/Company/UserProfileField';
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userProfileIds) => {
      return axiosClient.delete(url, {
        data: { userProfileFieldIds: userProfileIds },
      });
    },
    onMutate,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.company });
    },
    onSuccess,
    onError,
  });
};

interface GetWhatsapp360DialogTemplateParams {
  whatsapp360DialogConfigId: string;
  limit?: number;
  offset?: number;
}

export const useWhatsapp360DialogTemplateQuery = <
  T = TravisBackendChannelDomainViewModelsGetWhatsApp360DialogTemplateResponse,
>(
  {
    whatsapp360DialogConfigId,
    limit = 1000,
    offset = 0,
  }: GetWhatsapp360DialogTemplateParams,
  options?: {
    select?: (
      data: TravisBackendChannelDomainViewModelsGetWhatsApp360DialogTemplateResponse,
    ) => T;
    enabled?: boolean;
  },
) => {
  const axiosClient = useAxios();
  return useQuery({
    queryKey: companyKeys.getWhatsapp360DialogTemplate({
      offset,
      limit,
      whatsapp360DialogConfigId,
    }),
    queryFn: async ({ signal }) => {
      const url = `/Company/Whatsapp/360dialog/${whatsapp360DialogConfigId}/Template`;
      const response = await axiosClient.get(url, {
        signal,
        params: { offset, limit },
      });
      return response.data;
    },
    select: options?.select,
    enabled: options?.enabled,
    throwOnError: false,
  });
};

interface BookmarkWhatsapp360DialogTemplateMutationParams {
  bookmarkId?: number | null;
  isBookmarked: boolean;
  templateName?: string | null;
  templateNamespace?: string | null;
  templateLanguage?: string | null;
}

export const useBookmarkWhatsapp360DialogTemplateMutation = (
  configId: string,
) => {
  const axiosClient = useAxios();
  const queryClient = useQueryClient();

  const queryKey = companyKeys.getWhatsapp360DialogTemplate({
    whatsapp360DialogConfigId: configId,
  });

  return useMutation({
    mutationFn: ({
      bookmarkId,
      isBookmarked,
      templateName,
      templateNamespace,
      templateLanguage,
    }: BookmarkWhatsapp360DialogTemplateMutationParams) => {
      if (isBookmarked) {
        const url = `/company/whatsapp/360dialog/${configId}/template/bookmark`;
        const payload = {
          whatsapp360dialogConfigId: configId,
          templateName,
          templateNamespace,
          templateLanguage,
        };
        return axiosClient.post(url, payload);
      } else {
        const url = `/company/whatsapp/360dialog/${configId}/template/bookmark/${bookmarkId}`;
        const payload = {
          templateName,
          templateNamespace,
          templateLanguage,
        };
        return axiosClient.delete(url, { data: payload });
      }
    },
    onMutate: ({ isBookmarked, templateName, templateLanguage }) => {
      queryClient.cancelQueries({ queryKey });
      const [queryKeys, prevTemplates] = queryClient.getQueriesData({
        queryKey,
      });

      queryClient.setQueriesData<TravisBackendChannelDomainViewModelsGetWhatsApp360DialogTemplateResponse>(
        { queryKey },
        (data) => {
          if (!data?.whatsAppTemplates) return data;
          return {
            ...data,
            whatsAppTemplates: data.whatsAppTemplates.map((t) =>
              t.name === templateName && t.language === templateLanguage
                ? { ...t, isTemplateBookmarked: isBookmarked }
                : t,
            ),
          };
        },
      );

      return { queryKeys, prevTemplates };
    },
    onError: (err, _, context) => {
      const { queryKeys, prevTemplates } =
        (context as
          | { queryKeys: QueryKey[]; prevTemplates?: unknown[] }
          | undefined) || {};
      if (queryKeys && prevTemplates) {
        queryKeys.forEach((key, index) => {
          queryClient.setQueryData(key, prevTemplates[index]);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
};

export const useWhatsappCloudApiTemplateQuery = <
  T = TravisBackendDataWhatsappCloudApiGetTemplatesResponse,
>(
  {
    wabaId,
    limit = 20,
    offset = 0,
  }: { wabaId: string; limit?: number; offset?: number },
  {
    select,
    enabled,
  }: {
    select?: (data: TravisBackendDataWhatsappCloudApiGetTemplatesResponse) => T;
    enabled?: boolean;
  },
) => {
  const axiosClient = useAxios();
  return useQuery({
    queryKey: companyKeys.getWhatsAppCloudApiTemplate({
      wabaId,
      limit,
      offset,
    }),
    queryFn: async ({ signal }) => {
      const url = `/company/whatsapp/cloudapi/template`;
      const response =
        await axiosClient.get<TravisBackendDataWhatsappCloudApiGetTemplatesResponse>(
          url,
          {
            signal,
            params: { wabaId, limit, offset },
          },
        );
      return response.data;
    },
    select,
    enabled,
    throwOnError: false,
  });
};

interface BookmarkWhatsappCloudApiTemplateMutationParams {
  isBookmarked: boolean;
  templateId?: string | null;
  templateName?: string | null;
  templateLanguage?: string | null;
}

export const useBookmarkWhatsappCloudApiTemplateMutation = (
  wabaId?: string | null,
) => {
  const axiosClient = useAxios();
  const queryClient = useQueryClient();

  const queryKey = companyKeys.getWhatsAppCloudApiTemplate({
    wabaId: wabaId || '',
  });

  return useMutation({
    mutationFn: ({
      isBookmarked,
      templateId,
      templateName,
      templateLanguage,
    }: BookmarkWhatsappCloudApiTemplateMutationParams) => {
      if (isBookmarked) {
        const url = '/company/whatsapp/cloudapi/template/bookmark';
        const payload = {
          wabaId,
          templateId,
          templateName,
          templateLanguage,
        };
        return axiosClient.post(url, payload);
      } else {
        const url = '/company/whatsapp/cloudapi/template/bookmark';
        const payload = {
          wabaId,
          templateId,
        };
        return axiosClient.delete(url, { data: payload });
      }
    },
    onMutate: ({ isBookmarked, templateId }) => {
      queryClient.cancelQueries({ queryKey });
      const prevTemplates = queryClient.getQueryData(queryKey);

      queryClient.setQueryData<TravisBackendDataWhatsappCloudApiGetTemplatesResponse>(
        queryKey,
        (data) => {
          if (!data?.whatsappTemplates) return data;
          return {
            ...data,
            whatsappTemplates: data.whatsappTemplates.map((t) =>
              t.id === templateId
                ? { ...t, is_template_bookmarked: isBookmarked }
                : t,
            ),
          };
        },
      );

      return { prevTemplates };
    },
    onError: (err, _, context) => {
      const { prevTemplates } =
        (context as { prevTemplates?: unknown } | undefined) || {};
      if (prevTemplates) {
        queryClient.setQueryData(queryKey, prevTemplates);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
};

export const useUploadWhatsapp360DialogMediaFileMutation = ({
  onMutate,
  onSuccess,
}: {
  onMutate?: (variables: UploadWhatsapp360DialogMediaFileRequest) => unknown;
  onSuccess?: (
    data: UploadWhatsapp360DialogMediaFileResponse,
    variables: UploadWhatsapp360DialogMediaFileRequest,
  ) => void;
} = {}) => {
  const axiosClient = useAxios();
  return useMutation({
    mutationFn: async (data) => {
      const url = `/Company/Whatsapp/360dialog/${data.whatsapp360DialogConfigId}/File`;
      const formData = new FormData();
      data.displayName && formData.append('displayName', data.displayName);
      formData.append(
        'whatsappMediaType',
        data.whatsappMediaType.toLowerCase(),
      );
      formData.append('file', data.file);
      formData.append('isTemplateFile', JSON.stringify(data.isTemplateFile));
      const response =
        await axiosClient.post<UploadWhatsapp360DialogMediaFileResponse>(
          url,
          formData,
        );
      return response.data;
    },
    onMutate,
    onSuccess,
  });
};

export const useDeleteWhatsapp360DialogMediaFileMutation = ({
  onMutate,
  onSuccess,
}: {
  onMutate?: (variables: DeleteWhatsapp360DialogMediaFileRequest) => unknown;
  onSuccess?: (
    data: DeleteWhatsapp360DialogMediaFileResponse,
    variables: DeleteWhatsapp360DialogMediaFileRequest,
  ) => void;
} = {}) => {
  const axiosClient = useAxios();
  return useMutation({
    mutationFn: async (data) => {
      const url = `/Company/Whatsapp/360dialog/${data.whatsapp360DialogConfigId}/File/${data.fileId}`;
      const response =
        await axiosClient.delete<DeleteWhatsapp360DialogMediaFileResponse>(url);
      return response.data;
    },
    onMutate,
    onSuccess,
  });
};

export const useDeleteWhatsapp360DialogMediaFileWithoutConfigIdMutation = ({
  onMutate,
  onSuccess,
  onError,
}: {
  onMutate?: (variables: { fileId: string }) => unknown;
  onSuccess?: (
    data: DeleteWhatsapp360DialogMediaFileResponse,
    variables: { fileId: string },
  ) => void;

  onError?:
    | ((
        error: unknown,
        variables: { fileId: string },
        context: unknown,
      ) => unknown)
    | undefined;
} = {}) => {
  const axiosClient = useAxios();
  return useMutation({
    mutationFn: async (data) => {
      const url = `/Company/Whatsapp/360dialog/File/${data.fileId}`;
      const response =
        await axiosClient.delete<DeleteWhatsapp360DialogMediaFileResponse>(url);
      return response.data;
    },
    onMutate,
    onSuccess,
    onError,
  });
};

export const useUploadWhatsappCloudMediaFileMutation = ({
  onMutate,
  onSuccess,
}: {
  onMutate?: (variables: UploadWhatsappCloudMediaFileRequest) => unknown;
  onSuccess?: (
    data: UploadWhatsappCloudMediaFileResponse,
    variables: UploadWhatsappCloudMediaFileRequest,
  ) => void;
} = {}) => {
  const axiosClient = useAxios();
  return useMutation({
    mutationFn: async (data) => {
      const url = '/ExtendedMessage/File';
      const formData = new FormData();
      data.DisplayName && formData.append('DisplayName', data.DisplayName);
      formData.append('ExtendedMessageType', data.ExtendedMessageType);
      formData.append('MediaType', data.MediaType.toLowerCase());
      formData.append('Channel', data.Channel);
      formData.append('File', data.File);
      formData.append('IsTemplateFile', JSON.stringify(data.IsTemplateFile));
      const response =
        await axiosClient.post<UploadWhatsappCloudMediaFileResponse>(
          url,
          formData,
        );
      return response.data;
    },
    onMutate,
    onSuccess,
  });
};

export const useDeleteWhatsappCloudMediaFileMutation = ({
  onMutate,
  onSuccess,
  onError,
}: {
  onError?:
    | ((
        error: unknown,
        variables: { fileId: string },
        context: unknown,
      ) => unknown)
    | undefined;
  onSuccess?:
    | ((
        data: { message: string },
        variables: { fileId: string },
        context: unknown,
      ) => unknown)
    | undefined;
  onMutate?: ((variables: { fileId: string }) => unknown) | undefined;
}) => {
  const axiosClient = useAxios();

  return useMutation({
    mutationFn: async (data: { fileId: string }) => {
      const url = `/ExtendedMessage/File/${data.fileId}`;
      const response = await axiosClient.delete<{ message: string }>(url);
      return response.data;
    },
    onMutate,
    onSuccess,
    onError,
  });
};

export type UserProfileFieldsMutationParams = Partial<
  Omit<CustomUserProfileFields, 'customUserProfileFieldOptions'> & {
    customUserProfileFieldOptions: Omit<CustomUserProfileFieldOptions, 'id'>[];
  }
>[];

export const useUserProfileFieldsMutation = ({
  onSuccess,
  onError,
}: {
  onSuccess:
    | ((
        data: Company,
        variables: UserProfileFieldsMutationParams,
        context: unknown,
      ) => unknown)
    | undefined;
  onError:
    | ((
        error: unknown,
        variables: UserProfileFieldsMutationParams,
        context: unknown,
      ) => unknown)
    | undefined;
}) => {
  const url = '/Company/UserProfileFields';
  const axiosClient = useAxios();
  return useMutation({
    mutationFn: async (data: UserProfileFieldsMutationParams) => {
      const resp = await axiosClient.post<Company>(url, data);
      return resp.data;
    },
    onSuccess,
    onError,
  });
};

export const AppearOnlineDict = {
  Active: 'Active',
  Away: 'Away',
} as const;

export type UserStatusType =
  (typeof AppearOnlineDict)[keyof typeof AppearOnlineDict];

export function useStaffProfileMutation({
  onError,
}: {
  onError?:
    | ((
        error: unknown,
        variables: {
          [key: string]: any;
        },
        context: unknown,
      ) => unknown)
    | undefined;
}) {
  const queryClient = useQueryClient();
  const axiosClient = useAxios();

  return useMutation({
    mutationFn: async (data: { [key: string]: any; userId: string }) => {
      const url = `Company/Staff/${data.userId}`;
      const response = await axiosClient.post<Staff>(url, data);
      return response.data;
    },

    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: companyKeys.getStaffById({ userId: variables.userId }),
      });
    },
    onError,
  });
}

export function useGetWabaChannelsQuery<T = GetWabaChannelsResponse>({
  select,
}: {
  select?: (data: GetWabaChannelsResponse) => T;
}) {
  const axiosClient = useAxios();
  return useQuery({
    queryKey: companyKeys.getWabaChannels('waba'),
    queryFn: async () => {
      const response = await axiosClient.get<GetWabaChannelsResponse>(
        '/company/whatsapp/cloudapi/channel',
      );
      return response.data;
    },
    select,
  });
}

export function getCompanyUsageQueryOptions<T>(options?: {
  select?: (data: CompanyUsageResponse) => T;
  staleTime?: number;
}) {
  const url = '/company/usage';

  return {
    queryKey: companyKeys.getCompanyUsage,
    queryFn: async ({ signal }: { signal: AbortSignal }) => {
      const res = await axiosClient.get<CompanyUsageResponse>(url, { signal });
      return res.data;
    },
    ...options,
  };
}

export const useCompanyUsageQuery = <T = CompanyUsageResponse>(options?: {
  select?: (data: CompanyUsageResponse) => T;
}) => {
  return useQuery(getCompanyUsageQueryOptions<T>(options));
};

export const useSuspenseCompanyUsageQuery = <
  T = CompanyUsageResponse,
>(options?: {
  select?: (data: CompanyUsageResponse) => T;
}) => {
  return useSuspenseQuery(getCompanyUsageQueryOptions<T>(options));
};

interface UpdateCompanyParams {
  companyName?: string;
  timeZone?: number;
  timeZoneInfoId?: string;
}

export function useUpdateCompanyMutation({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}) {
  const axiosClient = useAxios();

  return useMutation({
    mutationFn: async ({
      companyName,
      timeZone,
      timeZoneInfoId,
    }: UpdateCompanyParams) => {
      const url = `Company/Update`;
      const response = await axiosClient.post(url, {
        companyName,
        timeZone,
        timeZoneInfoId,
      });
      return response.data;
    },
    onSuccess,
    onError,
  });
}

export const getCloudApiBalancesQueryOptions = <
  T = CloudApiBalanceResponse,
>(options: {
  select?: (data: CloudApiBalanceResponse) => T;
  enabled?: boolean;
  staleTime?: number;
}) => {
  const url = '/company/whatsapp/cloudapi/balances';
  return {
    queryKey: companyKeys.getCloudApiBalance,
    queryFn: async () => {
      const response = await axiosClient.get<CloudApiBalanceResponse>(url);
      return response.data;
    },
    meta: {
      url,
      description: 'Gets cloud api auto top up records',
    },
    ...options,
  };
};

export const useGetCloudApiBalanceRecordsQuery = <T = CloudApiBalanceResponse>(
  options: {
    select?: (data: CloudApiBalanceResponse) => T;
    enabled?: boolean;
  } = {},
) => useQuery(getCloudApiBalancesQueryOptions<T>(options));

export const useGetAutoTopUpProfileQuery = <T = AutoTopUpProfileResponse>(
  facebookBusinessId: string,
  {
    enabled,
    select,
  }: {
    select?: (data: AutoTopUpProfileResponse) => T;
    enabled?: boolean;
  },
) => {
  const axiosClient = useAxios();
  const url = `/company/whatsapp/cloudapi/auto-top-up/${facebookBusinessId}`;
  return useQuery({
    queryKey: companyKeys.getAutoTopProfile(facebookBusinessId),
    queryFn: async () => {
      const response = await axiosClient.get<AutoTopUpProfileResponse>(url);
      return response.data;
    },
    select,
    enabled,
    meta: {
      url,
      description: 'Gets cloud api auto top up profile',
    },
  });
};

export const useAutoTopUpMutation = (
  facebookBusinessId?: string | undefined,
  facebookWabaId?: string | undefined,
  onSuccess?: () => void,
  setRedirectLink?: (redirectLink: string) => void,
) => {
  const axiosClient = useAxios();
  const queryClient = useQueryClient();

  function fbbaAutoTopUp(params: AutoTopUpMutationParam) {
    return axiosClient.put('/company/whatsapp/cloudapi/auto-top-up', params);
  }

  function wabaAutoTopUp(params: AutoTopUpMutationParam) {
    return axiosClient.post(
      '/company/whatsapp/cloudapi/balances/waba/upsert-waba-balance-auto-top-up-profile',
      params,
    );
  }

  return useMutation({
    mutationFn: (params: AutoTopUpMutationParam) => {
      return params.autoTopUpProfile.facebook_waba_id
        ? wabaAutoTopUp(params)
        : fbbaAutoTopUp(params);
    },
    onSuccess: (result) => {
      if (result.data.payment_url) {
        if (setRedirectLink) {
          setRedirectLink?.(result.data.payment_url);
          return;
        } else {
          window.location.replace(result.data.payment_url);
        }
      }
      if (facebookBusinessId) {
        queryClient.invalidateQueries({
          queryKey: companyKeys.getAutoTopProfile(facebookBusinessId),
        });

        queryClient.invalidateQueries({
          queryKey: billingKeys.useGetWabaTopUpProfile({
            fbbaId: facebookBusinessId,
          }),
        });

        queryClient.invalidateQueries({
          queryKey: billingKeys.useGetWabaTopUpProfile({
            fbbaId: facebookBusinessId,
            wabaId: facebookWabaId,
          }),
        });
      }
      onSuccess?.();
    },
  });
};

export const useGetAutoTopUpSettingOptionsQuery = <
  T = AutoTopUpOptionsResponse,
>({ select }: { select?: (data: AutoTopUpOptionsResponse) => T } = {}) => {
  const axiosClient = useAxios();
  const url = '/company/whatsapp/cloudapi/auto-top-up/settings';
  return useQuery({
    queryKey: companyKeys.getAutoTopUpOptions,
    queryFn: async () => {
      const response = await axiosClient.get(url);
      if (response) {
        return response.data;
      }
    },
    select,
    meta: {
      url,
      description: 'Gets cloud api auto top up settings',
    },
  });
};

export function useConnectTelegramMutation() {
  const axiosClient = useAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (variables: {
      telegramBotToken: string;
      displayName: string;
    }) => {
      return await axiosClient.post<ConnectTelegramResponse>(
        '/Company/telegram/connect',
        variables,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.company });
    },
  });
}

interface WebhookURLResponse {
  Url: string;
}

export function useGetLineWebhookUrlQuery() {
  const axiosClient = useAxios();

  return useQuery({
    queryKey: companyKeys.getWebHookUrl('line'),
    queryFn: async () => {
      const response = await axiosClient.get<WebhookURLResponse>(
        '/Company/line/webhookURL',
      );
      return response.data.Url;
    },
  });
}

export function useGetTwilioSMSWebhookQuery() {
  const axiosClient = useAxios();

  return useQuery({
    queryKey: companyKeys.getWebHookUrl('twilio-sms'),
    queryFn: async () => {
      const response = await axiosClient.get<WebhookURLResponse>(
        '/Company/twilio/sms/webhookURL',
      );
      return response.data.Url;
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

export function useConnectLineMutation() {
  const axiosClient = useAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      basicId: string;
      channelId: string;
      channelSecret: string;
    }) => {
      // TODO: response type
      return axiosClient.post('/Company/line/connect', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.company });
    },
  });
}

export const useConnectViberMutation = () => {
  const axiosClient = useAxios();
  const url = '/Company/viber/connect';
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      displayName: string;
      viberBotSenderName: string;
      botToken: string;
    }) => {
      //TODO add response type
      const response = await axiosClient.post(url, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.company });
    },
  });
};

export function useConnectWhatsappMutation() {
  const axiosClient = useAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      channelName: string;
      wabaId: string;
      wabaPhoneNumberId: string;
    }) => {
      return await axiosClient.post<ConnectWhatsappCloudApiResponse>(
        '/company/whatsapp/cloudapi/channel',
        data,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.company });
    },
  });
}

export function useCloudAPIConnectWABAMutation() {
  const axiosClient = useAxios();

  return useMutation({
    mutationFn: async (authorizationCode: string) => {
      const response = await axiosClient.post<{
        connectedWaba: Array<{
          facebookWabaName: string;
          facebookWabaAccountReviewStatus: string;
          facebookWabaId: string;
        }>;
      }>(
        '/company/whatsapp/cloudapi/waba/exchange-facebook-authorization-code',
        {
          facebook_authorization_code: authorizationCode,
        },
      );
      if (!response.data?.connectedWaba.length) {
        throw new Error('no connected channel');
      }
    },
  });
}

export const useDeleteTwilioChannelMutation = ({
  onMutate,
  onSuccess,
}: {
  onMutate?: (variables: DeleteTwilioChannelRequest) => unknown;
  onSuccess?: (data: unknown, variables: DeleteTwilioChannelRequest) => void;
} = {}) => {
  const axiosClient = useAxios();
  return useMutation({
    mutationFn: async (data) => {
      const url = '/Company/twilio/whatsapp';
      const response = await axiosClient.delete(url, {
        params: {
          sid: data.twilioAccountId,
        },
      });
      return response.data;
    },
    onMutate,
    onSuccess,
  });
};

export const useRenameTwilioChannelMutation = ({
  onMutate,
  onSuccess,
  onError,
}: {
  onMutate?: (variables: RenameTwilioChannelRequest) => unknown;
  onSuccess?: (data: unknown, variables: RenameTwilioChannelRequest) => void;
  onError?:
    | ((
        error: unknown,
        variables: RenameTwilioChannelRequest,
        context: unknown,
      ) => unknown)
    | undefined;
} = {}) => {
  const axiosClient = useAxios();
  return useMutation({
    mutationFn: async (data) => {
      const url = `Company/twilio/whatsapp/rename/${data.twilioAccountId}`;
      const response = await axiosClient.post(
        url,
        {
          name: data.newName,
          messagingServiceSid: data.newSID,
        },
        {
          params: {
            sid: data.twilioAccountId,
          },
        },
      );
      return response.data;
    },
    onMutate,
    onSuccess,
    onError,
  });
};

export const useDeleteCloudApiChannelMutation = ({
  onMutate,
  onSuccess,
}: {
  onMutate?: (variables: DeleteCloudApiChannelRequest) => unknown;
  onSuccess?: (data: unknown, variables: DeleteCloudApiChannelRequest) => void;
} = {}) => {
  const axiosClient = useAxios();
  return useMutation({
    mutationFn: async (data) => {
      const url = `/company/whatsapp/cloudapi/channel`;
      const response = await axiosClient.delete(url, {
        data: {
          wabaId: data.messagingHubWabaId,
          wabaPhoneNumberId: data.messagingHubWabaPhoneNumberId,
        },
      });
      return response.data;
    },
    onMutate,
    onSuccess,
  });
};

export const useRenameCloudApiChannelMutation = ({
  onMutate,
  onSuccess,
  onError,
}: {
  onMutate?: (variables: RenameCloudApiChannelRequest) => unknown;
  onSuccess?: (data: unknown, variables: RenameCloudApiChannelRequest) => void;
  onError?:
    | ((
        error: unknown,
        variables: RenameCloudApiChannelRequest,
        context: unknown,
      ) => unknown)
    | undefined;
} = {}) => {
  const axiosClient = useAxios();
  return useMutation({
    mutationFn: async (data) => {
      const url = '/company/whatsapp/cloudapi/channel';
      const response = await axiosClient.put(url, {
        channelName: data.newName,
        wabaId: data.messagingHubWabaId,
        wabaPhoneNumberId: data.messagingHubWabaPhoneNumberId,
      });
      return response.data;
    },
    onMutate,
    onSuccess,
    onError,
  });
};

export const useDelete360DialogChannelMutation = ({
  onMutate,
  onSuccess,
}: {
  onMutate?: (variables: Delete360ApiChannelRequest) => unknown;
  onSuccess?: (data: unknown, variables: Delete360ApiChannelRequest) => void;
} = {}) => {
  const axiosClient = useAxios();
  return useMutation({
    mutationFn: async (data) => {
      const url = `/company/whatsapp/360dialog/${data.id}`;
      const response = await axiosClient.delete(url);
      return response.data;
    },
    onMutate,
    onSuccess,
  });
};

export const useRename360DialogChannelMutation = ({
  onMutate,
  onSuccess,
  onError,
}: {
  onMutate?: (variables: Rename360DialogChannelRequest) => unknown;
  onSuccess?: (data: unknown, variables: Rename360DialogChannelRequest) => void;
  onError?:
    | ((
        error: unknown,
        variables: Rename360DialogChannelRequest,
        context: unknown,
      ) => unknown)
    | undefined;
} = {}) => {
  const axiosClient = useAxios();
  return useMutation({
    mutationFn: async (data) => {
      const url = `/company/whatsapp/360dialog/${data.id}`;
      const response = await axiosClient.put(url, {
        channelName: data.newName,
      });
      return response.data;
    },
    onMutate,
    onSuccess,
    onError,
  });
};

export const useDeleteSmsChannelMutation = ({
  onMutate,
  onSuccess,
}: {
  onMutate?: (variables: DeleteSmsChannelRequest) => unknown;
  onSuccess?: (data: unknown, variables: DeleteSmsChannelRequest) => void;
} = {}) => {
  const axiosClient = useAxios();
  return useMutation({
    mutationFn: async (data) => {
      const url = `/Company/twilio/sms/${data.twilioAccountId}`;
      const response = await axiosClient.delete(url);
      return response.data;
    },
    onMutate,
    onSuccess,
  });
};

export const useRenameSmsChannelMutation = ({
  onMutate,
  onSuccess,
  onError,
}: {
  onMutate?: (variables: RenameSmsChannelRequest) => unknown;
  onSuccess?: (data: unknown, variables: RenameSmsChannelRequest) => void;
  onError?:
    | ((
        error: unknown,
        variables: RenameSmsChannelRequest,
        context: unknown,
      ) => unknown)
    | undefined;
} = {}) => {
  const axiosClient = useAxios();
  return useMutation({
    mutationFn: async (data) => {
      const url = `/Company/twilio/sms/rename/${data.twilioAccountId}`;
      const response = await axiosClient.post(url, {
        name: data.newName,
      });
      return response.data;
    },
    onMutate,
    onSuccess,
    onError,
  });
};

export const useDeleteFacebookChannelMutation = ({
  onMutate,
  onSuccess,
}: {
  onMutate?: (variables: DeleteFacebookChannelRequest) => unknown;
  onSuccess?: (data: unknown, variables: DeleteFacebookChannelRequest) => void;
} = {}) => {
  const axiosClient = useAxios();
  return useMutation({
    mutationFn: async (data) => {
      const url = `/Company/Facebook/${data.pageId}`;
      const response = await axiosClient.delete(url);
      return response.data;
    },
    onMutate,
    onSuccess,
  });
};

export const useRenameFacebookChannelMutation = ({
  onMutate,
  onSuccess,
  onError,
}: {
  onMutate?: (variables: RenameFacebookChannelRequest) => unknown;
  onSuccess?: (data: unknown, variables: RenameFacebookChannelRequest) => void;
  onError?:
    | ((
        error: unknown,
        variables: RenameFacebookChannelRequest,
        context: unknown,
      ) => unknown)
    | undefined;
} = {}) => {
  const axiosClient = useAxios();
  return useMutation({
    mutationFn: async (data) => {
      const url = `/Company/Facebook/rename/${data.pageId}`;
      const response = await axiosClient.post(url, {
        name: data.newName,
      });
      return response.data;
    },
    onMutate,
    onSuccess,
    onError,
  });
};

export const useDeleteInstagramChannelMutation = ({
  onMutate,
  onSuccess,
}: {
  onMutate?: (variables: DeleteInstagramChannelRequest) => unknown;
  onSuccess?: (data: unknown, variables: DeleteInstagramChannelRequest) => void;
} = {}) => {
  const axiosClient = useAxios();
  return useMutation({
    mutationFn: async (data) => {
      const url = `/Company/instagram/${data.instagramPageId}`;
      const response = await axiosClient.delete(url);
      return response.data;
    },
    onMutate,
    onSuccess,
  });
};

export const useDeleteLineChannelMutation = ({
  onMutate,
  onSuccess,
}: {
  onMutate?: (variables: DeleteLineChannelRequest) => unknown;
  onSuccess?: (data: unknown, variables: DeleteLineChannelRequest) => void;
} = {}) => {
  const axiosClient = useAxios();
  return useMutation({
    mutationFn: async (data) => {
      const url = `/company/line/${data.channelID}`;
      const response = await axiosClient.delete(url);
      return response.data;
    },
    onMutate,
    onSuccess,
  });
};

export const useRenameLineChannelMutation = ({
  onMutate,
  onSuccess,
  onError,
}: {
  onMutate?: (variables: RenameLineChannelRequest) => unknown;
  onSuccess?: (data: unknown, variables: RenameLineChannelRequest) => void;
  onError?:
    | ((
        error: unknown,
        variables: RenameLineChannelRequest,
        context: unknown,
      ) => unknown)
    | undefined;
} = {}) => {
  const axiosClient = useAxios();
  return useMutation({
    mutationFn: async (data) => {
      const url = `/Company/line/rename/${data.channelID}`;
      const response = await axiosClient.post(url, {
        name: data.newName,
      });
      return response.data;
    },
    onMutate,
    onSuccess,
    onError,
  });
};

export const useDeleteWeChatChannelMutation = ({
  onMutate,
  onSuccess,
}: {
  onMutate?: (variables: DeleteWeChatChannelRequest) => unknown;
  onSuccess?: (data: unknown, variables: DeleteWeChatChannelRequest) => void;
} = {}) => {
  const axiosClient = useAxios();
  return useMutation({
    mutationFn: async (data) => {
      const url = `/Company/wechat/${data.appId}`;
      const response = await axiosClient.delete(url);
      return response.data;
    },
    onMutate,
    onSuccess,
  });
};

export const useRenameWeChatChannelMutation = ({
  onMutate,
  onSuccess,
  onError,
}: {
  onMutate?: (variables: RenameWeChatChannelRequest) => unknown;
  onSuccess?: (data: unknown, variables: RenameWeChatChannelRequest) => void;
  onError?:
    | ((
        error: unknown,
        variables: RenameWeChatChannelRequest,
        context: unknown,
      ) => unknown)
    | undefined;
} = {}) => {
  const axiosClient = useAxios();
  return useMutation({
    mutationFn: async (data) => {
      const url = `/Company/wechat/rename/${data.appId}`;
      const response = await axiosClient.post(url, {
        name: data.newName,
      });
      return response.data;
    },
    onMutate,
    onSuccess,
    onError,
  });
};

export const useDeleteTelegramChannelMutation = ({
  onMutate,
  onSuccess,
  onError,
}: {
  onMutate?: (variables: DeleteTelegramChannelRequest) => unknown;
  onSuccess?: (data: unknown, variables: DeleteTelegramChannelRequest) => void;
  onError?:
    | ((
        error: unknown,
        variables: DeleteTelegramChannelRequest,
        context: unknown,
      ) => unknown)
    | undefined;
} = {}) => {
  const axiosClient = useAxios();
  return useMutation({
    mutationFn: async (data) => {
      const url = '/Company/telegram';
      const response = await axiosClient.delete(url, {
        data: { telegramChannelId: data.id },
      });
      return response.data;
    },
    onMutate,
    onSuccess,
    onError,
  });
};

export const useRenameTelegramChannelMutation = ({
  onMutate,
  onSuccess,
  onError,
}: {
  onMutate?: (variables: RenameTelegramChannelRequest) => unknown;
  onSuccess?: (data: unknown, variables: RenameTelegramChannelRequest) => void;
  onError?:
    | ((
        error: unknown,
        variables: RenameTelegramChannelRequest,
        context: unknown,
      ) => unknown)
    | undefined;
} = {}) => {
  const axiosClient = useAxios();
  return useMutation({
    mutationFn: async (data) => {
      const url = '/Company/telegram';
      const response = await axiosClient.put(url, {
        telegramChannelId: data.id,
        displayName: data.newName,
      });
      return response.data;
    },
    onMutate,
    onSuccess,
    onError,
  });
};

export const useDeleteViberChannelMutation = ({
  onMutate,
  onSuccess,
  onError,
}: {
  onMutate?: (variables: DeleteViberChannelRequest) => unknown;
  onSuccess?: (data: unknown, variables: DeleteViberChannelRequest) => void;
  onError?:
    | ((
        error: unknown,
        variables: DeleteViberChannelRequest,
        context: unknown,
      ) => unknown)
    | undefined;
} = {}) => {
  const axiosClient = useAxios();
  return useMutation({
    mutationFn: async (data) => {
      const url = '/Company/viber';
      const response = await axiosClient.delete(url, {
        data: { viberChannelId: data.id },
      });
      return response.data;
    },
    onMutate,
    onSuccess,
    onError,
  });
};

export const useRenameViberChannelMutation = ({
  onMutate,
  onSuccess,
  onError,
}: {
  onMutate?: (variables: RenameViberChannelRequest) => unknown;
  onSuccess?: (data: unknown, variables: RenameViberChannelRequest) => void;
  onError?:
    | ((
        error: unknown,
        variables: RenameViberChannelRequest,
        context: unknown,
      ) => unknown)
    | undefined;
} = {}) => {
  const axiosClient = useAxios();
  return useMutation({
    mutationFn: async (data) => {
      const url = '/Company/viber';
      const response = await axiosClient.put(url, {
        viberChannelId: data.id,
        displayName: data.newName,
        viberBotSenderName: data.viberBotSenderName,
      });
      return response.data;
    },
    onMutate,
    onSuccess,
    onError,
  });
};

export const useCloudAPIInvoiceQuery = ({
  select,
}: {
  select?: (
    data: CloudAPIInvoiceResponse,
  ) => Record<CloudAPIHeaderType, string>[];
} = {}) => {
  const axiosClient = useAxios();
  const url = '/company/whatsapp/cloudapi/top-up/invoices';
  return useQuery({
    queryKey: companyKeys.getCloudAPIInvoice,
    queryFn: async () => {
      const response = await axiosClient.get<CloudAPIInvoiceResponse>(url, {});
      return response.data;
    },
    select,
  });
};

function usePersonalColumnsPreferencesQueryOptions({
  onError,
  onSuccess,
  enabled,
}: {
  onError?: () => void;
  enabled: boolean;
  onSuccess?: (data: UserPersonalColumnsPreferencesNormalized) => void;
}) {
  const axiosClient = useAxios();
  const url = '/v2/Company/Staff/UserPreferences/PersonalColumns';

  return {
    enabled,
    queryKey: companyKeys.getPersonalColumnsPreferences,
    queryFn: async () => {
      try {
        const response =
          await axiosClient.get<UserPersonalColumnsPreferencesNormalized>(
            url,
            {},
          );
        const dataSorted = [...response.data].sort((a, b) => a.order - b.order);
        if (onSuccess) {
          onSuccess(dataSorted);
        }
        return dataSorted;
      } catch (_e) {
        onError && onError();
        return [];
      }
    },
  };
}

export const usePersonalColumnsPreferencesQuery = ({
  onError,
  enabled = true,
}: {
  onError?: () => void;
  enabled?: boolean;
}) => {
  return useQuery({
    ...usePersonalColumnsPreferencesQueryOptions({ onError, enabled }),
  });
};

export const useSuspensePersonalColumnsPreferencesQuery = ({
  onError,
  enabled,
  onSuccess,
}: {
  onError?: () => void;
  enabled?: boolean;
  onSuccess?: (data: UserPersonalColumnsPreferencesNormalized) => void;
}) => {
  const options = usePersonalColumnsPreferencesQueryOptions({
    onError,
    enabled: enabled ?? true,
    onSuccess,
  });

  return useSuspenseQuery({
    ...options,
  });
};

export const usePersonalColumnsPreferencesMutation = (
  props: {
    onSuccess?: () => void;
    onError?: () => void;
  } = {},
) => {
  const axiosClient = useAxios();
  const url = '/v2/Company/Staff/UserPreferences/PersonalColumns';

  return useMutation({
    mutationFn: async (data: CustomUserProfileFieldsForEditColumns[]) => {
      const payload: UserPersonalColumnsPreferencesNormalized = data.map(
        (c) => ({
          field_id: c.id,
          order: c.order,
          is_visible: c.isVisible,
        }),
      );
      const response = await axiosClient.post(url, payload);
      return response.data;
    },
    onSuccess: props.onSuccess,
    onError: props.onError,
  });
};

interface GetShopifyStatusListParams {
  offset?: number;
  limit?: number;
}

export const useShopifyStatusList = (params?: GetShopifyStatusListParams) => {
  const axiosClient = useAxios();
  return useQuery({
    queryKey: companyKeys.getShopifyStatusList({
      offset: params?.offset,
      limit: params?.limit,
    }),
    queryFn: async ({ queryKey: [, , { offset, limit }] }) => {
      const response = await axiosClient.get<
        {
          id: number;
          name: string;
          usersMyShopifyUrl: string;
          accessToken: string;
          createdAt: string;
          lastUpdatedAt: string;
          status: string;
          currency: string;
          isShopifySubscriptionPaid: boolean;
          chargeId: number;
          chargeUpdatedAt: string;
          isShowInInbox: boolean;
          isEnabledDiscounts: boolean;
          supportedCountries: [];
          billRecord: {
            id: number;
            companyId: string;
            subscriptionPlanId: string;
            periodStart: string;
            periodEnd: string;
            status: number;
            paymentStatus: number;
            payAmount: number;
            purchaseStaffId: number;
            invoice_Id: number;
            stripe_subscriptionId: number;
            customerId: string;
            customer_email: string;
            hosted_invoice_url: string;
            invoice_pdf: string;
            amount_due: number;
            amount_paid: number;
            amount_remaining: number;
            currency: string;
            created: string;
            metadata: {
              rewardful: string;
              shopifyConfigId: string;
              companyId: string;
              isShopifyRenewal: string;
            };
            quantity: number;
            cmsSalesPaymentRecords: [];
            subscriptionTier: number;
            stripeId: string;
            isFreeTrial: boolean;
            paidByReseller: boolean;
            isCustomized: boolean;
          };
          paymentLinkSetting?: {
            isPaymentLinkEnabled: boolean;
            paymentLinkOption: number;
          };
        }[]
      >('/company/shopify/status/list', {
        params: {
          offset,
          limit,
        },
      });
      return response.data;
    },
  });
};

export const useGetTwilioUsage = () => {
  const axiosClient = useAxios();
  const url = '/company/twilio/usage';
  return useQuery({
    queryKey: companyKeys.getTwilioUsage,
    queryFn: async () => {
      const response = await axiosClient.get<TwilioUsage[]>(url);
      return response.data;
    },
  });
};

export function useGetShopifyDiscountSetting() {
  const axiosClient = useAxios();
  const url = '/company/Shopify/discount-setting';
  return useQuery({
    queryFn: async () =>
      await axiosClient.get<{ isEnabledDiscounts: boolean }>(url),
    select: (data) => data.data?.isEnabledDiscounts ?? false,
    queryKey: companyKeys.getShopifyDiscountSetting,
  });
}

export type GetAvailableChannelsResponse =
  TravisBackendControllersMessageControllersMessagingChannelControllerGetAvailableChannelsResults;

interface UseGetAvailableChannelsOptions<T>
  extends Omit<
    UseQueryOptions<GetAvailableChannelsResponse, unknown, T>,
    'queryKey'
  > {
  select?: (data: GetAvailableChannelsResponse) => T;
}

export const useGetAvailableChannels = <T = GetAvailableChannelsResponse>(
  options: UseGetAvailableChannelsOptions<T> = {},
) => {
  const axiosClient = useAxios();
  return useQuery({
    queryKey: companyKeys.getAvailableChannels,
    queryFn: async () => {
      const response = await axiosClient.post(
        '/MessagingChannels/GetAvailableChannels',
      );
      return response.data;
    },
    staleTime: Infinity,
    ...options,
  });
};

interface SetupWabaDatasetParams {
  messagingHubWabaId: string;
  datasetName: string;
}

interface SetupWabaDatasetResponse {
  waba_dataset: {
    facebook_dataset_id: string;
    facebook_dataset_name: string;
  };
}

export const useSetupWabaDataset = () => {
  const axios = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      messagingHubWabaId,
      datasetName,
    }: SetupWabaDatasetParams) => {
      const response = await axios.post<SetupWabaDatasetResponse>(
        '/company/whatsapp/cloudapi/conversion-api/SetupWabaDataset',
        {
          messagingHubWabaId,
          datasetName,
        },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: companyKeys.getAvailableChannels,
      });
    },
  });
};
