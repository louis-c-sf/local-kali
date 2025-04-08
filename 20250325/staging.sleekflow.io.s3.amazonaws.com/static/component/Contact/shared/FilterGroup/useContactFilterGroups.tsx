import { useMemo, useCallback } from "react";
import {
  LIST_FIELD_NAME,
  HASHTAG_FIELD_NAME,
} from "config/ProfileFieldMapping";
import { CustomProfileField } from "../../../../types/ContactType";
import { useTranslation } from "react-i18next";
import { UserProfileFieldOptionsType } from "../../../../types/CompanyType";
import { ListTypeValue } from "../../../../container/Contact/hooks/ContactsStateType";
import { parseInt } from "lodash-es";
import { FilterGroupFieldType } from "./FilterGroupFieldType";
import { matchesField } from "./matchesField";
import { useFieldLocales } from "../../locaizable/useFieldLocales";
import { normalizeIndex } from "./FilterGroup";
import { useCompanyStaff } from "api/User/useCompanyStaff";
import { staffDisplayName } from "component/Chat/utils/staffDisplayName";
import { matchesStaffId } from "types/TeamType";

export function useContactFilterGroups(props: {
  fields: CustomProfileField[];
  excludeStaticFields?: string[];
  formValues: ListTypeValue[];
}) {
  const { fields, formValues } = props;
  const { t } = useTranslation();

  const fieldsStamp = JSON.stringify(fields);
  const staffList = useCompanyStaff();

  const { staticFieldDisplayNames } = useFieldLocales();

  const fieldsBasic: FilterGroupFieldType[] = useMemo(() => {
    const initStaticFields = [
      {
        fieldName: "firstname",
        fieldType: "singlelinetext",
        displayName: staticFieldDisplayNames.firstname,
      },
      {
        fieldName: "lastname",
        fieldType: "singlelinetext",
        displayName: staticFieldDisplayNames.lastname,
      },
      {
        fieldName: LIST_FIELD_NAME,
        displayName: staticFieldDisplayNames[LIST_FIELD_NAME],
        fieldType: LIST_FIELD_NAME,
      },
      {
        fieldName: HASHTAG_FIELD_NAME,
        displayName: staticFieldDisplayNames[HASHTAG_FIELD_NAME],
        fieldType: HASHTAG_FIELD_NAME,
      },
    ].filter((f) => !props.excludeStaticFields?.includes(f.fieldName));
    return [
      ...initStaticFields,
      ...fields.map((f) => {
        let options = f.options;
        if (f.type.toLowerCase() === "travisuser" && options) {
          options = options.map<UserProfileFieldOptionsType>((op) => {
            const id = op.value;
            const staffMatch = staffList.staffList.find(matchesStaffId(id));
            if (!staffMatch) {
              return op;
            }
            return {
              ...op,
              customUserProfileFieldOptionLinguals:
                op.customUserProfileFieldOptionLinguals.map((ling) => ({
                  ...ling,
                  displayName: staffDisplayName(staffMatch),
                })),
            };
          });
        }
        return {
          fieldName: f.fieldName,
          displayName: f.displayName,
          options: options,
          fieldType: f.type,
        };
      }),
      {
        fieldName: "createdat",
        fieldType: "datetime",
        displayName: staticFieldDisplayNames.createdAt,
      },
    ];
  }, [fieldsStamp, staffList.booted]);

  // cache the translations to avoid multiple hook reads
  const valueMissingError = t("profile.filter.error.general.valueMissing");

  function extractFieldErrors(value: ListTypeValue) {
    const field = fieldsBasic.find(matchesField(value.fieldName));
    if (!field) {
      return;
    }

    if (["IsNull", "IsNotNull"].includes(value.selectedValue.operator)) {
      return;
    }
    const errors = [];

    if (value.selectedValue.values.length === 0) {
      errors.push(valueMissingError);
    } else if (
      field.fieldType === "range" &&
      value.selectedValue.values.length < 2
    ) {
      const validValues = value.selectedValue.values.filter(
        (v) => !isNaN(parseInt(v))
      );
      if (validValues.length < 2) {
        errors.push(valueMissingError);
      }
    }

    if (errors.length > 0) {
      return errors;
    }
  }

  const getFieldErrors = useCallback(
    (fieldName: string, index?: number) => {
      if (index !== undefined) {
        const fieldIndex = normalizeIndex(formValues, fieldName, index);
        if (fieldIndex === null) {
          console.error(
            `missing error index ${index} at ${fieldIndex} [${fieldName}]`,
            formValues
          );
          return;
        }

        const fieldMatch = formValues[fieldIndex];
        if (!fieldMatch) {
          console.error(
            `missing error index ${index} at ${fieldIndex}`,
            formValues
          );
          return;
        }
        return extractFieldErrors(fieldMatch);
      }

      const values = formValues.filter(matchesField(fieldName));
      if (values.length > 0) {
        const allErrors = values
          .map(extractFieldErrors)
          .filter(Boolean)
          .flat(1);
        return allErrors.length > 0 ? allErrors : undefined;
      } else {
        return [valueMissingError];
      }
    },
    [JSON.stringify([formValues])]
  );

  const isValid = !formValues.some((v) => Boolean(getFieldErrors(v.fieldName)));

  return {
    fieldsBasic,
    getFieldErrors,
    isValid,
  };
}
