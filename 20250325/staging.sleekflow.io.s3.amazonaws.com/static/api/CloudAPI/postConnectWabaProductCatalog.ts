import { postWithExceptions } from "../apiRequest";

export async function postConnectWabaProductCatalog(
  wabaId: string,
  facebookProductCatalogId: string
) {
  return postWithExceptions(
    "/company/whatsapp/cloudapi/productcatalog/connect/facebook-wabas-product-catalogs",
    {
      param: {
        connectWabaProductCatalogs: [
          {
            waba_id: wabaId,
            facebook_product_catalog_id: facebookProductCatalogId,
          },
        ],
      },
    }
  );
}
