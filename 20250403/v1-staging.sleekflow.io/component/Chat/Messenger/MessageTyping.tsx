import { useAppSelector } from "AppRootContext";
import { equals } from "ramda";
import React from "react";
import { useTranslation } from "react-i18next";
import { matchesStaffId } from "types/TeamType";
import { staffDisplayName } from "../utils/staffDisplayName";
import styles from "./SendMessageBox.module.css";
export default function MessageTyping() {
  const { t } = useTranslation();
  const typing = useAppSelector(
    (s) => s.inbox.conversationTypingSignalrResponse,
    equals
  );
  const typingStaffName = useAppSelector((s) => {
    if (typing) {
      const typingStaff = s.staffList.find(matchesStaffId(typing.staffId));
      if (typingStaff) {
        return staffDisplayName(typingStaff);
      }
    }
  });
  const typingVisible = !!typing && !!typingStaffName;
  return (
    <div className={styles.typing}>
      {typingVisible &&
        t("chat.alert.typing", {
          name: typingStaffName,
        })}
    </div>
  );
}
