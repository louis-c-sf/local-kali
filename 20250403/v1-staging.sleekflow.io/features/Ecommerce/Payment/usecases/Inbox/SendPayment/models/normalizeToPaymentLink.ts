import { PaymentLinkFormItemType } from "features/Ecommerce/Payment/usecases/Inbox/SendPayment/contracts/PaymentFormType";
import { PaymentLinkType } from "core/models/Ecommerce/Payment/PaymentLinkType";
import { money } from "utility/math/money";

export function normalizeToPaymentLink(
  pmt: PaymentLinkFormItemType,
  discount: number
): PaymentLinkType {
  const amountNum = money(pmt.amount);
  const discountTotal = amountNum.mul(discount).div(100).todp(2).toNumber();
  return {
    amount: amountNum.toNumber(),
    quantity: pmt.quantity,
    totalDiscount: discountTotal,
    images: [],
    paidAt: undefined,
    metadata: pmt.metadata,
    currency: pmt.currency,
    description: pmt.description,
    name: pmt.name,
  };
}
