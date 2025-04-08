import { createQueryKeys } from '@lukemorales/query-key-factory';
import {
  InfiniteData,
  keepPreviousData,
  QueryKey,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { useTranslation } from 'react-i18next';

import { companyKeys, useCompany, useGetStaffOverview } from '@/api/company';
import { conversationKeys } from '@/api/conversation';
import {
  CompanyTag,
  Condition,
  CustomUserProfileFields,
  Hashtag,
  StaffWithoutCompanyResponse,
  UserProfile,
  UserProfileImportValidateResponse,
  UserProfileInner,
  UserProfileListDetail,
  WebClientInfo,
} from '@/api/types';
import type { ColumnsMap } from '@/pages/Contacts/ContactsImport/StepMatch';
import { findPhoneNumberUserProfileField } from '@/pages/Contacts/shared/utils';
import { getFullName } from '@/utils/formatting';
import { AtLeastOne } from '@/utils/ts-utils';

import type { ImportStrategy } from '../pages/Contacts/ContactsImport/useContactsImport';
import { useAxios } from './axiosClient';

export interface CustomUserProfileFieldLingualsType {
  language: string;
  displayName: string;
}

export interface UserProfileFieldOptionsType {
  id: number;
  customUserProfileFieldOptionLinguals: CustomUserProfileFieldLingualsType[];
  value: string;
  order: number;
}

export type CreateNewContactArgs = (Omit<
  UpdateUserProfileDetailMutationArgs,
  'userProfileId'
> & {
  whatsAppPhoneNumber: string;
  labels?: string[];
  listIds?: number[];
})[];

export interface UserProfileGroupType {
  companyId: string;
  createdAt: string;
  failedCount: number;
  id: number;
  importName: string;
  importedCount: number;
  importedUserProfiles: { userProfileId: string }[];
  isImported: boolean;
  isBookmarked: boolean;
  importedFrom: {
    userInfo: {
      id: string;
      displayName: string;
      userName: string;
      email: string;
      userRole: string;
      phoneNumber: string;
    };
    name: string;
    locale: string;
    timeZoneInfoId: string;
    position: string;
  };
  status: 'Completed' | 'importing' | 'imported' | undefined;
  totalContactCount: number;
  updatedCount: number;
  order: number;
}

export const userProfileKeys = createQueryKeys('userProfile', {
  getUserProfileListDetail: ({ listId }: { listId: string | undefined }) => [
    { listId },
  ],
  getUserProfileConversation: ({
    userProfileId,
  }: {
    userProfileId: string;
  }) => [{ userProfileId }],
  getImportPreview: ({
    files,
    columnsMap,
    importName,
    isTriggerAutomation,
  }: ImportPreview) => [
    {
      files: [files?.name, files?.type, files?.size],
      columnsMap,
      importName,
      isTriggerAutomation,
    },
  ],
  getUserProfile: ({
    offset = 0,
    limit = 500,
    sortBy,
    order,
    fields,
    channel,
    channelIds,
    data,
    type,
  }: GetUserProfileParams = {}) => [
    {
      offset,
      limit,
      sortBy,
      order,
      fields,
      channel,
      channelIds,
      data,
      type,
    },
  ],
  getUserProfileTotal: (body?: Condition[]) => body || {},
  getBriefUserProfile: ({ name }: { name: string }) => [{ name }],
  getContactList: ({
    offset = 0,
    limit = 15,
    name = '',
  }: GetContactListParams = {}) => [{ offset, limit, name }],
  getUserProfileDetail: ({ id }: { id: string | null | undefined }) => [{ id }],
  getUserWebClientInfo: ({ id }: { id: string }) => [{ id }],
  getUserProfileImportValidate: ({
    files,
    isTriggerAutomation,
  }: UseUserProfileImportValidateArgs) => [
    {
      files,
      isTriggerAutomation,
    },
  ],
  getSafeDeletedUserProfiles: (params: SafeDeletedUserProfilesQueryParam) => [
    { params },
  ],
  getSafeDeletedUserProfilesIds: null,
});

export const useCreateUserProfileMutation = ({
  onMutate,
  onSuccess,
  onError,
}: {
  onMutate?: (variables: CreateNewContactArgs) => unknown;
  onSuccess?: (
    data: unknown,
    variables: CreateNewContactArgs,
    context: unknown,
  ) => unknown;
  onError?: (
    error: unknown,
    variables: CreateNewContactArgs,
    context: unknown,
  ) => unknown;
} = {}) => {
  const url = '/UserProfile/Add';
  const axiosClient = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await axiosClient.post<CreateNewContactArgs>(url, data);
      return response.data;
    },
    onMutate,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.company });
      queryClient.invalidateQueries({
        queryKey: userProfileKeys.getUserProfile._def,
      });
      queryClient.invalidateQueries({
        queryKey: userProfileKeys.getBriefUserProfile._def,
      });
      onSuccess?.(data, variables, context);
    },
    onError,
  });
};

interface GetContactListParams {
  offset?: number;
  limit?: number;
  name?: string;
}

export type GetUserProfileCondition = {
  containHashTag?: string;
  fieldName?: string;
  conditionOperator?: number | string;
  values?: string[];
  timeValueType?: number;
  nextOperator?: number | string;
  companyMessageTemplateId?: string;
  broadcastMessageStatus?: number;
};

