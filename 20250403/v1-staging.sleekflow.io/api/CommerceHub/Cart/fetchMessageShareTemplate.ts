import { postWithExceptions } from "api/apiRequest";

export async function fetchMessageShareTemplate(
  storeId: string,
  productId: string,
  variantId: string,
  currency: string,
  language: string
): Promise<ResponseType> {
  return await postWithExceptions(
    "/CommerceHub/Products/GetProductMessagePreview",
    {
      param: {
        store_id: storeId,
        product_variant_id: variantId,
        product_id: productId,
        currency_iso_code: currency,
        language_iso_code: language,
      },
    }
  );
}

interface ResponseType {
  success: boolean;
  data: {
    message_preview: {
      coverImageUrl: string;
      text: string;
    };
  };
}
