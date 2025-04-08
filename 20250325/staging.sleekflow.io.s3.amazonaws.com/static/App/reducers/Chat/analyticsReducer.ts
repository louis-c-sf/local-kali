import produce from "immer";
import { LoginType, Action } from "../../../types/LoginType";
import { initialUser } from "../../../context/LoginContext";
import {
  AnalyticsStateType,
  AnalyticsHistoryRecordType,
} from "../../../types/state/InboxStateType";
import { WebClientInfoResponseType } from "../../../types/Analytics/api/WebClientInfoResponseType";
import { LiveChatStatusUpdateType } from "../../../types/Analytics/api/LiveChatStatusUpdateType";

export type AnalyticsWidgetActionType =
  | {
      type: "INBOX.ANALYTICS.INIT";
      webClientUUID: string;
      conversationId: string;
    }
  | {
      type: "INBOX.ANALYTICS.INIT_LOADED";
      summary: WebClientInfoResponseType[];
      conversationId: string;
      onlineStatus?: string;
      history: Array<{}>;
    }
  | {
      type: "INBOX.ANALYTICS.STATUS_UPDATED";
      data: LiveChatStatusUpdateType;
    }
  | {
      type: "INBOX.ANALYTICS.WEBCLIENT_INFO_UPDATED";
      data: WebClientInfoResponseType;
      webClientUUID: string;
    };

function findOrCreateChatAnalyticsRecord(
  analytics: AnalyticsStateType,
  conversationId: string
) {
  const found = analytics.recordsMemoized.find(
    (r) => r.conversationId === conversationId
  );
  if (!found) {
    const newRec: AnalyticsHistoryRecordType = {
      override: {},
      summary: [],
      conversationId,
    };
    analytics.recordsMemoized.push(newRec);
    return newRec;
  }
  return found;
}

export const analyticsReducer = produce(
  (state: LoginType = initialUser, action: Action) => {
    const analytics = state.inbox.analytics;
    const currentClientUUID = state.profile.webClient?.webClientUUID;
    switch (action.type) {
      case "INBOX.ANALYTICS.INIT":
        analytics.loading = true;
        break;
      case "INBOX.ANALYTICS.INIT_LOADED": {
        analytics.loading = false;
        const memoizedItem = findOrCreateChatAnalyticsRecord(
          analytics,
          action.conversationId
        );
        memoizedItem.override = {};
        if (action.onlineStatus) {
          memoizedItem.override.onlineStatus = action.onlineStatus;
        }
        memoizedItem.summary = [
          ...memoizedItem.summary,
          ...action.summary.filter(
            (rNew) =>
              !memoizedItem.summary.some(
                (rMemoized) => rMemoized.id === rNew.id
              )
          ),
        ];
        break;
      }

      case "INBOX.ANALYTICS.STATUS_UPDATED": {
        if (currentClientUUID !== action.data.webClientUUID) {
          return;
        }
        const conversationId = state.profile.conversationId;
        const record = findOrCreateChatAnalyticsRecord(
          analytics,
          conversationId
        );
        record.override = { ...record.override, ...action.data };
        if (action.data.onlineStatus) {
          record.override.onlineStatus = action.data.onlineStatus;
        }
        break;
      }

      case "INBOX.ANALYTICS.WEBCLIENT_INFO_UPDATED": {
        if (currentClientUUID !== action.webClientUUID) {
          return;
        }
        const conversationId = state.profile.conversationId;
        const record = findOrCreateChatAnalyticsRecord(
          analytics,
          conversationId
        );
        record.override = { ...record.override, ...action.data };
        if (
          !record.summary.some((s) => s.createdAt === action.data.createdAt)
        ) {
          record.summary.push(action.data);
        }
        break;
      }
    }
  }
);
