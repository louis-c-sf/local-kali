import { useMutation } from '@tanstack/react-query';
import { TFunction } from 'i18next';
import { Metadata } from 'libphonenumber-js';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

import { useAxios } from '@/api/axiosClient';
import {
  Collaborator,
  CustomUserProfileFields,
  Hashtag,
  HASHTAG_TYPE,
  HashtagType,
  isCollaboratorsArray,
  isHashtagsArray,
  isUserProfileContactListArray,
  Linguals,
  TRANSFORMED_HASHTAG_COLORS,
  TransformedCustomUserProfileOptions,
  TransformedHashtagColors,
  UserProfileContactList,
} from '@/api/types';
import type { BriefUserProfileList } from '@/api/userProfile';
import { LABELS_COLOR_MAPPING } from '@/constants/label';
import { EMPTY_CELL_VALUE } from '@/constants/table';
import useSnackbar from '@/hooks/useSnackbar';
import type { CustomUserProfileFieldWithStaticFieldType } from '@/pages/Contacts/shared/ContactsTable/ContactsFilterDialog';
import type { TransformedCustomUserProfileFieldArray } from '@/pages/Contacts/shared/adapters';
import {
  TransformedLinguals,
  transformedLingualsSchema,
} from '@/pages/Contacts/shared/types';
import { getFullName } from '@/utils/formatting';
import { notEmpty } from '@/utils/ts-utils';
import { parsePhoneNumber } from '@/utils/phoneNumber';

export function useListNameExists({
  onSuccess,
}: {
  onSuccess:
    | ((
        data: boolean,
        variables: { name: string },
        context: unknown,
      ) => unknown)
    | undefined;
}) {
  const url = '/UserProfile/List/brief';
  const axiosClient = useAxios();
  const snackbar = useSnackbar();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (data: { name: string }) => {
      const response = await axiosClient.get<BriefUserProfileList>(url, {
        params: { name: data.name },
      });
      const allUniqueListNames = new Set(
        response.data.userGroups.map((userGroup) =>
          userGroup.importName?.toLowerCase(),
        ),
      );
      // lowercase comparison
      return allUniqueListNames.has(data.name.toLowerCase());
    },
    meta: {
      url,
      description: 'Check if list name already exists',
    },
    onError: () => {
      snackbar.error(t('contact.list-name-exists-error-toast'));
    },
    onSuccess,
  });
}

export const getPhoneNumberMaxLength = (phoneNumber: string) => {
  const [phoneNumberParse] = parsePhoneNumber(
    `+${phoneNumber.replace(/\D/, '')}`,
    'HK',
  );
  const countryCode = phoneNumberParse?.country || 'HK';
  const metadata = new Metadata();
  metadata.selectNumberingPlan(countryCode);
  const possibleLengths = metadata.numberingPlan?.possibleLengths();
  return Math.max(...(possibleLengths || []));
};
export const isCustomValidPhoneNumber = (
  transformedPhoneNumber: string,
): boolean => {
  const [phoneNumberParse] = parsePhoneNumber(transformedPhoneNumber);
  if (
    !phoneNumberParse?.isValid() &&
    phoneNumberParse &&
    phoneNumberParse.countryCallingCode === '852' &&
    phoneNumberParse.nationalNumber.length === 8
  ) {
    const allowedPhoneNumber = ['4', '7', '8'];
    return allowedPhoneNumber.some((s) =>
      phoneNumberParse.nationalNumber.startsWith(s),
    );
  }
  return !!phoneNumberParse?.isValid();
};

