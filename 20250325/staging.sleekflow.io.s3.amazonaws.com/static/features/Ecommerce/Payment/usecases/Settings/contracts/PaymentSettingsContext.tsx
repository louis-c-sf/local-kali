import { PaymentSettingsContextType } from "features/Ecommerce/Payment/usecases/Settings/contracts/PaymentSettingsContextType";
import React, { useContext, ReactNode } from "react";

const PaymentSettingsContextInternal =
  React.createContext<PaymentSettingsContextType | null>(null);

export function usePaymentSettingsContext() {
  const context = useContext(PaymentSettingsContextInternal);
  if (context === null) {
    throw "Initiate the PaymentSettingsContext value";
  }
  return context;
}

export function PaymentSettingsContext(props: {
  children: ReactNode;
  value: PaymentSettingsContextType;
}) {
  return (
    <PaymentSettingsContextInternal.Provider value={props.value}>
      {props.children}
    </PaymentSettingsContextInternal.Provider>
  );
}
