import { LinkSharingServiceInterface } from "core/models/Ecommerce/Cart/LinkSharingServiceInterface";
import { fetchShopifyProductLink } from "api/Chat/Shopify/fetchShopifyProductLink";
import { ProductGenericType } from "core/models/Ecommerce/Cart/ProductGenericType";
import { formatCurrency } from "utility/string";
import fetchStripeTemplateMessage from "api/Chat/fetchStripeTemplateMessage";
import {
  getProductName,
  getProductDescription,
} from "features/Ecommerce/vendor/CommerceHub/toGenericProduct";

export class ShopifyLinkSharingService implements LinkSharingServiceInterface {
  async buildProductMessageText(
    product: ProductGenericType,
    variantId: string | number,
    shareLink: string,
    price: { amount: number; currency: string },
    language: string
  ): Promise<{ text: string; image: string | null }> {
    const [template] = await fetchStripeTemplateMessage("product");
    const text =
      `${getProductName(product, language)}\n` +
      `${formatCurrency(price.amount, price.currency)}\n\n` +
      `Description: ${getProductDescription(product, language)}\n` +
      (`${shareLink}\n` ?? "") +
      (template?.messageBody ?? "");

    return { text, image: product.image || null };
  }

  async fetchProductLink(
    product: ProductGenericType,
    storeId: any
  ): Promise<string> {
    const link = await fetchShopifyProductLink(
      product.productId as number,
      storeId
    );
    const [firstLink] = link;

    return firstLink.url;
  }
}
