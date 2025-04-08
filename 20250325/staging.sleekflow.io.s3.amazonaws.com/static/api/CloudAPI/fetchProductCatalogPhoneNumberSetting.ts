import { getWithExceptions } from "api/apiRequest";

type PhoneNumberSettingResponseType = {
  waba: {
    waba_dto_phone_numbers: {
      id: string;
      facebook_is_catalog_visible: boolean;
      facebook_is_cart_enabled: boolean;
    }[];
  };
};

export async function fetchProductCatalogPhoneNumberSetting(props: {
  wabaId: string;
  wabaPhoneNumberId: string;
  allowCache: boolean;
}): Promise<PhoneNumberSettingResponseType> {
  const { wabaId, wabaPhoneNumberId, allowCache } = props;
  return getWithExceptions(
    "/company/whatsapp/cloudapi/productcatalog/phone-number/settings",
    {
      param: {
        wabaId,
        wabaPhoneNumberId,
        allowCache,
      },
    }
  );
}