interface GetUserProfileParams {
  type?: 'infinite' | 'query';
  offset?: number;
  limit?: number;
  sortBy?: string;
  order?: string;
  fields?: string;
  channel?: string;
  channelIds?: string;
  data?: GetUserProfileCondition[];
}

// concated search API and userprofile API - if no search params then use userprofile API, if there is search then use search API
export function useUserProfileQuery<T = UserProfile>({
  offset = 0,
  limit = 500,
  sortBy,
  order,
  fields,
  channel,
  channelIds,
  data = [],
  select,
  enabled,
}: Omit<GetUserProfileParams, 'type'> & {
  select?: (data: UserProfile) => T;
  enabled?: boolean;
} = {}): UseQueryResult<T, unknown> {
  const searchProfilesUrl = '/UserProfile/Search';
  const axiosClient = useAxios();
  const { t } = useTranslation();
  const company = useCompany();
  const staffOverview = useGetStaffOverview();

  return useQuery({
    queryKey: userProfileKeys.getUserProfile({
      offset,
      limit,
      sortBy,
      order,
      data,
      type: 'query',
    }),

    queryFn: async ({ signal }) => {
      const result = await axiosClient.post<UserProfile>(
        searchProfilesUrl,
        data,
        {
          signal,
          params: {
            offset,
            limit,
            sortBy,
            order,
            fields,
            channel,
            channelIds,
          },
        },
      );

      return {
        ...result.data,
        userProfiles: result.data.userProfiles.map((profile) => {
          const phoneNumberField = findPhoneNumberUserProfileField(
            company.data?.customUserProfileFields || [],
          );
          const phoneNumber = profile.customFields.find((x) => {
            return x.companyDefinedFieldId === phoneNumberField?.id;
          });
          return {
            ...profile,
            displayName: getFullName({
              firstName: profile.firstName,
              lastName: profile.lastName,
              fallback:
                phoneNumber?.value ||
                profile.emailAddress?.email ||
                t('general.unknown-label'),
            }),
            collaborators: profile.collaborators?.map((collaborator) => {
              const foundStaff = staffOverview.data?.find((x) => {
                return x.staffIdentityId === collaborator.identityId;
              });
              return {
                ...collaborator,
                // trust the display name for full name display for staff
                displayName:
                  foundStaff?.displayName ||
                  getFullName({
                    firstName: collaborator.firstName,
                    lastName: collaborator.lastName,
                    fallback: foundStaff?.email || t('general.unknown-label'),
                  }),
              };
            }),
          };
        }),
      };
    },

    enabled: enabled && !staffOverview.isLoading,
    select,
    placeholderData: keepPreviousData,
    meta: {
      searchProfilesUrl,
    },
  });
}

export function useUserProfileInfiniteQuery<T = UserProfile>({
  offset = 0,
  limit = 500,
  sortBy,
  order,
  fields,
  channel,
  channelIds,
  data = [],
  select,
}: Omit<GetUserProfileParams, 'type'> & {
  select?: (data: InfiniteData<UserProfile>) => InfiniteData<T>;
}) {
  const searchProfilesUrl = '/UserProfile/Search';
  const axiosClient = useAxios();
  return useInfiniteQuery({
    queryKey: userProfileKeys.getUserProfile({
      offset,
      limit,
      sortBy,
      order,
      fields,
      channel,
      channelIds,
      data,
      type: 'infinite',
    }),
    queryFn: async ({ pageParam, signal }) => {
      const result = await axiosClient.post<UserProfile>(
        searchProfilesUrl,
        data,
        {
          signal,
          params: {
            offset: pageParam,
            limit,
            sortBy,
            order,
            fields,
            channel,
            channelIds,
          },
        },
      );
      return result.data;
    },
    initialPageParam: 0,
    select,
    getNextPageParam: (_, pages) => {
      return pages.length * limit;
    },
    placeholderData: keepPreviousData,
    meta: {
      searchProfilesUrl,
    },
  });
}

export interface UserProfileTotalWithSearch {
  totalResult: number;
  userProfileIds: string[];
}

// @deprecated do not use this API. Use UserProfileSearch API instead
export const useUserProfileTotal = <T = UserProfileTotalWithSearch>({
  body,
  enabled,
}: {
  body?: Condition[];
  enabled?: boolean;
} = {}): UseQueryResult<T> => {
  const url = '/UserProfile/Total';
  const axiosClient = useAxios();
  return useQuery({
    queryKey: userProfileKeys.getUserProfileTotal(body),
    queryFn: async ({ signal }) => {
      const response = await axiosClient.post<UserProfileTotalWithSearch>(
        url,
        body,
        { signal },
      );
      return response.data;
    },
    enabled,
  });
};

interface ImportPreview {
  files: File;
  columnsMap?: ColumnsMap[];
  importName?: string;
  isTriggerAutomation?: boolean;
}

export interface ImportPreviewResponse {
  headers: ImportPreviewHeader[];
  records: ImportPreviewRecord[];
}

export const IMPORT_ACTION_FROM_API = {
  overwrite: 0,
  updateBlankOnly: 1,
  addAppendix: 3,
} as const;

export type ImportActionFromApi =
  (typeof IMPORT_ACTION_FROM_API)[keyof typeof IMPORT_ACTION_FROM_API];

