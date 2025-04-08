import React, { useState } from "react";
import { DropdownOptionType } from "../../../Chat/ChannelFilterDropdown";
import { Dropdown } from "semantic-ui-react";
import { post } from "../../../../api/apiRequest";
import { POST_ASSIGNMENT_RULE_ACTION_BLANK } from "../../../../api/apiPath";
import {
  addCollaboratorActionDefaults,
  addConversationNoteActionDefaults,
  addHashtagsActionDefaults,
  addToListActionDefaults,
  assignActionDefaults,
  AutomationActionType,
  AutomationActionTypeEnum,
  changeConversationStatusActionDefaults,
  removeFromListActionDefaults,
  removeHashtagsActionDefaults,
  sendMediaActionDefaults,
  sendMessageActionDefaults,
  sendWebhookActionDefaults,
  updateCustomFieldsActionDefaults,
} from "../../../../types/AutomationActionType";
import { getQueryMatcher } from "../../../../container/Settings/filters/getQueryMatcher";
import { SearchableDialog } from "../../../shared/popup/SearchableDialog/SearchableDialog";
import { DropdownMenuList } from "../../../shared/DropdownMenuList";
import { useTranslation } from "react-i18next";
import { InfoTooltip } from "../../../shared/popup/InfoTooltip";
import {
  FacebookActionTypes,
  facebookInitiateDmActionDefaults,
  facebookReplyCommentActionDefaults,
  FbPostComment,
  IgPostComment,
  InstagramActionTypes,
  instagramInitiateDmActionDefaults,
  instagramReplyCommentActionDefaults,
} from "../CreateRule/FbIg/PostCommentTypes";
import styles from "./AddAction.module.css";
import { AutomationTypeEnum } from "../../../../types/AssignmentRuleType";

