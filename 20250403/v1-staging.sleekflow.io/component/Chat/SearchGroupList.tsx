import React, { useContext, useEffect, useState, useReducer } from "react";
import { Loader, Dimmer } from "semantic-ui-react";
import { useDebouncedCallback } from "use-debounce";
import SearchMessageGroupList from "./SearchMessageGroupList";
import SearchNameGroupList from "./SearchNameGroupList";
import SearchChatReducer, {
  defaultState,
} from "./SearchChat/SearchChatReducer";
import SearchChatContext from "../../context/SearchChatContext";
import ChatGroupListDummy from "./ChatGroupListDummy";
import { handleScrolling } from "./ChatSidebar";

interface SearchGroupListProps {
  searchMessage: string;
}

export default (props: SearchGroupListProps) => {
  const { searchMessage } = props;
  const [scrollParent, setScrollParent] = useState<
    HTMLDivElement | undefined
  >();
  // const [loading, isLoading] = useState(false);
  const [searchChatState, searchChatDispatch] = useReducer(
    SearchChatReducer,
    defaultState
  );
  const { isLoading, isLoadingChat, isLoadingMessage } = useContext(
    SearchChatContext
  );

  const [debonceCallback] = useDebouncedCallback(() => {
    searchChatDispatch({ type: "UPDATE_SEARCH_MESSAGE", searchMessage });
  }, 800);
  const handleScrollingListener = () => {
    handleScrolling(scrollParent);
  };
  useEffect(() => {
    scrollParent?.addEventListener("scroll", handleScrollingListener, true);
    return () => {
      scrollParent?.removeEventListener(
        "scroll",
        handleScrollingListener,
        true
      );
    };
  }, [scrollParent, isLoading, isLoadingChat, isLoadingMessage]);

  useEffect(() => {
    debonceCallback();
    return () => {};
  }, [props.searchMessage]);

  return (
    <div className="search-group content no-scrollbars">
      <SearchChatContext.Provider
        value={{
          ...searchChatState,
          searchChatDispatch,
        }}
      >
        <div className="content" ref={(e) => setScrollParent(e ?? undefined)}>
          <Dimmer.Dimmable dimmed={searchChatState.isLoadingChat}>
            <SearchNameGroupList />
            <SearchMessageGroupList scrollParent={scrollParent} />
            {searchChatState.isLoadingChat && <ChatGroupListDummy />}
            {!searchChatState.isLoadingChat &&
              searchChatState.resultExist === 0 && (
                <div className="no-record">No result found</div>
              )}
          </Dimmer.Dimmable>
        </div>
      </SearchChatContext.Provider>
    </div>
  );
};