export interface ImportPreviewHeader {
  headerName: string | undefined;
  isValid: boolean;
  csvFileColumnNumber: number;
  importAction: ImportActionFromApi;
  fieldType?: CustomUserProfileFields;
}

interface ImportPreviewRecord {
  fields: string[];
}

export function useImportPreview<T = ImportPreviewResponse>({
  enabled,
  select,
  data,
}: {
  select?: (data: ImportPreviewResponse) => T;
  enabled?: boolean;
  data: ImportPreview;
}): UseQueryResult<T, unknown> {
  const url = '/UserProfile/Import/Preview';
  const axiosClient = useAxios();

  return useQuery<ImportPreviewResponse, unknown, T>({
    queryKey: userProfileKeys.getImportPreview(data),
    queryFn: async ({ signal }) => {
      const formData = new FormData();
      data.columnsMap &&
        formData.append('ColumnsMap', JSON.stringify(data.columnsMap));
      formData.append('files', data.files);
      data.importName && formData.append('importName', data.importName);
      data.isTriggerAutomation &&
        formData.append(
          'isTriggerAutomation',
          JSON.stringify(data.isTriggerAutomation),
        );
      const response = await axiosClient.post<ImportPreviewResponse>(
        url,
        formData,
        { signal },
      );

      return response.data;
    },
    enabled,
    select,
  });
}

export interface BriefUserProfileList {
  userGroups: {
    id: number;
    importName: string;
  }[];
  totalGroups: number;
}

export function useBriefUserProfileList<T = BriefUserProfileList>(
  {
    select,
    params,
  }: {
    params?: { name?: string };
    select?: (data: BriefUserProfileList) => T;
  } = { params: { name: '' } },
) {
  const url = '/UserProfile/List/brief';
  const axiosClient = useAxios();
  return useQuery({
    queryKey: userProfileKeys.getBriefUserProfile({
      name: params?.name ? params.name : '',
    }),
    queryFn: async ({ signal }) => {
      const response = await axiosClient.get<BriefUserProfileList>(url, {
        params,
        signal,
      });
      return response.data;
    },
    select,
    meta: {
      url,
      description: 'Get brief user profile List',
    },
  });
}

interface CreateContactListParams {
  UserProfileIds: string[];
  GroupListName: string;
}

export const useCreateContactListMutation = ({
  onMutate,
  onSuccess,
  onError,
}: {
  onMutate?: (variables: CreateContactListParams) => unknown;
  onSuccess?: (data: CompanyTag, variables: CreateContactListParams) => void;
  onError?: (
    error: unknown,
    variables: CreateContactListParams,
    context: unknown | undefined,
  ) => void;
} = {}) => {
  const axiosClient = useAxios();
  const queryClient = useQueryClient();
  const url = '/userprofile/list/create';
  return useMutation({
    mutationFn: async (variables: CreateContactListParams) => {
      const response = await axiosClient.post<CompanyTag>(url, variables);
      return response.data;
    },
    onSuccess,
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: userProfileKeys.getUserProfile._def,
      });
      queryClient.invalidateQueries({
        queryKey: userProfileKeys.getContactList._def,
      });
      queryClient.invalidateQueries({
        queryKey: userProfileKeys.getUserProfileDetail._def,
      });
      queryClient.invalidateQueries({
        queryKey: userProfileKeys.getBriefUserProfile._def,
      });
    },
    onError,
    onMutate,
  });
};

export function useUserProfileListDetail<T = UserProfileListDetail>({
  select,
  listId,
}: {
  select?: (data: UserProfileListDetail) => T;
  listId: string | undefined;
}) {
  const url = `/UserProfile/List/${listId}`;
  const axiosClient = useAxios();
  return useQuery({
    queryKey: userProfileKeys.getUserProfileListDetail({ listId }),
    queryFn: async ({ signal }) => {
      const response = await axiosClient.get<UserProfileListDetail>(url, {
        signal,
      });
      return response.data;
    },
    select,
    meta: {
      url,
      description: 'Get user profile list details',
    },
  });
}

type UserProfileListDeleteArgs = {
  listIds: number[];
};

export function useUserProfileListDeleteMutation(options?: {
  onError?:
    | ((
        error: unknown,
        variables: UserProfileListDeleteArgs,
        context: unknown,
      ) => unknown)
    | undefined;
  onSuccess?:
    | ((
        data: { message: 'success' },
        variables: UserProfileListDeleteArgs,
        context: unknown,
      ) => unknown)
    | undefined;
}) {
  const url = '/UserProfile/List';
  const axiosClient = useAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (variables: UserProfileListDeleteArgs) => {
      const response = await axiosClient.delete<{ message: 'success' }>(url, {
        data: variables,
      });
      return response.data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: userProfileKeys.getBriefUserProfile._def,
      });
      queryClient.invalidateQueries({
        queryKey: userProfileKeys.getContactList._def,
      });
      options?.onSuccess?.(data, variables, context);
    },
    onError: options?.onError,
  });
}

export interface ContactList {
  userGroups: UserGroup[];
  totalGroups: number;
}

