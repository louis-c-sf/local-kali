import { PaymentLinkType } from "./PaymentLinkType";
import { add } from "ramda";
import { getPaymentAmount } from "core/models/Ecommerce/Payment/getPaymentAmount";

export function getPaymentsSum(payments: PaymentLinkType[]) {
  return payments.map(getPaymentAmount).reduce(add);
}
