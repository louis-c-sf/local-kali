import React, { useMemo, useCallback } from "react";
import { HashTagCountedType } from "../../../../../types/ConversationType";
import SingleCondition from "../Condition/SingleCondition";
import { ConditionNameType } from "../../../../../config/ProfileFieldMapping";
import { useTranslation } from "react-i18next";
import { TagsDropdown } from "../Filter/TagsDropdown";
import { FieldError } from "../../../../shared/form/FieldError";
import {
  FieldValueAwareInterface,
  ValueAwareInterface,
} from "../FilterGroupFieldType";
import { innerJoin } from "ramda";

type TagFilterInputProps = {
  tagsAvailable: HashTagCountedType[];
  hideConditions?: boolean;
} & FieldValueAwareInterface &
  ValueAwareInterface;

export const TagFilterInput = (props: TagFilterInputProps) => {
  const {
    field,
    value,
    update,
    tagsAvailable,
    hideConditions = false,
    errors,
  } = props;

  const { t } = useTranslation();

  const tagsNames = value?.selectedValue.values ?? [];
  const tagsApplied = useMemo(
    () =>
      innerJoin((tag, name) => tag.hashtag === name, tagsAvailable, tagsNames),
    [JSON.stringify([tagsAvailable, tagsNames])]
  );

  const updateTags = useCallback(
    (tags: HashTagCountedType[]) => {
      if (!value) {
        return;
      }
      update({
        ...value,
        selectedValue: {
          ...value.selectedValue,
          values: tags.map((t) => t.hashtag),
        },
      });
    },
    [update, JSON.stringify(value)]
  );

  const conditionChoices = useMemo(
    () => ({
      ContainsAny: t("profile.condition.list.ContainsAnyOr"),
      ContainsAll: t("profile.condition.list.ContainsAllAnd"),
    }),
    []
  );

  const updateConditionOperator = useCallback(
    (condition: ConditionNameType) => {
      if (!value) {
        return update({
          selectedValue: { operator: condition, values: [] },
          fieldName: field.fieldName,
        });
      }
      update({
        ...value,
        selectedValue: {
          ...value.selectedValue,
          operator: condition,
        },
      });
    },
    [update, JSON.stringify(value), field.fieldName]
  );

  if (hideConditions) {
    return (
      <TagsDropdown
        value={tagsApplied}
        onValueChange={(tags) => updateTags(tags)}
        tagsAvailable={tagsAvailable}
      />
    );
  }

  return (
    <>
      <SingleCondition
        updateConditionOperator={updateConditionOperator}
        conditionOperator={value?.selectedValue.operator}
        choices={conditionChoices}
      >
        <>
          <TagsDropdown
            value={tagsApplied}
            onValueChange={updateTags}
            tagsAvailable={tagsAvailable}
          />
          {errors && (
            <>
              {errors.map((e, idx) => (
                <FieldError text={e} key={idx} />
              ))}
            </>
          )}
        </>
      </SingleCondition>
    </>
  );
};
