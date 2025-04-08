import { putMethod } from "api/apiRequest";
import { PUT_SHOPIFY_STATUS_UPDATE } from "api/apiPath";
import { PaymentLinkSettingType } from "features/Ecommerce/Payment/usecases/Settings/Catalog/types";

export const updateShopifyStatus = async (
  id: number,
  name: string,
  isShowInInbox: boolean,
  paymentLinkSetting?: PaymentLinkSettingType
) => {
  const paymentLinkSettingParam = paymentLinkSetting
    ? {
        paymentLinkSetting: {
          isPaymentLinkEnabled: paymentLinkSetting?.isPaymentLinkEnabled,
          paymentLinkOption: paymentLinkSetting?.paymentLinkOption,
        },
      }
    : {};
  return putMethod(
    PUT_SHOPIFY_STATUS_UPDATE.replace("{shopifyConfigId}", String(id)),
    {
      param: {
        name: name,
        isShowInInbox: isShowInInbox,
        ...paymentLinkSettingParam,
      },
    }
  );
};
