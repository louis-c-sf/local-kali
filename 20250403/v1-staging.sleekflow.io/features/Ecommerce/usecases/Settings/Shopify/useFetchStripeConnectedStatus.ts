import { useEffect, useState } from "react";
import { getWithExceptions } from "api/apiRequest";

type StripeConnectionStatusResponseType = {
  stripeCurrencyConnectionStatuses: StripeCurrencyConnectionStatusesType[];
};
type StripeCurrencyConnectionStatusesType = {
  currency: string;
  isConnected: boolean;
};

export const useFetchStripeConnectedStatus = (shopifyId: number) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const getStripeConnectionStatus = async () => {
    const result: StripeConnectionStatusResponseType = await getWithExceptions(
      `/company/Shopify/stripe-connection-status/${shopifyId}`,
      {
        param: {},
      }
    );
    if (result.stripeCurrencyConnectionStatuses.length > 0) {
      result.stripeCurrencyConnectionStatuses.forEach(
        (stripeCurrencyConnectionStatus) =>
          stripeCurrencyConnectionStatus.isConnected && setIsConnected(true)
      );
    }
  };

  useEffect(() => {
    getStripeConnectionStatus();
  }, []);

  return {
    isConnected,
  };
};
