import { PaymentLinkType } from "core/models/Ecommerce/Payment/PaymentLinkType";

export function getPaymentAmount(p: PaymentLinkType) {
  return Number(p.amount) * p.quantity - p.totalDiscount * p.quantity;
}
