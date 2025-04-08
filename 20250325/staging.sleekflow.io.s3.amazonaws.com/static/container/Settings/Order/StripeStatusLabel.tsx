import {
  LabelColorType,
  StatusLabel,
} from "component/shared/Label/StatusLabel";
import { useTranslation } from "react-i18next";
import React from "react";
import { PaymentStatusType } from "core/models/Ecommerce/Payment/PaymentLinkType";

function getStatusColor(status: PaymentStatusType) {
  const mapping: Record<PaymentStatusType, LabelColorType> = {
    Canceled: "red",
    Paid: "green",
    Pending: "yellow",
    Failed: "red",
    RefundPending: "yellow",
    Refunded: "green",
    PartialRefund: "blue",
    RefundFailed: "red",
    RefundCanceled: "green",
  };
  return mapping[status];
}

export function StripeStatusLabel(props: { status: PaymentStatusType }) {
  const { t } = useTranslation();
  let { status } = props;

  function getStatusText(status: PaymentStatusType) {
    const mapping: Record<PaymentStatusType, string> = {
      Pending: t("settings.paymentLink.order.status.pending.singular"),
      Paid: t("settings.paymentLink.order.status.paid.singular"),
      Canceled: t("settings.paymentLink.order.status.canceled.singular"),
      Failed: t("settings.paymentLink.order.status.failed.singular"),
      Refunded: t("settings.paymentLink.order.status.refunded.singular"),
      PartialRefund: t(
        "settings.paymentLink.order.status.refundedPartially.singular"
      ),
      RefundPending: t(
        "settings.paymentLink.order.status.refundPending.singular"
      ),
      RefundCanceled: t(
        "settings.paymentLink.order.status.refundCanceled.singular"
      ),
      RefundFailed: t(
        "settings.paymentLink.order.status.refundFailed.singular"
      ),
    };
    return mapping[status];
  }

  return (
    <StatusLabel color={getStatusColor(status)}>
      {getStatusText(status)}
    </StatusLabel>
  );
}
