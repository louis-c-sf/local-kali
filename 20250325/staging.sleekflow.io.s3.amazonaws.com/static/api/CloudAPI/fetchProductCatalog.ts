import { getWithExceptions, postWithExceptions } from "api/apiRequest";
import {
  ProductCatalogWabaType,
  ProductCatalogWabaProductCatalogType,
} from "features/WhatsappCatalog/models/ProductCatalogType";

type ProductCatalogResponseType = {
  waba?: ProductCatalogWabaType;
  waba_product_catalog?: ProductCatalogWabaProductCatalogType;
};

export async function fetchProductCatalog(
  userAccessToken: string
): Promise<ProductCatalogResponseType[]> {
  return await getWithExceptions(
    "/company/whatsapp/cloudapi/productcatalog/by-waba/exchange-facebook-authorization-code",
    {
      param: {
        facebookAuthorizationCode: userAccessToken,
      },
    }
  );
}
