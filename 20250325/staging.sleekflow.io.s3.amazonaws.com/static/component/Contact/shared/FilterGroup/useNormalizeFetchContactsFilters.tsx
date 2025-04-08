import { useContactFilterGroups } from "./useContactFilterGroups";
import {
  ListTypeValue,
  DefaultOperatorValue,
} from "container/Contact/hooks/ContactsStateType";
import { matchesField } from "./matchesField";
import {
  HASHTAG_FIELD_NAME,
  LIST_FIELD_NAME,
  ConditionNameType,
} from "config/ProfileFieldMapping";
import { AudienceType } from "types/BroadcastCampaignType";
import { useCompanyHashTags } from "../../../Settings/hooks/useCompanyHashTags";
import { CustomProfileField } from "types/ContactType";
import { ContactsRequestPageExtensionType } from "api/Contacts/types";

export function useNormalizeFetchContactsFilters(props: {
  fieldsAvailable: CustomProfileField[];
}) {
  const { companyTags } = useCompanyHashTags();

  const { fieldsBasic } = useContactFilterGroups({
    fields: props.fieldsAvailable,
    formValues: [],
  });

  function normalizeFetchContactsFilters(
    selectedFilters: Array<ListTypeValue>
  ): ContactsRequestPageExtensionType {
    let param: ContactsRequestPageExtensionType = { page: 1, filters: [] };

    if (!selectedFilters.find(matchesField(HASHTAG_FIELD_NAME))) {
      param = { ...param, tags: [], tagOperator: DefaultOperatorValue };
    }

    if (!selectedFilters.find(matchesField(LIST_FIELD_NAME))) {
      param = { ...param, listIds: [], listOperator: DefaultOperatorValue };
    }

    param = selectedFilters.reduce<ContactsRequestPageExtensionType>(
      (acc, next) => {
        const fieldMatch = fieldsBasic.find(matchesField(next.fieldName));
        if (!fieldMatch) {
          return acc;
        }
        const condition = next.selectedValue;
        if (fieldMatch.fieldName === HASHTAG_FIELD_NAME) {
          const tagsNames = condition.values ?? [];
          const tags = companyTags.filter((t) => tagsNames.includes(t.hashtag));
          const operator = condition.operator as ConditionNameType;
          if (operator) {
            return { ...acc, tags, tagOperator: operator };
          }
          return acc;
        } else if (fieldMatch.fieldName === LIST_FIELD_NAME) {
          const listIds = condition.values as string[];
          const operator = condition.operator as ConditionNameType;
          return { ...acc, listIds, listOperator: operator };
        }
        const prevFilters: AudienceType[] = acc.filters ?? [];

        const filter: AudienceType = {
          fieldName: next.fieldName,
          fieldType: fieldMatch.fieldType,
          filterCondition: condition.operator,
          filterValue: condition.values,
        };
        return { ...acc, filters: [...prevFilters, filter] };
      },
      param
    );

    const addedCurrency = selectedFilters.find(
      (f) => f.meta?.currency !== undefined
    )?.meta?.currency;

    if (addedCurrency) {
      param.filters?.push({
        filterCondition: "Contains",
        fieldName: "LAST ORDER CURRENCY",
        filterValue: ["HKD"],
        nextOperator: "And",
      });
    }
    return param;
  }

  return normalizeFetchContactsFilters;
}
