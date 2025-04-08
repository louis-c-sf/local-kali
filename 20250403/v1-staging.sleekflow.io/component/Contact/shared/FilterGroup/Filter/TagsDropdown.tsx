import { HashTagCountedType } from "../../../../../types/ConversationType";
import React, { SyntheticEvent, useCallback } from "react";
import { useTagInput } from "../../../../shared/input/useTagInput";
import { Dropdown } from "semantic-ui-react";

export function TagsDropdown(props: {
  value: HashTagCountedType[];
  onValueChange: (tags: HashTagCountedType[]) => void;
  tagsAvailable: HashTagCountedType[];
}) {
  const { onValueChange, tagsAvailable, value } = props;

  const {
    tagsValue,
    updateTagsValue,
    choicesSorted,
    placeholder,
    renderLabel,
  } = useTagInput({
    availableTags: tagsAvailable,
    value: value,
    onChange: onValueChange,
  });

  const onChange = useCallback(
    (_: any, { value }: any) => updateTagsValue(value as string[]),
    [updateTagsValue]
  );

  return (
    <Dropdown
      multiple
      scrolling
      fluid
      search
      upward={false}
      selectOnBlur={false}
      value={tagsValue}
      onChange={onChange}
      placeholder={placeholder}
      renderLabel={renderLabel}
      options={choicesSorted}
      selection
      allowAdditions={false}
    />
  );
}
