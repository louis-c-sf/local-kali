import React from "react";
import MessageType from "../../../types/MessageType";
import { RenderMessage, RenderString } from "./MessageQuoteSelected";

export function MessageQuoted(props: {
  message?: MessageType | string;
  onClick?: (message?: MessageType) => void;
}) {
  const { message } = props;
  if (message === undefined) {
    return null;
  }
  return (
    <div
      className="quote-message"
      onClick={() => props.onClick?.(message as MessageType)}
    >
      <span className="bg" />
      {typeof message === "string" ? (
        <RenderString content={message} />
      ) : (
        <RenderMessage message={message} />
      )}
    </div>
  );
}
