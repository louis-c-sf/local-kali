import { getWithExceptions } from "../apiRequest";
import {
  PaymentHistoryRecordType,
  PaymentStatusType,
} from "core/models/Ecommerce/Payment/PaymentLinkType";

export function fetchConversationPaymentsHistory(
  conversationId: string,
  status: PaymentStatusType,
  offset: number,
  limit: number
): Promise<PaymentHistoryResponseType> {
  return getWithExceptions(`/SleekPay/userProfile/${conversationId}/payments`, {
    param: {
      status,
      limit,
      offset,
    },
  });
}

export type PaymentHistoryResponseType = {
  stripePaymentCustomerPaymentHistoryRecords: Array<PaymentHistoryRecordType>;
  totalNumberOfRecords: number;
};
