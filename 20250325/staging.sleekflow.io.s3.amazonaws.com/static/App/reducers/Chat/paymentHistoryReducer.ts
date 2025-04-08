import produce from "immer";
import { initialUser } from "context/LoginContext";
import { LoginType, Action } from "types/LoginType";
import { assoc, mergeRight } from "ramda";
import { PaymentAttachedToMessage } from "core/models/Ecommerce/Payment/PaymentLInkProxyType";
import {
  PaymentHistoryRecordNormalizedType,
  PaymentHistoryRecordType,
  PaymentStatusType,
} from "core/models/Ecommerce/Payment/PaymentLinkType";

export type PaymentHistoryStateType = {
  records: PaymentHistoryRecordNormalizedType[];
};

export type PaymentHistoryActionType =
  | {
      type: "INBOX.PAYMENT_HISTORY.UPDATED";
      paymentIntentId: string;
      status: PaymentStatusType;
      paidAt?: string;
      payAmount: number;
    }
  | {
      type: "INBOX.PAYMENT_HISTORY.LOADED";
      data: PaymentHistoryRecordType[];
      profileId: string;
    }
  | {
      type: "INBOX.PAYMENT_HISTORY.REFUNDED";
      paymentIntentId: string;
      status: PaymentStatusType;
      refundAmount: string;
    };

export const paymentHistoryReducer = produce(
  (draft: LoginType = initialUser, action: Action) => {
    const draftHistory = draft.inbox.paymentHistory;

    switch (action.type) {
      case "MESSAGE_UPDATED": {
        const paymentUpdated = action.message.sleekPayRecord;
        if (!paymentUpdated) {
          return;
        }
        draftHistory.records = updateHistoryCache(
          draftHistory.records,
          paymentUpdated
        );
        break;
      }
      case "UPDATE_MESSAGE_STATUS": {
        const paymentUpdated = action.receivedMessage.sleekPayRecord;
        if (!paymentUpdated) {
          return;
        }
        draftHistory.records = updateHistoryCache(
          draftHistory.records,
          paymentUpdated
        );
        break;
      }

      case "INBOX.PAYMENT_HISTORY.UPDATED": {
        const historyIndex = draftHistory.records.findIndex(
          (r) => r.paymentId === action.paymentIntentId
        );
        if (historyIndex > -1) {
          draftHistory.records[historyIndex].status = action.status;
          draftHistory.records[historyIndex].payAmount = action.payAmount;
          if (action.paidAt) {
            draftHistory.records[historyIndex].paidAt = action.paidAt;
          }
        }

        for (let msg of draft.messagesMemoized) {
          const msgPayment = msg.sleekPayRecord;
          if (
            msgPayment &&
            msgPayment.stripePaymentIntentId === action.paymentIntentId
          ) {
            const paymentUpdated = updatePaymentStatus(
              msgPayment,
              action.status
            );
            msg.sleekPayRecord = paymentUpdated;
          }
        }
        break;
      }

      case "INBOX.PAYMENT_HISTORY.REFUNDED": {
        const historyIndex = draftHistory.records.findIndex(
          (r) => r.paymentId === action.paymentIntentId
        );
        if (historyIndex > -1) {
          draftHistory.records[historyIndex].status = action.status;
          if (action.refundAmount) {
            draftHistory.records[historyIndex].refundedAmount =
              action.refundAmount;
          }
        }
        break;
      }

      case "INBOX.PAYMENT_HISTORY.LOADED": {
        draftHistory.records = mergeWithNewPaymentHistory(
          draftHistory.records,
          action.data,
          action.profileId
        );
        break;
      }
    }
  }
);

function updateHistoryCache(
  records: PaymentHistoryRecordNormalizedType[],
  paymentUpdated: PaymentAttachedToMessage
): PaymentHistoryRecordNormalizedType[] {
  const anyPaymentsForMessage = records.some(
    (rec) => rec.paymentId === paymentUpdated.stripePaymentIntentId
  );
  if (!anyPaymentsForMessage) {
    return [
      ...records,
      {
        paymentId: paymentUpdated.stripePaymentIntentId,
        status: paymentUpdated.status,
        profileId: paymentUpdated.userProfileId,
        createdAt: paymentUpdated.createdAt,
        lineItems: paymentUpdated.lineItems,
        paymentTrackingUrl: paymentUpdated.paymentTrackingUrl,
        orderNo: undefined,
        payAmount: paymentUpdated.payAmount,
        isPaymentLinkSent: true,
      },
    ];
  }
  return records.map((rec) => {
    if (rec.paymentId === paymentUpdated.stripePaymentIntentId) {
      return updatePaymentStatus(rec, paymentUpdated.status);
    }
    return rec;
  });
}

function updatePaymentStatus<
  T = PaymentAttachedToMessage | PaymentHistoryRecordNormalizedType
>(pmt: T, data: PaymentStatusType): T {
  return {
    ...pmt,
    status: data,
  };
}

function mergeWithNewPaymentHistory(
  memoizedRecords: PaymentHistoryRecordNormalizedType[],
  newRecords: PaymentHistoryRecordType[],
  profileId: string
) {
  const newRecordsDeduped = newRecords.reduce<PaymentHistoryRecordType[]>(
    (acc, next) => {
      if (!next.isPaymentLinkSent) {
        return acc;
      }
      if (!acc.some((r) => r.paymentId === next.paymentId)) {
        return [...acc, next];
      }
      return acc;
    },
    []
  );

  return memoizedRecords
    .filter((r) => !newRecordsDeduped.some((d) => d.paymentId === r.paymentId))

    .concat(newRecordsDeduped.map(assoc("profileId", profileId)));
}

export function defaultPaymentHistoryState(): PaymentHistoryStateType {
  return { records: [] };
}
