import React, { useState } from "react";
import {
  Dropdown,
  DropdownItemProps,
  DropdownProps,
  Ref,
} from "semantic-ui-react";
import { Trans, useTranslation } from "react-i18next";
import { useAppDispatch } from "../../../../AppRootContext";
import { getQueryMatcher } from "../../../../container/Settings/filters/getQueryMatcher";
import { DropdownOptionType } from "../../../Chat/ChannelFilterDropdown";
import { useCompanyHashTags } from "../../../Settings/hooks/useCompanyHashTags";
import { submitCreateOrUpdateHashTag } from "../../../../api/Company/submitCreateOrUpdateHashTag";
import {
  HashTagCountedType,
  tagColorsBase,
} from "../../../../types/ConversationType";
import { ColorPicker } from "../../../Chat/LabelsWidget/ColorPicker";
import { HashTagField } from "../fields/HashTagField";
import { ChatLabel } from "../../../Chat/ChatLabel";

const TEMP_ID = "TEMP_ID";

export function HashTagsValueInput(props: {
  field: HashTagField;
  onChange: (value: string | string[]) => void;
}) {
  const { field, onChange } = props;
  const { t } = useTranslation();
  const { companyTags: hashtags } = useCompanyHashTags();
  const [isBlocked, setIsBlocked] = useState(false);
  const [editTag, setEditTag] = useState<HashTagCountedType>();
  const [savingTag, setSavingTag] = useState<HashTagCountedType>();
  const loginDispatch = useAppDispatch();
  const [dropdownElement, setDropdownElement] = useState<HTMLElement | null>(
    null
  );
  const [isAnyMatch, setIsAnyMatch] = useState(false);
  const matchesQuery = getQueryMatcher(
    (item: DropdownOptionType) => item.value
  );

  const visibleHashTags = hashtags
    .concat(editTag ? [editTag] : [])
    .concat(savingTag ? [savingTag] : []);

  const handleAddItem = async (_: any, data: DropdownProps) => {
    const name = data.value as string;
    const newTag = {
      id: TEMP_ID,
      hashtag: name,
      hashTagColor: tagColorsBase[0],
      count: 0,
    };
    const currentValue = field.toInputValueType() as string[];
    setEditTag(newTag);
    onChange([...currentValue, name]);

    if (dropdownElement) {
      const searchInput = dropdownElement.querySelector(
        "input.search"
      ) as HTMLInputElement;
      if (searchInput) {
        searchInput.blur();
      }
    }
  };

  const handleSearch = (
    items: DropdownItemProps[],
    query: string
  ): DropdownItemProps[] => {
    const matches = items.filter(matchesQuery(query));
    setIsAnyMatch(matches.length > 0);
    return matches;
  };

  const renderLabel = (item: DropdownItemProps) => {
    const tag = visibleHashTags.find((t) => t.hashtag === item.value);
    if (!tag) {
      return null;
    }
    return (
      <ChatLabel
        tag={tag}
        collapsible={false}
        onDismiss={() => {
          const currentValue = field.toInputValueType() as string[];
          const updatedValue = currentValue.filter((v) => v !== tag.hashtag);
          onChange(updatedValue);
        }}
      />
    );
  };

  const storeAddedTag = async () => {
    if (!editTag) {
      return;
    }
    setEditTag(undefined);
    setSavingTag({ ...editTag });
    setIsBlocked(true);
    try {
      const updated = await submitCreateOrUpdateHashTag(editTag);
      loginDispatch({
        type: "UPDATE_COMPANY_TAGS",
        tags: updated,
      });
    } catch (e) {
      setEditTag(editTag);
      console.error(e);
    } finally {
      setIsBlocked(false);
      setSavingTag(undefined);
    }
  };

  return (
    <>
      <Ref innerRef={setDropdownElement}>
        <Dropdown
          fluid
          scrolling
          selection
          upward={false}
          icon={"search"}
          className={"icon-left hashtag-dropdown"}
          disabled={isBlocked}
          loading={isBlocked}
          noResultsMessage={t("form.field.dropdown.noResults")}
          multiple={field.isMultiple()}
          value={field.toInputValueType()}
          onChange={(_, data) => onChange(data.value as string | string[])}
          allowAdditions={!isAnyMatch}
          additionLabel={
            <Trans i18nKey={"automation.field.hashTag.addItem"}>
              <span className={"addition-label"}>+ Create label for</span>
            </Trans>
          }
          renderLabel={renderLabel}
          onLabelClick={(e, data) => {
            e.stopPropagation();
            setEditTag(
              visibleHashTags.find(
                (t) => t.hashtag === (data.hashtag as string)
              )
            );
          }}
          onAddItem={handleAddItem}
          search={handleSearch}
          options={visibleHashTags.map((tag) => ({
            key: tag.id,
            value: tag.hashtag,
            content: <ChatLabel tag={tag} collapsible={false} />,
          }))}
        />
      </Ref>
      {editTag && (
        <ColorPicker
          onPickColor={(color) => {
            const updatedTag = { ...editTag, hashTagColor: color };
            setEditTag(updatedTag);
          }}
          onClose={storeAddedTag}
          tag={editTag}
          anchor={dropdownElement}
          placement={"bottom"}
        />
      )}
    </>
  );
}