export interface UserGroup {
  id: number;
  companyId: string;
  importName?: string;
  importedCount: number;
  updatedCount: number;
  failedCount: number;
  isImported: boolean;
  createdAt: string;
  importedUserProfiles: unknown[];
  importedFrom?: ImportedFrom;
  status: UserGroupStatus;
  totalContactCount: number;
  order: number;
  isBookmarked: boolean;
  contactListType: string;
}

export interface ImportedFrom {
  userInfo: UserInfo;
  staffId: number;
  roleType: string;
  name: string;
  locale?: string;
  timeZoneInfoId: string;
  position: string;
  status: ImportedFromStatus;
  isAcceptedInvitation: boolean;
  isShowName: boolean;
  isNewlyRegistered: boolean;
  qrCodeIdentity?: string;
  defaultCurrency?: string;
  qrCodeChannel?: QrCodeChannel;
  message?: string;
}

export interface QrCodeChannel {
  channel: string;
  ids: string[];
}

export enum ImportedFromStatus {
  Active = 'Active',
  Away = 'Away',
}

export interface UserInfo {
  id: string;
  firstName: string;
  lastName?: string;
  displayName: string;
  userName: string;
  email: string;
  phoneNumber: string;
  emailConfirmed: boolean;
  createdAt: string;
  userRole?: string;
}

enum UserGroupStatus {
  Imported = 'Imported',
  Importing = 'Importing',
}

export function useContactListInfiniteQuery<T = ContactList>({
  offset = 0,
  limit = 10,
  name = '',
  select,
}: GetContactListParams & {
  select?: (data: InfiniteData<ContactList>) => InfiniteData<T>;
}) {
  const url = '/UserProfile/List';
  const axiosClient = useAxios();
  return useInfiniteQuery<
    ContactList,
    Error,
    InfiniteData<T, unknown>,
    QueryKey,
    number | undefined
  >({
    queryKey: userProfileKeys.getContactList({
      offset,
      limit,
      name,
    }),
    queryFn: async ({ pageParam = 0, signal }) => {
      const response = await axiosClient.get<ContactList>(url, {
        params: { offset: pageParam, limit, name },
        signal,
      });
      return response.data;
    },
    meta: {
      url,
      description: 'Get infinite user profile list',
    },
    placeholderData: keepPreviousData,
    getNextPageParam: (lastPage, pages) => {
      return pages.length * limit < lastPage.totalGroups
        ? pages.length * limit
        : null;
    },
    initialPageParam: undefined,
    select,
  });
}

export const useContactList = <T = ContactList>({
  offset,
  limit = 500,
  name,
  select,
  enabled,
}: GetContactListParams & {
  select?: (data: ContactList) => T;
  enabled?: boolean;
} = {}) => {
  const url = `/UserProfile/List`;
  const axios = useAxios();

  return useQuery({
    queryKey: userProfileKeys.getContactList({ offset, limit, name }),
    queryFn: async ({ signal }) => {
      const response = await axios.get(url, {
        signal,
        params: { offset, limit, name },
      });
      return response.data;
    },
    meta: {
      url,
    },
    select,
    enabled,
    placeholderData: keepPreviousData,
  });
};

export interface ImportSpreadsheetBackgroundResponse {
  id: number;
  companyId: string;
  staffId: number;
  userId: string;
  total: number;
  progress: number;
  isCompleted: boolean;
  isDismissed: boolean;
  startedAt: string;
  completedAt: string;
  taskType: number;
  updatedAt: string;
  createdAt: string;
  errorMessage: string;
  taskStatus: number;
  target: string;
  result: string;
}

export type BulkEditContactsParamsType = {
  userProfileIds: string[];
  isTriggerAutomation: boolean;
} & AtLeastOne<{
  updateCustomFields: UpdateCustomFieldType[];
  addConversationLabels: Pick<Hashtag, 'id' | 'hashtag'>[];
  removeConversationLabels: Pick<Hashtag, 'id' | 'hashtag'>[];
  setConversationLabels: Partial<Pick<Hashtag, 'id' | 'hashtag'>>[];
  assigneeIdList: string[];
}>;

export interface UpdateCustomFieldType {
  customFieldName: string;
  customFieldId: string;
  customValue: string | undefined;
}

export interface BulkEditContactsResponseType {
  id: number;
  companyId: string;
  staffId: number;
  userId: string;
  total: number;
  progress: number;
  isCompleted: boolean;
  isDismissed: boolean;
  startedAt: string;
  completedAt: string;
  taskType: number;
  updatedAt: string;
  createdAt: string;
  errorMessage: string;
  taskStatus: number;
  target: string;
  result: string;
}