export function AddAction(props: {
  setActionsPending: (pending: boolean) => void;
  canAddAction: (type: AutomationActionTypeEnum) => boolean;
  addAction: (action: AutomationActionType) => void;
  existingActions: AutomationActionType[];
  excludeActions?: AutomationActionTypeEnum[];
  renderTrigger: (togglePopup: () => void) => JSX.Element;
  automationType?: AutomationTypeEnum;
  hasFbIgType: boolean;
  ruleId?: string;
}) {
  const {
    setActionsPending,
    canAddAction,
    addAction,
    renderTrigger,
    hasFbIgType,
    existingActions,
    excludeActions = [],
    automationType,
  } = props;
  const [showPopup, setShowPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [triggerNode, setTriggerNode] = useState<HTMLElement | null>(null);
  const { t } = useTranslation();

  const fbActionTypes: Array<[AutomationActionTypeEnum, string]> =
    automationType === FbPostComment
      ? [
          ["FacebookInitiateDm", t("automation.action.initiateDm.name")],
          ["FacebookReplyComment", t("automation.action.replyComment.name")],
        ]
      : [];
  const igActionTypes: Array<[AutomationActionTypeEnum, string]> =
    automationType === IgPostComment
      ? [
          ["InstagramInitiateDm", t("automation.action.initiateDm.name")],
          ["InstagramReplyComment", t("automation.action.replyComment.name")],
        ]
      : [];

  let ACTION_TYPES: Array<[AutomationActionTypeEnum, string]> = [
    ...fbActionTypes,
    ...igActionTypes,
    ["Assignment", t("automation.action.assignment.name")],
    ["AddAdditionalAssignee", t("automation.action.addCollaborator.name")],
    ["SendMessage", t("automation.action.sendMessage.name")],
    ["SendMedia", t("automation.action.sendMedia.name")],
    ["AddConversationNote", t("automation.action.addNote.name")],
    ["UpdateCustomFields", t("automation.action.update.name")],
    ["AddToList", t("automation.action.addToList.name")],
    ["RemoveFromList", t("automation.action.removeFromList.name")],
    [
      "ChangeConversationStatus",
      t("automation.action.changeConversationStatus.name"),
    ],
    ["AddTags", t("automation.action.addLabels.name")],
    ["RemoveTags", t("automation.action.removeLabels.name")],
    ["SendWebhook", t("automation.action.sendWebhook.name")],
  ];

  const ifReplyCommentActionApplied = (choice: DropdownOptionType) => {
    if (
      ![
        "FacebookReplyComment",
        "InstagramReplyComment",
        "FacebookInitiateDm",
        "InstagramInitiateDm",
      ].includes(choice.value)
    ) {
      return true;
    }
    let applied = false;
    existingActions.forEach((row) => {
      if (row.automatedTriggerType === choice.value) {
        applied = true;
      }
    });
    return !applied;
  };

  if (hasFbIgType) {
    ACTION_TYPES = ACTION_TYPES.filter((type: string[]) => {
      const [automationType] = type;
      return automationType !== "SendMessage" && automationType !== "SendMedia";
    });
  }

  const optionMatcher = getQueryMatcher(
    (data: DropdownOptionType) => data.text
  );

  const actionChoices = ACTION_TYPES.filter(
    (a) => !excludeActions.includes(a[0])
  )
    .reduce<Array<DropdownOptionType & { value: AutomationActionTypeEnum }>>(
      (acc, [automationType, title]) => {
        if (canAddAction(automationType)) {
          return [
            ...acc,
            { text: title, value: automationType, key: acc.length },
          ];
        }
        return acc;
      },
      []
    )
    .filter(ifReplyCommentActionApplied);

  const searchResults = searchQuery
    ? actionChoices.filter(optionMatcher(searchQuery))
    : actionChoices;

  const showDropdown = actionChoices.length > 0;

  const handleAddAction = async (actionType: AutomationActionTypeEnum) => {
    if (actionType === "SendMedia") {
      setActionsPending(true);
      try {
        if (!props.ruleId) {
          throw "Missing rule id";
        }
        const actionBlank = await post(
          POST_ASSIGNMENT_RULE_ACTION_BLANK.replace(
            "{assignmentRuleId}",
            props.ruleId
          ),
          { param: {} }
        );
        addAction(sendMediaActionDefaults(actionBlank));
      } catch (e) {
        console.error("#SendMedia add", e, { id: props.ruleId });
      } finally {
        setActionsPending(false);
      }
      return;
    }

    const actionFactories: {
      [t in AutomationActionTypeEnum]?: () => AutomationActionType;
    } = {
      Assignment: assignActionDefaults,
      SendMessage: sendMessageActionDefaults,
      AddConversationNote: addConversationNoteActionDefaults,
      AddToList: addToListActionDefaults,
      RemoveFromList: removeFromListActionDefaults,
      UpdateCustomFields: updateCustomFieldsActionDefaults,
      ChangeConversationStatus: changeConversationStatusActionDefaults,
      AddTags: addHashtagsActionDefaults,
      RemoveTags: removeHashtagsActionDefaults,
      AddAdditionalAssignee: addCollaboratorActionDefaults,
      SendWebhook: sendWebhookActionDefaults,
      FacebookReplyComment: facebookReplyCommentActionDefaults,
      InstagramReplyComment: instagramReplyCommentActionDefaults,
      FacebookInitiateDm: facebookInitiateDmActionDefaults,
      InstagramInitiateDm: instagramInitiateDmActionDefaults,
    };
    const actionFactory = actionFactories[actionType];
    if (actionFactory) {
      addAction(actionFactory());
    }
  };

  return !showDropdown ? (
    <></>
  ) : (
    <>
      {showPopup && (
        <SearchableDialog
          onSearch={setSearchQuery}
          onSearchClear={() => setSearchQuery("")}
          close={() => {
            setShowPopup(false);
            setSearchQuery("");
          }}
          triggerRef={triggerNode}
          popperPlacement={"top-start"}
          offset={[-17, 0]}
        >
          {() => (
            <DropdownMenuList className={"items-nowrapped scrolling"}>
              {hasFbIgType ? (
                <>
                  <div className={styles.subMenu}>
                    <Dropdown.Header className="category">
                      {searchResults.some((action) =>
                        [
                          ...FacebookActionTypes,
                          ...InstagramActionTypes,
                        ].includes(action.value)
                      ) && (
                        <div className="name">
                          {t(
                            "automation.rule.form.actions.dropdown.header.fb/ig"
                          )}
                        </div>
                      )}
                    </Dropdown.Header>
                    {searchResults
                      .filter((action) => {
                        return [
                          ...FacebookActionTypes,
                          ...InstagramActionTypes,
                        ].includes(action.value);
                      })
                      .map((action, idx) => (
                        <Dropdown.Item
                          onClick={() => {
                            handleAddAction(action.value);
                            setShowPopup(false);
                            setSearchQuery("");
                          }}
                          key={`${action.value}${idx}`}
                        >
                          {action.text}
                        </Dropdown.Item>
                      ))}
                  </div>
                  <div className={styles.subMenu}>
                    <Dropdown.Header className="category">
                      <div className="name">
                        {t(
                          "automation.rule.form.actions.dropdown.header.general"
                        )}
                      </div>
                    </Dropdown.Header>
                    {searchResults
                      .filter((action) => {
                        return ![
                          ...FacebookActionTypes,
                          ...InstagramActionTypes,
                        ].includes(action.value);
                      })
                      .map((action, idx) => (
                        <Dropdown.Item
                          onClick={() => {
                            handleAddAction(action.value);
                            setShowPopup(false);
                            setSearchQuery("");
                          }}
                          key={`${action.value}${idx}`}
                        >
                          {action.text}
                        </Dropdown.Item>
                      ))}
                  </div>
                </>
              ) : (
                <>
                  {searchResults.map((action, idx) => (
                    <Dropdown.Item
                      onClick={() => {
                        handleAddAction(action.value);
                        setShowPopup(false);
                        setSearchQuery("");
                      }}
                      key={`${action.value}${idx}`}
                    >
                      {action.text}
                    </Dropdown.Item>
                  ))}
                </>
              )}
            </DropdownMenuList>
          )}
        </SearchableDialog>
      )}
      <div className="add-row">
        <span className={styles.trigger} ref={setTriggerNode}>
          <InfoTooltip
            placement={"right"}
            children={t("automation.tooltip.form.addAction")}
            trigger={renderTrigger(() => setShowPopup(!showPopup))}
          />
        </span>
      </div>
    </>
  );
}
