import { CustomUserProfileFieldLingualsType } from "../../../types/CompanyType";
import { useTranslation } from "react-i18next";
import {
  AWAY_STATUS_FIELD_NAME_DENORMALIZED,
  HASHTAG_FIELD_NAME,
} from "../../../config/ProfileFieldMapping";
import { useCallback, useMemo } from "react";
import { CustomProfileField } from "../../../types/ContactType";
import ProfileSearchType from "../../../types/ProfileSearchType";
import moment from "moment";
import useCompanyChannels from "../../Chat/hooks/useCompanyChannels";
import { useProfileDisplayName } from "../../Chat/utils/useProfileDisplayName";
import { useChatChannelLocales } from "../../Chat/localizable/useChatChannelLocales";
import { useCountryDialList } from "../../../config/localizable/useCountryDialList";
import { useAppSelector } from "../../../AppRootContext";
import { equals } from "ramda";

export function useFieldLocales() {
  const { t, i18n } = useTranslation();

  const staticFieldDisplayNames = useMemo(
    () => ({
      firstname: t("profile.staticField.firstName.name"),
      lastname: t("profile.staticField.lastName.name"),
      displayname: t("profile.staticField.displayname.name"),
      createdAt: t("profile.staticField.createdAt.name"),
      importfrom: t("profile.staticField.importfrom.name"),
      Message: t("profile.staticField.Message.name"),
      MessageRegex: t("profile.staticField.Message.name"),
      [AWAY_STATUS_FIELD_NAME_DENORMALIZED]: t(
        "profile.staticField.awayStatus.name"
      ),
      [HASHTAG_FIELD_NAME]: t("profile.staticField.hashtag.name"),
      Language: t("profile.staticField.language.name"),
      ConversationStatus: t("profile.staticField.ConversationStatus.name"),
    }),
    [i18n.language]
  );

  const fieldNameMapping = useMemo(
    () => ({
      displayName: t("profile.lists.grid.header.displayName"),
      tags: t("profile.lists.grid.header.label"),
      createdAt: t("profile.lists.grid.header.createdAt"),
      company: t("profile.lists.grid.header.company"),
      updatedAt: t("profile.lists.grid.header.updatedAt"),
      channels: t("profile.lists.grid.header.channels"),
    }),
    [i18n.language]
  );

  const conversationStatus = useMemo(
    () => ({
      open: t("chat.filter.status.open"),
      closed: t("chat.filter.status.closed"),
      snoozed: t("chat.filter.status.snoozed"),
    }),
    [i18n.language]
  );

  const getFieldDisplayNameLocale: (
    dict: CustomUserProfileFieldLingualsType[],
    defaultName: string
  ) => string = useCallback(
    (
      dict: CustomUserProfileFieldLingualsType[],
      defaultName: string
    ): string => {
      let languagePackLocale = dict.find((lang) =>
        new RegExp(lang.language, "i").test(i18n.language)
      );
      if (languagePackLocale) {
        return languagePackLocale.displayName;
      }

      let languagePackFallback = dict.find((lang) => /en/i.test(lang.language));
      return languagePackFallback?.displayName ?? defaultName;
    },
    [i18n.language]
  );

  const companyChannels = useCompanyChannels();
  const { profileDisplayName } = useProfileDisplayName();
  const { getProfileLastChannelName } = useChatChannelLocales();
  const { countryDialList } = useCountryDialList();
  const selectedTimeZone = useAppSelector((s) => s.selectedTimeZone);
  const companyFields = useAppSelector(
    (s) => s.company?.customUserProfileFields,
    equals
  );

  const cellValueFactory = (
    field: string | CustomProfileField,
    profile: ProfileSearchType
  ): any => {
    if (field === undefined) {
      console.error(`#cellValueFactory Undefined field `, field);
    }

    if (typeof field === "string") {
      switch (field) {
        case "id":
          return profile.id;
        case "displayName":
          return profileDisplayName(profile);
        case "pic":
          return profile.displayProfilePicture || "";
        case "tags":
          return profile.conversationHashtags ?? [];
        case "createdAt":
          return profile.createdAt;
        case "updatedAt":
          return profile.updatedAt;
        case "contactLists":
          return profile.contactLists;
        case "collaborators":
          return profile.collaborators;
      }
    }
    // seek in custom fields
    let value = "-";
    let foundProfileCustomField = undefined;
    if (typeof field === "string") {
      const companyField = companyFields?.find((cf) => {
        return cf.fieldName === field;
      });
      if (companyField) {
        const profileField = profile.customFields?.find(
          (pf) => pf.companyDefinedFieldId === companyField.id
        );
        foundProfileCustomField = profileField;
      }
    } else {
      foundProfileCustomField = (profile.customFields || []).find(
        (customField) => customField.companyDefinedFieldId === field.id
      );
    }

    const valueRaw = foundProfileCustomField?.value ?? "-";
    value = valueRaw;
    const lowerCaseFieldType =
      typeof field === "string"
        ? field.toLowerCase()
        : field.type.toLowerCase();

    if (lowerCaseFieldType === "datetime") {
      value =
        foundProfileCustomField && foundProfileCustomField.value
          ? moment
              .utc(foundProfileCustomField.value)
              .utcOffset(selectedTimeZone)
              .format("LLL")
          : "-";
    }
    if (lowerCaseFieldType === "date") {
      value =
        foundProfileCustomField && foundProfileCustomField.value
          ? moment
              .utc(foundProfileCustomField.value)
              .utcOffset(selectedTimeZone)
              .format("LL")
          : "-";
    }
    if (lowerCaseFieldType === "phonenumber" && foundProfileCustomField) {
      const findCountryCode = countryDialList.find((countryCode) => {
        const retrieveNum = valueRaw.substring(
          0,
          countryCode.callingCode.length
        );
        return retrieveNum === countryCode.callingCode;
      });
      if (findCountryCode) {
        const retrieveNum = valueRaw.substring(
          0,
          findCountryCode.callingCode.length
        );
        value = `+${retrieveNum} ${valueRaw.substring(
          findCountryCode.callingCode.length
        )}`;
      }
    }
    if (lowerCaseFieldType === "channel") {
      value =
        valueRaw === "-"
          ? valueRaw
          : getProfileLastChannelName(valueRaw, companyChannels, profile);
    }
    if (lowerCaseFieldType === "boolean") {
      const booleanDict = {
        true: t("profile.field.type.boolean.true"),
        false: t("profile.field.type.boolean.false"),
      };
      value = booleanDict[valueRaw.toLowerCase()] ?? "-";
    }

    return value;
  };

  return {
    staticFieldDisplayNames,
    listFieldsName: fieldNameMapping,
    conversationStatus,
    getFieldDisplayNameLocale,
    cellValueFactory,
  };
}
