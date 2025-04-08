import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useSignalRGroup } from "../SignalR/useSignalRGroup";
import { useBrowserNotifications } from "../../lib/effects/useBrowserNotifications";
import { PushNotificationType } from "../../types/SignalR/SignalRMessageTypes";
import { useHistory, useLocation } from "react-router-dom";
import useRouteConfig from "../../config/useRouteConfig";
import { useAppDispatch, useAppSelector } from "../../AppRootContext";
import MessageType from "../../types/MessageType";
import { submitChatRead } from "../../api/Chat/submitChatRead";
import { useSignalRAck } from "component/SignalR/useSignalRAck";
import { LoginType } from "../../types/LoginType";
import { ReadonlyDeep } from "Object/Readonly";

export function InboxNotifier() {
  const signalRGroupName = useAppSelector((s) => s.user?.signalRGroupName);
  const loginDispatch = useAppDispatch();
  const { notify, browserNotificationsEnabled, enableBrowserNotifications } =
    useBrowserNotifications();
  const { routeTo, matchesCurrentRoute } = useRouteConfig();
  const history = useHistory();
  const location = useLocation();
  useEffect(() => {
    if (!browserNotificationsEnabled) {
      enableBrowserNotifications();
    }
  }, [browserNotificationsEnabled]);

  const openChat = (
    conversationId: string,
    userId: string | null | undefined
  ) => {
    return () => {
      window.focus();
      const id = userId ?? "all";
      history.push(routeTo(`/inbox/${id}/${conversationId}/`));
    };
  };

  function handleNotification(state: any, result: PushNotificationType) {
    switch (result.event) {
      case "NewMessage":
      case "Assignment":
      case "Note": {
        loginDispatch({
          type: "INBOX.INCREMENT_NOTIFICATIONS",
          conversationId: result.conversationId,
          badgeCounter: result.badge,
        });
        notify(
          result.title,
          result.body,
          openChat(result.conversationId, result.assigneeId)
        );
        break;
      }
      default:
        notify(result.title, result.body);
        break;
    }
  }

  const isInboxPage = useMemo(() => {
    return location.pathname.indexOf("/inbox") > -1;
  }, [location.pathname]);

  const updateMessageHandling = async (
    state: ReadonlyDeep<LoginType>,
    message: MessageType
  ) => {
    if (
      isInboxPage &&
      message.conversationId === state.profile.conversationId &&
      !message.isSentFromSleekflow
    ) {
      submitChatRead(message.conversationId).catch(console.error);
    }
    if (isInboxPage) {
      try {
        loginDispatch({
          type: "INBOX.API.LOAD_CONVERSATION",
          message,
        });
      } catch (e) {
        console.error(`error retryGetConversationDetailApiRequest ${e}`);
      }
    }
  };

  useSignalRGroup(
    signalRGroupName,
    {
      PushNotitions: [handleNotification],
      PushNotification: [handleNotification],
      OnConversationNoteReceived: [
        (state, message: MessageType) => {
          updateMessageHandling(state, message);
        },
      ],
      OnMessageReceived: [
        (state, message: MessageType) => {
          // updateMessageHandling(state, message);
        },
      ],
    },
    "InboxNotifier"
  );
  useSignalRAck(
    {
      "Reliable.ReceiveMessage": (state, message: MessageType) => {
        updateMessageHandling(state, message);
      },
    },
    "InboxNotifier"
  );
  return null;
}
