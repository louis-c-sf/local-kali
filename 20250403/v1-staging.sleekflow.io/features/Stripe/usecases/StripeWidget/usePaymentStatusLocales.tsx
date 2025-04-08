import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { PaymentStatusType } from "core/models/Ecommerce/Payment/PaymentLinkType";

export function usePaymentStatusLocales() {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  return useMemo(() => {
    const map: Record<PaymentStatusType, string> = {
      Canceled: t("chat.paymentLink.status.label.Canceled"),
      Failed: t("chat.paymentLink.status.label.Failed"),
      Paid: t("chat.paymentLink.status.label.Paid"),
      Pending: t("chat.paymentLink.status.label.Pending"),
      RefundCanceled: t("chat.paymentLink.status.label.RefundCanceled"),
      RefundFailed: t("chat.paymentLink.status.label.RefundFailed"),
      PartialRefund: t("chat.paymentLink.status.label.PartialRefund"),
      RefundPending: t("chat.paymentLink.status.label.RefundPending"),
      Refunded: t("chat.paymentLink.status.label.Refunded"),
    };
    return map;
  }, [language]);
}
