import { HashTagCountedType } from "../../../types/ConversationType";
import React from "react";
import { Dropdown } from "semantic-ui-react";
import { useTagInput } from "./useTagInput";

export function TagInput(props: {
  availableTags: HashTagCountedType[];
  onChange: (tags: HashTagCountedType[]) => void;
  value: HashTagCountedType[];
}) {
  const { availableTags, onChange, value } = props;

  const {
    placeholder,
    choicesSorted,
    tagsValue,
    updateTagsValue,
    renderLabel,
  } = useTagInput({
    availableTags,
    onChange,
    value,
  });

  return (
    <Dropdown
      multiple
      scrolling
      selection
      fluid
      search
      selectOnBlur={false}
      options={choicesSorted}
      value={tagsValue}
      placeholder={placeholder}
      onChange={(_, { value }) => updateTagsValue(value as string[])}
      renderLabel={renderLabel}
    />
  );
}
