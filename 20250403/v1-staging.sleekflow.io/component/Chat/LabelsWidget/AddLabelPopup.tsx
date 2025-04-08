import { SearchableDialog } from "../../shared/popup/SearchableDialog/SearchableDialog";
import React, { useState } from "react";
import {
  HashTagCountedType,
  HashTagType,
  tagColorsBase,
} from "../../../types/ConversationType";
import { Dropdown } from "semantic-ui-react";
import { ChatLabel } from "../ChatLabel";
import { getQueryMatcher } from "../../../container/Settings/filters/getQueryMatcher";
import { eqBy, prop, propSatisfies, toLower } from "ramda";
import { DropdownMenuList } from "../../shared/DropdownMenuList";
import { Trans, useTranslation } from "react-i18next";

const matcher = getQueryMatcher(prop("hashtag"));

/** @deprecated use ProfileLabelsPopup instead */
export function AddLabelPopup(props: {
  availableItems: HashTagCountedType[];
  allItems: HashTagCountedType[];
  onItemAdded: (tag: HashTagType, isNew: boolean) => void;
  trigger: HTMLElement | null;
  close: () => void;
}) {
  const { onItemAdded, allItems, close, trigger, availableItems } = props;
  const [itemsFiltered, setItemsFiltered] = useState<HashTagCountedType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchActive, setSearchActive] = useState(false);
  const { t } = useTranslation();

  let items = availableItems;
  let hasExactMatch = false;

  if (searchActive) {
    items = itemsFiltered;
    hasExactMatch = allItems.some(
      propSatisfies(eqBy(toLower, searchQuery.toLowerCase()), "hashtag"),
      items
    );
  }
  const canAddNewLabel = searchActive && !hasExactMatch;

  function resetSearch() {
    setSearchActive(false);
    setSearchQuery("");
  }

  function search(query: string) {
    setSearchActive(true);
    setSearchQuery(query);
    setItemsFiltered(availableItems.filter(matcher(query)));
  }

  function addLabel(item: HashTagType) {
    return () => {
      onItemAdded(item, false);
    };
  }

  function addNewLabel() {
    onItemAdded(
      { hashtag: searchQuery.trim(), hashTagColor: tagColorsBase[0] },
      true
    );
  }

  return (
    <SearchableDialog
      flowing
      searchLoading={false}
      onSearch={search}
      onSearchClear={resetSearch}
      onSearchKeyDown={(event) => {
        if (event.keyCode === 13 && canAddNewLabel) {
          addNewLabel();
        }
      }}
      triggerRef={trigger}
      close={close}
      className={"add-label"}
      placeholder={t("chat.labels.manage.field.search.placeholder")}
    >
      {() => {
        return (
          <>
            <DropdownMenuList>
              {items.map((item, index) => {
                return (
                  <Dropdown.Item key={index} onClick={addLabel(item)}>
                    <ChatLabel tag={item} />
                    <span className="description" children={item.count} />
                  </Dropdown.Item>
                );
              })}
              {canAddNewLabel && (
                <Dropdown.Item onClick={addNewLabel} className={"action"}>
                  <Trans
                    i18nKey={"chat.labels.manage.prompt.createLabel"}
                    values={{
                      name: searchQuery,
                    }}
                  >
                    + Create label for ‘
                    <span className={"sample"}>{searchQuery}</span>’
                  </Trans>
                </Dropdown.Item>
              )}
            </DropdownMenuList>
          </>
        );
      }}
    </SearchableDialog>
  );
}
