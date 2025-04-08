import React, { useContext, useRef, useState } from "react";
import { Dropdown, Icon, Loader, Ref } from "semantic-ui-react";
import { StaffItemAvatar } from "../../../../Chat/StaffItemAvatar";
import { useFlashMessageChannel } from "../../../../BannerMessage/flashBannerMessage";
import { pick } from "ramda";
import { AssignmentPopup } from "../../../../Chat/AssignmentPopup";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "AppRootContext";
import headerDropdownStyles from "../../../../Chat/ChatHeader/HeaderDropdown.module.css";
import postDemoConversationAssign from "api/Onboarding/postDemoConversationAssign";
import fetchInboxDemoConversation from "api/Onboarding/fetchInboxDemoConversation";
import InboxDemoContext from "../inboxDemoContext";
import Avatar from "react-avatar";
import { htmlEscape } from "../../../../../lib/utility/htmlEscape";

const demoStaffList = [
  {
    name: "Sabrina Li",
    displayName: "Sabrina Li",
    email: "",
    id: "1",
    userName: "",
    userRole: "",
    firstName: "Sabrina",
    lastName: "Li",
    createdAt: "",
  },
  {
    name: "Dan Palfrey",
    displayName: "Dan Palfrey",
    email: "",
    id: "2",
    userName: "",
    userRole: "",
    firstName: "Dan",
    lastName: "Palfrey",
    createdAt: "",
  },
];

export default function ChatAssignment() {
  const { demoDispatch } = useContext(InboxDemoContext);
  const { profile } = useAppSelector(pick(["profile"]));
  const flash = useFlashMessageChannel();
  const [triggerNode, setTriggerNode] = useState<HTMLElement | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleAssign = async (name: string) => {
    setOpened(false);
    setLoading(true);
    try {
      await postDemoConversationAssign(profile.conversationId, name);
      const conversation = await fetchInboxDemoConversation(
        Number(profile.conversationId)
      );
      demoDispatch({ type: "UPDATE_CONVERSATION", conversation });
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
    flash(t("flash.inbox.chat.assigned.id.id", { name: htmlEscape(name) }));
  };

  const assignName =
    profile.assignee?.displayName || t("chat.filter.assignee.unassigned");

  return (
    <div className={`ui dropdown search-list ${headerDropdownStyles.dropdown}`}>
      <Ref innerRef={setTriggerNode}>
        <span
          className={`selected-dropdown ${headerDropdownStyles.shrinkOnNarrowTablet}`}
          title={htmlEscape(assignName ?? "")}
        >
          {<Loader active={loading} inline size={"small"} />}
          <span className="assignee-pic">
            <Avatar name={assignName} maxInitials={2} round />
          </span>
          <span className={`info ${headerDropdownStyles.text}`}>
            <span className="name">{assignName}</span>
          </span>
          <Icon name="dropdown" />
        </span>
      </Ref>
      <AssignmentPopup
        anchorNode={triggerNode}
        opened={opened}
        setOpened={setOpened}
        offset={[15, 15]}
      >
        <div className={" menu visible"} ref={popupRef}>
          {opened && (
            <Dropdown.Menu scrolling className="team-list no-scrollbars">
              <div className={"item collapsible"}>
                {demoStaffList.map((staff) => (
                  <div
                    className="collapsible__wrap collapsible__wrap_uncollapsed"
                    key={staff.id}
                  >
                    <Dropdown.Item
                      onClick={() => {
                        handleAssign(staff.displayName);
                      }}
                      className="search-staff"
                    >
                      <div className={`staff`}>
                        <StaffItemAvatar staff={staff} />
                        <div className={"info"}>
                          <div className="name">{staff.displayName}</div>
                        </div>
                      </div>
                    </Dropdown.Item>
                  </div>
                ))}
              </div>
              {Boolean(profile.assignee) && (
                <Dropdown.Item
                  className={"top"}
                  onClick={() => {
                    handleAssign("unassigned");
                  }}
                  text={t("chat.filter.assignee.unassigned")}
                />
              )}
            </Dropdown.Menu>
          )}
        </div>
      </AssignmentPopup>
    </div>
  );
}
