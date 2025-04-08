import React, { useState } from "react";
import styles from "./ProfileLabels.module.css";
import { ProfileType } from "../../../types/LoginType";
import { useLabelsManagementFlow } from "../LabelsWidget/useLabelsManagementFlow";
import { ChatLabel } from "../ChatLabel";
import { Ref } from "semantic-ui-react";
import { Button } from "../../shared/Button/Button";
import { useTranslation } from "react-i18next";
import { ProfileLabelsPopup } from "./ProfileLabelsPopup";
import { ColorPicker } from "../LabelsWidget/ColorPicker";
import { useCompanyHashTags } from "../../Settings/hooks/useCompanyHashTags";
import { useProfileLabelsFlow } from "component/Chat/ProfileInfo/useProfileLabelsFlow";
import { useHashtagsFilter } from "component/Chat/hooks/useHashtagsFilter";

export function ProfileLabels(props: { profile: ProfileType }) {
  const { profile } = props;
  const [addTriggerNode, setAddTriggerNode] = useState<HTMLElement | null>(
    null
  );
  const [widgetNode, setWidgetNode] = useState<HTMLElement | null>(null);
  const [isAddPopupVisible, setIsAddPopupVisible] = useState(false);
  const { companyTags } = useCompanyHashTags();
  const { t } = useTranslation();

  const {
    availableTagsToAdd,
    profileTagsVisible,
    handleProfileTagAdded,
    confirmNewTagColor,
    handleNewTagColorPick,
    state,
    isDeleteLoading,
  } = useLabelsManagementFlow({ profile });

  const tagsFilter = useHashtagsFilter({
    availableItems: availableTagsToAdd,
    allItems: companyTags,
    limit: 100,
    collatorLang: navigator.language,
  });

  const profileLabelsFlow = useProfileLabelsFlow({
    onItemAdded: handleProfileTagAdded,
    close: () => setIsAddPopupVisible(false),
    hasExactMatch: tagsFilter.hasExactMatch,
    searchActive: tagsFilter.searchActive,
    searchQuery: tagsFilter.searchQuery,
  });

  return (
    <div className={styles.wrap} ref={setWidgetNode}>
      <div className={styles.labels}>
        {profileTagsVisible.map((tagMap) => {
          return (
            <ChatLabel
              key={tagMap.key}
              tag={tagMap.tag}
              onDismiss={tagMap.deleteHandler}
              className={styles.label}
            />
          );
        })}
      </div>
      <div className={styles.addButton}>
        <Ref innerRef={setAddTriggerNode}>
          <Button
            loading={isDeleteLoading}
            customSize={"sm"}
            content={t("chat.labels.button.addLabel")}
            onClick={() => setIsAddPopupVisible(true)}
          />
        </Ref>
      </div>
      <ProfileLabelsPopup
        opened={isAddPopupVisible}
        trigger={addTriggerNode}
        anchor={widgetNode}
        close={() => {
          setIsAddPopupVisible(false);
        }}
        flow={profileLabelsFlow}
        filter={tagsFilter}
      />
      {state.editNewTag && (
        <ColorPicker
          tag={state.editNewTag}
          anchor={widgetNode}
          onPickColor={handleNewTagColorPick}
          onClose={confirmNewTagColor}
          placement={"bottom"}
        />
      )}
    </div>
  );
}
