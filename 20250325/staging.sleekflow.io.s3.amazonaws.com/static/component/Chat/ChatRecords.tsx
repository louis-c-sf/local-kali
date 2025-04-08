import React, { useLayoutEffect, useState } from "react";
import MessageType from "../../types/MessageType";
import { ProfileType } from "../../types/LoginType";
import useSelectedChat from "../../lib/effects/useSelectedChat";
import { handleScrolling } from "./ChatSidebar";
import { equals } from "ramda";
import { useAppSelector } from "../../AppRootContext";
import { MessageSearchStrip } from "./MessageSearchStrip";
import { PreselectedMessagesStrip } from "./PreselectedMessagesStrip";
import { ChatMessagesStrip } from "./ChatMessagesStrip";
import { matchesConversationId } from "./mutators/chatSelectors";
import Banner from "../../features/Facebook/usecases/Inbox/components/Banner";
import { Loader } from "semantic-ui-react";
import { sortedFromOldest } from "./mutators/sortedFromOldest";

export interface ChatMessageRequestType {
  channel?: string;
  offset?: number;
  afterTimestamp?: number;
  beforeTimestamp?: number;
  limit: number;
  channelIds?: string;
}

export const SCROLL_STRIP_ID = "chats-scroll-strip";

export function ChatRecords(props: { profile: ProfileType }) {
  const { profile } = props;
  const [scrollParent, setScrollParent] = useState<HTMLDivElement | null>(null);

  let currentChatId = profile?.conversationId;
  const { selectedChatMessages: chatMessages, latestCustomerMessage } =
    useSelectedChat(currentChatId);

  const isMessagesSearchVisible = useAppSelector((s) => {
    const contextMessages = s.inbox.messageSearch.contextMessages;
    return contextMessages.active && contextMessages.list.length > 0;
  });

  const isPreselectedSearchVisible = useAppSelector((s) => {
    const contextMessages = s.inbox.preselectedMessage.contextMessages;
    return contextMessages.active && contextMessages.list.length > 0;
  });

  const isChatMessageStripVisible = !(
    isMessagesSearchVisible || isPreselectedSearchVisible
  );

  const searchContextMessages: MessageType[] = useAppSelector(
    (s) => sortedFromOldest(s.inbox.messageSearch.contextMessages.list),
    equals
  ).filter(matchesConversationId(currentChatId));
  const preselectedContextMessages: MessageType[] = useAppSelector(
    (s) => sortedFromOldest(s.inbox.preselectedMessage.contextMessages.list),
    equals
  ).filter(matchesConversationId(currentChatId));

  const {
    loading: facebookOTNStateLoading,
    showBanner: showFacebookOTNBanner,
  } = useAppSelector((s) => s.inbox.facebook.messageType);

  useLayoutEffect(() => {
    if (!scrollParent) {
      return;
    }
    const handleScrollingListener = () => {
      handleScrolling(scrollParent ?? undefined);
    };

    scrollParent.addEventListener("scroll", handleScrollingListener, true);
    return () => {
      scrollParent?.removeEventListener("scroll", handleScrollingListener);
    };
  }, [scrollParent]);

  if (!currentChatId) {
    return null;
  }
  return (
    <div
      className={`chats ${chatMessages.length <= 1 ? "no-scrollbars" : ""}`}
      ref={setScrollParent}
      id={SCROLL_STRIP_ID}
    >
      {facebookOTNStateLoading ? (
        <Loader />
      ) : (
        showFacebookOTNBanner && (
          <Banner
            pageId={latestCustomerMessage?.facebookSender?.pageId}
            fbReceiverId={profile.facebookAccount?.id}
            conversationId={latestCustomerMessage?.conversationId}
          />
        )
      )}
      <div className="scroll-animation" />
      {isMessagesSearchVisible && (
        <MessageSearchStrip
          scrollParent={scrollParent}
          messages={searchContextMessages}
        />
      )}
      {isPreselectedSearchVisible && (
        <PreselectedMessagesStrip
          scrollParent={scrollParent}
          messages={preselectedContextMessages}
        />
      )}
      {isChatMessageStripVisible && (
        <ChatMessagesStrip scrollParent={scrollParent} profile={profile} />
      )}
    </div>
  );
}
