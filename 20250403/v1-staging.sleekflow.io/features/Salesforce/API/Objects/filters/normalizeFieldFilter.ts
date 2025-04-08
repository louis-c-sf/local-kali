import { FilterGroupType } from "../contracts";

export function normalizeFieldFilter(
  name: string,
  value: string | null
): FilterGroupType | null {
  if (value === null) {
    return null;
  }
  return {
    filters: [
      {
        field_name: `unified:${name}`,
        value: value ?? "",
        operator: "=",
      },
    ],
  };
}
