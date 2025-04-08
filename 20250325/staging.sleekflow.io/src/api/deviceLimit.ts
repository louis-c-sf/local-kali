import { createQueryKeys } from '@lukemorales/query-key-factory';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { getDevicePlatform } from '@/utils/platform';

import { useAxios } from './axiosClient';

export const deviceLimitKeys = createQueryKeys('deviceLimit', {
  getDeviceLimit: (isTakeOver: boolean) => [isTakeOver],
  deregisterDeviceLimit: (isTakeOver: boolean) => [isTakeOver],
});
export type DeviceLimitResponse = {
  deviceName: string;
  deviceType: 'Mobile' | 'Web';
  sessionStatus: 'Active' | 'Deactivate' | 'AutoLogout';
  createdAt: string;
  updatedAt: string;
  uuid: string;
};

export const usePostDeviceLimitQuery = ({
  isTakeOver,
  browserId,
  enabled,
}: {
  isTakeOver: boolean;
  browserId: string;
  enabled: boolean;
}) => {
  const url = '/Account/Register/Device';
  const axiosClient = useAxios();
  const os = getDevicePlatform();
  return useQuery<
    Array<DeviceLimitResponse>,
    AxiosError<Array<DeviceLimitResponse>>
  >({
    queryKey: deviceLimitKeys.getDeviceLimit(isTakeOver),
    queryFn: async () => {
      const response = await axiosClient.post<Array<DeviceLimitResponse>>(url, {
        deviceName: os,
        uuid: browserId,
        deviceType: 'webv2',
        isTakeover: isTakeOver,
      });
      return response.data;
    },
    meta: {
      url,
      description: 'Gets Device Limit',
    },
    staleTime: 2000,
    throwOnError: false,
    retry: 0,
    enabled,
  });
};

export const usePostDeregisterDeviceLimitMutation = () => {
  const url = '/Account/Deregister/Device';
  const axiosClient = useAxios();
  const os = getDevicePlatform();
  return useMutation({
    mutationKey: deviceLimitKeys.deregisterDeviceLimit(false),
    mutationFn: async ({
      isTakeOver,
      browserId,
    }: {
      isTakeOver: boolean;
      browserId: string;
    }) => {
      const response = await axiosClient.post(url, {
        deviceName: os,
        uuid: browserId,
        deviceType: 'webv2',
        isTakeover: isTakeOver,
      });
      return response.data;
    },
    meta: {
      url,
      description: 'Deregister Device Limit',
    },
    throwOnError: false,
    retry: 0,
  });
};
