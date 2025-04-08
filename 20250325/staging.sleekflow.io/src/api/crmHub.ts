import { createQueryKeys } from '@lukemorales/query-key-factory';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';

import { useAxios } from './axiosClient';
import {
  AuthenticationUrlKey,
  ProviderKey,
} from '@/pages/Integrations/integrations';
import { getIntegratorObjectFields } from '@/pages/Integrations/ConnectionDashboard/UserMapping/helpers';

type CrmHubConfigResponse = {
  usage_limit: CrmHubConfigUsageLimit;
  sleekflow_company_id: string;
  created_by: {
    sleekflow_staff_id: string;
  };
  updated_by: {
    sleekflow_staff_id: string;
  };
  created_at: string;
  updated_at: string;
  id: string;
  feature_accessibility_settings: {
    can_access_custom_object: boolean;
    can_access_custom_object_flow_builder_components: boolean;
  };
  usage_limit_offset?: CrmHubConfigUsageLimitOffset;
};

type CrmHubConfigUsageLimitOffset = {
  custom_object_maximum_schema_num_offset: number;
  custom_object_maximum_property_num_per_schema_offset: number;
  custom_object_maximum_schemaful_object_num_per_schema_offset: number;
  custom_object_maximum_schemaful_object_num_per_company_offset: number;
  custom_object_maximum_array_object_array_size_offset: number;
};
type CrmHubConfigUsageLimit = {
  custom_object_maximum_schema_num: number;
  custom_object_maximum_property_num_per_schema: number;
  custom_object_maximum_schemaful_object_num_per_schema: number;
  custom_object_maximum_schemaful_object_num_per_company: number;
  custom_object_maximum_array_object_array_size: number;
};

export type CrmProviderRequestPayload = {
  providerName: string;
  providerConnectionId: string;
  entityTypeName: string;
  typeIds?: { type: string; id: string }[];
};

export const crmHubKeys = createQueryKeys('crm', {
  getCrmHubConfig: null,
  getCrmHubProviderConnections: (provider: string) => provider,
  getProviderTypeFields: ({
    providerName,
    providerConnectionId,
    entityTypeName,
  }: CrmProviderRequestPayload) => ({
    providerName,
    providerConnectionId,
    entityTypeName,
  }),
  getProviderUserMappingConfig: (
    payload: CrmProviderUserMappingConfigPayload,
  ) => payload,
  getPreviewObjects: (payload: CrmPreviewObjectsQueryPayload) => payload,
});

export const useGetCrmHubConfigQuery = <T = CrmHubConfigResponse>({
  select,
}: {
  select?: (data: CrmHubConfigResponse) => T;
} = {}) => {
  const axiosClient = useAxios();
  const url = '/CrmHub/CrmHubConfigs/GetCrmHubConfig';

  return useQuery<any, AxiosResponse<T>>({
    queryKey: crmHubKeys.getCrmHubConfig,
    queryFn: async () => {
      const result = await axiosClient.post(url);
      return result.data;
    },
    select,
  });
};

type ItegrationNormalized = {
  id: string;
  name: string;
  environment: 'production' | 'sandbox';
  organization_id: string;
  is_active: boolean;
  sleekflow_company_id: string;
  is_api_request_limit_exceeded: boolean;
};

export type CrmIntegrationsResponse = {
  connections: ItegrationNormalized[];
};

export function useCrmHubIntegrations<TData>(
  provider: string,
  props: {
    select?: (data: CrmIntegrationsResponse) => TData;
  },
) {
  const axiosClient = useAxios();

  return useQuery({
    queryKey: crmHubKeys.getCrmHubProviderConnections(provider),
    queryFn: async ({ signal }) => {
      const response = await axiosClient.post(
        '/CrmHub/GetProviderConnections',
        { signal, provider_name: provider },
      );
      return response.data;
    },
    select: props.select,
  });
}

export const SALESFORCE_PROPERTY_FIELD_TYPES = [
  'datetime',
  'boolean',
  'number',
  'string',
  'id',
  'reference',
  'double',
  'url',
  'phone',
  'email',
  'picklist',
  'int',
  'date',
  'currency',
  'textarea',
] as const;

