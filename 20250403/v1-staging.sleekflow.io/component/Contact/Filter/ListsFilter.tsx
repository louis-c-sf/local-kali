import React, { useContext } from "react";
import { TagsListsCheckableDropdownInput } from "./TagsListsCheckableDropdownInput";
import { useTranslation } from "react-i18next";
import useImportedLists from "container/Contact/Imported/useImportedLists";
import { ContactsContext } from "container/Contact/hooks/ContactsStateType";
import { CheckableDropdownInput } from "./CheckableDropdownInput";
import { UserProfileGroupType } from "container/Contact/Imported/UserProfileGroupType";
import { ConditionNameType } from "config/ProfileFieldMapping";

export default function ListsFilter(props: {
  onListFilterChange: (idParam: string[]) => any;
  initListIds: string[];
  isSupportMultipleCondition?: boolean;
}) {
  const { initListIds, isSupportMultipleCondition, onListFilterChange } = props;
  const { scopeState } = useContext(ContactsContext);
  const setListIdAndOperatorFilter =
    scopeState.default.setListIdAndOperatorFilter ?? (() => {});
  const { lists, loading } = useImportedLists();
  const { t } = useTranslation();

  function serialize<TData extends { id: number | string }>(list: TData) {
    return String(list.id);
  }

  const onFilterApplied = (
    checkedItems: UserProfileGroupType[],
    operator: ConditionNameType
  ): void => {
    const formatAry: string[] = checkedItems.map((l) => String(l.id));
    setListIdAndOperatorFilter(formatAry, operator);
  };

  return isSupportMultipleCondition ? (
    <TagsListsCheckableDropdownInput
      placeholder={t("profile.staticField.importfrom.name")}
      items={lists}
      values={initListIds.reduce<UserProfileGroupType[]>((acc, next) => {
        const existingList = lists.find((l) => serialize(l) === next);
        return existingList ? [...acc, existingList] : acc;
      }, [])}
      serializeValue={serialize}
      getLabel={(list) => list.importName}
      disabled={loading}
      name={"list"}
      onFilterApplied={onFilterApplied}
    />
  ) : (
    <CheckableDropdownInput
      placeholder={t("profile.staticField.importfrom.name")}
      items={lists}
      values={initListIds.reduce<UserProfileGroupType[]>((acc, next) => {
        const existingList = lists.find((l) => serialize(l) === next);
        return existingList ? [...acc, existingList] : acc;
      }, [])}
      serializeValue={serialize}
      onChange={(lists) => onListFilterChange(lists.map((l) => String(l.id)))}
      getLabel={(list) => list.importName}
      disabled={loading}
      subtitle={t("profile.condition.list.ContainsAny")}
    />
  );
}
