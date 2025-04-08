import React from "react";
import { useCompanyHashTags } from "../../Settings/hooks/useCompanyHashTags";
import { HashTagCountedType } from "../../../types/ConversationType";
import { useTranslation } from "react-i18next";
import { ChatLabel } from "../../Chat/ChatLabel";
import { CheckableDropdownInput } from "./CheckableDropdownInput";
import { TagsListsCheckableDropdownInput } from "./TagsListsCheckableDropdownInput";
import { ConditionNameType } from "../../../config/ProfileFieldMapping";
import { useHashtagsFilter } from "component/Chat/hooks/useHashtagsFilter";

const serialize = (tag: HashTagCountedType) => tag.hashtag;

export function TagsFilter(props: {
  tagFilters: HashTagCountedType[];
  onTagFiltersChanged: (tags: HashTagCountedType[]) => void;
  isSupportMultipleCondition?: boolean;
  setTagAndOperatorFilter?: (
    tags: HashTagCountedType[],
    operator: ConditionNameType
  ) => void;
}) {
  let {
    tagFilters: initTagFilters,
    isSupportMultipleCondition = false,
    setTagAndOperatorFilter = () => {},
  } = props;

  const { companyTags, getActualTagsOnly } = useCompanyHashTags();
  const { t } = useTranslation();

  const hashtagsFilter = useHashtagsFilter({
    availableItems: companyTags,
    allItems: companyTags,
    limit: 100,
    collatorLang: navigator.language,
  });
  const filterTagsActual = getActualTagsOnly(initTagFilters);
  const onFilterApplied = (
    conditionOperator: HashTagCountedType[],
    operator: ConditionNameType
  ): void => {
    setTagAndOperatorFilter(conditionOperator, operator);
  };

  return isSupportMultipleCondition ? (
    <TagsListsCheckableDropdownInput
      placeholder={t("profile.staticField.hashtag.name")}
      serializeValue={serialize}
      values={filterTagsActual}
      items={
        hashtagsFilter.searchActive
          ? hashtagsFilter.itemsFiltered
          : hashtagsFilter.items
      }
      getLabel={(item) => item.hashtag}
      renderLabel={(item, clickHandler) => (
        <ChatLabel tag={item} onClick={clickHandler} />
      )}
      onFilterApplied={onFilterApplied}
      name={"hashtag"}
      onSearch={hashtagsFilter.search}
    />
  ) : (
    <CheckableDropdownInput
      placeholder={t("profile.staticField.hashtag.name")}
      serializeValue={serialize}
      values={filterTagsActual}
      onChange={props.onTagFiltersChanged}
      items={getActualTagsOnly(companyTags)}
      getLabel={(item) => item.hashtag}
      subtitle={t("profile.condition.hashtag.ContainsAny")}
      renderLabel={(item, clickHandler) => {
        return <ChatLabel tag={item} onClick={() => clickHandler()} />;
      }}
    />
  );
}
