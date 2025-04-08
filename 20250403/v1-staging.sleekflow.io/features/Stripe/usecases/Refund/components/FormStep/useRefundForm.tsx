import { number, object, string } from "yup";
import { useFormik } from "formik";
import {
  RefundFormType,
  RefundFormValidType,
} from "../../models/RefundFormType";
import { useTranslation } from "react-i18next";
import { formatCurrency, toFloat } from "../../../../../../utility/string";
import { StripeOrderType } from "types/Stripe/Settings/StripeOrderType";
import { PaymentHistoryRecordType } from "core/models/Ecommerce/Payment/PaymentLinkType";

export function useRefundForm(props: {
  payment: PaymentHistoryRecordType | StripeOrderType;
  initValues: RefundFormType | undefined;
  submit: (data: RefundFormValidType) => void;
}) {
  const { initValues, payment, submit } = props;
  const { t } = useTranslation();
  const totalAmount = payment.payAmount;

  const refundedAmount =
    payment.status === "PartialRefund" && payment.refundedAmount
      ? toFloat(payment.refundedAmount) ?? 0
      : 0;
  const maxAmount = totalAmount - refundedAmount;

  const currency = payment.lineItems[0]?.currency ?? "HKD";

  const amountMessage = t("chat.payment.refund.error.amount", {
    min: formatCurrency(0.01, currency),
    max: maxAmount.toFixed(2),
  });
  const amountMaxMessage = t("chat.payment.refund.error.amountMax", {
    max: formatCurrency(maxAmount, currency),
  });
  const requiredMessage = t("chat.payment.refund.error.required");

  return useFormik<RefundFormType>({
    initialValues: initValues ?? {
      amount: 0,
      reason: null,
      reasonDetail: null,
    },
    onSubmit: (values) => submit(values as RefundFormValidType),
    validationSchema: object({
      amount: number()
        .required(amountMessage)
        .min(0.01, amountMaxMessage)
        .max(maxAmount, amountMaxMessage),
      reason: string().nullable().required(requiredMessage),
      reasonDetail: string()
        .nullable()
        .when("reason", {
          is: "Custom",
          then: string().required(requiredMessage),
        }),
    }),
  });
}