export type SalesforcePropertyFieldType =
  (typeof SALESFORCE_PROPERTY_FIELD_TYPES)[number];

export type CrmUpdatableField = {
  calculated: boolean;
  createable: boolean;
  custom: boolean;
  encrypted: boolean;
  label: string;
  length: number;
  name: string;
  picklist_values: PickListOption[];
  soap_type: string;
  type: SalesforcePropertyFieldType;
  unique: boolean;
  updateable: boolean;
  mandatory: boolean;
};

export type PickListOption = {
  label: string;
  value: string;
};

export type CrmUpdatableFieldsResponse = {
  updatable_fields: CrmUpdatableField[];
  creatable_fields: CrmUpdatableField[];
  viewable_fields: CrmUpdatableField[];
};

export const useGetUpdatableFieldsQuery = <T = CrmUpdatableFieldsResponse>({
  providerName,
  providerConnectionId,
  entityTypeName,
  typeIds,
  select,
  enabled,
}: CrmProviderRequestPayload & {
  select?: (data: CrmUpdatableFieldsResponse) => T;
  enabled?: boolean;
}) => {
  const axiosClient = useAxios();
  const url = '/CrmHub/GetProviderTypeFieldsV2';

  return useQuery({
    queryKey: crmHubKeys.getProviderTypeFields({
      providerName,
      providerConnectionId,
      entityTypeName,
    }),
    queryFn: async () => {
      const result = await axiosClient.post<CrmUpdatableFieldsResponse>(url, {
        provider_name: providerName,
        provider_connection_id: providerConnectionId,
        entity_type_name: entityTypeName,
        typed_ids: typeIds,
      });
      return result.data;
    },
    select,
    enabled,
  });
};

export type CrmProviderUserMappingConfigPayload = {
  provider_name: string;
  provider_connection_id: string;
};

export type CrmProviderUserMappingConfigResponse = {
  user_mapping_config: {
    id: string;
    sleekflow_company_id: string;
    connection_id: string;
    user_mappings: {
      provider_user_id: string;
      sleekflow_user_id: string;
      provider_user: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
      };
      sleekflow_user: {
        id: string;
        display_name: string;
        user_name: string;
        email: string;
      };
    }[];
  };
};

export const useGetProviderUserMappingConfigQuery = <
  T = CrmProviderUserMappingConfigResponse,
>(
  {
    providerKey,
    providerConnectionId,
  }: {
    providerKey: ProviderKey;
    providerConnectionId: string;
  },
  {
    select,
    enabled,
  }: {
    select?: (data: CrmProviderUserMappingConfigResponse) => T;
    enabled?: boolean;
  } = {},
) => {
  const axiosClient = useAxios();
  const payload = {
    provider_name: providerKey,
    provider_connection_id: providerConnectionId,
  };

  const url = '/CrmHub/ProviderUserMappingConfigs/GetProviderUserMappingConfig';

  return useQuery({
    queryKey: crmHubKeys.getProviderUserMappingConfig(payload),
    queryFn: async () => {
      const result =
        await axiosClient.post<CrmProviderUserMappingConfigResponse>(
          url,
          payload,
        );
      return result.data;
    },
    select,
    enabled,
  });
};

export type CrmPreviewObjectsQueryPayload = {
  provider_name: ProviderKey;
  provider_connection_id: string;
  entity_type_name: 'User';
  field_filters: {
    name: string;
  }[];
};

export type SetupReinitResponse = {
  is_re_authentication_required: boolean;
  context: Record<AuthenticationUrlKey, string>;
};

export type CrmPreviewObjectsQueryResponse = {
  objects: {
    Email: string;
    FirstName: string;
    Id: string;
    LastName: string;
    Phone: string | null;
    attributes: {
      type: 'User';
      url: string;
    };
  }[];
};

