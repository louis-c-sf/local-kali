import { fetchShopifyStatusList } from "api/Stripe/fetchShopifyStatusList";
import { useAppSelector } from "AppRootContext";
import moment from "moment";
import { useCallback, useState } from "react";
import { ShopifyConfigsType } from "types/CompanyType";

export function isExpired(periodEnd: string) {
  if (!periodEnd) {
    return false;
  }
  return moment().isAfter(moment(periodEnd));
}

export default function useFetchShopifyStatus() {
  const [storeStatus, setStoreStatus] = useState<ShopifyConfigsType[]>();
  const isShopifyExisted = useAppSelector(
    (s) => s.company?.shopifyConfigs && s.company?.shopifyConfigs.length > 0
  );
  const refresh = useCallback(
    async function refreshShopifyStatus() {
      try {
        if (isShopifyExisted === undefined) {
          return;
        }
        if (!isShopifyExisted) {
          setStoreStatus([]);
          return;
        }
        if (!storeStatus) {
          const result = await fetchShopifyStatusList();
          setStoreStatus(result);
        }
      } catch (e) {
        console.error(`fetchShopifyStatus error ${e}`);
        setStoreStatus([]);
      }
    },
    [isShopifyExisted]
  );
  return {
    storeStatus: storeStatus,
    refresh,
    expiredShopifyStoreConfigs: storeStatus?.filter(
      (shopify: ShopifyConfigsType) =>
        isExpired(shopify.billRecord?.periodEnd ?? "")
    ),
  };
}
