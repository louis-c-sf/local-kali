import { useTranslation } from "react-i18next";

export function useShopifyLocales() {
  const { t } = useTranslation();
  const orderDetailField = {
    orderName: t("chat.shopify.orderName"),
    createdAt: t("chat.shopify.createdAt"),
    url: t("chat.shopify.url"),
    adminUrl: t("chat.shopify.adminUrl"),
    updatedAt: t("chat.shopify.updatedAt"),
    payment: t("chat.shopify.payment"),
    status: t("chat.shopify.status"),
    fulfillment: t("chat.shopify.fulfillment"),
    note: t("chat.shopify.note"),
    courier: t("chat.shopify.courier"),
    trackingNumber: t("chat.shopify.trackingNumber"),
  };
  const abandonedField = {
    quantity: t("chat.shopify.quantity"),
    date: t("chat.shopify.date"),
    abandonedURL: t("chat.shopify.abandonedUrl"),
  };

  return {
    orderDetailField,
    abandonedField,
  };
}
