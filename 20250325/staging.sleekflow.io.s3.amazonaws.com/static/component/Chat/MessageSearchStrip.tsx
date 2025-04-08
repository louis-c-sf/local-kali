import React, { useCallback, useState } from "react";
import { Ref } from "semantic-ui-react";
import { ScrollContentsMemo } from "./Records/ScrollContents";
import ContextMessageScroller from "./Sidebar/SearchMessages/ContextMessageScroller";
import { LoginType, Action } from "../../types/LoginType";
import { getMessageNodeId } from "./Records/CheckableRow";
import MessageType from "../../types/MessageType";

export function MessageSearchStrip(props: {
  scrollParent: HTMLDivElement | null;
  messages: MessageType[];
}) {
  const { scrollParent, messages } = props;
  const [scrollNode, setScrollNode] = useState<HTMLDivElement | null>(null);

  const selectSearchMessageHighlightNodeId = useCallback((s: LoginType) => {
    const messageClicked = s.inbox.messageSearch.highlightMessage;
    const isInitialized = s.inbox.messageSearch.contextMessages.initialized;
    return messageClicked && isInitialized
      ? getMessageNodeId(messageClicked)
      : undefined;
  }, []);

  const createScrollAction = useCallback((bound: "upper" | "lower"): Action => {
    return {
      type: "INBOX.MESSAGE.SEARCH_CONTEXT_SCROLL",
      bound: bound,
    };
  }, []);

  return (
    <ContextMessageScroller
      scrollParentRef={scrollParent}
      scrollRef={scrollNode}
      selectHighlightMessageNode={selectSearchMessageHighlightNodeId}
      createScrollAction={createScrollAction}
    >
      <Ref innerRef={(el) => setScrollNode(el ?? undefined)}>
        <ScrollContentsMemo containerNode={scrollNode} messages={messages} />
      </Ref>
    </ContextMessageScroller>
  );
}
