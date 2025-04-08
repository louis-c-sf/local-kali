import React from "react";
import ChatGroupList from "../../../../Chat/ChatGroupList";
import ChatAssigneeDropdown from "../../../../Chat/ChatAssigneeDropdown";
import { useTranslation } from "react-i18next";
import { sortByDisplayPriority } from "../../../../Chat/mutators/sortByDisplayPriotity";
import { FilterDropdownMemo as FilterDropdown } from "../../../../Chat/filter/FilterDropdown";
import { StatusFilter } from "../../../../Chat/StatusFilter";
import { useAppSelector } from "AppRootContext";
import { equals } from "ramda";
import demoStyles from "../InboxDemo.module.css";
import { Icon, Input } from "semantic-ui-react";

export default function DemoChatSidebar() {
  const { t } = useTranslation();
  const chatsSorted = useAppSelector(
    (s) => sortByDisplayPriority(s.chats ?? []),
    equals
  );

  return (
    <div className="chat-sidebar">
      <div className={demoStyles.sidebar}>
        <div className="header-menu top">
          <ChatAssigneeDropdown />
        </div>
        <div className="search-section">
          <Input
            name="search"
            className="search"
            placeholder={t("chat.form.input.searchMessage.placeholder")}
            fluid
          >
            <Icon name="search" />
            <input />
          </Input>
          <FilterDropdown />
        </div>
        <StatusFilter />
        <div className={demoStyles.demoCover} />
      </div>
      <div className="content">
        <ChatGroupList id="" tags={[]} chatsSorted={chatsSorted} disabledMenu />
      </div>
    </div>
  );
}
