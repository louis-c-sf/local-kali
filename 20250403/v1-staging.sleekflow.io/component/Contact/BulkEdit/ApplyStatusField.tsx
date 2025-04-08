import React from "react";
import { Dropdown, DropdownItemProps } from "semantic-ui-react";
import openImg from "../../../assets/images/open-status.svg";
import snoozeImg from "../../../assets/images/snooze-status.svg";
import closedImg from "../../../assets/images/close-status.svg";
import { useTranslation } from "react-i18next";
import { omit } from "ramda";
import styles from "./ApplyStatusField.module.css";

function ConversationStatusDropdown(props: {
  status?: string;
  onSelect: (status: string) => void;
}) {
  const { t } = useTranslation();
  const { status, onSelect } = props;

  const caseHandle = (value: string) => {
    onSelect(value);
  };

  const options: DropdownItemProps[] = [
    {
      key: "open",
      value: "open",
      content: (
        <div className={styles.item}>
          <img className={styles.icon} src={openImg} />
          <span className={styles.text}>{t("chat.filter.status.open")}</span>
        </div>
      ),
    },
    {
      key: "pending",
      value: "pending",
      content: (
        <div className={styles.item}>
          <img className={styles.icon} src={snoozeImg} />
          <span className={styles.text}>{t("chat.filter.status.snoozed")}</span>
        </div>
      ),
    },
    {
      key: "closed",
      value: "closed",
      content: (
        <div className={styles.item}>
          <img className={styles.icon} src={closedImg} />
          <span className={styles.text}>{t("chat.filter.status.closed")}</span>
        </div>
      ),
    },
  ];

  return (
    <Dropdown
      options={options.map(omit(["visible"]))}
      value={status}
      onChange={(_, data) => caseHandle(data.value as string)}
      selectOnBlur={false}
      trigger={
        <div className={styles.selectedDropdown}>
          {options.find((o) => o.value === status)?.content}
        </div>
      }
    />
  );
}

export default ConversationStatusDropdown;
