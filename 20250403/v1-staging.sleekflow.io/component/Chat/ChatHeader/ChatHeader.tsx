import React, { useMemo } from "react";
import { Menu } from "semantic-ui-react";
import styles from "./ChatHeader.module.css";
import ChatProfileName from "./ChatProfileName";
import ChatAssignment from "./ChatAssignment";
import DemoChatAssignment from "../../Onboarding/GetStarted/InboxDemo/MockInbox/MockChatAssignment";
import { useTranslation } from "react-i18next";
import { InfoTooltip } from "../../shared/popup/InfoTooltip";
import { useAppSelector } from "../../../AppRootContext";
import CollaboratorsInput from "./CollaboratorsInput";
import ConversationStatusDropdown from "./ConversationStatusDropdown";
import { ProfileType } from "../../../types/LoginType";
import { MessageSearchButton } from "./MessageSearchButton";
import { MessagesChannelFilter } from "./MessagesChannelFilter";
import FilterFunnelIcon from "../../../assets/tsx/icons/FilterFunnelIcon";
import { handleDemoStatusType } from "../../Onboarding/GetStarted/InboxDemo/MockInbox/MockChatMainContent";

export default ChatHeader;

function ChatHeader(props: {
  profile: ProfileType;
  isDemo?: boolean;
  handleDemoStatus?: handleDemoStatusType;
}) {
  const { profile, isDemo = false, handleDemoStatus } = props;

  const { t } = useTranslation();
  const selectedUser = useAppSelector((s) => s.selectedUser);

  const collaboratorIds = useMemo(
    () => profile.collaboratorIds ?? [],
    [JSON.stringify(profile.collaboratorIds)]
  );

  return (
    <div className={`chat-header ${styles.chatHeader}`}>
      <div className="info">
        <Menu>
          <Menu.Item className={`header-item ${styles.section}`}>
            <ChatProfileName />
            {isDemo && <div className={styles.demoCover} />}
          </Menu.Item>
          <Menu.Menu position="right">
            <Menu.Item className={`${styles.section}`}>
              <InfoTooltip
                placement={"right"}
                children={t("chat.tooltip.chat.searchMessage")}
                trigger={<MessageSearchButton />}
              />
              <div className={styles.divider} />
              {isDemo && <div className={styles.demoCover} />}
            </Menu.Item>

            <Menu.Item className={styles.section}>
              <ConversationStatusDropdown
                isDemo={isDemo}
                handleDemoStatus={handleDemoStatus}
              />
            </Menu.Item>
            <Menu.Item className={styles.section}>
              <CollaboratorsInput
                collaboratorIds={collaboratorIds}
                conversationAssigneeId={selectedUser?.id}
              />
              {isDemo && <div className={styles.demoCover} />}
            </Menu.Item>
            <Menu.Item className={styles.section}>
              <InfoTooltip
                placement={"right"}
                children={t("chat.tooltip.chat.assign")}
                trigger={isDemo ? <DemoChatAssignment /> : <ChatAssignment />}
              />
              <div className={styles.divider} />
            </Menu.Item>
            <Menu.Item className={styles.section}>
              <span className={styles.filterIconWrap}>
                <FilterFunnelIcon active />
              </span>
              {isDemo && <div className={styles.demoCover} />}
            </Menu.Item>
            <Menu.Item className={styles.section}>
              <MessagesChannelFilter />
              {isDemo && <div className={styles.demoCover} />}
            </Menu.Item>
          </Menu.Menu>
        </Menu>
      </div>
    </div>
  );
}
