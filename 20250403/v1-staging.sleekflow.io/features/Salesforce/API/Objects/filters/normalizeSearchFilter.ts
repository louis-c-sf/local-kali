import { FilterGroupType } from "../contracts";

export function normalizeSearchFilter(search: string): FilterGroupType | null {
  const nameFields = ["Name", "FirstName", "LastName", "Email", "Phone"];
  return search.trim() === ""
    ? null
    : {
        filters: nameFields.map((field) => {
          return {
            operator: "contains",
            value: search,
            field_name: `unified:${field}`,
          };
        }),
      };
}

export const SearchFilter = Symbol("SearchFilter");
