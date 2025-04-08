import React from "react";
import styles from "./PaymentRecord.module.css";
import MessageRecord from "../MessageRecord";
import { ProfileType } from "types/LoginType";
import { TFunction } from "i18next";
import MessageContent from "../MessageContent";
import MessageType from "../../../../types/MessageType";
import { StripeStatusLabel } from "container/Settings/Order/StripeStatusLabel";
import { PaymentLinkProxyType } from "core/models/Ecommerce/Payment/PaymentLInkProxyType";
import { getPaymentsSum } from "core/models/Ecommerce/Payment/getPaymentsSum";
import { formatCurrency } from "utility/string";
import { MessageRecordCommonProps } from "component/Chat/Records/MessageRecord/MessageRecordBase";
import { htmlEscape } from "../../../../lib/utility/htmlEscape";

export function PaymentRecord(
  props: MessageRecordCommonProps & {
    messageQuoted?: MessageType;
    userId: string;
    pickingMessagesActive: boolean;
    payment: PaymentLinkProxyType;
  }
) {
  const {
    channelTitle,
    channelTypeName,
    isShowIcon,
    message,
    messageQuoted,
    pickingMessagesActive,
    profile,
    senderName,
    senderPic,
    t,
    userId,
    payment,
  } = props;
  const linkFormatted = payment.paymentTrackingUrl.replace(
    /^http(s):\/\//i,
    ""
  );

  return (
    <MessageRecord
      channelTitle={channelTitle}
      message={message}
      messageQuoted={messageQuoted}
      profile={profile}
      userId={userId}
      t={t}
      pickingMessagesActive={pickingMessagesActive}
      senderName={senderName}
      senderPic={senderPic}
      isShowIcon={isShowIcon}
      channelTypeName={channelTypeName}
      beforeContent={props.beforeContent}
    >
      <div>
        <div className={styles.payment}>
          <div className={styles.head}>
            <div className={styles.summary}>
              {t("chat.message.payment.itemsSummary", {
                count: payment.lineItems.length,
                total: formatCurrency(
                  getPaymentsSum(payment.lineItems),
                  payment.lineItems[0]?.currency ?? "HKD"
                ),
              })}
            </div>
            <div className={styles.status}>
              <StripeStatusLabel status={payment.status} />
            </div>
          </div>
          <div className={styles.link}>
            <a
              href={htmlEscape(payment.paymentTrackingUrl)}
              target={"_blank"}
              rel={"noopener noreferrer"}
            >
              {linkFormatted}
            </a>
          </div>
        </div>
        <div className={styles.text}>
          <MessageContent
            message={message.messageContent}
            sender={message.sender}
          />
        </div>
      </div>
    </MessageRecord>
  );
}
