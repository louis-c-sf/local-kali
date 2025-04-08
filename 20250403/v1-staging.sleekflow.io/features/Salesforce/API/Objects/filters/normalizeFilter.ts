import { FilterGroupType } from "../contracts";
import { SearchFilter, normalizeSearchFilter } from "./normalizeSearchFilter";
import { normalizeFieldFilter } from "./normalizeFieldFilter";

export function createFilterNormalizer<Filter extends {}, Field = keyof Filter>(
  fieldsMap: Array<{ filter: keyof Filter; apiName: string | symbol }>
): (values: { [k in keyof Filter]: string | null }) => Array<FilterGroupType> {
  return (values) => {
    const results: FilterGroupType[] = [];

    for (let mapEntry of fieldsMap) {
      const value = values[mapEntry.filter];
      const apiName = mapEntry.apiName;
      if (apiName === SearchFilter) {
        const normalized = normalizeSearchFilter(value ?? "");
        if (normalized) {
          results.push(normalized);
        }
      } else {
        const normalized = normalizeFieldFilter(String(apiName), value);
        if (normalized) {
          results.push(normalized);
        }
      }
    }
    return results;
  };
}
