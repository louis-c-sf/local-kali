import { ProductGenericType } from "core/models/Ecommerce/Cart/ProductGenericType";

export interface GenericCartItemType extends ProductGenericType {
  selectedVariantId: number | string;
  quantity: number;
  totalAmount: number;
  shareLink?: string;
  discountAmount?: string;
}

export function isGenericCartItem(
  x: ProductGenericType
): x is GenericCartItemType {
  return (x as GenericCartItemType).selectedVariantId !== undefined;
}
