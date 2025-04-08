import React, { SyntheticEvent } from "react";
import { DropdownProps } from "semantic-ui-react/dist/commonjs/modules/Dropdown/Dropdown";
import { Dropdown, DropdownItemProps } from "semantic-ui-react";

interface GenericDropdownPropsInterface<
  TItemData,
  TValue extends TItemData | TItemData[]
>
  extends Omit<
    DropdownProps,
    "value" | "options" | "onChange" | "search" | "renderLabel"
  > {
  value: TValue;
  serializeItem: (dataItem: TItemData) => string | undefined;
  unserializeItem: (dropdownValue: string) => TItemData;
  renderChoice?: (dataItem: TItemData, index: number) => React.ReactNode;
  normalizeChoice?: (dataItem: TItemData, index: number) => DropdownItemProps;
  renderLabel?: (dataItem: TItemData, index: number) => React.ReactNode;
  search?: (options: TItemData[], value: string) => TItemData[];
  onChange: (event: SyntheticEvent, data: TValue) => any;
  options: TItemData[];
  multiple: boolean;
}

function GenericDropdown<TItemData, TValue extends TItemData | TItemData[]>(
  props: GenericDropdownPropsInterface<TItemData, TValue>
) {
  const {
    value,
    serializeItem,
    renderChoice,
    normalizeChoice,
    unserializeItem,
    onChange,
    options,
    renderLabel,
    search,
    ...dropdownProps
  } = props;

  function toDropdownChoice(
    choice: TItemData,
    index: number
  ): DropdownItemProps {
    if (normalizeChoice) {
      return normalizeChoice(choice, index);
    } else if (!renderChoice) {
      throw "Please specify either renderChoice / normalizeChoice prop";
    }
    const content = renderChoice(choice, index);
    return {
      value: serializeItem(choice),
      content: content,
      text: content,
      key: index,
    };
  }

  return (
    <Dropdown
      value={
        dropdownProps.multiple
          ? ((props.value as TItemData[]).map(serializeItem) as string[])
          : (serializeItem(props.value as TItemData) as string)
      }
      onChange={(event, data) => {
        if (props.multiple) {
          const dataMatched = (data.value as string[])
            .map(String)
            .map(unserializeItem) as TValue;
          onChange(event, dataMatched);
        } else {
          const dataMatched = unserializeItem(data.value as string) as TValue;
          onChange(event, dataMatched);
        }
      }}
      renderLabel={
        renderLabel
          ? (item, index) => {
              const itemUnserialized = unserializeItem(item.value as string);
              return renderLabel(itemUnserialized, index);
            }
          : undefined
      }
      search={
        search
          ? (options, value) => {
              const optionsUnserialized = options
                .map((o) => o.value as string)
                .map(String)
                .map(unserializeItem);
              return search(optionsUnserialized, value).map(toDropdownChoice);
            }
          : undefined
      }
      options={options.map(toDropdownChoice)}
      {...dropdownProps}
    />
  );
}

export default GenericDropdown;
