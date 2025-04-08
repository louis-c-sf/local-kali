import React, { useState } from "react";
import { useAppSelector } from "AppRootContext";
import { equals, prop } from "ramda";
import { useTranslation } from "react-i18next";
import { Dropdown } from "semantic-ui-react";
import { FieldError } from "../../../../../component/shared/form/FieldError";
import { ChatLabel } from "../../../../../component/Chat/ChatLabel";
import styles from "./AddLabelDropdown.module.css";
import { HashTagCountedType, tagColorsBase } from "types/ConversationType";
import { useLabelsManagementFlow } from "../../../../../component/Chat/LabelsWidget/useLabelsManagementFlow";
import produce from "immer";
import FacebookImg from "../../../../../assets/images/channels/facebook-messenger.svg";

const CurrentHashTagType = "Facebook";
const AddLabelDropdown = (props: {
  setSelectedLabels: (labels: HashTagCountedType[]) => any;
  selectedLabels: HashTagCountedType[];
  error: string | never[] | string[] | undefined;
}) => {
  const { setSelectedLabels, selectedLabels, error } = props;
  const { t } = useTranslation();
  const profile = useAppSelector((s) => s.profile, equals);
  const { availableTagsToAdd } = useLabelsManagementFlow({
    profile,
    tagsFilter: false,
  });

  const [itemsFiltered, setItemsFiltered] = useState<HashTagCountedType[]>(
    availableTagsToAdd.filter((item) => item.hashTagType === CurrentHashTagType)
  );

  return (
    <div className={`ui form ${styles.addLabelDropdown}`}>
      <div className="field">
        <label htmlFor="addItem">{t("form.addLabel.label")}</label>
        <Dropdown
          id="addItem"
          selection
          search
          selectOnBlur={false}
          options={itemsFiltered.map((tag, k) => {
            return {
              value: tag.hashtag,
              text: tag.hashtag,
              key: k,
              content: (
                <ChatLabel tag={tag} collapsible={false}>
                  <img src={FacebookImg} alt="facebook" />
                </ChatLabel>
              ),
            };
          })}
          onChange={(event, { value }) => {
            const valueArr = value as string[];
            const result = itemsFiltered.filter((item) =>
              valueArr.includes(item.hashtag)
            );
            setSelectedLabels(result);
          }}
          icon={"search"}
          className={"icon-left"}
          placeholder={t("form.addLabel.placeholder")}
          upward={false}
          allowAdditions
          additionLabel={t("form.addLabel.addAddition")}
          noResultsMessage={t("form.field.dropdown.noResults")}
          value={selectedLabels.map(prop("hashtag"))}
          multiple
          onAddItem={(event, { value }) => {
            const newTag = {
              hashtag: value as string,
              hashTagColor: tagColorsBase[0],
              hashTagType: CurrentHashTagType,
              id: "",
            };
            setItemsFiltered(
              produce(itemsFiltered, (draft) => {
                draft.push(newTag as HashTagCountedType);
              })
            );
            setSelectedLabels(
              produce(selectedLabels, (draft) => {
                draft.push(newTag as HashTagCountedType);
              })
            );
          }}
        />
        <FieldError text={error} className={styles.error} />
      </div>
    </div>
  );
};
export default AddLabelDropdown;
