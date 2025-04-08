import { PaymentFormType } from "features/Ecommerce/Payment/usecases/Inbox/SendPayment/contracts/PaymentFormType";
import Decimal from "decimal.js-light";
import { money } from "utility/math/money";

function getDiscount(form: PaymentFormType): Decimal {
  const discountRate = form.discount.rate ?? 0;
  return getSubTotal(form).div(100).mul(discountRate);
}

export function getSubTotal(form: PaymentFormType): Decimal {
  return form.payments.reduce<Decimal>(
    (acc, next) =>
      next.amount ? money(next.amount).mul(next.quantity).add(acc) : acc,
    money(0)
  );
}

export function getTotal(form: PaymentFormType): Decimal {
  return getSubTotal(form).sub(getDiscount(form)).todp(2, Decimal.ROUND_FLOOR);
}
