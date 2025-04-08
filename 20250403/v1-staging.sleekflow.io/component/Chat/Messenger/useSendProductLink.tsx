import { useSendMessage } from "./useSendMessage";
import { useProductCartContext } from "features/Ecommerce/usecases/Inbox/Share/ShareProductModal/ProductCartContext";
import { ProductGenericType } from "core/models/Ecommerce/Cart/ProductGenericType";
import { findVariantPrice } from "App/reducers/Chat/productReducer";
import { isGenericCartItem } from "core/models/Ecommerce/Catalog/GenericCartItemType";
import { useAppSelector } from "AppRootContext";

async function getFileFromUrl(
  url: string,
  name: string,
  defaultType = "image/jpeg"
) {
  const response = await fetch(url);
  const data = await response.blob();
  return new File([data], name, {
    type: data.type || defaultType,
  });
}

export function useSendProductLink(storeId: number | string, language: string) {
  const { sendFilesAttached, sendMessageText } = useSendMessage();
  const productCart = useProductCartContext();
  const currency = useAppSelector((s) => s.inbox.product?.currency) as string;

  async function sendProductLink(product: ProductGenericType) {
    let file: File | undefined = undefined;
    if (!storeId) {
      return;
    }
    const shareLink = await productCart.linkSharingService.fetchProductLink(
      product,
      storeId
    );
    const variantId = isGenericCartItem(product)
      ? product.selectedVariantId
      : productCart.shoppingCartService.getDefaultVariantId(product);

    const mainPrice = variantId
      ? findVariantPrice(product, variantId, currency)
      : parseFloat(product.amount) || 0;

    let { text: productMessage, image: imageUrl } =
      await productCart.linkSharingService.buildProductMessageText(
        product,
        variantId ?? "",
        shareLink,
        {
          amount: mainPrice,
          currency: currency,
        },
        language
      );

    try {
      if (imageUrl) {
        file = await getFileFromUrl(imageUrl, "image.jpg");
      }
    } catch (e) {
      console.error(e);
    }

    if (!file) {
      return await sendMessageText(productMessage, {
        whatsapp360Dialog: undefined,
        transaction: undefined,
      });
    } else {
      return await sendFilesAttached(productMessage, [file], undefined);
    }
  }

  return { sendProductLink };
}
