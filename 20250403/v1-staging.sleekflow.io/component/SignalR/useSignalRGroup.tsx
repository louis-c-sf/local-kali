import { HubConnectionState, HubConnection } from "@microsoft/signalr";
import { useContext, useEffect } from "react";
import { SignalRContext } from "./SignalRObservable";
import { useAppDispatch } from "../../AppRootContext";
import { useStore } from "react-redux";
import { LoginType } from "../../types/LoginType";
import { ReadonlyDeep } from "Object/Readonly";

export function useSignalRGroup(
  groupName: string | undefined,
  handlers: {
    [method: string]: Array<
      (state: ReadonlyDeep<LoginType>, ...args: any[]) => void
    >;
  },
  client: string,
  onLeave?: (connection: HubConnection) => void
) {
  const { connection } = useContext(SignalRContext);
  const loginDispatch = useAppDispatch();

  const reduxStore = useStore();

  useEffect(() => {
    if (!connection) {
      return;
    }
    if (!groupName) {
      return;
    }
    connection
      .invoke("AddToGroup", groupName)
      .then(() => {
        console.debug(`🎀 #signalr AddToGroup OK@${client}`, {
          cid: connection?.connectionId,
          groupName,
        });
        Object.entries(handlers).forEach(([method, handlers]) => {
          handlers.forEach((handler) =>
            connection.on(method, (...args: any[]) =>
              handler(reduxStore.getState(), ...args)
            )
          );
        });
      })
      .catch((err: any) => {
        console.error(
          `🎀  #signalr AddToGroup @${client} ${err?.toString() ?? "??"}`
        );
        if (connection.state === HubConnectionState.Disconnected) {
          loginDispatch({ type: "DISPLAY_SIGNALR_DISCONNECT_MESSAGE" });
        }
      });

    return () => {
      console.debug(`🐡⬇️ #signalr @${client}`, {
        cid: connection?.connectionId,
        groupName,
      });
      if (connection) {
        // turn off exactly those listeners that were attached
        Object.entries(handlers).forEach(([method, handlers]) => {
          handlers.forEach((handler) => connection.off(method, handler));
        });
        try {
          onLeave && onLeave(connection);
        } catch (e) {
          console.error("OnLeave", e);
        }
      }
    };
  }, [connection?.connectionId, groupName]);
}
