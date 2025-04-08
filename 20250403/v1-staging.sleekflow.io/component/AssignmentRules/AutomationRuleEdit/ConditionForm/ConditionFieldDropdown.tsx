import { Dropdown, DropdownItemProps, Ref } from "semantic-ui-react";
import React, { useState } from "react";
import { AbstractConditionField } from "../fields/AbstractConditionField";
import { useTranslation } from "react-i18next";

export function ConditionFieldDropdown(props: {
  field: AbstractConditionField;
  availableTypeChoices: DropdownItemProps[];
  onChange: (fieldName: string) => void;
}) {
  const { field, availableTypeChoices, onChange } = props;
  const { t } = useTranslation();
  const [conditionFieldNode, setConditionFieldNode] =
    useState<HTMLElement | null>(null);
  const [conditionFieldOpened, setConditionFieldOpened] = useState(false);
  const [conditionFieldSearch, setConditionFieldSearch] = useState("");

  return (
    <Ref innerRef={setConditionFieldNode}>
      <Dropdown
        upward={false}
        scrolling={true}
        closeOnBlur
        closeOnChange
        onOpen={() => {
          setConditionFieldOpened(true);
        }}
        onClose={() => {
          setConditionFieldSearch("");
          setConditionFieldOpened(false);
        }}
        open={conditionFieldOpened}
        noResultsMessage={t("form.field.dropdown.noResults")}
        search
        searchQuery={conditionFieldSearch}
        selectOnBlur={false}
        onSearchChange={(event, data) => {
          setConditionFieldSearch(data.searchQuery);
        }}
        text={field.displayName}
        title={field.displayName}
        options={availableTypeChoices.map((item, key) => ({
          value: item.value,
          active: item.value === field.fieldName,
          key: key,
          text: item.text,
          onClick: (_, data) => {
            onChange(data.value as string);
            setConditionFieldSearch("");
            setConditionFieldOpened(false);
            if (conditionFieldNode) {
              const input = conditionFieldNode.querySelector("input.search");
              input instanceof HTMLInputElement &&
                setTimeout(() => input.blur(), 100);
            }
          },
        }))}
      />
    </Ref>
  );
}