export const useImportSpreadsheetBackground = ({
  onMutate,
  onSuccess,
  onError,
}: {
  onMutate?: (variables: ImportPreview) => unknown;
  onSuccess?: (
    response: ImportSpreadsheetBackgroundResponse,
    variables: ImportPreview,
  ) => unknown;
  onError?: (err: unknown, variables: ImportPreview) => unknown;
} = {}) => {
  const url = '/UserProfile/Import/Spreadsheet/Background';
  const axiosClient = useAxios();

  return useMutation<
    ImportSpreadsheetBackgroundResponse,
    unknown,
    ImportPreview,
    unknown
  >({
    mutationFn: async (data) => {
      const formData = new FormData();
      data.columnsMap &&
        formData.append('ColumnsMap', JSON.stringify(data.columnsMap));
      formData.append('Files', data.files);
      data.importName && formData.append('ImportName', data.importName);
      data.isTriggerAutomation &&
        formData.append(
          'isTriggerAutomation',
          JSON.stringify(data.isTriggerAutomation),
        );
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
  });
};

export interface ImportListBackgroundRequest
  extends Omit<ImportPreview, 'importName'> {
  listId?: number;
  listName?: string;
}

export const useImportToListSpreadsheetBackground = ({
  strategy,
  onMutate,
  onSuccess,
  onError,
}: {
  strategy: ImportStrategy;
  onMutate?: (variables: ImportListBackgroundRequest) => unknown;
  onSuccess?: (
    response: ImportSpreadsheetBackgroundResponse,
    variables: ImportListBackgroundRequest,
  ) => unknown;
  onError?: (err: unknown, variables: ImportListBackgroundRequest) => unknown;
}) => {
  const axiosClient = useAxios();

  return useMutation<
    ImportSpreadsheetBackgroundResponse,
    unknown,
    ImportListBackgroundRequest,
    unknown
  >({
    mutationFn: async (data) => {
      const formData = new FormData();
      data.columnsMap &&
        formData.append('ColumnsMap', JSON.stringify(data.columnsMap));
      formData.append('Files', data.files);
      data.isTriggerAutomation &&
        formData.append(
          'isTriggerAutomation',
          JSON.stringify(data.isTriggerAutomation),
        );

      let url: string | null = null;
      if (strategy === 'express') {
        if (data.listId) {
          url = '/userprofile/bulk-import-into-list/spreadsheet/background';
          formData.append('ListId', JSON.stringify(data.listId));
        } else if (data.listName) {
          url = '/userprofile/bulk-import/spreadsheet/background';
          formData.append('ImportName', data.listName);
        } else {
          url = '/userprofile/bulk-import/spreadsheet/background';
        }
      } else if (strategy === 'standard') {
        if (data.listId) {
          url = '/UserProfile/Import-into-List/Spreadsheet/Background';
          formData.append('ListId', JSON.stringify(data.listId));
        } else if (data.listName) {
          url = '/UserProfile/Import/Spreadsheet/Background';
          formData.append('ImportName', data.listName);
        }
      }
      if (!url) {
        console.error({ data, strategy });
        throw new Error('Unknown strategy / data input');
      }
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
  });
};

export const useBulkEditCustomFieldsBackground = ({
  onMutate,
  onSuccess,
  onError,
}: {
  onMutate?: (params: BulkEditContactsParamsType) => void;
  onSuccess?:
    | ((
        data: BulkEditContactsResponseType,
        variables: BulkEditContactsParamsType,
        context: void | undefined,
      ) => unknown)
    | undefined;
  onError?:
    | ((
        error: unknown,
        variables: BulkEditContactsParamsType,
        context: void | undefined,
      ) => unknown)
    | undefined;
}) => {
  const url = '/userProfile/CustomFields/background';
  const axiosClient = useAxios();

  return useMutation({
    mutationFn: async (data: BulkEditContactsParamsType) => {
      const response = await axiosClient.post<BulkEditContactsResponseType>(
        url,
        data,
      );
      return response.data;
    },
    onMutate,
    onSuccess,
    onError,
  });
};

export const useBulkEditCustomFields = ({
  onMutate,
  onSuccess,
  onError,
}: {
  onMutate?: (params: BulkEditContactsParamsType) => void;
  onSuccess?:
    | ((
        data: BulkEditContactsResponseType,
        variables: BulkEditContactsParamsType,
        context: void | undefined,
      ) => unknown)
    | undefined;
  onError?: () => void;
}) => {
  const url = '/userProfile/CustomFields';
  const axiosClient = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await axiosClient.post<
        unknown,
        AxiosResponse<BulkEditContactsResponseType>,
        BulkEditContactsParamsType
      >(url, data);
      return response.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: userProfileKeys.getUserProfile._def,
      });
    },
    onMutate,
    onSuccess,
    onError,
  });
};

export interface AddUsersToListParamsType {
  groupId: number;
  groupListName: string;
  userProfileIds?: string[];
}

export interface AddUsersToListResponseType {
  code: number;
  message: string;
  errorId: string;
  timestamp: string;
}

// This API is used to edit list name
export const useAddUsersToListMutation = ({
  onMutate,
  onSuccess,
  onError,
}: {
  onMutate?: (params: AddUsersToListParamsType) => void;
  onSuccess?:
    | ((
        data: AddUsersToListResponseType,
        variables: AddUsersToListParamsType,
        context: void | undefined,
      ) => unknown)
    | undefined;
  onError?: () => void;
} = {}) => {
  const axiosClient = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const { groupId, groupListName, userProfileIds } = data;
      const url = `/UserProfile/List/${groupId}/Add`;
      const params = { groupListName, userProfileIds };
      const response = await axiosClient.post<
        unknown,
        AxiosResponse<AddUsersToListResponseType>,
        Omit<AddUsersToListParamsType, 'groupId'>
      >(url, params);
      return response.data;
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({
        queryKey: userProfileKeys.getUserProfileListDetail({
          listId: String(variables.groupId),
        }),
      });
      queryClient.invalidateQueries({
        queryKey: userProfileKeys.getContactList._def,
      });
      queryClient.invalidateQueries({
        queryKey: userProfileKeys.getUserProfile._def,
      });
      queryClient.invalidateQueries({
        queryKey: userProfileKeys.getUserProfileDetail._def,
      });
      queryClient.invalidateQueries({
        queryKey: userProfileKeys.getBriefUserProfile._def,
      });
    },
    onMutate,
    onSuccess,
    onError,
  });
};

