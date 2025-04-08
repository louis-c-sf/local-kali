import React, { createContext, ReactNode, useContext } from "react";

export type SendPaymentLinkContextType = {
  supportImageUpload: boolean;
};

const SendPaymentLinkContextInternal =
  createContext<SendPaymentLinkContextType | null>(null);

export function SendPaymentLinkContext(props: {
  value: SendPaymentLinkContextType;
  children: ReactNode;
}) {
  return (
    <SendPaymentLinkContextInternal.Provider value={props.value}>
      {props.children}
    </SendPaymentLinkContextInternal.Provider>
  );
}

export function useSendPaymentLinkContext() {
  const value = useContext(SendPaymentLinkContextInternal);
  if (value === null) {
    throw "Add <SendPaymentLinkContext> wrapper";
  }
  return value;
}
