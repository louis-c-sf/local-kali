import { useCallback, useEffect, useRef, useState } from "react";
import ConversationType, { HashTagType } from "../../types/ConversationType";
import { get } from "../apiRequest";
import { ProfileType } from "../../types/LoginType";
import { useConversationParams } from "./useConversationParams";
import {
  InboxFilterParamsType,
  InboxPaginationParamsType,
} from "./fetchAllSummaries";
import { useChatsFilterBuilder } from "./useChatsFilterBuilder";
import { useAppDispatch } from "../../AppRootContext";
import { denormalizeConversation } from "../../types/Chat/denormalizeConversation";

export function useLoadMoreChats(props: {
  id: string;
  tags: HashTagType[];
  startLimit: number;
  nextLimit: number;
}) {
  const loginDispatch = useAppDispatch();
  const { assigneeId, conversationId } = useConversationParams();
  const limit = props.startLimit;
  const [loading, isLoading] = useState(true);
  const [pageLoaded, setPageLoaded] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const {
    currentFilterStamp,
    isLoadMoreBlocked,
    getChatsEndPoint,
    buildFilter,
  } = useChatsFilterBuilder();
  const currentFilterRef = useRef<string>();
  const pagesQueriedRef = useRef<number[]>([]);
  const loadMore = useCallback(async () => {
    try {
      const nextPage = pageLoaded + 1;
      if (isLoadMoreBlocked || !assigneeId) {
        return;
      }
      const endpoint = getChatsEndPoint(assigneeId);
      let result: ConversationType[] = [];
      let offset = 0;
      if (pageLoaded > 0) {
        offset = limit + (pageLoaded - 1) * props.nextLimit;
      }
      if (pagesQueriedRef.current.includes(nextPage)) {
        // already loading / loaded
        return;
      }
      pagesQueriedRef.current.push(nextPage);

      isLoading(true);
      result = (await get(endpoint, {
        param: buildPageParams(limit, offset),
      })) as ConversationType[];
      if (
        currentFilterRef.current !== null &&
        currentFilterRef.current !== currentFilterStamp
      ) {
        // filter were changed before load succeeds
        return;
      }
      setPageLoaded(nextPage);
      setHasMore(result.length === limit);
      isLoading(false);
      let conversations: ProfileType[] = [];
      for (const updatedConversation of result) {
        const formattedConversationMessage =
          denormalizeConversation(updatedConversation);
        conversations.push(formattedConversationMessage);
      }
      loginDispatch({
        type: "UPDATE_SELECTED_ASSIGNEE_CONVERSATIONS",
        updatedConversations: conversations,
      });
      loginDispatch({
        type: "CHATS_UPDATED",
        conversationId: props.id,
        chats: conversations,
        selectedAssigneeId: assigneeId,
      });
    } catch (e) {
      console.error("#more ChatGroupList error: ", e);
      setHasMore(false);
      isLoading(false);
    }
  }, [currentFilterStamp, isLoadMoreBlocked, pageLoaded]);

  useEffect(() => {
    if (isLoadMoreBlocked) {
      return;
    }
    currentFilterRef.current = currentFilterStamp;
    pagesQueriedRef.current = [];
    loginDispatch({ type: "CHATS_RESET" });
    if (!conversationId) {
      loginDispatch({ type: "RESET_PROFILE" });
    }
    setPageLoaded(0);
  }, [currentFilterStamp, isLoadMoreBlocked]);

  const buildPageParams = useCallback(
    (
      limit: number,
      offset: number
    ): InboxFilterParamsType & InboxPaginationParamsType => ({
      ...buildFilter(),
      offset,
      limit,
    }),
    [buildFilter]
  );

  return {
    buildPageParams,
    getChatsEndPoint,
    currentFilterStamp,
    hasMore,
    isLoadMoreBlocked,
    loadMore,
    loading,
    pageLoaded,
  };
}
