import React, { createContext } from "react";
import SearchChatType from "../component/Chat/SearchChat/SearchChatType";
import { defaultState } from "../component/Chat/SearchChat/SearchChatReducer";

interface SearchChatContextType extends SearchChatType {
  searchChatDispatch: Function;
}
export function searchChatContextDefaults(): SearchChatContextType {
  return {
    ...defaultState,
    searchChatDispatch: () => {},
  };
}

const SearchChatContext = createContext<SearchChatContextType>(
  searchChatContextDefaults()
);

export default SearchChatContext;
