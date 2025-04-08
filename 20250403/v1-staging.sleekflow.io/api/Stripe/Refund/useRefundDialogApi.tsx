import useFetchCompany from "api/Company/useFetchCompany";
import { submitRefund } from "api/Stripe/Refund/submitRefund";
import { RefundFormValidType } from "features/Stripe/usecases/Refund/models/RefundFormType";
import { isAxiosHttpError } from "api/apiRequest";
import { RefundErrorType } from "core/models/Ecommerce/Payment/Refund/RefundErrorType";
import { StripeOrderType } from "types/Stripe/Settings/StripeOrderType";
import { PaymentHistoryRecordType } from "core/models/Ecommerce/Payment/PaymentLinkType";

export function useRefundDialogApi(
  payment: PaymentHistoryRecordType | StripeOrderType
) {
  const { company } = useFetchCompany();

  async function submit(data: RefundFormValidType) {
    if (!company) {
      throw "No company loaded";
    }
    const totalAmount = payment.payAmount;
    const isPartial = data.amount < totalAmount;
    try {
      return await submitRefund(
        company.id,
        payment.paymentId,
        isPartial,
        data.amount,
        data.reason,
        data.reasonDetail ?? undefined
      );
    } catch (e) {
      if (isAxiosHttpError(e)) {
        let error: RefundErrorType | undefined = undefined;
        if (e.response?.status === 400) {
          error = { code: "LogicError" };
        } else if (e.response?.status === 500) {
          error = { code: "SystemError" };
        } else {
          error = { code: "Unknown" };
        }
        throw error;
      }
      throw e;
    }
  }

  return {
    submit,
  };
}
