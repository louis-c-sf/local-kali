import React from "react";
import styles from "./FormStep.module.css";
import { useTranslation } from "react-i18next";
import { Dropdown, DropdownItemProps } from "semantic-ui-react";
import { CurrencyInput } from "../../../../../../component/shared/form/CurrencyInput";
import { toFloat } from "../../../../../../utility/string";
import { FieldError } from "../../../../../../component/shared/form/FieldError";
import { Button } from "../../../../../../component/shared/Button/Button";
import { Aside } from "./Aside";
import { useRefundForm } from "./useRefundForm";
import { useRefundDialogApi } from "api/Stripe/Refund/useRefundDialogApi";
import { ResultType } from "core/models/Ecommerce/Payment/Refund/ResultType";
import {
  RefundFormType,
  RefundFormValidType,
} from "../../models/RefundFormType";
import {
  isRefundError,
  RefundErrorType,
} from "core/models/Ecommerce/Payment/Refund/RefundErrorType";
import { StripeOrderType } from "types/Stripe/Settings/StripeOrderType";
import { PaymentHistoryRecordType } from "core/models/Ecommerce/Payment/PaymentLinkType";

export function FormStep(props: {
  payment: PaymentHistoryRecordType | StripeOrderType;
  initValues: RefundFormType | undefined;
  onSuccess: (result: ResultType) => void;
  onFail: (values: RefundFormType, error: RefundErrorType) => void;
}) {
  const { t } = useTranslation();

  const api = useRefundDialogApi(props.payment);
  const form = useRefundForm({
    initValues: props.initValues,
    payment: props.payment,
    submit: async (values) => {
      try {
        const result = await api.submit(values);
        const valuesValid = form.values as RefundFormValidType;
        props.onSuccess({
          amount: valuesValid.amount,
          refundId: result.refundId,
          status: result.status,
          refundAmount: result.refundedAmount,
        });
      } catch (e) {
        console.error(e);
        if (isRefundError(e)) {
          props.onFail(values, e);
        } else {
          props.onFail(values, { code: "Unknown" });
        }
      }
    },
  });

  const reasonChoices: DropdownItemProps[] = [
    {
      key: "dup",
      text: t("chat.payment.refund.reason.duplicate"),
      value: "Duplicate",
    },
    {
      key: "fraud",
      text: t("chat.payment.refund.reason.fraud"),
      value: "Fraudulent",
    },
    {
      key: "customer",
      text: t("chat.payment.refund.reason.customer"),
      value: "RequestedByCustomer",
    },
    {
      key: "other",
      text: t("chat.payment.refund.reason.other"),
      value: "Custom",
    },
  ];

  function getFieldClasses(name: string) {
    if (form.errors[name]) {
      return styles.error;
    }
  }

  return (
    <div className={styles.root}>
      <div className={styles.main}>
        <div className={styles.body}>
          <div className={styles.head}>
            {t("chat.payment.refund.dialog.header")}
          </div>
          <div className={styles.description}>
            {t("chat.payment.refund.dialog.description")}
          </div>
          <div className={`form ui ${styles.form}`}>
            <div className={`field ${getFieldClasses("amount")}`}>
              <label>{t("chat.payment.refund.amount.label")}</label>
              <CurrencyInput
                value={form.values.amount?.toFixed(2) ?? "0"}
                disabled={false}
                onChange={(val) => {
                  form.setFieldValue("amount", toFloat(val) ?? 0);
                }}
              />
              <FieldError text={form.errors.amount} />
            </div>
            <div className={`field ${getFieldClasses("reason")}`}>
              <label>{t("chat.payment.refund.reason.label")}</label>
              <Dropdown
                selection
                value={form.values.reason ?? undefined}
                onChange={(_, data) => {
                  form.setFieldValue("reason", data.value);
                }}
                options={reasonChoices}
              />
              <FieldError text={form.errors.reason} />
            </div>
            {form.values.reason === "Custom" && (
              <div className={`field ${getFieldClasses("reasonDetail")}`}>
                <textarea
                  placeholder={t(
                    "chat.payment.refund.reasonDetail.placeholder"
                  )}
                  value={form.values.reasonDetail ?? undefined}
                  rows={3}
                  onChange={(ev) => {
                    form.setFieldValue("reasonDetail", ev.target.value);
                  }}
                />
                <FieldError
                  text={
                    form.touched.reasonDetail ? form.errors.reasonDetail : ""
                  }
                />
              </div>
            )}
          </div>
        </div>
        <div className={styles.actions}>
          <Button
            primary
            content={t("chat.payment.refund.action.refund")}
            onClick={form.submitForm}
            disabled={form.isSubmitting}
            loading={form.isSubmitting}
          />
        </div>
      </div>
      <div className={styles.aside}>
        <Aside payment={props.payment} />
      </div>
    </div>
  );
}