// This API is used to add list name CANNOT be used to edit list name
export const useAddUsersToListMutationBackground = ({
  onMutate,
  onSuccess,
  onError,
}: {
  onMutate?: (params: AddUsersToListParamsType) => void;
  onSuccess?:
    | ((
        data: AddUsersToListResponseType,
        variables: AddUsersToListParamsType,
        context: void | undefined,
      ) => unknown)
    | undefined;
  onError?: () => void;
} = {}) => {
  const axiosClient = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const { groupId, groupListName, userProfileIds } = data;
      const url = `/UserProfile/List/${groupId}/Add/background`;
      const params = { groupListName, userProfileIds };
      const response = await axiosClient.post<
        unknown,
        AxiosResponse<AddUsersToListResponseType>,
        Omit<AddUsersToListParamsType, 'groupId'>
      >(url, params);
      return response.data;
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({
        queryKey: userProfileKeys.getUserProfileListDetail({
          listId: String(variables.groupId),
        }),
      });
      queryClient.invalidateQueries({
        queryKey: userProfileKeys.getContactList._def,
      });
      queryClient.invalidateQueries({
        queryKey: userProfileKeys.getUserProfile._def,
      });
      queryClient.invalidateQueries({
        queryKey: userProfileKeys.getUserProfileDetail._def,
      });
      queryClient.invalidateQueries({
        queryKey: userProfileKeys.getBriefUserProfile._def,
      });
    },
    onMutate,
    onSuccess,
    onError,
  });
};

interface ContactsDeleteMutationArgs {
  userProfileIds: string[];
  groupListName: string;
}

export const useDeleteContacts = ({
  onMutate,
  onSuccess,
  onError,
}: {
  onMutate?: (variables: ContactsDeleteMutationArgs) => unknown;
  onSuccess?: (data: unknown, variables: ContactsDeleteMutationArgs) => void;
  onError?: (
    error: unknown,
    variables: ContactsDeleteMutationArgs,
    context: unknown | undefined,
  ) => void;
} = {}) => {
  const axiosClient = useAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: ContactsDeleteMutationArgs) => {
      return axiosClient.delete('/UserProfile', { data: { ...args } });
    },
    onMutate,
    onSuccess,
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: userProfileKeys.getUserProfile._def,
      });
    },
    onError,
  });
};

export interface RemoveUsersToListMutationArgs {
  groupId: number;
  userProfileIds?: string[];
}

export const useRemoveContactFromList = ({
  onMutate,
  onSuccess,
  onError,
}: {
  onMutate?: (variables: RemoveUsersToListMutationArgs) => unknown;
  onSuccess?: (data: unknown, variables: RemoveUsersToListMutationArgs) => void;
  onError?: (
    error: unknown,
    variables: RemoveUsersToListMutationArgs,
    context: unknown | undefined,
  ) => void;
} = {}) => {
  const axiosClient = useAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: RemoveUsersToListMutationArgs) => {
      return axiosClient.post(`/UserProfile/List/${args.groupId}/Remove`, {
        userProfileIds: args.userProfileIds,
      });
    },
    onMutate,
    onSuccess,
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({
        queryKey: userProfileKeys.getUserProfileListDetail({
          listId: String(variables.groupId),
        }),
      });
      variables.userProfileIds?.forEach((profile) => {
        queryClient.invalidateQueries({
          queryKey: userProfileKeys.getUserProfileDetail({ id: profile }),
        });
      });

      queryClient.invalidateQueries({
        queryKey: userProfileKeys.getUserProfile._def,
      });
    },
    onError,
  });
};

interface UserProfileDetailQueryOptions<T = UserProfileInner>
  extends Omit<UseQueryOptions<UserProfileInner, unknown, T>, 'queryKey'> {
  id: string;
  select?: (data: UserProfileInner) => T;
}

export function useUserProfileDetail<T = UserProfileInner>({
  id,
  ...rest
}: UserProfileDetailQueryOptions<T>) {
  const url = `/UserProfile/${id}`;
  const axiosClient = useAxios();

  return useQuery({
    queryKey: userProfileKeys.getUserProfileDetail({ id }),
    queryFn: async ({ signal }) => {
      const response = await axiosClient.get<UserProfileInner>(url, {
        signal,
      });
      return response.data;
    },
    select: rest.select,
    ...rest,
  });
}

type UpdateUserProfileDetailMutationArgs = {
  userProfileId: string;
  firstName: string;
  lastName: string;
  PhoneNumber?: string;
  WhatsAppPhoneNumber?: string;
  email?: string;
  userProfileFields: {
    customFieldId: string;
    customFieldName: string;
    customValue: string;
  }[];
  labels?: string[];
  addLabels?: string[];
  removeLabels?: string[];
  listIds?: number[];
};

