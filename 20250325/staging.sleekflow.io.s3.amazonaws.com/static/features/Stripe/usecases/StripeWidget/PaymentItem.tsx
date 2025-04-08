import styles from "./PaymentItem.module.css";
import { CopyField } from "component/Chat/ShopifyWidget/CopyField";
import { Accordion } from "component/Chat/BaseWidget/Accordion";
import { formatCurrency } from "utility/string";
import React from "react";
import { showCurrency } from "./PaymentList";
import moment from "moment/moment";
import { useCurrentUtcOffset } from "component/Chat/hooks/useCurrentUtcOffset";
import {
  STRIPE_REFUND_DAYS_MAX,
  usePaymentsPolicy,
} from "core/policies/Ecommerce/Payments/usePaymentsPolicy";
import { useTranslation } from "react-i18next";
import { useRefundDialogContext } from "../Refund/contracts/RefundDialogContext";
import { InfoTooltip } from "component/shared/popup/InfoTooltip";
import { OrderItem } from "./OrderItem";
import { StripeOrderType } from "types/Stripe/Settings/StripeOrderType";
import { MaskedId } from "features/Stripe/usecases/StripeWidget/MaskedId";
import { PaymentHistoryRecordNormalizedType } from "core/models/Ecommerce/Payment/PaymentLinkType";
import { getPaymentsSum } from "core/models/Ecommerce/Payment/getPaymentsSum";
import { htmlEscape } from "../../../../lib/utility/htmlEscape";

export function showPaymentCurrency<
  T extends PaymentHistoryRecordNormalizedType | StripeOrderType
>(payment: T) {
  const [item] = payment.lineItems;
  if (item?.currency) {
    return showCurrency(item.currency);
  } else {
    return showCurrency("HKD");
  }
}

export function PaymentItem(props: {
  payment: PaymentHistoryRecordNormalizedType;
  isLast: boolean;
}) {
  const { isLast, payment } = props;
  const { t } = useTranslation();
  const utcOffset = useCurrentUtcOffset();
  const paymentsPolicy = usePaymentsPolicy();
  const createdAt = moment(payment.createdAt).utcOffset(utcOffset);
  const { start } = useRefundDialogContext();

  function getRefundBlockReason(payment: PaymentHistoryRecordNormalizedType) {
    if (paymentsPolicy.isAlreadyRefunded(payment)) {
      return t("chat.payment.refund.blocked.refunded");
    }
    if (!paymentsPolicy.isWithinRefundTimeWindow(payment)) {
      return t("chat.payment.refund.blocked.outOfTimeWindow", {
        count: STRIPE_REFUND_DAYS_MAX,
      });
    }
    return undefined;
  }

  const actionLinks = [];

  if (paymentsPolicy.isRefundableByStatus(payment)) {
    if (paymentsPolicy.isRefundPossible(payment)) {
      actionLinks.push(
        <a className={styles.link} onClick={() => start(payment)}>
          {t("chat.paymentLink.statusWidget.field.action.refund")}
        </a>
      );
    } else {
      actionLinks.push(
        <InfoTooltip
          placement={"bottom"}
          trigger={
            <a className={`${styles.link} ${styles.disabled}`}>
              {t("chat.paymentLink.statusWidget.field.action.refund")}
            </a>
          }
        >
          {getRefundBlockReason(payment)}
        </InfoTooltip>
      );
    }
  }

  return (
    <div
      className={` ${styles.payment} ${isLast ? styles.last : ""}`}
      key={payment.paymentId}
    >
      <div className={styles.row}>
        <div className={styles.label}>
          {t("chat.paymentLink.statusWidget.field.payment")}
        </div>
        <div className={styles.value}>
          <MaskedId value={payment.paymentId} />
        </div>
      </div>
      {payment.orderNo !== undefined &&
        payment.eshopPlatformOrderTrackingUrl !== undefined && (
          <div className={styles.row}>
            <div className={styles.label}>
              {t("chat.paymentLink.statusWidget.field.order")}
            </div>
            <div className={styles.value}>
              <a
                href={htmlEscape(payment.eshopPlatformOrderTrackingUrl)}
                target={"_blank"}
                rel={"noopener noreferrer"}
              >
                {payment.orderNo}
              </a>
            </div>
          </div>
        )}
      <div className={styles.row} key={"createdAt"}>
        <div className={styles.label}>
          {t("chat.paymentLink.statusWidget.field.createdAt")}
        </div>
        <div className={styles.value}>
          {createdAt.format("YYYY-MM-DD hh:mm A")}
        </div>
      </div>
      {payment.payAmount > 0 && (
        <div className={styles.row} key={"shippingFee"}>
          <div className={styles.label}>
            {t("chat.paymentLink.statusWidget.field.shippingFee")}
          </div>
          <div className={styles.value}>
            {`${showPaymentCurrency(payment)} ${formatCurrency(
              payment.payAmount - getPaymentsSum(payment.lineItems)
            )}`}
          </div>
        </div>
      )}
      {actionLinks.length > 0 && (
        <div className={`${styles.row} ${styles.actions}`}>
          <div className={styles.label}>
            {t("chat.paymentLink.statusWidget.field.actions")}
          </div>
          <div className={styles.links}>{actionLinks}</div>
        </div>
      )}
      <Accordion
        initOpen={false}
        head={`${payment.lineItems.length} ${t("chat.shopify.items")}`}
        headSuffix={`${showPaymentCurrency(payment)} ${formatCurrency(
          getPaymentsSum(payment.lineItems)
        )}`}
      >
        <div>
          {payment.lineItems.map((item, itemIdx) => (
            <OrderItem item={item} index={itemIdx} key={itemIdx} />
          ))}
        </div>
        {payment.paymentTrackingUrl && (
          <div className={styles.row} key={"paymentURL"}>
            <div className={styles.label}>
              {t("chat.paymentLink.statusWidget.field.paymentURL")}
            </div>
            <div className={styles.value}>
              <CopyField value={payment.paymentTrackingUrl} showText />
            </div>
          </div>
        )}
      </Accordion>
    </div>
  );
}
