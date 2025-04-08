import { getWithExceptions } from "../apiRequest";
import { GET_SLEEKPAY_RESULT } from "../apiPath";
import { PaymentLinkResultType } from "core/models/Ecommerce/Payment/PaymentLinkType";

export default function fetchPaymentResult(
  key: string
): Promise<PaymentLinkResultType> {
  return getWithExceptions(GET_SLEEKPAY_RESULT.replace("{resultId}", key), {
    param: {},
  });
}
