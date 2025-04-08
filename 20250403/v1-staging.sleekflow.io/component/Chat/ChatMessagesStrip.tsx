import React, { useCallback, useEffect, useState } from "react";
import InfiniteChatScroller from "./InfiniteChatScroller/InfiniteChatScroller";
import { Ref } from "semantic-ui-react";
import { ScrollContentsMemo } from "./Records/ScrollContents";
import { useAppDispatch, useAppSelector } from "../../AppRootContext";
import MessageType from "../../types/MessageType";
import { fetchChatMessages } from "api/Chat/fetchChatMessages";
import { useOldestMessageTimestamp } from "./hooks/useOldestMessageTimestamp";
import { ChatMessageRequestType } from "./ChatRecords";
import { normalizeAPIMessagesPage } from "./mutators/messageMutators";
import { equals, prop } from "ramda";
import { ProfileType, LoginType } from "types/LoginType";
import useSelectedChat from "lib/effects/useSelectedChat";
import * as Sentry from "@sentry/browser";
import moment from "moment";

export function ChatMessagesStrip(props: {
  scrollParent: HTMLDivElement | null;
  profile: ProfileType;
}) {
  const [hasMore, setHasMore] = useState(true);
  const { scrollParent, profile } = props;
  const currentChatId = profile.conversationId;
  const isScrollToEnd = useAppSelector((s: LoginType) =>
    Boolean(s.isScrollToEnd)
  );
  const loginDispatch = useAppDispatch();
  const [scrollNode, setScrollNode] = useState<HTMLDivElement | null>(null);
  const oldestMessageTimeStamp = useOldestMessageTimestamp();
  const [pageLoading, setPageLoading] = useState(false);
  const channelFilter = useAppSelector(
    (s: LoginType) => s.inbox.messagesFilter,
    equals
  );
  const { selectedChatMessages: chatMessages } = useSelectedChat(currentChatId);
  const completeScrollToBottom = () => {
    loginDispatch({
      type: "UPDATE_SCROLL_END",
      isScrollToEnd: false,
    });
  };

  useEffect(() => {
    if (currentChatId) {
      setHasMore(true);
    }
    setPageLoading(false);
  }, [currentChatId]);

  useEffect(() => {
    loginDispatch({
      type: "UPDATE_SELECTED_CHAT_WITH_PROFILE",
      currentMessages: chatMessages,
    });
  }, [JSON.stringify(chatMessages.map((s) => s.timestamp))]);

  useEffect(() => {
    if (!channelFilter.channelName && chatMessages.length === 0) {
      loadMore();
    }
  }, [channelFilter.channelName, chatMessages.length]);
  const loadMore = useCallback(async () => {
    if (!currentChatId) {
      return;
    }
    setPageLoading(true);

    let param: ChatMessageRequestType = {
      limit: 25,
    };
    if (!oldestMessageTimeStamp || profile.isNeedToFetch) {
      param.offset = 0;
      param.beforeTimestamp = moment().utc().unix();
    } else {
      param.beforeTimestamp = oldestMessageTimeStamp;
    }
    if (chatMessages.length === 1 && !profile.isNeedToFetch) {
      param.beforeTimestamp = oldestMessageTimeStamp;
    }
    if (channelFilter.channelName) {
      param.channel = channelFilter.channelName;
      if (channelFilter.channelId) {
        param.channelIds = channelFilter.channelId;
      }
    }

    let result: MessageType[] = [];
    try {
      const messageResp = await fetchChatMessages(param, currentChatId ?? "");
      if (messageResp) {
        result = messageResp;
      }
    } catch (error) {
      console.error("ChatMessagesStrip.loadMore", error);
      Sentry.captureException(error, (scope) => {
        scope.setTag("errorType", "HttpAPI");
        scope.setTag("feature", "Inbox");
        scope.setContext("conversation", {
          requestParams: param,
          channelFilter,
          currentChatId,
          oldestMessageTimeStamp,
        });
        return scope;
      });
      setPageLoading(false);
    }
    setHasMore(result.length > 0);
    setPageLoading(false);
    if (profile.isNeedToFetch) {
      loginDispatch({
        type: "CURRENT_CHAT_FETCHED",
        conversationId: currentChatId,
      });
    }
    if (result.length > 0) {
      loginDispatch({
        type: "CURRENT_CHAT_PAGE_LOADED",
        chatsDataUpdate: {
          messages: normalizeAPIMessagesPage(result, profile),
        },
        conversationId: currentChatId,
      });
    }
  }, [
    oldestMessageTimeStamp,
    currentChatId,
    channelFilter,
    profile.isNeedToFetch,
  ]);

  return (
    <InfiniteChatScroller
      conversationId={currentChatId}
      threshold={150}
      loadMore={loadMore}
      hasMore={hasMore}
      scrollToBottom={isScrollToEnd}
      scrollParent={scrollParent}
      onScrollToBottom={completeScrollToBottom}
      loading={pageLoading}
      autoloadFirstPage={chatMessages.length < 10}
    >
      <Ref innerRef={setScrollNode}>
        <ScrollContentsMemo
          messages={chatMessages}
          containerNode={scrollNode}
        />
      </Ref>
    </InfiniteChatScroller>
  );
}
