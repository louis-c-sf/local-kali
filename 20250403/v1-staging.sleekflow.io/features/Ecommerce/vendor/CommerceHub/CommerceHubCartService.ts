import { ShoppingCartServiceInterface } from "core/models/Ecommerce/Cart/ShoppingCartServiceInterface";
import { GenericCartItemType } from "core/models/Ecommerce/Catalog/GenericCartItemType";
import {
  ProductVariantGenericType,
  ProductVariantOptionGenericType,
} from "core/models/Ecommerce/Cart/ProductProviderInterface";
import { ProductGenericType } from "core/models/Ecommerce/Cart/ProductGenericType";

export class CommerceHubCartService implements ShoppingCartServiceInterface {
  getDefaultVariantStock(product: ProductGenericType): number {
    return Infinity;
  }

  getDefaultVariantId(
    product: ProductGenericType
  ): string | number | undefined {
    return product.variants[0]?.id;
  }

  canUseDiscounts(): boolean {
    return true;
  }

  getSelectedVariantOption(
    product: GenericCartItemType,
    currency: string
  ): ProductVariantOptionGenericType {
    const variant = this.getSelectedVariant(product);
    return {
      stock: Infinity,
      id: "",
      price: variant?.prices.find(({ code }) => code === currency)?.amount ?? 0,
    };
  }

  private getSelectedVariant(
    product: GenericCartItemType
  ): ProductVariantGenericType | undefined {
    return product.variants[0];
  }
}
