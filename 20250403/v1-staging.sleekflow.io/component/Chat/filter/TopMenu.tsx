import React from "react";
import { Checkbox, Dropdown } from "semantic-ui-react";
import { useTranslation } from "react-i18next";
import { AssigneeSummaryResponseType } from "../../../types/ChatsSummaryResponseType";
import { Action } from "../../../types/LoginType";

const TopMenu = (props: {
  filter: {
    tagIds: string[];
    unreadStatus?: "UnreadOnly" | "ReadOnly" | undefined;
    channel?: string | undefined;
  };
  summary: {
    filters: AssigneeSummaryResponseType;
    teams: {
      [teamId: number]: {
        [assigneeId: string]: number;
      };
    };
    loading: boolean;
  };
  loginDispatch: React.Dispatch<Action>;
}) => {
  const { filter, summary, loginDispatch } = props;
  const { t } = useTranslation();

  function toggleUnreadStatus() {
    if (filter.unreadStatus === "UnreadOnly") {
      loginDispatch({ type: "CHAT_REMOVE_UNREAD_FILTER" });
    } else {
      loginDispatch({ type: "CHAT_ADD_UNREAD_FILTER" });
    }
  }

  return (
    <Dropdown.Item className={"filter"}>
      <Checkbox
        checked={Boolean(filter.unreadStatus)}
        onClick={toggleUnreadStatus}
      />
      <div className="marker">
        <span className="update-marker" />
      </div>
      <div className="text" onClick={toggleUnreadStatus}>
        {t("chat.filter.status.unread")}
      </div>
      <div className="count">{summary.filters.unreadCount}</div>
    </Dropdown.Item>
  );
};
export default TopMenu;
