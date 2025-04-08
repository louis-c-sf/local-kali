import { createQueryKeys } from '@lukemorales/query-key-factory';
import { useQuery } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import { useAxios } from '@/api/axiosClient';
import { StripeSetUp } from '@/api/types';
import { LATEST_PLAN_VERSION } from '@/constants/subscription-plans';

import { CreateStripeCheckoutResponse, WabaPhoneNumber } from './types';

export const stripeKeys = createQueryKeys('stripe', {
  stripeSetUp: ({
    version,
    currency,
  }: {
    version?: number;
    currency?: string;
  }) => [{ version, currency }],
});

export function useGetStripeSetUpQuery<T = StripeSetUp>(
  version?: number,
  currency?: string,
  {
    enabled,
    select,
  }: { enabled?: boolean; select?: (data: StripeSetUp) => T } = {},
) {
  const axiosClient = useAxios();
  return useQuery({
    queryKey: stripeKeys.stripeSetUp({ version, currency }),
    queryFn: async () => {
      const response = await axiosClient.get<StripeSetUp>('/stripe/setup', {
        params: {
          Version: version === 0 ? LATEST_PLAN_VERSION : version,
          Currency: currency,
        },
      });
      return response.data;
    },
    enabled,
    select,
  });
}

export type WabaChannel = WabaPhoneNumber & {
  whatsappDisplayName: string;
  facebookWabaName: string;
  messagingHubWabaId: string;
};

export function useCreateCheckoutSessionMutation(props?: {
  onSuccessCallback?: (data: CreateStripeCheckoutResponse) => void;
  onErrorCallback?: () => void;
}) {
  const axiosClient = useAxios();
  const url = '/v2/stripe/create-checkout-session';
  return useMutation({
    mutationFn: async ({
      planId,
      quantity = 1,
      successUrl,
      cancelUrl,
    }: {
      planId: string;
      quantity?: number;
      successUrl?: string;
      cancelUrl?: string;
    }) => {
      const request = {
        planId,
        quantity,
      };
      const response = await axiosClient.post<CreateStripeCheckoutResponse>(
        url,
        {
          subscriptionItems: [request],
          ...(successUrl ? { successUrl } : {}),
          ...(cancelUrl ? { cancelUrl } : {}),
        },
      );
      return response.data;
    },
    onSuccess: props?.onSuccessCallback
      ? props?.onSuccessCallback
      : (data: CreateStripeCheckoutResponse) => {
          if (data.url) {
            window.location.replace(data.url);
          }
        },
    onError: (error: Error) => {
      console.error('useCreateCheckoutSessionMutation onError: ', error);

      if (error && props?.onErrorCallback) {
        props.onErrorCallback();
      }
    },
  });
}

export function useUpdateStripeCardMutation() {
  const axiosClient = useAxios();
  const url = '/stripe/update-card';
  return useMutation({
    mutationFn: async ({
      successUrl,
      cancelUrl,
    }: {
      successUrl: string;
      cancelUrl: string;
    }) => {
      const response = await axiosClient.post(url, {
        successUrl,
        cancelUrl,
      });
      if (response.data) {
        window.location.replace(response.data.url);
      }
      return;
    },
  });
}

export const useSubscribePlanMutation = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const axiosClient = useAxios();
  return useMutation({
    mutationFn: async (subscribePlan: {
      baseSubscriptionPlanId: string;
      addOns: { subscriptionPlanId: string; quantity: number }[];
      successUrl: string;
      cancelUrl: string;
    }) => {
      const url = '/subscription/subscribe-plans';
      const response = await axiosClient.post(url, subscribePlan);
      return response.data;
    },
    onSuccess: (data) => {
      onSuccess && onSuccess();
      window.location.replace(data.redirectUrl);
    },
    onError,
  });
};