// Used to get the header name of a contact field with fallbacks
export const getLocalisedContactFieldLinguals = ({
  languageOptions,
  language,
  fallbacks = [],
}: {
  fallbacks?: string | undefined | (string | undefined | null)[];
  languageOptions: TransformedLinguals | undefined | Linguals[];
  language: string;
}) => {
  let fallback;
  let options = languageOptions;
  if (typeof fallbacks === 'string') {
    fallback = fallbacks;
  } else {
    fallback = fallbacks.find((f) => !!f);
  }

  if (!options) {
    return fallback || EMPTY_CELL_VALUE;
  }

  // If options is not a transformedLinguals type, convert it to an object
  if (Array.isArray(options)) {
    options = options.reduce<TransformedLinguals>((prevVal, nextVal) => {
      const { language, displayName } = nextVal;
      prevVal[language] = displayName;
      return prevVal;
    }, {});
  }

  const contactFieldLinguaglOptionsKeys = Object.keys(options);

  /*
    > Check for localised header
    > default to EN
    > Default to any available
    > Default to first available fallback
    > Default to EMPTY_VALUE
  */
  const result =
    options?.[language.toLowerCase() as Linguals['language']] ||
    options?.en ||
    (contactFieldLinguaglOptionsKeys.length > 0 &&
      options?.[contactFieldLinguaglOptionsKeys[0] as Linguals['language']]) ||
    fallback ||
    EMPTY_CELL_VALUE;
  return result.trim();
};

// https://github.com/blakeembrey/change-case/blob/master/packages/title-case/src/index.ts
const SMALL_WORDS =
  /\b(?:an?d?|a[st]|because|but|by|en|for|i[fn]|neither|nor|o[fnr]|only|over|per|so|some|tha[tn]|the|to|up|upon|vs?\.?|versus|via|when|with|without|yet)\b/i;
const TOKENS = /[^\s:–—-]+|./g;
const WHITESPACE = /\s/;
const IS_MANUAL_CASE = /.(?=[A-Z]|\..)/;
const ALPHANUMERIC_PATTERN = /[A-Za-z0-9\u00C0-\u00FF]/;

export function titleCase(input: string) {
  let result = '';
  let m: RegExpExecArray | null;

  // tslint:disable-next-line
  while ((m = TOKENS.exec(input)) !== null) {
    const { 0: token, index } = m;

    if (
      // Ignore already capitalized words.
      !IS_MANUAL_CASE.test(token) &&
      // Ignore small words except at beginning or end.
      (!SMALL_WORDS.test(token) ||
        index === 0 ||
        index + token.length === input.length) &&
      // Ignore URLs.
      (input.charAt(index + token.length) !== ':' ||
        WHITESPACE.test(input.charAt(index + token.length + 1)))
    ) {
      // Find and uppercase first word character, skips over *modifiers*.
      result += token.replace(ALPHANUMERIC_PATTERN, (m) => m.toUpperCase());
      continue;
    }

    result += token;
  }

  return result;
}

type EmptyUserProfileFieldInputOption = Omit<
  TransformedUserProfileFieldSelectOption,
  'value'
> & { value: string | undefined };

export const transformUserProfileFieldInputOptions = ({
  includeEmptyOption,
  options,
  fieldType,
  t,
  language,
}: {
  includeEmptyOption?: boolean;
  fieldType: CustomUserProfileFieldWithStaticFieldType['type'];
  options: CustomUserProfileFieldWithStaticFieldType['customUserProfileFieldOptions'];
  t: TFunction;
  language: string;
}) => {
  let transformedOptions:
    | TransformedUserProfileFieldInputOptions
    | UserProfileContactList[];

  transformedOptions = Object.entries(options).map((entry) => {
    const [value, displayNameOptions] = entry;

    if (fieldType === 'Labels') {
      return displayNameOptions;
    }

    if (fieldType === 'Lists') {
      return displayNameOptions;
    }

    const localisedDisplayName = getLocalisedContactFieldLinguals({
      languageOptions: displayNameOptions as TransformedLinguals | undefined,
      language,
    });
    const isEmptyName = localisedDisplayName.trim().length === 0;
    return {
      value,
      displayName: isEmptyName
        ? t('untitled-label-by-field-type', {
            fieldType,
            defaultValue: 'Untitled',
          })
        : localisedDisplayName,
    };
  });

  if (
    isTransformedUserProfileFieldSelectOptionArray(transformedOptions) &&
    includeEmptyOption
  ) {
    transformedOptions = [
      {
        displayName: EMPTY_CELL_VALUE,
        value: undefined,
      },
      ...transformedOptions,
    ];
  }

  return transformedOptions;
};

