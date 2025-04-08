import { FilterConfigType } from "../../../../types/FilterConfigType";
import { useFieldLocales } from "../../locaizable/useFieldLocales";
import { UserProfileFieldOptionsType } from "../../../../types/CompanyType";

export function useCustomFieldConfig(props: {
  fieldName: string;
  fieldType: string;
  displayName: string;
  options?: UserProfileFieldOptionsType[];
}): FilterConfigType {
  const { fieldName, fieldType, displayName, options = [] } = props;
  const { getFieldDisplayNameLocale, staticFieldDisplayNames } =
    useFieldLocales();
  const fieldNameLC = fieldName.toLowerCase();

  if (fieldNameLC === "firstname") {
    return {
      type: "customField",
      fieldName: "firstname",
      fieldDisplayName: staticFieldDisplayNames.firstname,
      fieldType: "singlelinetext",
      fieldOptions: [],
    };
  } else if (fieldNameLC === "lastname") {
    return {
      type: "customField",
      fieldName: "lastname",
      fieldDisplayName: staticFieldDisplayNames.lastname,
      fieldType: "singlelinetext",
      fieldOptions: [],
    };
  } else if (fieldNameLC === "createdat") {
    return {
      type: "customField",
      fieldName: "createdat",
      fieldDisplayName: staticFieldDisplayNames.createdAt,
      fieldType: "datetime",
      fieldOptions: [],
    };
  }
  return {
    fieldName: fieldName,
    fieldDisplayName: displayName,
    type: "customField",
    fieldType: fieldType.toLowerCase(),
    fieldOptions: (options || []).map((option, key) => ({
      key: key,
      value: option.value,
      text: getFieldDisplayNameLocale(
        option.customUserProfileFieldOptionLinguals,
        option.value
      ),
    })),
  };
}
