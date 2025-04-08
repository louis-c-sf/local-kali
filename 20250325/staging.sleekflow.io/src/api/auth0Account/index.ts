import { useQuery } from '@tanstack/react-query';

import { useAxios } from '@/api/axiosClient';
import { useMyProfile } from '@/hooks/useMyProfile';
import { auth0AccountKeys } from './keys';

type CompanyRegisteredResponse = {
  data: {
    is_company_registered: boolean;
    http_status_code: number;
    success: boolean;
  };
  success: boolean;
};
export const useAuth0AccountIsCompanyRegisteredQuery = () => {
  const url = '/v1/tenant-hub/Register/Companies/IsCompanyRegistered';
  const axiosClient = useAxios();

  return useQuery({
    queryKey: auth0AccountKeys.getAuth0AccountIsCompanyRegistered,
    queryFn: async ({ signal }) => {
      const response = await axiosClient.post<CompanyRegisteredResponse>(
        import.meta.env.VITE_SLEEKFLOW_API_BASE_URL + url,
        {},
        { signal },
      );
      return response.data;
    },
    meta: {
      url,
      description: 'Check if company is registered',
    },
    gcTime: Infinity,
    throwOnError: false,
  });
};

export const useAuth0EmailVerifiedSyncQuery = ({
  enabled,
}: {
  enabled: boolean;
}) => {
  const url = '/auth0/account/SyncEmailVerified';
  const axiosClient = useAxios();
  const myProfile = useMyProfile();
  return useQuery({
    queryKey: auth0AccountKeys.getAuth0EmailVerified,
    queryFn: async () => {
      const response = await axiosClient.post<CompanyRegisteredResponse>(url, {
        sleekflow_user_id: myProfile.data?.userInfo.id,
      });
      return response.data;
    },
    meta: {
      url,
      description: 'Check if email is verified in auth0',
    },
    enabled,
  });
};
