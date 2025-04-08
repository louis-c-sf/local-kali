import produce from "immer";
import { LoginType, Action } from "types/LoginType";
import { initialUser } from "context/LoginContext";
import { mergeLeft } from "ramda";
import { matchesCurrencyCode } from "features/Ecommerce/usecases/Inbox/Share/ShareProductModal/useFetchProducts";
import { ProductGenericType } from "core/models/Ecommerce/Cart/ProductGenericType";
import { ShoppingVendorType } from "features/Ecommerce/usecases/Inbox/Share/ShareProductModal/ProductCartContext";
import { GenericCartItemType } from "core/models/Ecommerce/Catalog/GenericCartItemType";
import { GenericCartCalculationResult } from "core/models/Ecommerce/Catalog/GenericCartCalculationResult";
import { PaymentCartFormType } from "features/Ecommerce/usecases/Inbox/Share/ShareProductModal";
import { reduceReducersWithDefaults } from "utility/reduce-reducers";
import { shopifyCartReducer } from "features/Ecommerce/vendor/Shopify/reducers/shopifyCartReducer";
import { SelectedDiscountType } from "types/ShopifyProductType";

export type ProductActionType =
  | {
      type: "INBOX.SHOPIFY_MODAL.OPEN";
      storeId: number;
      vendor: "shopify";
      language: undefined;
      languages: [];
    }
  | {
      type: "INBOX.SHOPIFY_MODAL.OPEN";
      storeId: string;
      vendor: "commerceHub";
      userProfileId: string;
      language: string;
      languages: Array<{ code: string; name: string }>;
    }
  | {
      type: "INBOX.SHOPIFY_MODAL.UPDATED";
      storeId: string;
      vendor: ShoppingVendorType;
      items: GenericCartItemType[];
    }
  | {
      type: "INBOX.CART.ADD";
      variantId: number | string;
      product: ProductGenericType;
      storeId: string | number;
      quantity: number;
      currency: string;
      vendor: ShoppingVendorType;
      language: string;
    }
  | {
      type: "INBOX.CART.UPDATE.CURRENCY";
      currency: string;
    }
  | {
      type: "INBOX.CART.UPDATE.QUANTITY";
      variantId: number | string;
      productId: number | string;
      quantity: number;
      currency: string;
      storeId: string | number;
      form: PaymentCartFormType;
    }
  | {
      type: "INBOX.CART.CHANGE.DISCOUNT_TYPE";
      storeId: string | number;
      currency: string;
      discountType: SelectedDiscountType;
      userProfileId: string;
      cart: GenericCartItemType[];
      overallDiscountPercent: number;
    }
  | {
      type: "INBOX.CART.UPDATE.DISCOUNT";
      variantId: number | string;
      productId: number | string;
      quantity: number;
      storeId: string | number;
      currency: string;
      form: PaymentCartFormType;
      discount?: string;
    }
  | {
      type: "INBOX.CART.ITEM_DELETE";
      productId: number | string;
      variantId: number | string;
      storeId: string | number;
      currency: string;
      quantity: number;
    }
  | {
      type: "INBOX.SHOPIFY_MODAL.CLOSE";
      storeId: string | number;
      userProfileId: string;
      vendor: ShoppingVendorType;
    }
  | {
      type: "INBOX.CART.SEARCH";
      search: string;
    }
  | {
      type: "INBOX.CART.CLEAR";
      storeId: string | number;
      userProfileId: string;
      vendor: ShoppingVendorType;
      currency?: string;
    }
  | {
      type: "INBOX.CART.CLEARED";
    }
  | {
      type: "INBOX.CART.RECALCULATE";
      language: string;
      storeId: string | number;
      userProfileId: string;
      currency: string;
      selectedDiscount: SelectedDiscountType;
      percentage: number;
    }
  | {
      type: "INBOX.CART.RECALCULATED";
      result: GenericCartCalculationResult;
    }
  | {
      type: "INBOX.CART.LANGUAGE_SELECTED";
      language: string;
    }
  | {
      type: "INBOX.CART.LOADING";
    };

export function findVariantPrice(
  product: ProductGenericType,
  variantId: number | string,
  currency: string
) {
  const selectedProduct = product.variants.find((v) => v.id === variantId);
  if (!selectedProduct) {
    return 0;
  }
  if (selectedProduct.multipleCurrencies) {
    return (
      selectedProduct.multipleCurrencies?.find(matchesCurrencyCode(currency))
        ?.amount ?? 0
    );
  }
  return (
    selectedProduct.prices.find(({ code }) => code === currency)?.amount ?? 0
  );
}

