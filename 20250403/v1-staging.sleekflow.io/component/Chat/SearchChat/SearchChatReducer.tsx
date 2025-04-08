import React from "react";
import SearchChatType from "./SearchChatType";

const SearchChatReducer = (
  state: SearchChatType,
  action: any
): SearchChatType => {
  switch (action.type) {
    case "UPDATE_LOADING_RESULT": {
      return {
        ...state,
        isLoading: action.isLoading
          ? action.isLoading
          : action.isLoading && state.isLoading,
      };
    }
    case "UPDATE_SEARCH_RESULT_FOUND": {
      return { ...state, resultExist: action.result + state.resultExist };
    }
    case "UPDATE_LOADING_MESSAGE_RESULT": {
      return {
        ...state,
        isLoadingMessage: action.isLoadingMessage,
        isLoading: action.isLoadingMessage && state.isLoadingChat,
      };
    }
    case "UPDATE_LOADING_CHAT_RESULT": {
      return {
        ...state,
        isLoadingChat: action.isLoadingChat,
        isLoading: action.isLoadingMessage || state.isLoadingChat,
      };
    }
    case "SELECTED_PROFILE": {
      return {
        ...state,
        targetProfileId: action.targetProfileId,
        targetMessageId: action.targetMessageId,
      };
    }
    case "UPDATE_SEARCH_MESSAGE":
      return { ...state, searchMessage: action.searchMessage, resultExist: 0 };
  }
  return state;
};

export const defaultState: SearchChatType = {
  targetProfileId: "",
  targetMessageId: 0,
  searchMessage: "",
  resultExist: 0,
  isLoadingMessage: false,
  isLoadingChat: false,
  isLoading: false,
};

export default SearchChatReducer;
