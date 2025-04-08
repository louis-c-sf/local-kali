import produce from "immer";
import { LoginType, Action } from "types/LoginType";
import { initialUser } from "context/LoginContext";
import { GenericCartCalculationResult } from "core/models/Ecommerce/Catalog/GenericCartCalculationResult";
import { GenericCartItemType } from "core/models/Ecommerce/Catalog/GenericCartItemType";
import { SelectedDiscountType } from "types/ShopifyProductType";

export const shopifyCartReducer = produce(
  (draft: LoginType = initialUser, action: Action) => {
    const productPart = draft.inbox.product;
    if (productPart?.vendor !== "shopify") {
      return;
    }

    switch (action.type) {
      case "INBOX.CART.RECALCULATE":
        if (!productPart) {
          return;
        }
        if (!productPart.cart) {
          productPart.cart = [];
        }
        if (action.selectedDiscount !== "fixed") {
          productPart.cart = productPart.cart.map((item) => ({
            ...item,
            discountAmount: "",
          }));
        }
        productPart.totals = calculatePrice(
          productPart.cart,
          productPart.totals?.discountType ?? "none",
          productPart.totals?.percentageDiscount ?? 0
        );
        break;
    }
  }
);

function calculatePrice(
  itemsDenormalized: GenericCartItemType[],
  discount: SelectedDiscountType,
  percentage: number
): GenericCartCalculationResult {
  const totalAmount = itemsDenormalized.reduce(
    (acc, item) => acc + item.totalAmount,
    0
  );
  const afterDiscountTotal = itemsDenormalized.reduce(
    (acc, item) =>
      acc -
      displayedDiscount(
        item.quantity,
        item.totalAmount,
        item.discountAmount ? Number(item.discountAmount) : 0,
        discount,
        percentage
      ),
    totalAmount
  );

  const items = itemsDenormalized.map((item) => {
    const totalDiscount =
      displayedDiscount(
        item.quantity,
        item.totalAmount,
        item.discountAmount ? Number(item.discountAmount) : 0,
        discount,
        percentage
      ) / item.quantity;
    const amount = Number(item.totalAmount) / item.quantity;

    return {
      productId: item.productId,
      productVariantId: item.selectedVariantId,
      quantity: item.quantity,
      amount: amount,
      totalDiscount: totalDiscount,
      preview: null,
    };
  });

  return {
    items: items,
    subtotalAmount: totalAmount,
    totalAmount: afterDiscountTotal,
    discountType: discount,
    percentageDiscount: percentage,
  };
}

function displayedDiscount(
  quantity: number,
  totalAmount: number,
  discount: number,
  selectedDiscountType: SelectedDiscountType,
  percentage: number
) {
  if (selectedDiscountType === "percentage") {
    return (totalAmount * percentage) / 100;
  }
  return quantity * discount;
}