export const isTransformedUserProfileFieldSelectOptionArray = (
  elem: unknown,
): elem is TransformedUserProfileFieldSelectOption[] => {
  const schema = yup.array().of(transformedUserProfileFieldSelectOptionSchema);

  return schema.isValidSync(elem, { stripUnknown: false });
};

export const isTransformedUserProfileFieldSelectOption = (
  elem: unknown,
): elem is TransformedUserProfileFieldSelectOption => {
  return transformedUserProfileFieldSelectOptionSchema.isValidSync(elem, {
    stripUnknown: false,
  });
};

export const isTransformedUserProfileFieldHashtagSelectOption = (
  elem: unknown,
): elem is TransformedUserProfileFieldHashtagSelectOption => {
  return transformedUserProfileFieldHashtagSelectOptionSchema.isValidSync(
    elem,
    {
      stripUnknown: false,
    },
  );
};

export const isTransformedUserProfileFieldSelectHashtagOptionArray = (
  elem: unknown,
): elem is TransformedUserProfileFieldHashtagSelectOption[] => {
  const schema = yup
    .array()
    .of(transformedUserProfileFieldHashtagSelectOptionSchema);

  return schema.isValidSync(elem, { stripUnknown: false });
};

export type TransformedUserProfileFieldSelectOption = {
  value: string;
  displayName: string;
};

export type TransformedUserProfileFieldHashtagSelectOption = {
  value: string;
  displayName: string;
  color: TransformedHashtagColors;
  hashTagType: 'Normal' | 'Facebook' | 'Shopify';
};

export type TransformedUserProfileFieldInputOptions =
  | EmptyUserProfileFieldInputOption[]
  | TransformedUserProfileFieldSelectOption[]
  | Hashtag[]
  | UserProfileContactList[];

export const transformedUserProfileFieldHashtagSelectOptionSchema = yup
  .object({
    value: yup.string(),
    displayName: yup.string(),
    color: yup
      .mixed<TransformedHashtagColors>()
      .oneOf(TRANSFORMED_HASHTAG_COLORS),
    hashTagType: yup.mixed<HashtagType>().oneOf(HASHTAG_TYPE),
  })
  .noUnknown();

export const isTransformedCustomUserProfileHashtagOptions = (
  elem: unknown,
): elem is TransformedUserProfileFieldHashtagSelectOption => {
  const schema = yup.lazy((value) => {
    if (notEmpty(value)) {
      const newEntries = Object.keys(value).reduce<yup.ObjectShape>(
        (acc, val) => {
          acc[val] = transformedLingualsSchema;
          return acc;
        },
        {},
      );
      return yup.object().shape(newEntries).noUnknown();
    }
    return yup.object().noUnknown();
  });

  return schema.isValidSync(elem, { stripUnknown: false });
};

export const transformedUserProfileFieldSelectOptionSchema = yup
  .object({
    value: yup.string(),
    displayName: yup.string(),
  })
  .noUnknown();

export const isTransformedCustomUserProfileOptions = (
  elem: unknown,
): elem is TransformedCustomUserProfileOptions => {
  const schema = yup.lazy((value) => {
    if (notEmpty(value)) {
      const newEntries = Object.keys(value).reduce<yup.ObjectShape>(
        (acc, val) => {
          acc[val] = transformedLingualsSchema;
          return acc;
        },
        {},
      );
      return yup.object().shape(newEntries).noUnknown();
    }
    return yup.object().noUnknown();
  });

  return schema.isValidSync(elem, { stripUnknown: false });
};