export const useGetPreviewObjectsQuery = <T = CrmPreviewObjectsQueryResponse>(
  {
    providerKey,
    providerConnectionId,
    entityType,
  }: {
    providerKey: ProviderKey;
    entityType: 'User';
    providerConnectionId: string;
  },
  {
    select,
    enabled,
  }: {
    select?: (data: CrmPreviewObjectsQueryResponse) => T;
    enabled?: boolean;
  } = {},
) => {
  const axiosClient = useAxios();
  const payload = {
    provider_name: providerKey,
    provider_connection_id: providerConnectionId,
    entity_type_name: entityType,
    field_filters: getIntegratorObjectFields(providerKey),
  };

  const url = '/CrmHub/PreviewObjectsV2';

  return useQuery({
    queryKey: crmHubKeys.getPreviewObjects(payload),
    queryFn: async () => {
      const result = await axiosClient.post<CrmPreviewObjectsQueryResponse>(
        url,
        payload,
      );
      return result.data;
    },
    select,
    enabled,
  });
};

export const useUpdateProviderUserMappingMutation = ({
  onError,
}: {
  onError?: (error: unknown) => void;
} = {}) => {
  const axiosClient = useAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      provider_name: string;
      provider_user_mapping_config_id: string;
      user_mappings: {
        provider_user_id: string;
        sleekflow_user_id: string;
      }[];
    }) => {
      const url =
        '/CrmHub/ProviderUserMappingConfigs/UpdateProviderUserMappingConfig';
      const response = await axiosClient.post(url, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: crmHubKeys.getProviderUserMappingConfig._def,
      });
    },
    onError,
  });
};

export const useReinitProviderConnectionMutation = ({
  onSuccess,
  providerKey,
  successUrl,
  failureUrl,
  onError,
}: {
  onSuccess: (data: SetupReinitResponse) => void;
  providerKey: string;
  successUrl: string;
  failureUrl: string;
  onError?: (error: unknown) => void;
}) => {
  const axiosClient = useAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      connectionId,
      isSandbox = false,
    }: {
      connectionId: string;
      isSandbox?: boolean;
    }) => {
      const response = await axiosClient.post<SetupReinitResponse>(
        '/CrmHub/ReInitProviderConnection',
        {
          provider_name: providerKey,
          success_url: successUrl,
          failure_url: failureUrl,
          provider_connection_id: connectionId,
          additional_details: {
            is_sandbox: isSandbox,
          },
        },
      );
      return response.data;
    },
    onSuccess,
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: crmHubKeys.getCrmHubProviderConnections(providerKey),
      });
    },
    onError,
  });
};

export const useInitProviderConnectionMutation = ({
  onSuccess,
  providerKey,
  successUrl,
  failureUrl,
  onError,
}: {
  onSuccess: (data: SetupReinitResponse) => void;
  providerKey: string;
  successUrl: string;
  failureUrl: string;
  onError?: (error: unknown) => void;
}) => {
  const axiosClient = useAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ isSandbox = false }: { isSandbox?: boolean }) => {
      const response = await axiosClient.post<SetupReinitResponse>(
        '/CrmHub/InitProviderV2',
        {
          provider_name: providerKey,
          success_url: successUrl,
          failure_url: failureUrl,
          additional_details: {
            is_sandbox: isSandbox,
          },
        },
      );
      return response.data;
    },
    onSuccess,
    onError,
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: crmHubKeys.getCrmHubProviderConnections(providerKey),
      });
    },
  });
};

type RenameResponse = {
  connection: {
    id: string;
    sleekflow_company_id: string;
    organization_id: string;
    name: string;
    environment: 'production' | 'sandbox';
    is_active: boolean;
  };
};

export function useCrmConnectionRenameMutation({
  providerKey,
}: {
  providerKey: string;
}) {
  const axios = useAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      connectionId,
      connectionName,
    }: {
      connectionId: string;
      connectionName: string;
    }) => {
      const result = await axios.post<RenameResponse>(
        '/CrmHub/RenameProviderConnection',
        {
          provider_name: providerKey,
          provider_connection_id: connectionId,
          name: connectionName,
        },
      );

      return result.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: crmHubKeys.getCrmHubProviderConnections(providerKey),
      });
    },
  });
}

export function useCrmConnectionDeleteMutation({
  providerKey,
}: {
  providerKey: string;
}) {
  const axios = useAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return await axios.post('/CrmHub/DeleteProviderConnection', {
        provider_name: providerKey,
        provider_connection_id: id,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: crmHubKeys.getCrmHubProviderConnections(providerKey),
      });
    },
  });
}
