import React, { useState } from "react";
import styles from "./RefundDialog.module.css";
import { useRefundDialogContext } from "./contracts/RefundDialogContext";
import { Modal } from "semantic-ui-react";
import { CloseIcon } from "component/shared/modal/CloseIcon";
import { FormStep } from "./components/FormStep/FormStep";
import { SuccessStep } from "./components/SuccessStep/SuccessStep";
import { ResultType } from "core/models/Ecommerce/Payment/Refund/ResultType";
import { useAppDispatch } from "AppRootContext";
import { RefundErrorType } from "core/models/Ecommerce/Payment/Refund/RefundErrorType";
import { FailureStep } from "./components/FailureStep/FailureStep";
import { RefundFormType } from "./models/RefundFormType";
import { StripeOrderType } from "types/Stripe/Settings/StripeOrderType";
import { PaymentHistoryRecordType } from "core/models/Ecommerce/Payment/PaymentLinkType";

export function RefundDialog(props: { refreshPaymentList?: () => void }) {
  const { refreshPaymentList } = props;
  const refund = useRefundDialogContext();
  const [result, setResult] = useState<ResultType>();
  const [failure, setFailure] = useState<{
    error: RefundErrorType;
    values: RefundFormType;
  }>();
  const [retryValues, setRetryValues] = useState<RefundFormType>();

  const loginDispatch = useAppDispatch();
  if (!refund.payment) {
    return null;
  }

  const [firstItem] = refund.payment.lineItems;

  function updateCacheAndResultOf(
    payment: PaymentHistoryRecordType | StripeOrderType
  ) {
    if (refreshPaymentList) {
      return refreshPaymentList;
    }
    return (result: ResultType) => {
      setResult(result);
      loginDispatch({
        type: "INBOX.PAYMENT_HISTORY.UPDATED",
        paymentIntentId: payment.paymentId,
        status: result.status,
        refundAmount: result.refundAmount,
        payAmount: payment.payAmount,
      });
    };
  }

  function showFailStep(values: RefundFormType, error: RefundErrorType) {
    //todo divide errors by status reason
    if (error.code === "LogicError") {
    } else if (error.code === "SystemError") {
    } else if (error.code === "Unknown") {
    }
    setFailure({ error, values });
  }

  function retry() {
    setFailure(undefined);
    setRetryValues(failure?.values);
  }

  return (
    <Modal
      className={styles.modal}
      open
      closeIcon={<CloseIcon />}
      closeOnDimmerClick={false}
      closeOnDocumentClick={false}
      onClose={refund.cancel}
    >
      <Modal.Content className={styles.content}>
        {!result ? (
          !failure ? (
            <FormStep
              payment={refund.payment}
              onSuccess={updateCacheAndResultOf(refund.payment)}
              onFail={showFailStep}
              initValues={retryValues}
            />
          ) : (
            <FailureStep onDismiss={refund.cancel} onRetry={retry} />
          )
        ) : (
          <SuccessStep
            amount={result.amount}
            refundId={result.refundId}
            onClose={refund.finish}
            amountCurrency={firstItem.currency}
          />
        )}
      </Modal.Content>
    </Modal>
  );
}
