import { HashTagCountedType } from "../../../types/ConversationType";
import { ChatLabel } from "../../Chat/ChatLabel";
import React, { useMemo, useCallback } from "react";
import { DropdownItemProps } from "semantic-ui-react";
import { propEq, remove, ascend, prop } from "ramda";
import { useTranslation } from "react-i18next";

export function useTagInput(props: {
  availableTags: HashTagCountedType[];
  onChange: (tags: HashTagCountedType[]) => void;
  value: HashTagCountedType[];
}) {
  const { availableTags, onChange, value } = props;
  const { t } = useTranslation();

  const valueHash = JSON.stringify(value);
  const tagsHash = JSON.stringify(availableTags);

  const tagsValue = useMemo(() => value.map(prop("id")), [valueHash]);
  const placeholder = t("profile.contacts.grid.search", {
    name: t("profile.staticField.hashtag.name"),
  });

  const choicesSorted = useMemo(() => {
    const choices = availableTags.map((label) => ({
      value: label.id,
      content: <ChatLabel tag={label} />,
      text: label.hashtag,
      key: label.id,
    }));
    return [...choices].sort(ascend(prop("text")));
  }, [tagsHash]);

  const updateTagsValue = useCallback(
    (value: string[]) => {
      const tagValues = value;
      const tags = availableTags.filter((ctag) =>
        tagValues.some((v) => v === ctag.id)
      );
      onChange(tags);
    },
    [onChange, tagsHash]
  );

  const renderLabel = useCallback(
    (item: DropdownItemProps, idx: number) => {
      const tag = availableTags.find(propEq("id", item.value));
      if (!tag) {
        return null;
      }
      return (
        <ChatLabel
          tag={tag}
          onDismiss={() => {
            const tagsWithoutThis = remove(idx, 1, value);
            onChange(tagsWithoutThis);
          }}
        />
      );
    },
    [valueHash, onChange, tagsHash]
  );

  return {
    choicesSorted,
    updateTagsValue,
    renderLabel,
    placeholder,
    tagsValue,
  };
}
