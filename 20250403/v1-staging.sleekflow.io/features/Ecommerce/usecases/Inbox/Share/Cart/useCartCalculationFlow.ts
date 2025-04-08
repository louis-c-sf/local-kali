import { useFormik } from "formik";
import { CART_TAB_TYPE } from "features/Ecommerce/usecases/Inbox/Share/ShareProductModal";
import { CartDisplayFormikType } from "features/Ecommerce/usecases/Inbox/Share/Cart/CartDisplay";
import { useAppSelector, useAppDispatch } from "AppRootContext";
import { equals } from "ramda";
import { PaymentLinkSetType } from "core/models/Ecommerce/Payment/PaymentLinkType";
import { GenericCartItemType } from "core/models/Ecommerce/Catalog/GenericCartItemType";
import * as Sentry from "@sentry/browser";
import { useSendProductLink } from "component/Chat/Messenger/useSendProductLink";
import { useState } from "react";
import { useProductCartContext } from "features/Ecommerce/usecases/Inbox/Share/ShareProductModal/ProductCartContext";
import { useSendPaymentLink } from "features/Ecommerce/usecases/Inbox/Share/Cart/useSendPaymentLink";

export function useCartCalculationFlow(props: {
  linkMessageTemplate: string | undefined;
  currency: string;
  onSubmitPaymentLink?: (paymentLink: PaymentLinkSetType) => void;
  onClose: Function;
  storeId: number | string;
  isShopifyPaymentLink?: boolean;
}) {
  const cart = useAppSelector((s) => s.inbox.product?.cart, equals);
  const quantity = cart?.reduce((acc, c) => acc + c.quantity, 0) ?? 0;

  const userProfileId = useAppSelector((s) => s.profile.id);
  const language = useAppSelector((s) => s.inbox.product?.language);
  const totals = useAppSelector((s) => s.inbox.product?.totals, equals);

  const loginDispatch = useAppDispatch();
  const productCart = useProductCartContext();
  const { sendProductLink } = useSendProductLink(props.storeId, language ?? "");
  const sendPaymentLink = useSendPaymentLink({
    onClose: props.onClose,
    userProfileId,
    vendor: productCart.vendor,
    storeId: props.storeId,
    cart: cart ?? [],
    currency: props.currency,
    linkMessageTemplate: props.linkMessageTemplate,
    onSubmitPaymentLink: props.onSubmitPaymentLink,
    isShopifyPaymentLink: props.isShopifyPaymentLink,
  });

  const [loading, setLoading] = useState(false);

  const form: CartDisplayFormikType = useFormik({
    onSubmit: (values) => {
      if (values.selectedTab === "payment") {
        sendPaymentLink.send(values);
      } else {
        shareProducts();
      }
    },
    initialValues: {
      selectedTab: "payment" as CART_TAB_TYPE,
    },
  });

  async function shareProducts() {
    setLoading(true);
    const selectedProducts = (cart ?? []).reduce<GenericCartItemType[]>(
      (acc, item) => {
        if (acc.some((p) => p.productId === item.productId)) {
          return [...acc];
        }
        return [...acc, item];
      },
      []
    );
    try {
      await Promise.all(
        selectedProducts.map((product) => sendProductLink(product))
      );
      props.onClose();
    } catch (e) {
      Sentry.captureException(e);
    } finally {
      setLoading(false);
    }
  }

  return {
    form,
    selectedOrderItems: cart ?? [],
    loading: loading || sendPaymentLink.loading,
    quantity,
    recalculate() {
      if (language === undefined || cart?.length === 0) {
        return;
      }
      loginDispatch({
        type: "INBOX.CART.RECALCULATE",
        currency: props.currency,
        userProfileId,
        storeId: props.storeId,
        percentage: totals?.percentageDiscount ?? 0,
        selectedDiscount: totals?.discountType ?? "none",
        language,
      });
    },
  };
}
