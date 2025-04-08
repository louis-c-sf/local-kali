import React, { useState } from "react";
import { Header } from "semantic-ui-react";
import { AddLabelPopup } from "../../component/Chat/LabelsWidget/AddLabelPopup";
import { ProfileType } from "../../types/LoginType";
import { HashTagType } from "../../types/ConversationType";
import { ChatLabel } from "../../component/Chat/ChatLabel";
import { propEq } from "ramda";
import { ColorPicker } from "../../component/Chat/LabelsWidget/ColorPicker";
import { ManageLabelsPopup } from "../../component/Chat/LabelsWidget/ManageLabelsPopup";
import { useTranslation } from "react-i18next";
import { InfoTooltip } from "../../component/shared/popup/InfoTooltip";
import { useCompanyHashTags } from "../../component/Settings/hooks/useCompanyHashTags";
import { useLabelsManagementFlow } from "../../component/Chat/LabelsWidget/useLabelsManagementFlow";

export function matchingTag(tag: HashTagType): (t: HashTagType) => boolean {
  if (tag.id !== undefined) {
    return (t) => (t.id ? tag.id === t.id : propEq("hashtag", tag.hashtag, t));
  }
  return propEq("hashtag", tag.hashtag);
}

export function LabelsManagementContainer(props: { profile: ProfileType }) {
  const { profile } = props;
  const { companyTags, refreshCompanyTags } = useCompanyHashTags();
  const [showAddLabel, setShowAddLabel] = useState(false);
  const [showManageLabels, setShowManageLabels] = useState(false);
  const [addLabelTrigger, setAddLabelTrigger] = useState<HTMLElement | null>(
    null
  );
  const [manageLabelsTrigger, setManageLabelsTrigger] =
    useState<HTMLElement | null>(null);

  const {
    dispatch,
    state,
    confirmNewTagColor,
    handleNewTagColorPick,
    handleProfileTagAdded,
    availableTagsToAdd,
    profileTagsVisible,
  } = useLabelsManagementFlow({ profile });

  const { t } = useTranslation();

  function showAddLabelPopup() {
    setShowAddLabel(true);
  }

  return (
    <div className={"labels-management padded container"}>
      <Header as={"h4"}>
        {t("chat.labels.manage.header")}
        <InfoTooltip
          placement={"bottom"}
          children={t("chat.tooltip.labels.manage")}
          trigger={
            <span
              className={"ui button button-small"}
              ref={setManageLabelsTrigger}
              onClick={() => setShowManageLabels(true)}
              children={t("chat.labels.manage.button.manage")}
            />
          }
        />
      </Header>
      <div className="detail">
        {profileTagsVisible.map((tagMap) => (
          <ChatLabel
            key={tagMap.key}
            tag={tagMap.tag}
            onDismiss={tagMap.deleteHandler}
          />
        ))}
      </div>
      <div className="footer">
        <InfoTooltip
          placement={"top"}
          children={t("chat.tooltip.labels.add")}
          trigger={
            <span
              className={"ui button button-small"}
              onClick={showAddLabelPopup}
              ref={setAddLabelTrigger}
              children={t("chat.labels.manage.button.add")}
            />
          }
        />
      </div>
      {showManageLabels && (
        <ManageLabelsPopup
          state={state.manageLabels}
          onClose={() => {
            dispatch({ type: "MANAGE_LABELS.HIDE" });
            setShowManageLabels(false);
          }}
          trigger={manageLabelsTrigger}
          deletingTags={state.deleteCompanyTagsProxy}
          companyTags={companyTags}
          newCompanyTagsProxy={state.newCompanyTagsProxy}
          dispatch={dispatch}
          fetchCompanyTags={refreshCompanyTags}
        />
      )}
      {showAddLabel && (
        <AddLabelPopup
          availableItems={availableTagsToAdd}
          allItems={companyTags}
          trigger={addLabelTrigger}
          close={() => {
            setShowAddLabel(false);
          }}
          onItemAdded={(tag, isNew) => {
            setShowAddLabel(false);
            handleProfileTagAdded(tag, isNew);
          }}
        />
      )}
      {state.editNewTag && (
        <ColorPicker
          tag={state.editNewTag}
          anchor={addLabelTrigger}
          onPickColor={handleNewTagColorPick}
          onClose={confirmNewTagColor}
          placement={"bottom"}
        />
      )}
    </div>
  );
}
