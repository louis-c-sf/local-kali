import { useEffect, useContext } from "react";
import { CONNECT_STATE, SignalRContext } from "../../SignalR/SignalRObservable";
import moment from "moment";
import { useAppDispatch } from "../../../AppRootContext";
import { useLatestMessageTimestamp } from "./useLatestMessageTimestamp";
import { fetchMultiChatMessages } from "../../../api/Chat/fetchMultiChatMessages";
import { normalizeAPIMessagesPage } from "../mutators/messageMutators";

export function useChatReconnectionBehavior() {
  const loginDispatch = useAppDispatch();

  const { apiConnection, signalRDispatch } = useContext(SignalRContext);
  const defaultLiveTimestamp = moment().utc().subtract(1, "hours").unix();
  const latestMessageTimeStamp =
    useLatestMessageTimestamp(defaultLiveTimestamp);

  useEffect(() => {
    if (apiConnection.chatMessages === CONNECT_STATE.UNSYNC) {
      fetchMultiChatMessages(latestMessageTimeStamp, moment().valueOf())
        .then((res) => {
          if (res) {
            loginDispatch({
              type: "INBOX.SYNC.MISSING_MESSAGES_RELOADED",
              messages: normalizeAPIMessagesPage(res.messages),
            });
          }
        })
        .catch((e) => console.error(`fetchMultiChatMessages`, e));
      signalRDispatch({
        type: "UPDATE_CHATMESSAGE_SIGNALR_CONNECTION_STATE",
        status: CONNECT_STATE.SYNC,
      });
    }
  }, [
    apiConnection.chatMessages,
    latestMessageTimeStamp,
    loginDispatch,
    signalRDispatch,
  ]);
}
