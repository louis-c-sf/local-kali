import React, {
  ReactNode,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
  RetryContext,
} from "@microsoft/signalr";
import { useAppDispatch, useAppSelector } from "../../AppRootContext";
import { useAuth0 } from "@auth0/auth0-react";
import useFetchCompany from "api/Company/useFetchCompany";
import { equals } from "ramda";
import { useChatsFilterBuilder } from "api/Chat/useChatsFilterBuilder";
import { useLoadMoreChats } from "api/Chat/useLoadMoreChats";
import { NEXT_LIMIT, START_LIMIT } from "component/Chat/ChatGroupList";
import { fetchChatMessages } from "api/Chat/fetchChatMessages";
import moment from "moment";
import { normalizeAPIMessagesPage } from "component/Chat/mutators/messageMutators";

const SIGNALR_URL = process.env.REACT_APP_API_URL;

export type SignalRActionType =
  | { type: "STARTED"; connection: HubConnection }
  | { type: "CLOSED" }
  | { type: "RECONNECT_STARTED" }
  | { type: "UPDATE_SESSION_ID"; sessionId: string }
  | { type: "CLEAR_SESSION_ID"; sessionId: undefined }
  | {
      type: "RECONNECT_COMPLETED";
      connection: HubConnection;
      sessionId: string;
    }
  | {
      type: "API.LOAD_CONVERSATION.STARTED";
    }
  | {
      type: "API.LOAD_CONVERSATION.COMPLETED";
    };

export interface SignalRContextType {
  connection: HubConnection | undefined;
  isFetchData: boolean;
  signalRDispatch: (action: SignalRActionType) => void;
}

export interface APIConnectionType {
  chatMessages: CONNECT_STATE;
  chats: CONNECT_STATE;
  lastConnectedTime?: string;
}

interface RetryContextWithStatusCode extends RetryContext {
  retryReason: RetryReasonWithStatusCode;
}

interface RetryReasonWithStatusCode extends Error {
  statusCode: number;
}

export enum CONNECT_STATE {
  "UP",
  "DOWN",
  "SYNC",
  "UNSYNC",
}

const initialSignalRState = {
  connection: undefined,
  isFetchData: false,
  signalRDispatch: () => {},
};
function useFetchConversationMessage() {
  const profile = useAppSelector((s) => s.profile, equals);
  const loginDispatch = useAppDispatch();
  function fetchConversationMessage() {
    const conversationId = profile.conversationId;
    if (!conversationId) {
      return;
    }
    fetchChatMessages(
      {
        offset: 0,
        beforeTimestamp: moment().utc().unix(),
        limit: 100,
      },
      conversationId
    ).then((result) => {
      if (result && result.length > 0) {
        loginDispatch({
          type: "CURRENT_CHAT_PAGE_LOADED",
          chatsDataUpdate: {
            messages: normalizeAPIMessagesPage(result, profile),
          },
          conversationId: conversationId,
        });
      }
    });
  }
  return { fetchConversationMessage };
}
function useRefreshConversation() {
  const chats = useAppSelector((s) => s.chats, equals);
  const { filterTags } = useChatsFilterBuilder();
  const loginDispatch = useAppDispatch();
  const { fetchConversationMessage } = useFetchConversationMessage();
  const { loadMore } = useLoadMoreChats({
    id: "",
    nextLimit: chats?.length ?? NEXT_LIMIT,
    startLimit: 0,
    tags: filterTags,
  });

  function refresh() {
    loadMore();
    loginDispatch({
      type: "CONVERSATION_NEED_REFETCH",
    });
    fetchConversationMessage();
  }
  return { refresh };
}
export const SignalRAckContext =
  React.createContext<SignalRContextType>(initialSignalRState);

function useFetchSignalRConnectionData() {
  const { company } = useFetchCompany();
  const userId = useAppSelector((s) => s.user?.id ?? "");
  function base64UrlEncode(data: string) {
    // Convert string data to Base64
    let base64 = btoa(data);

    // Modify Base64 to make it URL-friendly
    base64 = base64.replace("+", "-");
    base64 = base64.replace("/", "_");
    base64 = base64.replace(/=+$/, "");

    return base64;
  }
  if (!company?.signalRGroupName || !userId) {
    return undefined;
  }
  return base64UrlEncode(
    JSON.stringify({
      user_id: userId,
      group_ids: [company.signalRGroupName],
    })
  );
}

