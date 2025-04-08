import {
  Collaborator,
  Company,
  CustomUserProfileFields,
  Hashtag,
  TransformedCustomUserProfileOptions,
  UserProfileContactList,
  UserProfileInner,
} from '@/api/types';
import type { BriefUserProfileList } from '@/api/userProfile';
import {
  TransformedLinguals,
  TransformedUserProfileOptions,
} from '@/pages/Contacts/shared/types';
import {
  findCollaboratorsUserProfileField,
  findContactsListUserProfileField,
  findDefaultTravisUserField,
} from '@/pages/Contacts/shared/utils';
import { ArrayElement } from '@/utils/ts-utils';

export type TransformedCustomUserProfileField =
  ArrayElement<TransformedCustomUserProfileFieldArray>;

export type TransformedCustomUserProfileFieldArray = ReturnType<
  typeof transformCustomUserProfileFieldsFromApi
>;

export const transformCustomUserProfileFieldsFromApi = ({
  company,
  userProfileBrief,
}: {
  company: Company;
  userProfileBrief?: BriefUserProfileList;
}) => {
  const { companyHashtags, customUserProfileFields } = company;

  const formattedCompanyHashtags = companyHashtags.reduce<
    Record<string, Hashtag>
  >((prevVal, nextVal) => {
    const { hashtag, hashTagType, hashTagColor, id } = nextVal;
    prevVal[id] = {
      id,
      hashtag,
      hashTagType,
      hashTagColor,
    };
    return prevVal;
  }, {});

  let formattedListOptions: Record<
    string,
    ArrayElement<BriefUserProfileList['userGroups']>
  > = {};
  if (userProfileBrief) {
    formattedListOptions = userProfileBrief.userGroups.reduce<
      Record<string, ArrayElement<BriefUserProfileList['userGroups']>>
    >((prevVal, nextVal) => {
      const { id } = nextVal;
      prevVal[id] = nextVal;
      return prevVal;
    }, {});
  }

  const contactListsId = findContactsListUserProfileField(
    customUserProfileFields,
  )?.id;

  const contactsListIndex = customUserProfileFields.findIndex(
    (field) => field.id === contactListsId,
  );

  const collaboratorsId = findCollaboratorsUserProfileField(
    customUserProfileFields,
  )?.id;

  const defaultTravisUser = findDefaultTravisUserField(customUserProfileFields);

  const travisUserOptions =
    defaultTravisUser?.customUserProfileFieldOptions.reduce<TransformedCustomUserProfileOptions>(
      (prevVal, nextVal) => {
        const { customUserProfileFieldOptionLinguals, value } = nextVal;
        const localisedOptionsValues =
          customUserProfileFieldOptionLinguals.reduce<TransformedLinguals>(
            (prevVal, nextVal) => {
              const { language, displayName } = nextVal;
              prevVal[language] = displayName;
              return prevVal;
            },
            {},
          );
        prevVal[value] = localisedOptionsValues;
        return prevVal;
      },
      {},
    );

  const hashtagsId = customUserProfileFields.find(
    (field) =>
      field.type === 'Labels' &&
      field.fieldsCategory === 'Segmentation' &&
      field.fieldName === 'Labels',
  )?.id;

  // Format headers to have the columnId as the key to make it easier to access
  const transformedCustomUserProfileFields = customUserProfileFields.map(
    (header) => {
      const localisedFieldNames =
        header.customUserProfileFieldLinguals.reduce<TransformedLinguals>(
          (prevVal, nextVal) => {
            const { language, displayName } = nextVal;
            prevVal[language] = displayName;
            return prevVal;
          },
          {},
        );

      const localisedOptions =
        header.customUserProfileFieldOptions.reduce<TransformedCustomUserProfileOptions>(
          (prevVal, nextVal) => {
            const { customUserProfileFieldOptionLinguals, value } = nextVal;

            const localisedOptionsValues =
              customUserProfileFieldOptionLinguals.reduce<TransformedLinguals>(
                (prevVal, nextVal) => {
                  const { language, displayName } = nextVal;
                  prevVal[language] = displayName;
                  return prevVal;
                },
                {},
              );
            prevVal[value] = localisedOptionsValues;
            return prevVal;
          },
          {},
        );

      // HACK: bad type inferrance
      let result: Omit<
        CustomUserProfileFields,
        'customUserProfileFieldLinguals' | 'customUserProfileFieldOptions'
      > & {
        customUserProfileFieldLinguals: Partial<TransformedLinguals>;
        customUserProfileFieldOptions: TransformedUserProfileOptions;
      } = {
        ...header,
        customUserProfileFieldOptions: {},
        customUserProfileFieldLinguals: localisedFieldNames,
      };

      // Put hashtags into options as well
      if (header.id === hashtagsId) {
        result = {
          ...result,
          customUserProfileFieldOptions: formattedCompanyHashtags,
        };
        // Collaborator options are the same as TravisUser
      } else if (header.id === collaboratorsId) {
        result = {
          ...result,
          customUserProfileFieldOptions: travisUserOptions || {},
        };
        // Only default travisUser field has options, have to pour options into the custom fields created by user from that
      } else if (header.type === 'TravisUser') {
        result = {
          ...result,
          customUserProfileFieldOptions: travisUserOptions || {},
        };
      } else {
        result = {
          ...result,
          customUserProfileFieldOptions: localisedOptions || {},
        };
      }
      // put list options in there
      if (
        userProfileBrief &&
        header.id === contactListsId &&
        ~contactsListIndex
      ) {
        result = {
          ...result,
          customUserProfileFieldOptions: formattedListOptions,
        };
      }

      return result;
    },
  );

  return transformedCustomUserProfileFields;
};

export type TransformedUserProfileData = ReturnType<
  typeof transformUserProfileDataFromApi
>;

export const transformUserProfileDataFromApi = ({
  userProfileData,
  conversationHashtagsId,
  contactListsId,
  collaboratorsId,
}: {
  collaboratorsId?: string;
  userProfileData: UserProfileInner;
  conversationHashtagsId?: string;
  contactListsId?: string;
}) => {
  const { contactLists, customFields, conversationHashtags } = userProfileData;

  const formattedCustomFields = customFields.reduce<Record<string, string>>(
    (prevVal, nextVal) => {
      const { companyDefinedFieldId, value } = nextVal;
      prevVal[companyDefinedFieldId] = value;
      return prevVal;
    },
    {},
  );

  const allContactTableFields: Record<
    string,
    Hashtag[] | string | UserProfileContactList[] | Collaborator[]
  > = {
    ...formattedCustomFields,
  };
  if (conversationHashtagsId) {
    allContactTableFields[conversationHashtagsId] = conversationHashtags || [];
  }
  if (contactListsId) {
    allContactTableFields[contactListsId] = contactLists;
  }

  if (collaboratorsId) {
    allContactTableFields[collaboratorsId] = userProfileData.collaborators;
  }

  return {
    ...userProfileData,
    allContactTableFields,
  };
};
