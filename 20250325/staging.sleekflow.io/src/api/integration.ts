import { createQueryKeys } from '@lukemorales/query-key-factory';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAxios } from './axiosClient';

export const integrationDisconnectAlertKeys = createQueryKeys(
  'integrationDisconnectAlert',
  {
    getConfig: null,
  },
);

type IntegrationDisconnectAlertConfig = {
  id?: number;
  company_id: string;
  emails: string[];
  phone_numbers: string[];
  created_at: string;
};

export const useGetIntegrationAlertConfigQuery = <
  T = IntegrationDisconnectAlertConfig,
>({
  select,
}: {
  select?: (data: IntegrationDisconnectAlertConfig) => T;
} = {}) => {
  const url = '/IntegrationAlertConfig/GetConfig';
  const axiosClient = useAxios();

  return useQuery({
    queryKey: integrationDisconnectAlertKeys.getConfig,
    queryFn: async () => {
      try {
        const response =
          await axiosClient.post<IntegrationDisconnectAlertConfig>(url);

        return response.data;
      } catch (_e) {
        return {
          id: undefined,
          company_id: '',
          emails: [],
          phone_numbers: [],
          created_at: '',
        };
      }
    },
    select,
  });
};

type UpdateIntegrationAlertConfig = {
  id: number;
  emails: string[];
  phone_numbers: string[];
};

export const useUpdateIntegrationAlertConfigMutation = ({
  id,
}: {
  id?: number;
}) => {
  const axiosClient = useAxios();
  const url = '/IntegrationAlertConfig/UpdateConfig';
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<UpdateIntegrationAlertConfig, 'id'>) => {
      if (id === undefined) {
        return Promise.reject('integration Alert Config Id is required');
      }
      return axiosClient.post(url, {
        ...data,
        id,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: integrationDisconnectAlertKeys.getConfig,
      });
    },
  });
};