const SignalRReducer = (
  state: SignalRContextType,
  action: SignalRActionType
): SignalRContextType => {
  switch (action.type) {
    case "UPDATE_SESSION_ID":
      return {
        ...state,
      };
    case "RECONNECT_STARTED":
      return {
        ...state,
        connection: undefined,
      };
    case "RECONNECT_COMPLETED":
      return {
        ...state,
        connection: action.connection,
      };
    case "API.LOAD_CONVERSATION.STARTED":
      return {
        ...state,
        isFetchData: true,
      };
    case "API.LOAD_CONVERSATION.COMPLETED":
      return {
        ...state,
        isFetchData: false,
      };
    case "CLOSED":
      return {
        ...state,
        connection: undefined,
      };

    case "STARTED":
      return { ...state, connection: action.connection };

    default:
      return state;
  }
};
function SignalRAckObservable(props: { children: ReactNode }) {
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const connectionData = useFetchSignalRConnectionData();
  const [signalRInfo, signalRDispatch] = useReducer(
    SignalRReducer,
    initialSignalRState
  );
  const sessionRef = useRef("");
  const { refresh } = useRefreshConversation();
  const userLocationWorkspace = useAppSelector((s) => s.userWorkspaceLocation);
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (signalRInfo.isFetchData && !document.hidden) {
        signalRDispatch({
          type: "API.LOAD_CONVERSATION.COMPLETED",
        });
        refresh();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [signalRInfo.isFetchData]);
  const isDeprecatedFeature =
    process.env.REACT_APP_FEATURE_DEPRECATION?.split(",");
  useEffect(() => {
    let connectionBuilt: HubConnection | null = null;
    if (
      !isAuthenticated ||
      !connectionData ||
      (isDeprecatedFeature && isDeprecatedFeature.length > 0)
    ) {
      return;
    }
    let unmounting = false;
    async function retrySignalR() {
      try {
        connectionBuilt = await buildHubConnection(
          connectionData,
          getAccessTokenSilently,
          () => {},
          userLocationWorkspace
        );
        if (!connectionBuilt) {
          console.error(`🦄 #signalr No connection built`, { props });
          return;
        }
        connectionBuilt.serverTimeoutInMilliseconds = 9999999999999;
      } catch (e) {
        console.error("🦄 #signalr Fail", e);
      }

      if (!connectionBuilt) {
        console.error(`🦄 #signalr No connection built`, { props });
        return;
      }

      connectionBuilt
        .start()
        .then(() => {
          if (!connectionBuilt) {
            throw "🦄 #signalr Connection missed while connecting";
          }
          console.debug(
            `🦄 #signalr connected to ${connectionBuilt.connectionId!}`
            // { accessToken }
          );
          signalRDispatch({ type: "STARTED", connection: connectionBuilt });
          connectionBuilt
            .invoke("Sessions.InitSession")
            .catch((err) => console.error(err.toString()));
        })
        .catch((e) => {
          console.error(`🦄 #signalr mount: ${e}`, {
            e,
            connection: connectionBuilt,
          });
          reconnect(connectionBuilt);
        });
      connectionBuilt.on("Sessions.LeftSessionMessage", (mySessionId) => {
        if (sessionRef.current !== mySessionId) {
          console.error("SessionId is not matched");
        } else {
          console.log(`Disconnected with sessionId${mySessionId}!`);

          signalRDispatch({ type: "CLEAR_SESSION_ID", sessionId: undefined });
        }
      });
      connectionBuilt.on("Exceptions.SessionNotFoundException", () => {
        // The session is expired or not existed
        // Need to reset everything
        console.debug(`sessionId: ${sessionRef.current}`);
        reconnect(connectionBuilt);
        throw new Error("Unable to join the session");
      });
      connectionBuilt.on("Sessions.JoinedSession", (sid) => {
        let sessionId = sessionRef.current;
        if (!sessionId) {
          sessionId = sid;
          console.debug(`Initialized with sessionId${sid}! SignalR Connected.`);
        } else if (sessionRef.current !== sid) {
          console.error("SessionId is not matched");
          refresh();
        } else {
          console.debug(`Sessionid ${sessionId} same as sid: ${sid}`);
        }
        sessionRef.current = sessionId;
        // TODO: when workspace existed
        // Promise.all(additionalGroupId.map(groupId => {
        //   return connection.invoke("Associations.AssociateGroup", sessionId, groupId);
        // }))
      });
      connectionBuilt.onreconnecting((error) => {
        console.debug(
          `🦄 #signalr Reconnection because of ${
            error?.toString() ?? "nothing"
          }`
        );
      });
      connectionBuilt.onreconnected((connectionId) => {
        console.debug("🦄 #signalr ack Reconnected ", {
          connectionId,
          signalRInfo,
          sessionRef,
        });
        if (sessionRef.current && connectionBuilt) {
          signalRDispatch({
            type: "RECONNECT_COMPLETED",
            connection: connectionBuilt,
            sessionId: sessionRef.current,
          });
          connectionBuilt.invoke("Sessions.JoinSession", sessionRef.current);
        }
        signalRDispatch({
          type: "API.LOAD_CONVERSATION.STARTED",
        });
        console.debug(
          `🦄 #signalr Reconnected to ${connectionId ?? "nothing"}`
        );
      });
      connectionBuilt.onclose((error) => {
        if (unmounting) {
          console.debug("🦄 #signalr Connection UNMOUNT closed: ⬇️", error);
        } else {
          console.debug("🦄 #signalr Connection closed: ???", error);
          reconnect(connectionBuilt);
        }
      });
    }

    function reconnect(connectionBuilt: HubConnection | null) {
      connectionBuilt?.stop().finally(() => {
        signalRDispatch({
          type: "API.LOAD_CONVERSATION.STARTED",
        });
        setTimeout(retrySignalR, 10000);
      });
    }
    retrySignalR();
    return () => {
      unmounting = true;
      // shut down on accessToken changed
      // console.debug("🦄⬇️ #signalr", { signalRInfo });
      connectionBuilt
        ?.stop()
        .then(() => {
          console.debug(`🦄⬇️ #signalr Done`, {
            id: connectionBuilt?.connectionId,
          });
        })
        .catch((e) => {
          console.error(`🦄⬇️ #signalr`, e, { c: connectionBuilt });
        });
    };
  }, [user, isAuthenticated, connectionData, isDeprecatedFeature]);
  return (
    <SignalRAckContext.Provider value={{ ...signalRInfo, signalRDispatch }}>
      {props.children}
    </SignalRAckContext.Provider>
  );
}

