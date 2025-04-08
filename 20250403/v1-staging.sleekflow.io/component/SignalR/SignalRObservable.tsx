import React, { ReactNode, useEffect, useReducer } from "react";
import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
  RetryContext,
} from "@microsoft/signalr";
import { useAppDispatch, useAppSelector } from "../../AppRootContext";
import { mergeDeepRight } from "ramda";
import { useAuth0 } from "@auth0/auth0-react";

const SIGNALR_URL = process.env.REACT_APP_API_URL;

export type SignalRActionType =
  | { type: "STARTED"; connection: HubConnection }
  | { type: "CLOSED" }
  | {
      type: "UPDATE_CHATMESSAGE_SIGNALR_CONNECTION_STATE";
      status: CONNECT_STATE;
    }
  | { type: "UPDATE_CHATS_SIGNALR_CONNECTION_STATE"; status: CONNECT_STATE }
  | { type: "RECONNECT_STARTED" }
  | { type: "RECONNECT_COMPLETED"; connection: HubConnection };

export interface SignalRContextType {
  connection: HubConnection | undefined;
  apiConnection: APIConnectionType;
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
  apiConnection: {
    chatMessages: CONNECT_STATE.UP,
    chats: CONNECT_STATE.UP,
    lastConnectedTime: new Date().toISOString(),
  },
  signalRDispatch: () => {},
};
export const SignalRContext =
  React.createContext<SignalRContextType>(initialSignalRState);

const SignalRReducer = (
  state: SignalRContextType,
  action: SignalRActionType
): SignalRContextType => {
  switch (action.type) {
    case "RECONNECT_STARTED":
      return {
        ...state,
        connection: undefined,
        apiConnection: {
          chatMessages: CONNECT_STATE.DOWN,
          chats: CONNECT_STATE.DOWN,
          lastConnectedTime: new Date().toISOString(),
        },
      };
    case "RECONNECT_COMPLETED":
      return {
        ...state,
        connection: action.connection,
        apiConnection: {
          ...state.apiConnection,
          chatMessages: CONNECT_STATE.UNSYNC,
          chats: CONNECT_STATE.UNSYNC,
          //todo lastConnectedTime?
        },
      };
    case "UPDATE_CHATMESSAGE_SIGNALR_CONNECTION_STATE":
      return mergeDeepRight(state, {
        apiConnection: { chatMessages: action.status },
      });

    case "UPDATE_CHATS_SIGNALR_CONNECTION_STATE":
      return mergeDeepRight(state, {
        apiConnection: { chats: action.status },
      });

    case "CLOSED":
      return {
        ...state,
        connection: undefined,
        apiConnection: {
          chatMessages: CONNECT_STATE.DOWN,
          chats: CONNECT_STATE.DOWN,
          lastConnectedTime: new Date().toISOString(),
        },
      };

    case "STARTED":
      return { ...state, connection: action.connection };

    default:
      return state;
  }
};

function SignalRObservable(props: { children: ReactNode }) {
  const loginDispatch = useAppDispatch();
  const [signalRInfo, signalRDispatch] = useReducer(
    SignalRReducer,
    initialSignalRState
  );
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const userLocationWorkspace = useAppSelector((s) => s.userWorkspaceLocation);

  function signout() {
    // logout();
    // performLogout();
  }
  const isDeprecatedFeature =
    process.env.REACT_APP_FEATURE_DEPRECATION?.split(",");
  useEffect(() => {
    // do not create a parasite unauthenticated connection
    if (
      !isAuthenticated ||
      (isDeprecatedFeature && isDeprecatedFeature.length > 0)
    ) {
      return;
    }
    let unmounting = false;
    let connectionBuilt: HubConnection | null = null;
    async function retrySignalR() {
      try {
        connectionBuilt = await buildHubConnection(
          getAccessTokenSilently,
          signout,
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
        })
        .catch((e) => {
          console.error(`🦄 #signalr mount: ${e}`, {
            e,
            connection: connectionBuilt,
          });
        });

      connectionBuilt.onreconnecting((error) => {
        signalRDispatch({ type: "RECONNECT_STARTED" });
        console.debug(
          `🦄 #signalr Reconnection because of ${
            error?.toString() ?? "nothing"
          }`
        );
      });

      connectionBuilt.onreconnected((connectionId) => {
        console.debug("🦄 #signalr Reconnected ", {
          connectionId,
        });
        if (connectionId && connectionBuilt?.connectionId) {
          signalRDispatch({
            type: "RECONNECT_COMPLETED",
            connection: connectionBuilt,
          });
        }
        console.debug(
          `🦄 #signalr Reconnected to ${connectionId ?? "nothing"}`
        );
      });

      connectionBuilt.onclose((error) => {
        if (unmounting) {
          // todo we should not show the banner on a regular unmount.
          //  This is a moment when the page is already started refreshing,
          //  or changed to other one, where the subsription doesn't need an extra reload
          console.debug("🦄 #signalr Connection UNMOUNT closed: ⬇️", error);
        } else {
          console.debug("🦄 #signalr Connection closed: ???", error);
        }
        signalRDispatch({ type: "CLOSED" });
        console.debug(`#signalr onclose`, { signalRInfo });
        loginDispatch({ type: "DISPLAY_SIGNALR_DISCONNECT_MESSAGE" });
      });
    }
    retrySignalR();
    return () => {
      unmounting = true;
      // shut down on accessToken changed
      console.debug("🦄⬇️ #signalr", { signalRInfo });
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
  }, [user, isAuthenticated, isDeprecatedFeature]);

  return (
    <SignalRContext.Provider value={{ ...signalRInfo, signalRDispatch }}>
      {props.children}
    </SignalRContext.Provider>
  );
}

async function buildHubConnection(
  getAccessTokenSilently: () => Promise<string>,
  signout: () => void,
  userLocationWorkspace: string | undefined
) {
  return new HubConnectionBuilder()
    .withUrl(`${SIGNALR_URL}/chat`, {
      ...(userLocationWorkspace && {
        headers: {
          "X-Sleekflow-Location": userLocationWorkspace,
        },
      }),
      accessTokenFactory: async () => await getAccessTokenSilently(),
    })
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
        return 5000;
      },
    })
    .build();
}

export default SignalRObservable;
