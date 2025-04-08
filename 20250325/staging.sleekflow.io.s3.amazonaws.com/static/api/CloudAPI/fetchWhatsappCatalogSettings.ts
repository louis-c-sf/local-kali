import { getWithExceptions } from "api/apiRequest";

export type WhatsappCatalogSettingsResponseType = {
  messagingHubWabaId: string;
  messagingHubWabaPhoneNumberId: string;
  facebookProductCatalogId: string;
  whatsappPhoneNumber: string;
  whatsappDisplayName: string;
  facebookProductCatalogName: string;
  facebookWabaName: string;
  productCatalogSetting?: {
    hasEnabledProductCatalog: boolean;
    hasEnabledAutoSendStripePaymentUrl: boolean;
  };
};

export const fetchWhatsappCatalogSettings = async (
  allowCache: boolean
): Promise<WhatsappCatalogSettingsResponseType[]> => {
  return await getWithExceptions(
    "/company/whatsapp/cloudapi/productcatalog/connected-channels",
    {
      param: {
        allowCache,
      },
    }
  );
};
