import React, { useState } from "react";
import styles from "./DiscountPopup.module.css";
import { useTranslation } from "react-i18next";
import { FormikProps } from "formik/dist/types";
import { PaymentFormType } from "features/Ecommerce/Payment/usecases/Inbox/SendPayment/contracts/PaymentFormType";
import NumberFormat from "react-number-format";
import { usePopperPopup } from "component/shared/popup/usePopperPopup";
import { Button } from "component/shared/Button/Button";
import { clamp } from "ramda";
import { ChatLabel } from "component/Chat/ChatLabel";

export function DiscountPopup(props: {
  form: FormikProps<PaymentFormType>;
  loading: boolean;
}): JSX.Element | null {
  const [visible, setVisible] = useState(false);
  const [triggerNode, setTriggerNode] = useState<HTMLElement | null>(null);
  const [popupNode, setPopupNode] = useState<HTMLElement | null>(null);
  const [value, setValue] = useState<number | null>(null);
  const { t } = useTranslation();

  usePopperPopup(
    {
      anchorRef: triggerNode,
      popupRef: popupNode,
      onClose: () => setVisible(false),
      onTriggerClick: () => setVisible(true),
      placement: "top",
      closeOnOutsideClick: false,
      offset: [0, 20],
    },
    [visible]
  );

  return (
    <div className={styles.root}>
      <div className={styles.triggerWrap}>
        {props.form.values.discount.rate === null ? (
          <span
            className={styles.trigger}
            ref={setTriggerNode}
            onClick={() => {
              if (props.loading) {
                return;
              }
              setVisible(true);
            }}
          >
            {t("chat.paymentLink.generate.form.discount.apply")}
          </span>
        ) : (
          <ChatLabel
            tag={{
              hashtag: t("chat.paymentLink.generate.form.discount.amount", {
                rate: props.form.values.discount.rate,
              }),
              hashTagColor: "Green",
            }}
            onDismiss={() => {
              if (props.loading) {
                return;
              }
              setValue(null);
              props.form.setFieldValue("discount.rate", null);
            }}
          />
        )}
      </div>
      {visible && !props.loading && (
        <div className={styles.popup} ref={setPopupNode}>
          <div className={`${styles.form} ui form`}>
            <div className={styles.header}>
              {t("chat.paymentLink.generate.form.discount.title")}
            </div>
            <div className={styles.body}>
              <div className={styles.inputGroup}>
                <NumberFormat
                  value={value ?? ""}
                  className={styles.input}
                  min={0}
                  max={100}
                  decimalScale={2}
                  isAllowed={(values) => {
                    const floatValue = values.floatValue ?? 0;
                    return floatValue >= 0 && floatValue <= 100;
                  }}
                  allowLeadingZeros={false}
                  onValueChange={(values) => {
                    const floatValue = values.floatValue;
                    if (isNaN(floatValue as any)) {
                      setValue(null);
                      return;
                    }

                    const newVal = clamp(0, 100, floatValue as number);
                    setValue(newVal);
                  }}
                  displayType={"input"}
                  thousandSeparator={","}
                  decimalSeparator={"."}
                  placeholder={t(
                    "chat.paymentLink.generate.form.discount.placeholder"
                  )}
                />
                <span className={styles.icon}>%</span>
              </div>
            </div>
            <div className={styles.footer}>
              <Button
                noBorder
                content={t("form.button.cancel")}
                onClick={() => {
                  setValue(props.form.values.discount.rate);
                  setVisible(false);
                }}
              />
              <Button
                primary
                content={t("form.button.apply")}
                onClick={() => {
                  props.form.setFieldValue("discount.rate", value);
                  setVisible(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
