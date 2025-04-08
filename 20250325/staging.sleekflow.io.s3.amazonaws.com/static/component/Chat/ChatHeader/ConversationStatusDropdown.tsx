import React, { useState } from "react";
import { Dropdown, DropdownItemProps } from "semantic-ui-react";
import openImg from "../../../assets/images/open-status.svg";
import snoozeImg from "../../../assets/images/snooze-status.svg";
import closedImg from "../../../assets/images/close-status.svg";
import { useTranslation } from "react-i18next";
import { useFlashMessageChannel } from "../../BannerMessage/flashBannerMessage";
import { equals, omit, prop } from "ramda";
import { submitChatStatus } from "../../../api/Chat/submitChatStatus";
import { useAppSelector } from "../../../AppRootContext";
import headerDropdownStyles from "./HeaderDropdown.module.css";
import ReminderModal from "../../shared/modal/ReminderModal";
import { handleDemoStatusType } from "../../Onboarding/GetStarted/InboxDemo/MockInbox/MockChatMainContent";
import { htmlEscape } from "../../../lib/utility/htmlEscape";

function ConversationStatusDropdown(props: {
  isDemo?: boolean;
  handleDemoStatus?: handleDemoStatusType;
}) {
  const { isDemo = false, handleDemoStatus } = props;
  const { t } = useTranslation();
  const [conversationStatus, conversationId] = useAppSelector(
    (s) => [s.profile?.conversationStatus, s.profile?.conversationId],
    equals
  );
  const flash = useFlashMessageChannel();
  const [modalOpened, setModalOpened] = useState(false);

  const caseHandle = async (status: string) => {
    if (status === "pending") {
      setModalOpened(true);
      return;
    }

    if (isDemo && handleDemoStatus) {
      handleDemoStatus(conversationId, status);
    } else {
      await submitChatStatus(conversationId, status as "open" | "closed");
    }
    const statusName = status.charAt(0).toUpperCase() + status.substring(1);

    flash(
      t("flash.inbox.chat.status.updated", { status: htmlEscape(statusName) })
    );
  };

  const options: Array<DropdownItemProps & { visible: boolean }> = [
    {
      key: "open",
      value: "open",
      visible: conversationStatus !== "open",
      content: (
        <div className={"icon-item"} title={t("chat.filter.status.open")}>
          <img src={openImg} alt={t("chat.filter.status.open")} />
          <span className={headerDropdownStyles.text}>
            {t("chat.filter.status.open")}
          </span>
        </div>
      ),
    },
    {
      key: "pending",
      value: "pending",
      visible: !isDemo && conversationStatus === "open",
      content: (
        <div className={"icon-item"} title={t("chat.filter.status.snoozed")}>
          <img src={snoozeImg} alt={t("chat.filter.status.snoozed")} />
          <span className={headerDropdownStyles.text}>
            {t("chat.filter.status.snoozed")}
          </span>
        </div>
      ),
    },
    {
      key: "closed",
      value: "closed",
      visible: conversationStatus !== "closed",
      content: (
        <div className={"icon-item"} title={t("chat.filter.status.closed")}>
          <img src={closedImg} alt={t("chat.filter.status.closed")} />
          <span className={headerDropdownStyles.text}>
            {t("chat.filter.status.closed")}
          </span>
        </div>
      ),
    },
  ];

  return (
    <>
      <Dropdown
        className={`
        ${headerDropdownStyles.dropdown}
        conversation-status-dropdown`}
        options={options.filter(prop("visible")).map(omit(["visible"]))}
        value={conversationStatus}
        onChange={(_, data) => caseHandle(data.value as string)}
        selectOnBlur={false}
        trigger={
          <div
            className={`selected-dropdown
            ${headerDropdownStyles.shrinkOnTablet}
            ${headerDropdownStyles.noText}
            `}
          >
            {options.find((o) => o.value === conversationStatus)?.content}
          </div>
        }
      />
      <ReminderModal
        modalOpened={modalOpened}
        closeModal={() => setModalOpened(false)}
        onSubmit={async (dateUntil) => {
          await submitChatStatus(conversationId, "pending", dateUntil);
        }}
      />
    </>
  );
}

export default ConversationStatusDropdown;
