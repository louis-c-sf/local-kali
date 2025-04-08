import type { TFunction } from 'react-i18next';
import * as yup from 'yup';

import { MultipleChipsValue } from '@/components/LegacySearchComboBox/multipleSelectComponents/MultipleChipsDisplay';
import type {
  CustomUserProfileFieldWithStaticFieldType,
  FilterType,
} from '@/pages/Contacts/shared/ContactsTable/ContactsFilterDialog';
import { ContactsFilterSchema } from '@/pages/Contacts/shared/ContactsTable/ContactsFilterDialog/formSchema';
import {
  isTransformedUserProfileFieldSelectHashtagOptionArray,
  isTransformedUserProfileFieldSelectOptionArray,
  TransformedUserProfileFieldHashtagSelectOption,
  transformedUserProfileFieldHashtagSelectOptionSchema,
  transformedUserProfileFieldSelectOptionSchema,
} from '@/pages/Contacts/shared/utils';
import { RULE_OPTIONS_ARRAY, RuleOptionsValues } from '@/utils/rules';
import { AtLeastOne, notEmpty } from '@/utils/ts-utils';
import { tryParseEncodedURL } from '@/utils/url';

export const isValidMatchOperator = (
  operator: string,
): operator is 'And' | 'Or' => {
  const validOperators = ['And', 'Or'];
  return validOperators.includes(operator);
};

const isStringArray = (elem: unknown): elem is string[] => {
  return yup.array().of(yup.string()).isValidSync(elem);
};

const getFormattedFilterPayload = ({
  conditionOperator,
  nextOperator,
  fieldName,
  containHashTag,
  values,
}: {
  nextOperator: string;
  conditionOperator: RuleOptionsValues;
  values: string[];
} & AtLeastOne<{
  containHashTag: string;
  fieldName: string;
}>) => {
  return {
    conditionOperator,
    nextOperator,
    fieldName,
    containHashTag,
    values,
  };
};

const getTransformedContactsFilterDataSchema = (
  customUserProfileFieldIds: string[],
) =>
  yup
    .array<any, any>()
    .of(
      yup.object({
        category: yup.string(),
        type: yup.string(),
        contactField: yup.object({
          displayName: yup.string(),
          id: yup
            .mixed()
            .oneOf([
              'createdat',
              'firstName',
              'lastName',
              ...customUserProfileFieldIds,
            ]),
          value: yup.string(),
        }),
        rule: yup.mixed<RuleOptionsValues>().oneOf(RULE_OPTIONS_ARRAY),
        value: yup.lazy((value: string[] | string | MultipleChipsValue[]) => {
          if (Array.isArray(value)) {
            if (isTransformedUserProfileFieldSelectOptionArray(value)) {
              return yup
                .array()
                .of(transformedUserProfileFieldSelectOptionSchema);
            }

            if (isTransformedUserProfileFieldSelectHashtagOptionArray(value)) {
              return yup
                .array()
                .of(transformedUserProfileFieldHashtagSelectOptionSchema);
            }

            return yup.array().of(yup.string());
          }
          return yup.string().when('rule', ([rule]) => {
            if (rule === 'IsNull' || rule === 'IsNotNull') {
              return yup.string();
            }
            return yup.string().required().min(1);
          });
        }),
      }),
    )
    .nullable();

export const checkContactsFiltersSchemaFromURL = (
  data: string | null,
  customUserProfileFieldIds: string[],
): FilterType[] | null => {
  try {
    const parsedData = tryParseEncodedURL(data);
    const schema = getTransformedContactsFilterDataSchema(
      customUserProfileFieldIds,
    );

    return schema.validateSync(parsedData) as ContactsFilterSchema['filters'];
  } catch (_e) {
    return null;
  }
};

export const getIsContainHashTag = (
  fieldName: string | undefined,
  value: unknown,
  hasConditionalOperator: boolean,
): value is TransformedUserProfileFieldHashtagSelectOption[] => {
  return (
    fieldName === 'Labels' &&
    isTransformedUserProfileFieldSelectHashtagOptionArray(value) &&
    hasConditionalOperator
  );
};

// TODO: Fix any types with yup
export const transformContactsFiltersToApi = (
  encodedFilters: string | null | FilterType[],
  matchOperator: 'And' | 'Or',
  customUserProfileFieldIds: string[],
) => {
  try {
    // parse from string or use already parsed data from input
    const parsedData =
      typeof encodedFilters === 'string' || encodedFilters === null
        ? tryParseEncodedURL<any>(encodedFilters)
        : encodedFilters;
    const schema = getTransformedContactsFilterDataSchema(
      customUserProfileFieldIds,
    );
    const checkedData = schema.validateSync(parsedData);
    if (checkedData) {
      return checkedData
        .map((rule) => {
          const {
            contactField: { value: fieldName },
            rule: conditionOperator,
            value,
          } = rule;

          // HACK: Hashtags AKA Labels field
          if (
            conditionOperator &&
            getIsContainHashTag(fieldName, value, !!conditionOperator)
          ) {
            return getFormattedFilterPayload({
              conditionOperator,
              nextOperator: matchOperator,
              containHashTag: 'hashtags',
              // Values accepts display name and NOT id and omit fieldName field
              values: value.map((val) => val.displayName),
            });
          }

          // Select fields
          if (
            isTransformedUserProfileFieldSelectOptionArray(value) &&
            conditionOperator &&
            fieldName
          ) {
            return getFormattedFilterPayload({
              conditionOperator,
              nextOperator: matchOperator,
              fieldName,
              values: value.map((val) => val.value),
            });
          }

          if (
            fieldName &&
            conditionOperator &&
            (typeof value === 'string' || isStringArray(value))
          ) {
            return getFormattedFilterPayload({
              conditionOperator,
              nextOperator: matchOperator,
              fieldName,
              values: Array.isArray(value) ? value : [value],
            });
          }
          return null;
        })
        .filter(notEmpty);
    }
    return [];
  } catch (_e) {
    return [];
  }
};

export const getStaticContactFields = (t: TFunction) =>
  [
    {
      fieldsCategory: 'Static',
      id: 'firstName',
      fieldName: 'firstname',
      type: 'FirstName',
      customUserProfileFieldLinguals: {
        en: t('contacts.static-contact-fields.firstName-label', {
          defaultValue: 'First Name',
        }),
      },
    },
    {
      fieldsCategory: 'Static',
      id: 'lastName',
      fieldName: 'lastname',
      type: 'LastName',
      customUserProfileFieldLinguals: {
        en: t('contacts.static-contact-fields.lastName-label', {
          defaultValue: 'Last Name',
        }),
      },
    },
    {
      fieldsCategory: 'Static',
      id: 'createdat',
      fieldName: 'createdat',
      type: 'CreatedAt',
      customUserProfileFieldLinguals: {
        en: t('contacts.static-contact-fields.createdat-label', {
          defaultValue: 'Created At',
        }),
      },
    },
  ] as CustomUserProfileFieldWithStaticFieldType[];
