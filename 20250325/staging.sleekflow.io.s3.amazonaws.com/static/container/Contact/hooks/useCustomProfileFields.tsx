import { CustomProfileField } from "../../../types/ContactType";
import CompanyType, {
  CustomUserProfileFieldsType,
  CustomUserProfileFieldLingualsType,
} from "../../../types/CompanyType";
import { useFieldLocales } from "../../../component/Contact/locaizable/useFieldLocales";
import { prop, toPairs, equals } from "ramda";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../../AppRootContext";
import { useMemo } from "react";

export const CUSTOM_FIELDS_STATIC = [
  { firstname: "First Name" },
  { lastname: "Last Name" },
] as const;

export const CUSTOM_FIELD_FILTERS_STATIC = [
  {
    type: "customField",
    fieldName: "displayName",
    fieldDisplayName: "First Name",
    fieldType: "singlelinetext",
    fieldOptions: [],
  },
];

export function isNotLabelsColumn(
  f: CustomUserProfileFieldsType | CustomProfileField
) {
  return f.type.toLowerCase() !== "labels";
}

export function isNotListsColumn(
  f: CustomUserProfileFieldsType | CustomProfileField
) {
  return f.type.toLowerCase() !== "lists";
}
export function isNotCollaboratorColumn(
  f: CustomUserProfileFieldsType | CustomProfileField
) {
  return f.type.toLowerCase() !== "collaborators";
}

export function isFilterVisible(
  f: CustomUserProfileFieldsType | CustomProfileField
) {
  return f.isVisible;
}

export const useCustomProfileFields = (options?: {
  excludeLabels?: boolean;
  excludeLists?: boolean;
  excludeCollabors?: boolean;
  includeNonVisibleFields?: boolean;
}) => {
  const isBooted = useAppSelector((s) =>
    Boolean(s.company?.customUserProfileFields)
  );
  const { getFieldDisplayNameLocale } = useFieldLocales();
  const { i18n } = useTranslation();

  const fields: CustomProfileField[] | undefined = useAppSelector((s) => {
    const customUserProfileFields = s.company?.customUserProfileFields || [];
    if (customUserProfileFields.length === 0) {
      return;
    }
    const includeNonVisibleFields = options?.includeNonVisibleFields
      ? () => true
      : isFilterVisible;
    const labelsFilter = options?.excludeLabels
      ? isNotLabelsColumn
      : () => true;
    const listsFilter = options?.excludeLists ? isNotListsColumn : () => true;
    const collaboratorFilter = options?.excludeCollabors
      ? isNotCollaboratorColumn
      : () => true;
    return customUserProfileFields
      .filter(
        (field) =>
          (includeNonVisibleFields(field) ||
            (field.isDefault && field.type !== "ContactOwnerField")) &&
          field.type !== "ContactOwnerField" &&
          labelsFilter(field) &&
          listsFilter(field) &&
          collaboratorFilter(field)
      )
      .map(denormalizeCustomField(i18n.language, getFieldDisplayNameLocale));
  }, equals);

  const defaultFields = useMemo(() => [], []);
  const fieldsMemoized = useMemo(
    () => fields,
    [JSON.stringify(fields), JSON.stringify(options)]
  );

  return {
    isBooted,
    fields: fieldsMemoized ?? defaultFields,
  };
};

export function getCompanyCustomFieldNames(company: CompanyType): string[] {
  return [
    ...CUSTOM_FIELDS_STATIC.map((kv) => Object.keys(kv)[0]),
    ...(company.customUserProfileFields ?? []).map(prop("fieldName")),
  ];
}

export function useDenormalizeCustomFieldsToDisplay() {
  const { staticFieldDisplayNames, getFieldDisplayNameLocale } =
    useFieldLocales();
  return {
    denormalizeCustomFieldsToDisplay(
      company: CompanyType | undefined
    ): Record<string, string>[] {
      const staticFields = CUSTOM_FIELDS_STATIC.map(toPairs).map((kvs) => ({
        [kvs[0][0]]: staticFieldDisplayNames[kvs[0][0]],
      }));

      const customFields = (company?.customUserProfileFields ?? []).map(
        (field) => ({
          [field.fieldName]: getFieldDisplayNameLocale(
            field.customUserProfileFieldLinguals,
            field.fieldName
          ),
        })
      );

      return [...staticFields, ...customFields];
    },
  };
}

export function denormalizeCustomField(
  language: string,
  getFieldName: (
    dict: CustomUserProfileFieldLingualsType[],
    defaultName: string
  ) => string
) {
  return (field: CustomUserProfileFieldsType) => {
    const {
      id,
      fieldName,
      type,
      customUserProfileFieldOptions,
      isVisible,
      isEditable,
      isDefault,
      isDeletable,
    } = field;
    const localeLangIndex = field.customUserProfileFieldLinguals.findIndex(
      (lang) => new RegExp(lang.language, "i").test(language)
    );
    const displayFieldName = getFieldName(
      field.customUserProfileFieldLinguals,
      field.fieldName
    );
    return {
      id,
      fieldName,
      displayName: displayFieldName,
      options: customUserProfileFieldOptions,
      type,
      isVisible,
      isEditable,
      isDefault,
      isDeletable,
      linguals: field.customUserProfileFieldLinguals,
      locale:
        localeLangIndex > -1
          ? field.customUserProfileFieldLinguals[localeLangIndex].language
          : language,
      order: field.order,
    };
  };
}