export const useUpdateUserProfileDetailMutation = ({
  onMutate,
  onError,
  onSuccess,
}: {
  onError?:
    | ((
        error: unknown,
        variables: UpdateUserProfileDetailMutationArgs,
        context: unknown,
      ) => unknown)
    | undefined;
  onMutate?:
    | ((variables: UpdateUserProfileDetailMutationArgs) => unknown)
    | undefined;
  onSuccess?: (userProfileInner: UserProfileInner) => void;
} = {}) => {
  const axiosClient = useAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: UpdateUserProfileDetailMutationArgs) => {
      const response = await axiosClient.post<UserProfileInner>(
        `/UserProfile/Update/${args.userProfileId}`,
        {
          ...args,
        },
      );
      return response.data;
    },
    onMutate,
    onSuccess: (userProfileInner, variables, context) => {
      onSuccess?.(userProfileInner);

      const contextCast = context as { threadId?: string };
      queryClient.invalidateQueries({
        queryKey: userProfileKeys.getUserProfileDetail({
          id: variables.userProfileId,
        }),
      });
      queryClient.invalidateQueries({
        queryKey: conversationKeys.conversations._def,
      });
      queryClient.invalidateQueries({
        queryKey: companyKeys.getStaffById({ userId: variables.userProfileId }),
      });
      queryClient.invalidateQueries({
        queryKey: conversationKeys.getConversationById._def,
      });
      if (contextCast.threadId) {
        // Invalidate conversation thread for Inbox page
        queryClient.invalidateQueries({
          queryKey: conversationKeys.conversationTopControls({
            threadId: contextCast.threadId,
          }),
        });
      }
      // Invalidate conversation thread list for Inbox page
      queryClient.invalidateQueries({
        queryKey: conversationKeys.conversations._def,
      });
    },
    onError,
  });
};

type BookmarkParam = { listId: number; isBookmark: boolean }[];

export const useContactListBookmark = ({
  onSuccess,
  onMutate,
  onError,
}: {
  onSuccess?: (data: unknown, variables: BookmarkParam) => void;
  onError?: (
    error: unknown,
    variables: BookmarkParam,
    context: any | undefined,
  ) => void;
  onMutate?: (variables: BookmarkParam) => void;
} = {}) => {
  const axiosClient = useAxios();
  const url = '/userprofile/list/bookmark';
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: BookmarkParam) => {
      return axiosClient.post(url, data);
    },
    onSuccess,
    onError,
    onMutate,
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: userProfileKeys.getContactList._def,
      });
    },
  });
};

type ExportContactListArgs = { listIds: string[] };

export const useExportContactList = ({
  onMutate,
  onSuccess,
  onError,
}: {
  onError?:
    | ((
        error: unknown,
        variables: ExportContactListArgs,
        context: unknown,
      ) => unknown)
    | undefined;
  onMutate?: ((variables: ExportContactListArgs) => unknown) | undefined;
  onSuccess?:
    | ((
        data: Blob,
        variables: ExportContactListArgs,
        context: unknown,
      ) => unknown)
    | undefined;
} = {}) => {
  const url = '/UserProfile/Export';
  const axiosClient = useAxios();
  return useMutation({
    mutationFn: async ({ listIds }: ExportContactListArgs) => {
      const response = await axiosClient.post<Blob>(
        url,
        {
          listIds,
        },
        {
          responseType: 'blob',
        },
      );
      return response.data;
    },
    onSuccess,
    onMutate,
    onError,
  });
};

export const useExportContactListBackground = ({
  onMutate,
  onSuccess,
  onError,
}: {
  onError?:
    | ((
        error: unknown,
        variables: ExportContactListArgs,
        context: unknown,
      ) => unknown)
    | undefined;
  onMutate?: ((variables: ExportContactListArgs) => unknown) | undefined;
  onSuccess?:
    | ((
        data: Blob,
        variables: ExportContactListArgs,
        context: unknown,
      ) => unknown)
    | undefined;
} = {}) => {
  const url = '/UserProfile/Export/background';
  const axiosClient = useAxios();
  return useMutation({
    mutationFn: async ({ listIds }: ExportContactListArgs) => {
      const response = await axiosClient.post<Blob>(
        url,
        {
          listIds,
        },
        {
          responseType: 'blob',
        },
      );
      return response.data;
    },
    onSuccess,
    onMutate,
    onError,
  });
};

interface ContactListRemoveMutationArgs {
  listId: number;
  groupListName?: string;
  userProfileIds: string[];
}

export function useRemoveUserFromContactListMutation() {
  const axiosClient = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userProfileIds,
      listId,
    }: ContactListRemoveMutationArgs) => {
      const url = `/userprofile/list/${listId}/remove`;

      const response = await axiosClient.post(url, { userProfileIds });
      return response.data;
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: userProfileKeys.getUserProfile._def,
      });
      return queryClient.invalidateQueries({
        queryKey: userProfileKeys.getUserProfileDetail._def,
      });
    },
  });
}

export const useUserWebClientInfoQuery = <T = WebClientInfo>({
  id,
  enabled,
  select,
}: {
  id: string;
  enabled?: boolean;
  select?: (data: WebClientInfo) => T;
}) => {
  const url = `/UserProfile/WebClient/Info/${id}`;
  const axiosClient = useAxios();

  return useQuery({
    queryKey: userProfileKeys.getUserWebClientInfo({ id }),
    queryFn: async ({ signal }) => {
      const resp = await axiosClient.get<WebClientInfo>(url, { signal });
      return resp.data;
    },
    enabled,
    select,
  });
};

