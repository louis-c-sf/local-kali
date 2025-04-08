import { AudienceType } from "../../types/BroadcastCampaignType";
import { HashTagCountedType } from "../../types/ConversationType";
import { useCurrentUtcOffset } from "../../component/Chat/hooks/useCurrentUtcOffset";
import { DefaultOperatorValue } from "../../container/Contact/hooks/ContactsStateType";
import { buildQuickSearchParam } from "./useContactsSuggest";
import { notQuickCondition } from "../../container/Contact";
import { useCallback } from "react";
import { normalizeConditions } from "api/Contacts/normalizeConditions";
import { FiltersTupleType, ContactsRequestExtensionType } from "./types";

export function useContactsSearchFilter(
  filterList: AudienceType[],
  filterTags: HashTagCountedType[],
  quickSearch: string,
  listIds: string[],
  collaboratorFilters: string[],
  baseFilterList: AudienceType[] = []
) {
  const utcOffset = useCurrentUtcOffset();

  const buildFilters = useCallback(
    (extend: ContactsRequestExtensionType) =>
      buildAndCombineFilters(
        extend,
        filterList,
        filterTags,
        quickSearch,
        listIds,
        baseFilterList,
        utcOffset,
        collaboratorFilters
      ),
    [
      JSON.stringify([
        filterList,
        filterTags,
        listIds,
        baseFilterList,
        collaboratorFilters,
      ]),
      utcOffset,
      quickSearch,
    ]
  );

  return {
    buildFilters,
  };
}

function buildAndCombineFilters(
  extend: ContactsRequestExtensionType,
  filterList: AudienceType[],
  filterTags: HashTagCountedType[],
  quickSearch: string,
  listIds: string[],
  baseFilterList: AudienceType[] = [],
  utcOffset: number,
  collaboratorFilters: string[]
): FiltersTupleType {
  const tagsActual = extend.tags ?? filterTags;
  const quickSearchActual = extend.quickSearch ?? quickSearch;
  const listIdsActual = extend.listIds ?? listIds;
  const filtersActual = extend.filters ?? filterList;
  const collaboratorActual = extend.collaboratorIds ?? collaboratorFilters;
  const tagOperator = extend.tagOperator ?? DefaultOperatorValue;
  const listOperator = extend.listOperator ?? DefaultOperatorValue;
  const collaboratorOperator =
    extend.collaboratorOperator ?? DefaultOperatorValue;

  let filtersAdjustable = normalizeConditions(
    filtersActual,
    tagsActual,
    listIdsActual,
    collaboratorActual,
    utcOffset,
    tagOperator,
    listOperator,
    collaboratorOperator
  );
  let filtersConstant = normalizeConditions(
    baseFilterList,
    [],
    [],
    [],
    utcOffset,
    tagOperator,
    listOperator,
    collaboratorOperator
  );
  if (quickSearchActual.trim() !== "") {
    let quickConditions = buildQuickSearchParam(quickSearchActual);
    const nonQuickConditions = normalizeConditions(
      filtersActual.filter(notQuickCondition),
      tagsActual,
      listIdsActual,
      collaboratorActual,
      utcOffset,
      tagOperator,
      listOperator,
      collaboratorOperator
    );
    if (nonQuickConditions.length > 0 || filtersConstant.length > 0) {
      quickConditions[quickConditions.length - 1].nextOperator = "And";
    }
    filtersAdjustable = [...quickConditions, ...nonQuickConditions];
  }
  return [filtersAdjustable, filtersConstant];
}
