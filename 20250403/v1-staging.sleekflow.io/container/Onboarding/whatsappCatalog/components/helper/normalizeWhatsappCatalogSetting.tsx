import { fetchProductCatalogPhoneNumberSetting } from "api/CloudAPI/fetchProductCatalogPhoneNumberSetting";
import { WhatsappCatalogSettingsResponseType } from "api/CloudAPI/fetchWhatsappCatalogSettings";
export type WabaInfoType = {
  productCatalogName: string;
  facebookWabaName: string;
  whatsappDisplayName: string;
  whatsappPhoneNumber: string;
  hasEnabledAutoSendStripePaymentUrl?: boolean;
  hasEnabledProductCatalog?: boolean;
  wabaId: string;
  wabaPhoneNumberId: string;
};

export async function normalizeWhatsappCatalogSetting(
  catalogSettings: WhatsappCatalogSettingsResponseType[]
): Promise<Record<string, WabaInfoType[]>> {
  const indexedData: Record<string, WabaInfoType[]> = {};
  for (const item of catalogSettings) {
    if (
      !item.productCatalogSetting ||
      !item.productCatalogSetting.hasEnabledProductCatalog
    ) {
      continue;
    }
    const phonenumberSetting = await fetchProductCatalogPhoneNumberSetting({
      wabaId: item.messagingHubWabaId,
      wabaPhoneNumberId: item.messagingHubWabaPhoneNumberId,
      allowCache: false,
    });
    const mappingPhoneNumberSetting =
      phonenumberSetting.waba.waba_dto_phone_numbers.find(
        (phoneNumber) => phoneNumber.id === item.messagingHubWabaPhoneNumberId
      );
    const normalizedData = {
      productCatalogName: item.facebookProductCatalogName,
      facebookWabaName: item.facebookWabaName,
      whatsappDisplayName: item.whatsappDisplayName,
      whatsappPhoneNumber: item.whatsappPhoneNumber,
      hasEnabledAutoSendStripePaymentUrl:
        item?.productCatalogSetting?.hasEnabledAutoSendStripePaymentUrl,
      hasEnabledProductCatalog:
        mappingPhoneNumberSetting?.facebook_is_catalog_visible &&
        mappingPhoneNumberSetting?.facebook_is_cart_enabled,
      wabaId: item.messagingHubWabaId,
      wabaPhoneNumberId: item.messagingHubWabaPhoneNumberId,
    };
    const key = item.facebookProductCatalogId;
    if (!indexedData[key]) {
      indexedData[key] = [];
    }
    indexedData[key].push(normalizedData);
  }
  return indexedData;
}
