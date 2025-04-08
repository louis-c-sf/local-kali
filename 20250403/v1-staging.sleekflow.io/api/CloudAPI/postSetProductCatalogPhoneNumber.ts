import { postWithExceptions } from "../apiRequest";

export type SetProductCatalogPhoneNumberRequestType = {
  wabaId: string;
  wabaPhoneNumberId: string;
  isCatalogVisible?: boolean;
  isCartEnabled?: boolean;
};

export async function postSetProductCatalogPhoneNumber(
  productCatalogPhoneNumber: SetProductCatalogPhoneNumberRequestType
) {
  return postWithExceptions(
    "/company/whatsapp/cloudapi/productcatalog/phone-number/settings",
    {
      param: productCatalogPhoneNumber,
    }
  );
}
