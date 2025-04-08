import { method } from "lodash-es";
import { useContext, useEffect } from "react";
import { useStore } from "react-redux";
import { SignalRAckContext } from "./SignalRAckObservable";

export function useSignalRAck(
  handler: {
    [method: string]: (...args: any) => void;
  },
  client: string
) {
  const { connection } = useContext(SignalRAckContext);
  const reduxStore = useStore();
  useEffect(() => {
    if (!connection) {
      return;
    }
    Object.entries(handler).forEach(([method, handle]) => {
      if (method === "Reliable.ReceiveMessage") {
        connection.on(
          method,
          (
            messageType: string,
            connectionId: string,
            messageWrapperJson: string
          ) => {
            const messageWrapper = JSON.parse(messageWrapperJson);
            handle(reduxStore.getState(), JSON.parse(messageWrapper.message));
            connection
              .invoke("Reliable.AckMessage", messageWrapper.message_id)
              .catch((err) => console.error(err.toString()));
          }
        );
      } else {
        connection.on(method, handle);
      }
    });
    return () => {
      Object.entries(handler).forEach(([method, handle]) => {
        connection.off(method, handle);
      });
    };
  }, [connection?.connectionId]);
}
