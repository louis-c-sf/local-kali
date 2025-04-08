import React from "react";
import styles from "./PaymentLinkButton.module.css";
import { useAppDispatch, useAppSelector } from "AppRootContext";
import { PaymentLinkDialog } from "features/Ecommerce/Payment/usecases/Inbox/SendPayment/PaymentLinkDialog";
import { Icon } from "component/shared/Icon/Icon";
import {
  SendPaymentLinkContext,
  SendPaymentLinkContextType,
} from "features/Ecommerce/Payment/usecases/Inbox/SendPayment/contracts/SendPaymentLinkContext";

export function PaymentLinkButton() {
  const loginDispatch = useAppDispatch();
  const dialogVisible = useAppSelector(
    (s) => s.inbox.messenger.paymentLink.sendDialog.visible
  );

  function showPaymentDialog() {
    loginDispatch({ type: "INBOX.PAYMENT_LINK.SHOW" });
  }

  const supportsUploads = useAppSelector(
    (s) => s.inbox.messenger.paymentLink.sendDialog.mode === "userCart"
  );

  const contextValue: SendPaymentLinkContextType = {
    supportImageUpload: supportsUploads,
  };

  return (
    <>
      <span
        className={`${styles.button} ui button`}
        onClick={showPaymentDialog}
      >
        <Icon type="payment" />
      </span>
      <SendPaymentLinkContext value={contextValue}>
        {dialogVisible && <PaymentLinkDialog />}
      </SendPaymentLinkContext>
    </>
  );
}