export const transformUserProfileFieldCustomValueToApi = (
  val:
    | string
    | TransformedUserProfileFieldSelectOption
    | TransformedUserProfileFieldSelectOption[]
    | EmptyUserProfileFieldInputOption
    | UserProfileContactList[]
    | Hashtag[],
) => {
  if (isTransformedUserProfileFieldSelectOption(val)) {
    if (val.value === EMPTY_CELL_VALUE) {
      return '';
    }
    return val.value as string;
  }
  return val as string;
};

export const transformCustomUserProfileFieldInputsArray = ({
  customUserProfileFields,
  allContactTableFields,
  language,
}: {
  language: string;
  customUserProfileFields: TransformedCustomUserProfileFieldArray;
  allContactTableFields?: Record<
    string,
    string | Hashtag[] | UserProfileContactList[] | Collaborator[]
  >;
}) => {
  return customUserProfileFields.map((profile) => {
    const options = profile.customUserProfileFieldOptions;
    const rawVal = allContactTableFields?.[profile.id] || '';
    let resultingVal:
      | string
      | TransformedUserProfileFieldSelectOption
      | TransformedUserProfileFieldSelectOption[]
      | EmptyUserProfileFieldInputOption;

    // User Profile list fields
    if (isUserProfileContactListArray(rawVal)) {
      resultingVal = rawVal.map((opt) => ({
        displayName: opt.listName,
        value: String(opt.id),
      }));

      // Hashtags Field
    } else if (isHashtagsArray(rawVal)) {
      resultingVal = rawVal.map((tag) => ({
        value: tag.id,
        displayName: tag.hashtag,
        color: LABELS_COLOR_MAPPING[tag.hashTagColor],
      }));

      // Collaborators Field
    } else if (isCollaboratorsArray(rawVal)) {
      resultingVal = rawVal.map((collaborator) => {
        return {
          value: collaborator.identityId,
          displayName: getFullName({
            firstName: collaborator.firstName,
            lastName: collaborator.lastName,
            fallback: 'Untitled',
          }),
        };
      });
    } else if (
      profile.type === 'Channel' &&
      isTransformedCustomUserProfileOptions(options) &&
      typeof rawVal === 'string'
    ) {
      // HACK: Channel type hack since value does not always match up to an option
      if (rawVal) {
        const option = options[rawVal];

        if (option) {
          resultingVal = {
            displayName: getLocalisedContactFieldLinguals({
              languageOptions: option,
              language,
            }),
            value: rawVal,
          };
        } else {
          resultingVal = {
            displayName: rawVal === 'whatsapp' ? 'WhatsApp' : titleCase(rawVal),
            value: rawVal,
          };
        }
      } else {
        resultingVal = {
          displayName: EMPTY_CELL_VALUE,
          value: EMPTY_CELL_VALUE,
        };
      }
    } else if (
      isTransformedCustomUserProfileOptions(options) &&
      typeof rawVal === 'string' &&
      // Fields with customUserProfileOptions
      ['UserLanguage', 'TravisUser', 'Options', 'Collaborators'].includes(
        profile.type,
      )
    ) {
      resultingVal = {
        displayName: getLocalisedContactFieldLinguals({
          languageOptions: options[rawVal],
          language,
        }),
        // HACK: MUI Select and autocomplete won't accept empty string or null values for options
        value: rawVal ? rawVal : undefined,
      };
    } else {
      resultingVal = rawVal;
    }

    return {
      customFieldName: profile.fieldName,
      customValue: resultingVal || '',
      customFieldId: profile.id,
    };
  });
};

export type CustomFieldFormItem = ReturnType<
  typeof transformCustomUserProfileFieldInputsArray
>[0];

export const findContactsListUserProfileField = <
  T extends {
    type: string;
    fieldsCategory: string;
    fieldName: string;
  },
>(
  customUserProfileFields: T[],
) => {
  return customUserProfileFields.find(
    (field) =>
      field.type === 'Lists' &&
      field.fieldsCategory === 'Segmentation' &&
      field.fieldName === 'Lists',
  );
};

