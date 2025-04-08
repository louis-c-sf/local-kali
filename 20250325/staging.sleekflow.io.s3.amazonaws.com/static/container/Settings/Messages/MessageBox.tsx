import { StripeMessageTemplateType } from "api/Stripe/fetchStripeMessageTemplate";
import { useTranslation } from "react-i18next";
import insertTextAtCursor from "insert-text-at-cursor";
import styles from "container/Settings/Messages/MessagesTab.module.css";
import { TextareaCounted } from "component/shared/form/TextareaCounted/TextareaCounted";
import { Button } from "component/shared/Button/Button";
import { MessagePreview } from "container/Settings/Messages/components/MessagePreview";
import React from "react";

interface MessageMappingType {
  title: string;
  subTitle: string;
  placeholder: string;
}

export const PAYMENT_URL = `{payment_url}`;

export function MessageBox(props: {
  message: MessageMappingType;
  paymentType: string;
  content: StripeMessageTemplateType;
  setMessage: (type: string, message: string) => void;
  setParams?: (message: string) => void;
}) {
  const { t } = useTranslation();
  const { message, paymentType, setMessage, content } = props;
  const isParamExist = content.params.length > 0;

  function updateMessage(value: string) {
    setMessage(paymentType, value.replace(PAYMENT_URL, `{0}`));
    if (props.setParams) {
      if (value.includes(PAYMENT_URL) && !isParamExist) {
        props.setParams("paymentUrl");
      }
      if (isParamExist && !value.includes(PAYMENT_URL)) {
        props.setParams("");
      }
    }
  }

  const textareaId = `sendmessage-text-${paymentType}`;

  function onClick() {
    let textarea = document.getElementById(textareaId) as HTMLTextAreaElement;
    if (textarea && props.setParams) {
      insertTextAtCursor(textarea, `{0}`);
      props.setParams("paymentUrl");
    }
  }

  const messageBody =
    content.params.length > 0
      ? content.messageBody.replace(`{0}`, PAYMENT_URL)
      : content.messageBody;

  const insertEmoji = (emoji: string) => {
    let textarea = document.getElementById(textareaId) as HTMLTextAreaElement;
    if (textarea) {
      insertTextAtCursor(textarea, emoji);
    }
  };

  function formatCounter(size: number) {
    return t("settings.paymentLink.message.payment.messageCount", {
      count: size,
      variantCount: isParamExist ? 1 : 0,
    });
  }

  return (
    <div className={styles.box}>
      <div className={styles.message}>
        <div className={styles.title}>{message.title}</div>
        <div className={styles.subTitle}>{message.subTitle}</div>
        <div className={styles.textarea}>
          <TextareaCounted
            onChange={updateMessage}
            id={textareaId}
            value={messageBody}
            onEmojiSelected={insertEmoji}
            formatCounter={
              paymentType === "PaymentMessage" ? formatCounter : undefined
            }
            max={1024}
          />
        </div>
      </div>
      {paymentType === "PaymentMessage" && (
        <div className={styles.paymentButton}>
          <div className={styles.note}>
            {t("settings.paymentLink.message.payment.reminder")}
          </div>
          <Button
            disabled={isParamExist}
            content={`+  ${t(
              "settings.paymentLink.message.payment.paymentUrl"
            )}`}
            onClick={isParamExist ? undefined : onClick}
            primary={!isParamExist}
          />
        </div>
      )}
      <div className={styles.preview}>
        <div className={styles.title}>
          {t("settings.paymentLink.message.preview")}
        </div>
        <MessagePreview
          showImage={paymentType === "GeneralProductMessage"}
          messageBody={messageBody}
        />
      </div>
    </div>
  );
}
