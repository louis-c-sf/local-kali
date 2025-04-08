import { Dropdown, Menu, Ref } from "semantic-ui-react";
import React, { ReactNode, useState, useRef } from "react";
import { TagsListsFilterDialog } from "./TagsListsFilterDialog";
import { getQueryMatcher } from "../../../container/Settings/filters/getQueryMatcher";
import { reject, eqBy } from "ramda";
import CheckableItem from "../../shared/popup/SearchableDialog/CheckableItem";
import { useTranslation } from "react-i18next";
import { ConditionNameType } from "../../../config/ProfileFieldMapping";
import { useDebouncedCallback } from "use-debounce";
import styles from "./TagsListsCheckableDropdownInput.module.css";
import { useHashtagsFilter } from "component/Chat/hooks/useHashtagsFilter";

const FIRST_PAGE_LIMIT = navigator.hardwareConcurrency > 8 ? 60 : 30;

export function TagsListsCheckableDropdownInput<TItem extends any>(props: {
  items: TItem[];
  values: TItem[];
  serializeValue: (item: TItem) => string;
  getLabel: (item: TItem) => string;
  renderLabel?: (item: TItem, clickHandler: () => void) => ReactNode;
  placeholder: string;
  disabled?: boolean;
  name: "list" | "hashtag";
  onFilterApplied: (checkedItems: TItem[], operator: ConditionNameType) => void;
  onSearch?: (query: string) => TItem[];
}) {
  const {
    getLabel,
    items,
    placeholder,
    serializeValue,
    values,
    disabled = false,
    name = "list",
  } = props;
  const [opened, setOpened] = useState(false);
  const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(
    null
  );

  const [itemsFiltered, setItemsFiltered] = useState<TItem[]>();
  const matchItem = getQueryMatcher(getLabel);
  const [checkedItemFiltersLocal, setCheckedItemFiltersLocal] =
    useState<TItem[]>(values);
  const { t } = useTranslation();

  function toggleItem(checked: boolean, item: TItem) {
    const compare = (a: TItem) => (b: TItem) => eqBy(serializeValue, a, b);
    let itemsUpdated: TItem[];
    if (checked) {
      itemsUpdated = [...reject(compare(item), checkedItemFiltersLocal), item];
    } else {
      itemsUpdated = reject(compare(item), checkedItemFiltersLocal);
    }
    setCheckedItemFiltersLocal(itemsUpdated);
  }

  function stopEditCondition() {
    setOpened(false);
    setItemsFiltered(undefined);
  }

  const handleSearch = (query: string) => {
    const result = props?.onSearch
      ? props.onSearch(query)
      : items.filter(matchItem(query));
    setItemsFiltered(result);
  };

  return (
    <>
      <Ref innerRef={setTriggerElement}>
        <Dropdown
          text={placeholder}
          className={`
            search pinnable 
            ${values.length > 0 ? "pinned" : ""} 
            ${styles.dropdown}
          `}
          onClick={() => setOpened((o) => !o)}
          disabled={disabled}
        />
      </Ref>
      {
        <TagsListsFilterDialog
          opened={opened}
          className={"menu-filter"}
          compact
          small={false}
          placeholder={t("profile.contacts.grid.search", { name: placeholder })}
          onSearch={handleSearch}
          onSearchClear={() => setItemsFiltered(undefined)}
          close={stopEditCondition}
          triggerRef={triggerElement}
          mountElement={triggerElement?.parentElement ?? undefined}
          popperPlacement={"bottom-start"}
          offset={[0, 14]}
          showSearchIcon={false}
          name={name}
          onFilterApplied={(operator: ConditionNameType) => {
            props.onFilterApplied(checkedItemFiltersLocal, operator);
            stopEditCondition();
          }}
          setCheckedItemFiltersLocal={setCheckedItemFiltersLocal}
          values={values}
        >
          <Menu>
            {(itemsFiltered ?? items.slice(0, FIRST_PAGE_LIMIT)).map((item) => {
              const serialized = serializeValue(item);
              return (
                <CheckableItem
                  key={serializeValue(item)}
                  label={getLabel(item)}
                  active={checkedItemFiltersLocal.some(
                    (tagFilter) => serializeValue(tagFilter) === serialized
                  )}
                  onChange={toggleItem}
                  item={item}
                  renderLabel={props.renderLabel}
                />
              );
            })}
          </Menu>
        </TagsListsFilterDialog>
      }
    </>
  );
}
