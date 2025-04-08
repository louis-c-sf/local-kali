import React, { useCallback, useEffect, useState } from "react";
import ChatSearch from "../Chat/ChatSearch";
import SearchGroupList from "../Chat/SearchGroupList";
import ChatGroupList from "../Chat/ChatGroupList";
import ChatAssigneeDropdown from "./ChatAssigneeDropdown";
import { sortByDisplayPriority } from "./mutators/sortByDisplayPriotity";
import { useStickedScroll } from "../../lib/effects/useStickedScroll";
import { InboxFilterParamsType } from "../../api/Chat/fetchAllSummaries";
import { useChatsFilterBuilder } from "../../api/Chat/useChatsFilterBuilder";
import { FilterDropdownMemo as FilterDropdown } from "./filter/FilterDropdown";
import { StatusFilter } from "./StatusFilter";
import { useAppDispatch, useAppSelector } from "../../AppRootContext";
import { equals, pick } from "ramda";
import OrderByDropdown from "./orderBy/OrderByDropdown";

export const handleScrolling = (scrollParent?: HTMLDivElement) => {
  scrollParent?.classList.add("on-scrollbar");

  setTimeout(() => {
    scrollParent?.classList.remove("on-scrollbar");
  }, 1000);
};

export default function ChatSidebar(props: {
  id: string;
  visibleSidebar: boolean;
  isDemo?: boolean;
}) {
  const { id, visibleSidebar, isDemo = false } = props;
  const [scrollRef, setScrollRef] = useState<HTMLDivElement | null>(null);
  const { selectedAssignee, selectedAssigneeId, loggedInUserDetail } =
    useAppSelector(
      pick(["selectedAssignee", "selectedAssigneeId", "loggedInUserDetail"]),
      equals
    );
  const chatsSorted = useAppSelector(
    (s) => sortByDisplayPriority(s.chats ?? [], s.inbox.filter.orderBy),
    equals
  );

  const loginDispatch = useAppDispatch();
  const [searchText, updateSearching] = useState("");

  useEffect(() => {
    setRoleType(loggedInUserDetail?.roleType ?? "");
  }, [loggedInUserDetail?.roleType]);

  const [roleType, setRoleType] = useState("");

  const { isLoadMoreBlocked, filterTags, currentFilter, currentFilterStamp } =
    useChatsFilterBuilder();

  const updateSearchingText = (text: string) => {
    updateSearching(text);
    loginDispatch({ type: "CHATS_RESET" });
  };

  const handleScrollingListener = () => {
    handleScrolling(scrollRef ?? undefined);
  };

  useStickedScroll({
    stateSnapchot: chatsSorted
      .map((c) => c?.conversationId?.substr(0, 6) ?? "")
      .join("/"),
    containerNode: scrollRef,
  });

  useEffect(() => {
    if (!scrollRef) {
      return;
    }
    if (selectedAssignee) {
      updateSearching("");
    }
    scrollRef.addEventListener("scroll", handleScrollingListener, true);

    return () => {
      scrollRef.removeEventListener("scroll", handleScrollingListener);
    };
  }, [scrollRef, selectedAssignee]);

  const handleFilterChanged = useCallback(
    async (filter: InboxFilterParamsType) => {
      if (isLoadMoreBlocked || !selectedAssigneeId) {
        return;
      }
      loginDispatch({ type: "INBOX.API.LOAD_SUMMARY", filter });
    },
    [isLoadMoreBlocked, selectedAssigneeId]
  );

  useEffect(() => {
    handleFilterChanged(currentFilter);
  }, [handleFilterChanged, currentFilterStamp]);

  return (
    <div className={`chat-sidebar ${(visibleSidebar && "blur") || ""}`}>
      <div className="header-menu top">
        <ChatAssigneeDropdown />
      </div>
      <div className="search-section">
        <ChatSearch
          updateSearching={updateSearchingText}
          searchText={searchText}
        />
        <OrderByDropdown />
        <FilterDropdown />
      </div>
      <StatusFilter />
      {searchText ? (
        <SearchGroupList searchMessage={searchText} />
      ) : (
        <div className="content" ref={setScrollRef}>
          <ChatGroupList
            id={id}
            tags={filterTags}
            chatsSorted={chatsSorted}
            disabledMenu={isDemo}
          />
        </div>
      )}
    </div>
  );
}
