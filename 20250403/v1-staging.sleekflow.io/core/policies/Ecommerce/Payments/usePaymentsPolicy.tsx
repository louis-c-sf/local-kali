import { useFeaturesGuard } from "component/Settings/hooks/useFeaturesGuard";
import moment from "moment";
import { isWithinMaxWindow } from "core/policies/Ecommerce/Payments/isWithinMaxWindow";
import { PaymentPolicyInterface } from "core/policies/Ecommerce/Payments/models/PaymentPolicyInterface";
import { PaymentHistoryRecordType } from "core/models/Ecommerce/Payment/PaymentLinkType";
import { useAppSelector } from "AppRootContext";
import { useMemo } from "react";
import equals from "fast-deep-equal";
import { isFreeOrFreemiumPlan } from "types/PlanSelectionType";

export const STRIPE_REFUND_DAYS_MAX = 30;

export function usePaymentsPolicy(): PaymentPolicyInterface {
  const featuresGuard = useFeaturesGuard();
  const currentPlan = useAppSelector((s) => s.currentPlan, equals);

  function isAlreadyRefunded(payment: PaymentHistoryRecordType) {
    return ["Refunded"].includes(payment.status);
  }

  function isRefundableByStatus(payment: PaymentHistoryRecordType) {
    return ["Paid", "PartialRefund"].includes(payment.status);
  }

  function isWithinRefundTimeWindow(payment: PaymentHistoryRecordType) {
    if (!payment.paidAt) {
      return false;
    }
    const date = moment.utc(payment.paidAt);
    if (!date) {
      return false;
    }
    const now = moment();

    return isWithinMaxWindow(date, now, STRIPE_REFUND_DAYS_MAX);
  }

  function isRefundPossible(payment: PaymentHistoryRecordType) {
    if (!featuresGuard.canUseStripePayments()) {
      return false;
    }

    return (
      !isAlreadyRefunded(payment) &&
      isRefundableByStatus(payment) &&
      isWithinRefundTimeWindow(payment)
    );
  }

  const canUseCommercePayments = useMemo(() => {
    return currentPlan ? !isFreeOrFreemiumPlan(currentPlan) : false;
  }, [currentPlan]);

  return {
    isRefundPossible,
    isWithinRefundTimeWindow,
    isAlreadyRefunded,
    isRefundableByStatus,
    canUseCommercePayments,
  };
}