async function buildHubConnection(
  data: string | undefined,
  getAccessTokenSilently: () => Promise<string>,
  signout: () => void,
  userLocationWorkspace: string | undefined
) {
  if (!data) {
    return null;
  }
  return new HubConnectionBuilder()
    .withUrl(
      `${process.env.REACT_APP_SLEEKFLOW_API_URL}/v1/user-event-hub/ReliableMessage?data=${data}`,
      {
        ...(userLocationWorkspace && {
          headers: {
            "X-Sleekflow-Location": userLocationWorkspace,
          },
        }),
        accessTokenFactory: async () => await getAccessTokenSilently(),
      }
    )
    .configureLogging({
      log: (logLevel, message) => {
        switch (logLevel) {
          case LogLevel.Debug:
            console.info(`ℹ️ #signalr ${message}`);
            break;
          case LogLevel.Information:
            console.debug(`ℹ️ #signalr ${message}`);
            break;
          case LogLevel.Warning:
          case LogLevel.Error:
          case LogLevel.Critical:
            console.warn(`ℹ️ #signalr ${message}`);
            break;
        }
      },
    })
    .withAutomaticReconnect({
      nextRetryDelayInMilliseconds(retryContext: RetryContextWithStatusCode) {
        console.debug(`ℹ️️ #signalr retry attempt`, { retryContext });
        if (retryContext.retryReason.statusCode === 401) {
          signout();
        }
        // console.debug("retryContext.previousRetryCountretryContext.previousRetryCount", retryContext.previousRetryCount);
        // if (retryContext.previousRetryCount === 10) {
        //   return null;
        // }
        return null;
      },
    })
    .build();
}

export default SignalRAckObservable;
