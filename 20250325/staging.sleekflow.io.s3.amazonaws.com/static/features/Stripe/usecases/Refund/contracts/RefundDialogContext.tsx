import { StripeOrderType } from "types/Stripe/Settings/StripeOrderType";
import React, { useState, useContext, ReactNode } from "react";
import { PaymentHistoryRecordType } from "core/models/Ecommerce/Payment/PaymentLinkType";

type RefundDialogContextType = {
  opened: boolean;
  payment: PaymentHistoryRecordType | StripeOrderType | null;
  start(payment: PaymentHistoryRecordType | StripeOrderType): void;
  cancel(): void;
  finish(): void;
};

const Context = React.createContext<RefundDialogContextType | null>(null);

export function RefundDialogContext(props: { children: ReactNode }) {
  const [opened, setOpened] = useState(false);
  const [payment, setPayment] = useState<PaymentHistoryRecordType | null>(null);

  const value: RefundDialogContextType = {
    payment,
    opened: opened,
    start(payment: PaymentHistoryRecordType) {
      setOpened(true);
      setPayment(payment);
    },
    cancel() {
      setPayment(null);
      setOpened(false);
    },
    finish() {
      setPayment(null);
      setOpened(false);
    },
  };
  return <Context.Provider value={value}>{props.children}</Context.Provider>;
}

export function useRefundDialogContext(): RefundDialogContextType {
  const value = useContext(Context);
  if (value === null) {
    throw "Do not use the context without order info";
  }
  return value;
}
