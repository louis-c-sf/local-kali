import React from "react";
import { ButtonType } from "./InteractiveMessageSchema";
import styles from "./InteractiveMessageBoxView.module.css";
import { Icon } from "semantic-ui-react";
import { useTranslation } from "react-i18next";

export default function InteractiveMessageBoxView({
  type,
  quickReplies,
  listMessageTitle,
}: {
  type: ButtonType | string;
  quickReplies?: string[];
  listMessageTitle?: string;
}) {
  const { t } = useTranslation();
  if (type === ButtonType.QUICK_REPLY && quickReplies?.length) {
    return (
      <div className={styles.quickReplies}>
        {quickReplies?.map((reply, i) => (
          <div key={`${reply}_${i}`} className={styles.boxView}>
            {reply}
          </div>
        ))}
      </div>
    );
  }

  if (type === ButtonType.LIST_MESSAGE && listMessageTitle) {
    return (
      <div className={styles.boxView}>
        <Icon name="list ul" style={{ color: "var(--GRAY-MID)" }} />
        {listMessageTitle}
      </div>
    );
  }

  if (type === ButtonType.NOTIFY_ME) {
    return (
      <div className={styles.boxView}>
        {t("chat.facebookOTN.message.notifyMe")}
      </div>
    );
  }

  return null;
}
