import React, { useState } from "react";
import { Dropdown } from "semantic-ui-react";
import { ListField } from "../fields/ListField";
import { Trans, useTranslation } from "react-i18next";
import { submitCreateList } from "../../../../api/Contacts/submitCreateList";
import { useAppDispatch, useAppSelector } from "../../../../AppRootContext";
import { equals } from "ramda";
import { getQueryMatcher } from "../../../../container/Settings/filters/getQueryMatcher";
import { DropdownOptionType } from "../../../Chat/ChannelFilterDropdown";

export function ListValueInput(props: {
  field: ListField;
  onChange: (value: string | string[]) => void;
}) {
  const { field, onChange } = props;
  const { t } = useTranslation();
  const lists = useAppSelector((s) => s.contacts.lists, equals);
  const [isBlocked, setIsBlocked] = useState(false);
  const loginDispatch = useAppDispatch();
  const [isAnyMatch, setIsAnyMatch] = useState(false);
  const matchesQuery = getQueryMatcher((item: DropdownOptionType) => item.text);

  async function storeListAdded(name: string) {
    setIsBlocked(true);
    try {
      const result = await submitCreateList(name, []);
      return result;
    } catch (e) {
      console.error(e);
    } finally {
      setIsBlocked(false);
    }
  }

  return (
    <Dropdown
      fluid
      scrolling
      icon={"search"}
      allowAdditions={!isAnyMatch}
      additionLabel={
        <Trans i18nKey={"automation.field.userGroup.addItem"}>
          <span className={"addition-label"}>+ Create list for</span>
        </Trans>
      }
      onAddItem={async (_, data) => {
        const name = data.value as string;
        const listStored = await storeListAdded(name);
        if (listStored) {
          loginDispatch({ type: "LIST_ADDED", list: listStored });
          onChange([...field.toInputValueType(), String(listStored.id)]);
        }
      }}
      className={"icon-left"}
      search={(items, query) => {
        const matches = items.filter(matchesQuery(query));
        setIsAnyMatch(matches.length > 0);
        return matches;
      }}
      disabled={isBlocked}
      loading={isBlocked}
      noResultsMessage={t("form.field.dropdown.noResults")}
      selection
      upward={false}
      value={field.toInputValueType()}
      options={lists
        .filter((list) => list.importName)
        .map((list) => ({
          key: String(list.id),
          value: String(list.id),
          text: list.importName,
        }))}
      multiple={field.isMultiple()}
      onChange={(_, data) => onChange(data.value as string | string[])}
    />
  );
}
