import React from "react";
import { useAppDispatch, useAppSelector } from "../../../AppRootContext";
import chatHeaderStyles from "./ChatHeader.module.css";
import SearchIcon from "../../../assets/tsx/icons/SearchIcon";
import { Button } from "semantic-ui-react";

export function MessageSearchButton() {
  const loginDispatch = useAppDispatch();
  const searchActive = useAppSelector((s) => s.inbox.messageSearch.active);

  const openSearch = () => {
    loginDispatch({ type: "INBOX.MESSAGE.SEARCH_OPEN" });
  };

  return (
    <Button
      onClick={searchActive ? undefined : openSearch}
      className={`${chatHeaderStyles.searchButton}`}
    >
      <div className={chatHeaderStyles.iconWrap}>
        <SearchIcon color={"var(--BLACK)"} />
      </div>
    </Button>
  );
}