export const findDefaultTravisUserField = (
  customUserProfileFields: CustomUserProfileFields[],
) => {
  return customUserProfileFields.find(
    (field) =>
      field.type === 'TravisUser' &&
      field.fieldsCategory === 'SleekFlowUser' &&
      field.fieldName === 'ContactOwner',
  );
};

export const findContastsListUserProfileField = <
  T extends Omit<
    CustomUserProfileFields,
    'customUserProfileFieldLinguals' | 'customUserProfileFieldOptions'
  >,
>(
  customUserProfileFields: T[],
) => {
  return customUserProfileFields.find(
    (field) =>
      field.type === 'Lists' &&
      field.fieldsCategory === 'Segmentation' &&
      field.fieldName === 'Lists',
  );
};

export const findCollaboratorsUserProfileField = <
  T extends Omit<
    CustomUserProfileFields,
    'customUserProfileFieldLinguals' | 'customUserProfileFieldOptions'
  >,
>(
  customUserProfileFields: T[],
) => {
  return customUserProfileFields.find(
    (field) =>
      field.type === 'Collaborators' &&
      field.fieldsCategory === 'Default' &&
      field.fieldName === 'Collaborators',
  );
};

export const findHashtagUserProfileField = <
  T extends {
    type: string;
    fieldsCategory: string;
    fieldName: string;
  },
>(
  customUserProfileFields: T[],
) => {
  return customUserProfileFields.find(
    (field) =>
      field.type === 'Labels' &&
      field.fieldsCategory === 'Segmentation' &&
      field.fieldName === 'Labels',
  );
};

export const findEmailUserProfileField = (
  customUserProfileFields: Omit<
    CustomUserProfileFields,
    'customUserProfileFieldLinguals' | 'customUserProfileFieldOptions'
  >[],
) => {
  return customUserProfileFields.find(
    (field) =>
      field.type === 'Email' &&
      field.fieldsCategory === 'Default' &&
      field.fieldName === 'Email',
  );
};

export const findPositionOfContactOwnerField = <
  T extends {
    type: string;
    fieldsCategory: string;
    fieldName: string;
  },
>(
  customUserProfileFields: T[],
) => {
  return customUserProfileFields.find(
    (field) =>
      field.fieldName !== 'PositionOfContactOwner' &&
      field.fieldsCategory !== 'Default' &&
      field.type !== 'ContactOwnerField',
  );
};

export const findPhoneNumberUserProfileField = (
  customUserProfileFields: Omit<
    CustomUserProfileFields,
    'customUserProfileFieldLinguals' | 'customUserProfileFieldOptions'
  >[],
) => {
  return customUserProfileFields.find(
    (field) =>
      field.type === 'PhoneNumber' &&
      field.fieldsCategory === 'Default' &&
      field.fieldName === 'PhoneNumber',
  );
};

export const invisibleLinkClickDownload = (
  href: string,
  attributes?: { attribute: string; value: string }[],
) => {
  const link = document.createElement('a');
  link.href = href;
  link.style.display = 'none';
  attributes?.forEach(({ attribute, value }) => {
    link.setAttribute(attribute, value);
  });
  document.body.appendChild(link);
  link.dispatchEvent(new MouseEvent('click'));
  document.body.removeChild(link);
};

export const createLinkFromBlobAndDownload = ({
  filename,
  blob,
}: {
  filename: string;
  blob: Blob;
}) => {
  // create file link in browser's memory
  const href = URL.createObjectURL(blob);

  invisibleLinkClickDownload(href, [
    { attribute: 'download', value: filename },
  ]);

  URL.revokeObjectURL(href);
};

export const LABELS_COLOR_TO_API_MAPPING = {
  blue: 'Blue',
  brown: 'Pink',
  mustard: 'Yellow',
  forest: 'Green',
  red: 'Red',
  purple: 'Purple',
  gray: 'Grey',
  indigo: 'Cyan',
} as const;