const productCommonReducer = produce(
  (draft: LoginType = initialUser, action: Action) => {
    const cart = draft.inbox.product?.cart;
    switch (action.type) {
      case "INBOX.SHOPIFY_MODAL.OPEN":
        draft.inbox.product = mergeLeft(
          {
            showModal: true,
            calcLoading: false,
            productId: undefined,
            vendor: action.vendor,
            storeId: action.storeId,
            language: action.language ?? "",
            languages: action.languages,
            cart: undefined,
            currency: null,
          },
          draft.inbox.product ?? {}
        );
        break;

      case "INBOX.SHOPIFY_MODAL.CLOSE":
        draft.inbox.product = undefined;
        break;

      case "INBOX.CART.ITEM_DELETE":
        if (!draft.inbox.product) {
          return;
        }
        if (!cart) {
          return;
        }
        let foundDeleteIndex = cart.findIndex(
          (s) =>
            s.productId === action.productId &&
            s.selectedVariantId === action.variantId
        );
        if (foundDeleteIndex === -1) {
          return;
        }
        cart.splice(foundDeleteIndex, 1);
        break;

      case "INBOX.CART.ADD":
        if (!draft.inbox.product) {
          draft.inbox.product = {
            showModal: true,
            cart: [],
            vendor: action.vendor,
            language: action.language,
            languages: [],
            calcLoading: false,
            currency: null,
          };
        }
        if (!cart) {
          draft.inbox.product.cart = [
            {
              ...action.product,
              selectedVariantId: action.variantId,
              quantity: action.quantity,
              totalAmount:
                action.quantity *
                Number(
                  findVariantPrice(
                    action.product,
                    action.variantId,
                    action.currency
                  )
                ),
              discountAmount: "",
            },
          ];
        } else {
          cart.push({
            ...action.product,
            selectedVariantId: action.variantId,
            quantity: action.quantity,
            totalAmount:
              action.quantity *
              Number(
                findVariantPrice(
                  action.product,
                  action.variantId,
                  action.currency
                )
              ),
            discountAmount: "",
          });
        }
        break;

      case "INBOX.CART.UPDATE.DISCOUNT":
        if (!cart) {
          return;
        }
        const foundIndex = cart.findIndex(
          (c) =>
            c.selectedVariantId === action.variantId &&
            c.productId === action.productId
        );
        if (foundIndex > -1) {
          cart[foundIndex].discountAmount = action.discount;
        }
        break;

      case "INBOX.CART.UPDATE.QUANTITY":
        if (!cart) {
          return;
        }
        let foundUpdateIndex = cart.findIndex(
          (c) =>
            c.selectedVariantId === action.variantId &&
            c.productId === action.productId
        );
        if (foundUpdateIndex > -1) {
          cart[foundUpdateIndex].quantity = action.quantity;
          cart[foundUpdateIndex].totalAmount =
            findVariantPrice(
              cart[foundUpdateIndex],
              action.variantId,
              action.currency
            ) * action.quantity;
        }
        break;

      case "INBOX.SHOPIFY_MODAL.UPDATED":
        if (!draft.inbox.product) {
          return;
        }
        draft.inbox.product.cart = action.items;
        //todo handle status?
        break;

      case "INBOX.CART.CLEAR":
        if (!draft.inbox.product) {
          return;
        }
        draft.inbox.product.cart = undefined;
        if (action.currency !== undefined) {
          draft.inbox.product.currency = action.currency;
        }
        break;

      case "INBOX.CART.CHANGE.DISCOUNT_TYPE":
        if (!draft.inbox.product?.totals) {
          return;
        }
        draft.inbox.product.totals.percentageDiscount =
          action.overallDiscountPercent;
        draft.inbox.product.totals.discountType = action.discountType;
        break;

      case "INBOX.CART.RECALCULATE":
        if (!draft.inbox.product) {
          return;
        }
        if (draft.inbox.product.vendor === "commerceHub") {
          draft.inbox.product.calcLoading = true;
        }
        if (!draft.inbox.product.totals) {
          draft.inbox.product.totals = {
            discountType: action.selectedDiscount,
            percentageDiscount: action.percentage,
            items: [],
            totalAmount: 0,
            subtotalAmount: 0,
          };
          return;
        }
        draft.inbox.product.totals.percentageDiscount = action.percentage;
        draft.inbox.product.totals.discountType = action.selectedDiscount;
        break;

      case "INBOX.CART.RECALCULATED":
        if (!draft.inbox.product) {
          return;
        }
        draft.inbox.product.calcLoading = false;
        draft.inbox.product.totals = action.result;
        break;

      case "INBOX.CART.UPDATE.CURRENCY":
        if (!draft.inbox.product) {
          return;
        }
        draft.inbox.product.currency = action.currency;
        break;

      case "INBOX.CART.LANGUAGE_SELECTED":
        if (!draft.inbox.product) {
          return;
        }
        draft.inbox.product.language = action.language;
        break;

      case "INBOX.CART.LOADING":
        if (!draft.inbox.product) {
          return;
        }
        draft.inbox.product.calcLoading = true;
        break;
    }
  }
);

export const productReducer = reduceReducersWithDefaults(
  productCommonReducer,
  shopifyCartReducer
);
