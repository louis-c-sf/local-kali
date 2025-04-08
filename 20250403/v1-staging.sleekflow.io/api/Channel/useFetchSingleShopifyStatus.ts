import { useAppSelector } from "AppRootContext";
import { getWithExceptions } from "api/apiRequest";
import { PaymentLinkOptionDict } from "features/Ecommerce/usecases/Settings/Shopify/useConvertPaymentLinkOption";
import { useCallback, useState } from "react";
import { ShopifyConfigsType } from "types/CompanyType";

export default function useFetchSingleShopifyStatus(shopifyId: number | null) {
  const [storeStatus, setStoreStatus] = useState<ShopifyConfigsType | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const isShopifyExisted = useAppSelector(
    (s) => s.company?.shopifyConfigs && s.company?.shopifyConfigs.length > 0
  );
  const getShopifyStore: () => Promise<ShopifyConfigsType> =
    useCallback(async () => {
      if (!shopifyId) {
        return;
      }
      try {
        setLoading(true);
        if (isShopifyExisted === undefined) {
          return;
        }
        if (!isShopifyExisted) {
          setStoreStatus(null);
          return;
        }
        if (!storeStatus) {
          const result = await getWithExceptions(
            `/company/Shopify/status/${shopifyId}`,
            {
              param: {},
            }
          );
          setStoreStatus(result);
          return result;
        }
        return storeStatus;
      } catch (e) {
        console.error(`getShopifyStore error ${e}`);
        setStoreStatus(null);
      } finally {
        setLoading(false);
      }
    }, [isShopifyExisted, shopifyId]);

  return {
    boot: getShopifyStore,
    isShopifyPaymentLink: storeStatus
      ? storeStatus.paymentLinkSetting?.isPaymentLinkEnabled &&
        storeStatus.paymentLinkSetting?.paymentLinkOption ===
          PaymentLinkOptionDict.Shopify
      : undefined,
    loading,
  };
}
