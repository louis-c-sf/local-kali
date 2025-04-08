import { postWithExceptions } from "api/apiRequest";
import { RefundReasonType } from "core/models/Ecommerce/Payment/Refund/RefundReasonType";
import { RefundRequestType } from "api/Stripe/Refund/RefundRequestType";
import { RefundResponseType } from "api/Stripe/Refund/RefundResponseType";

export async function submitRefund(
  companyId: string,
  paymentIntentId: string,
  isPartial: boolean,
  amount: number,
  reason: RefundReasonType,
  customReason?: string
): Promise<RefundResponseType> {
  const param: RefundRequestType = {
    companyId,
    paymentIntentId,
    isPartialRefund: isPartial,
    refundAmount: amount,
    reason,
  };

  if (customReason) {
    param.customReason = customReason;
  }

  return await postWithExceptions("/SleekPay/refund", { param });
}