type UseUserProfileSelectAllArgs = {
  data?: GetUserProfileCondition[];
  channel?: string;
  channelIds?: string;
  status?: string;
};

type UserProfileSelectAllResponse = {
  userProfileIds: string[];
  totalResult: number;
};

export const useUserProfileSelectAll = (options?: {
  onSuccess?: (
    data: UserProfileSelectAllResponse,
    variables: UseUserProfileSelectAllArgs,
  ) => void;
}) => {
  const url = '/UserProfile/SelectAll';
  const axiosClient = useAxios();
  return useMutation({
    mutationFn: async (data: UseUserProfileSelectAllArgs) => {
      const response = await axiosClient.post<UserProfileSelectAllResponse>(
        url,
        data.data,
        {
          params: {
            channel: data.channel,
            channelIds: data.channelIds,
          },
        },
      );
      return response.data;
    },
    onSuccess: options?.onSuccess,
  });
};

type UseUserProfileImportValidateArgs = {
  files: File;
  isTriggerAutomation: boolean;
};

export const useUserProfileImportValidateQuery = (
  { files, isTriggerAutomation }: UseUserProfileImportValidateArgs,
  options?: {
    enabled?: boolean;
    throwOnError?: boolean;
    onError?: ((err: unknown) => void) | undefined;
    staleTime?: number;
    gcTime?: number;
  },
) => {
  const url = `/UserProfile/import/validate`;
  const axiosClient = useAxios();
  return useQuery({
    queryKey: userProfileKeys.getUserProfileImportValidate({
      files,
      isTriggerAutomation,
    }),
    queryFn: async ({ signal }) => {
      const formData = new FormData();
      formData.append('files', files);
      formData.append('isTriggerAutomation', String(isTriggerAutomation));
      const resp = await axiosClient.post<UserProfileImportValidateResponse>(
        url,
        formData,
        {
          signal,
        },
      );
      return resp.data;
    },
    throwOnError: options?.throwOnError,
    enabled: options?.enabled,
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
  });
};

type SafeDeletedUserProfiles = {
  id: number;
  userProfile: UserProfileInner & {
    phoneNumber: string;
    email: string;
    fullName: string;
  };
  deletedAt: string;
  scheduledHardDeleteAt: string;
  deletedByStaff?: StaffWithoutCompanyResponse;
};

type SafeDeletedUserProfilesOrderBy =
  | 'FullName'
  | 'PhoneNumber'
  | 'Email'
  | 'DeletedAt'
  | 'DeletedBy'
  | 'ScheduledHardDeleteAt';
type SafeDeletedUserProfilesQueryParam = {
  offset?: number;
  limit?: number;
  orderBy?: SafeDeletedUserProfilesOrderBy;
  direction?: 'DESC' | 'ASC';
};

type SafeDeletedUserProfilesResponse = {
  safeDeletedUserProfiles: SafeDeletedUserProfiles[];
  totalResult: number;
};

export const useSafeDeletedUserProfilesQuery = <T = SafeDeletedUserProfiles[]>({
  params = {},
  select,
}: {
  params?: SafeDeletedUserProfilesQueryParam;
  select?: (data: SafeDeletedUserProfilesResponse) => T;
} = {}) => {
  const url = `/UserProfile/SafeDeletion/GetUserProfiles`;
  const axiosClient = useAxios();

  return useQuery({
    queryKey: userProfileKeys.getSafeDeletedUserProfiles(params),
    queryFn: async () => {
      const resp = await axiosClient.get<SafeDeletedUserProfilesResponse>(url, {
        params,
      });
      return resp.data;
    },
    select,
    placeholderData: keepPreviousData,
  });
};

export const useSafeDeletedUserProfilesIdsQuery = () => {
  const url = '/Userprofile/SafeDeletion/GetUserProfileIds';
  const axiosClient = useAxios();

  return useQuery({
    queryKey: userProfileKeys.getSafeDeletedUserProfilesIds,
    queryFn: async ({ signal }) => {
      const resp = await axiosClient.get<string[]>(url, {
        signal,
      });
      return resp.data;
    },
  });
};

export const useRestoreDeletedUserProfilesMutation = () => {
  const axiosClient = useAxios();
  const url = '/Userprofile/SafeDeletion/Recover';
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: string[]) => {
      const response = await axiosClient.post<number>(url, data);
      return response.data;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: userProfileKeys.getSafeDeletedUserProfiles._def,
      });
      queryClient.invalidateQueries({
        queryKey: userProfileKeys.getSafeDeletedUserProfilesIds,
      });
    },
  });
};

export const useHardDeleteUserProfilesMutation = () => {
  const axiosClient = useAxios();
  const url = '/Userprofile/SafeDeletion/HardDelete';
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: string[]) => {
      const response = await axiosClient.post<number>(url, data);
      return response.data;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: userProfileKeys.getSafeDeletedUserProfiles._def,
      });
      queryClient.invalidateQueries({
        queryKey: userProfileKeys.getSafeDeletedUserProfilesIds,
      });
    },
  });
};
