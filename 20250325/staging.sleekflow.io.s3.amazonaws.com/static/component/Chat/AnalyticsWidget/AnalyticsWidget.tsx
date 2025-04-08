import React, { useCallback, useEffect, useState } from "react";
import styles from "./AnalyticsWidget.module.css";
import { useTranslation } from "react-i18next";
import { SummaryTab } from "./SummaryTab";
import { DetailsTab } from "./DetailsTab";
import iconStyles from "../../shared/Icon/Icon.module.css";
import { useAppDispatch, useAppSelector } from "../../../AppRootContext";
import { matchesConversationId } from "../mutators/chatSelectors";
import { useSignalRGroup } from "../../SignalR/useSignalRGroup";
import { LiveChatStatusUpdateType } from "../../../types/Analytics/api/LiveChatStatusUpdateType";
import { WebClientInfoResponseType } from "../../../types/Analytics/api/WebClientInfoResponseType";
import { BaseWidget } from "../BaseWidget/BaseWidget";
import { Tabs } from "../BaseWidget/Tabs";

function AnalyticsWidget() {
  const { t } = useTranslation();
  const webClientUUID = useAppSelector(
    (s) => s.profile?.webClient?.webClientUUID
  );
  const conversationId = useAppSelector((s) => s.profile?.conversationId);
  const analyticsLoading = useAppSelector((s) => s.inbox.analytics.loading);
  const loginDispatch = useAppDispatch();
  const [isShowAllHistory, setIsShowAllHistory] = useState(false);
  const isLoading = analyticsLoading;

  const toggleShowAllHistory = useCallback(() => {
    setIsShowAllHistory((s) => !s);
  }, [setIsShowAllHistory]);

  const record = useAppSelector((s) => {
    return s.inbox.analytics.recordsMemoized.find(
      matchesConversationId(s.profile.conversationId)
    );
  });
  const recordsList = record?.summary ?? [];
  const [summary] = recordsList;
  const [tabVisible, setTabVisible] = useState<"summary" | "history">(
    "summary"
  );

  useEffect(() => {
    if (!(webClientUUID && conversationId)) {
      return;
    }
    loginDispatch({
      type: "INBOX.ANALYTICS.INIT",
      webClientUUID,
      conversationId,
    });
    setIsShowAllHistory(false);
  }, [webClientUUID, conversationId]);

  useSignalRGroup(
    webClientUUID,
    {
      OnLiveChatOnlineStatusChanged: [
        (state, data: LiveChatStatusUpdateType) => {
          loginDispatch({
            type: "INBOX.ANALYTICS.STATUS_UPDATED",
            data,
          });
        },
      ],
      OnLiveChatInfoChanged: [
        (state, data: WebClientInfoResponseType) => {
          if (webClientUUID) {
            loginDispatch({
              type: "INBOX.ANALYTICS.WEBCLIENT_INFO_UPDATED",
              data,
              webClientUUID: webClientUUID,
            });
          }
        },
      ],
    },
    "AnalyticsWidget",
    (connection) => {
      connection.invoke("RemoveFromGroup", webClientUUID).catch((e) => {
        console.error("RemoveFromGroup", e);
      });
    }
  );

  if (!isLoading && recordsList.length === 0) {
    return null;
  }

  return (
    <BaseWidget
      loading={isLoading}
      header={t("chat.analytics.header")}
      icon={<div className={`${iconStyles.icon} ${styles.analyticsIcon}`} />}
      forceCollapse={Boolean(webClientUUID && conversationId) && isLoading}
    >
      <Tabs
        tabs={{
          summary: t("chat.analytics.tab.overview"),
          history: t("chat.analytics.tab.about"),
        }}
        contents={{
          summary: (
            <SummaryTab
              summary={summary}
              override={record?.override ?? {}}
              history={recordsList}
              isShowAll={isShowAllHistory}
              toggleShowAll={toggleShowAllHistory}
            />
          ),
          history:
            recordsList.length > 0 ? (
              <DetailsTab
                summary={summary}
                history={recordsList}
                override={record?.override ?? {}}
              />
            ) : null,
        }}
        active={tabVisible}
        setActive={setTabVisible}
      />
    </BaseWidget>
  );
}

export default AnalyticsWidget;
