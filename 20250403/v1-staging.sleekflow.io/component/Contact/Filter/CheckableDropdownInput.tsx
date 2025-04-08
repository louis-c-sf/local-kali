import { Checkbox, Dropdown, Menu, Ref } from "semantic-ui-react";
import React, { ReactNode, useState } from "react";
import { getQueryMatcher } from "../../../container/Settings/filters/getQueryMatcher";
import { reject } from "ramda";
import { SearchableDialog } from "../../shared/popup/SearchableDialog/SearchableDialog";
import CheckableItem from "../../shared/popup/SearchableDialog/CheckableItem";

export function CheckableDropdownInput<TItem extends any>(props: {
  items: TItem[];
  values: TItem[];
  serializeValue: (item: TItem) => string;
  onChange: (items: TItem[]) => void;
  getLabel: (item: TItem) => string;
  renderLabel?: (item: TItem, clickHandler: Function) => ReactNode;
  placeholder: string;
  subtitle?: string;
  disabled?: boolean;
}) {
  const {
    getLabel,
    items,
    onChange,
    placeholder,
    serializeValue,
    values,
    disabled = false,
  } = props;
  const [opened, setOpened] = useState(false);
  const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(
    null
  );
  const [itemsFiltered, setItemsFiltered] = useState<TItem[]>();
  const matchItem = getQueryMatcher(getLabel);
  const serializedValues = values.map(serializeValue);

  function toggleItem(checked: boolean, item: TItem) {
    const compare = (a: TItem) => (b: TItem) =>
      serializeValue(a) === serializeValue(b);
    let itemsUpdated: TItem[];
    if (checked) {
      itemsUpdated = [...reject(compare(item), values), item];
    } else {
      itemsUpdated = reject(compare(item), values);
    }
    onChange(itemsUpdated);
  }

  return (
    <>
      <Ref innerRef={setTriggerElement}>
        <Dropdown
          text={placeholder}
          className={`search pinnable ${values.length > 0 ? "pinned" : ""}`}
          onClick={() => setOpened((o) => !o)}
          disabled={disabled}
        />
      </Ref>
      {opened && (
        <SearchableDialog
          className={"menu-filter"}
          compact
          small={false}
          placeholder={placeholder}
          onSearch={(query) => {
            setItemsFiltered(items.filter(matchItem(query)));
          }}
          onSearchClear={() => setItemsFiltered(undefined)}
          close={() => setOpened(false)}
          triggerRef={triggerElement}
          mountElement={triggerElement?.parentElement ?? undefined}
          popperPlacement={"bottom-start"}
          offset={[0, 14]}
          showSearchIcon={false}
          subtitle={props.subtitle}
        >
          {() => (
            <Menu>
              {(itemsFiltered ?? items).map((item: TItem) => {
                const serialized = serializeValue(item);
                return (
                  <CheckableItem
                    key={serializeValue(item)}
                    label={getLabel(item)}
                    active={serializedValues.includes(serialized)}
                    onChange={toggleItem}
                    item={item}
                    renderLabel={props.renderLabel}
                  />
                );
              })}
            </Menu>
          )}
        </SearchableDialog>
      )}
    </>
  );
}
