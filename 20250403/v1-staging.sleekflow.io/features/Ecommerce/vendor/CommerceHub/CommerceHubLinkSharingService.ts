import { LinkSharingServiceInterface } from "core/models/Ecommerce/Cart/LinkSharingServiceInterface";
import { ProductGenericType } from "core/models/Ecommerce/Cart/ProductGenericType";
import { fetchMessageShareTemplate } from "api/CommerceHub/Cart/fetchMessageShareTemplate";
import { formatCurrency } from "utility/string";
import {
  getProductName,
  getProductDescription,
} from "features/Ecommerce/vendor/CommerceHub/toGenericProduct";

export class CommerceHubLinkSharingService
  implements LinkSharingServiceInterface
{
  constructor(private storeId: string) {}

  async buildProductMessageText(
    product: ProductGenericType,
    variantId: string | number,
    shareLink: string,
    price: { amount: number; currency: string },
    language: string
  ): Promise<{ text: string; image: string | null }> {
    const result = await fetchMessageShareTemplate(
      this.storeId,
      product.productId as string,
      variantId as string,
      price.currency,
      language
    );
    const text = result.data.message_preview.text;
    return {
      text:
        `${getProductName(product, language)}\n` +
        `${formatCurrency(price.amount, price.currency)}\n\n` +
        `${getProductDescription(product, language)}\n` +
        (shareLink ? `\n${shareLink}` : "") +
        `\n${text}`,
      image: result.data.message_preview.coverImageUrl || null,
    };
  }

  async fetchProductLink(
    product: ProductGenericType,
    storeId: any
  ): Promise<string> {
    return product.shareUrl ?? "";
  }
}
