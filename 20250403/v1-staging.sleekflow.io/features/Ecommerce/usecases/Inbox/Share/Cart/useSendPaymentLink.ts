import { PaymentCartFormType } from "features/Ecommerce/usecases/Inbox/Share/ShareProductModal";
import {
  PaymentLinkType,
  PaymentLinkSetType,
  ShopifyPaymentLinkType,
} from "core/models/Ecommerce/Payment/PaymentLinkType";
import { CalculationItemType } from "core/models/Ecommerce/Catalog/GenericCartCalculationResult";
import { ProductOptionGenericType } from "core/models/Ecommerce/Cart/ProductProviderInterface";
import { submitCreatePaymentLinks } from "api/StripePayment/submitCreatePaymentLinks";
import { useAppSelector, useAppDispatch } from "AppRootContext";
import { equals } from "ramda";
import { useState } from "react";
import { GenericCartItemType } from "core/models/Ecommerce/Catalog/GenericCartItemType";
import { useSupportedRegions } from "core/models/Region/useSupportedRegions";
import { useFlashMessageChannel } from "component/BannerMessage/flashBannerMessage";
import { useTranslation } from "react-i18next";
import { ShoppingVendorType } from "../ShareProductModal/ProductCartContext";
import { getProductName } from "features/Ecommerce/vendor/CommerceHub/toGenericProduct";
import { postWithExceptions } from "api/apiRequest";
import {
  PaymentLinkResponseType,
  ShopifyPaymentLinkResponseType,
} from "core/models/Ecommerce/Payment/PaymentLinkResponseType";
import { htmlEscape } from "../../../../../../lib/utility/htmlEscape";

export function useSendPaymentLink(props: {
  storeId: string | number | undefined;
  cart: GenericCartItemType[];
  userProfileId: string;
  linkMessageTemplate: string | undefined;
  currency: string;
  onSubmitPaymentLink?: (paymentLink: PaymentLinkSetType) => void;
  onClose: Function;
  vendor: ShoppingVendorType;
  isShopifyPaymentLink?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const { currenciesSupported } = useSupportedRegions();
  const flash = useFlashMessageChannel();

  const { t } = useTranslation();
  const loginDispatch = useAppDispatch();
  const totals = useAppSelector((s) => s.inbox.product?.totals, equals);
  const language = useAppSelector((s) => s.inbox.product?.language);
  async function sendPaymentLink(values: PaymentCartFormType) {
    if (!props.storeId) {
      return;
    }
    if (totals === undefined) {
      throw { message: "Invalid calculation state", calculation: totals };
    }

    try {
      setLoading(true);

      const paymentLinks = props.cart.map<PaymentLinkType>((item) => {
        const foundVariantIndex = item.variants.findIndex(
          (s) => s.id === item.selectedVariantId
        );
        const calculatedMatch = totals.items.find(
          (tItem: CalculationItemType) =>
            item.productId === tItem.productId &&
            item.selectedVariantId === tItem.productVariantId
        );

        return {
          metadata: {
            variantId: item.selectedVariantId,
          },
          name: getProductName(item, language ?? ""),
          description:
            item.variantsOptions.length > 1
              ? item.options
                  .map(
                    (option: ProductOptionGenericType) =>
                      item.variantsOptions[foundVariantIndex][
                        option.name
                      ] as string
                  )
                  .join(",")
              : "",
          currency: props.currency,
          images: item.image ? [item.image] : undefined,
          quantity: item.quantity,
          amount:
            props.vendor === "shopify"
              ? `${calculatedMatch?.amount ?? "-"}`
              : calculatedMatch?.amount ?? 0,
          totalDiscount: calculatedMatch?.totalDiscount ?? 0,
        };
      });

      const apiPaymentLinks = !props.isShopifyPaymentLink
        ? [...paymentLinks]
        : props.cart.map<ShopifyPaymentLinkType>((item) => ({
            variantId: item.selectedVariantId,
            quantity: item.quantity,
            discountOption: {},
          }));

      const expiredAtObj = values.expiredAt
        ? { expiredAt: values.expiredAt?.toISOString() }
        : {};

      const request: PaymentLinkSetType = {
        userprofileId: props.userProfileId,
        lineItems: apiPaymentLinks as PaymentLinkType[],
        ...expiredAtObj,
      };

      if (props.vendor === "shopify") {
        request.shopifyId = props.storeId;
      }

      if (props.onSubmitPaymentLink) {
        props.onSubmitPaymentLink(request);
      } else {
        const foundCurrency = currenciesSupported.find(
          (c) => c.currencyCode.toLowerCase() === props.currency.toLowerCase()
        );
        if (!foundCurrency && !props.isShopifyPaymentLink) {
          flash(
            t("chat.shopifyProductsModal.cart.error.notSupportedCurrency", {
              currency: htmlEscape(props.currency),
            })
          );
          return;
        }
        let result: PaymentLinkResponseType | ShopifyPaymentLinkResponseType;
        if (props.isShopifyPaymentLink) {
          result = await postWithExceptions(
            `/Shopify/DraftOrder?shopifyId=${request.shopifyId}`,
            {
              param: {
                userProfileId: request.userprofileId,
                draftOrderLineItems: apiPaymentLinks,
              },
            }
          );
        } else {
          result = await submitCreatePaymentLinks(
            request,
            foundCurrency?.countryCode
          );
        }

        loginDispatch({
          type: "INBOX.PAYMENT_LINK.COMPLETE",
          link: result,
          lineItems: props.isShopifyPaymentLink ? [] : paymentLinks,
          messageTemplate:
            props.linkMessageTemplate ?? t("chat.paymentLink.sendTemplate"),
        });
      }
      loginDispatch({
        type: "INBOX.CART.CLEAR",
        storeId: props.storeId,
        userProfileId: props.userProfileId,
        vendor: props.vendor,
      });
      props.onClose();
    } catch (e) {
      console.error(`POST_SHOPIFY_DRAFT_ORDER ${e}`);
    } finally {
      setLoading(false);
    }
  }

  return { send: sendPaymentLink, loading };
}
