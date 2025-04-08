import { CustomFieldTypeDict } from "types/ContactType";
import {
  UserProfileFieldOptionsType,
  CustomUserProfileFieldLingualsType,
} from "types/CompanyType";
import { UserProfileGroupType } from "container/Contact/Imported/UserProfileGroupType";
import { HashTagType } from "types/ConversationType";
import {
  AWAY_STATUS_TYPE,
  LANGUAGE_FIELD_TYPE,
  HASHTAG_FIELD_NAME,
} from "config/ProfileFieldMapping";
import { DropdownOptionType } from "component/Chat/ChannelFilterDropdown";
import { ConversationStatusMap } from "../contracts/FieldFactoryType";

export function FieldConfigInterpreter(
  fieldType: CustomFieldTypeDict | string,
  options: UserProfileFieldOptionsType[],
  lists: UserProfileGroupType[],
  hashtags: HashTagType[],
  getFieldDisplayNameLocale: (
    dict: CustomUserProfileFieldLingualsType[],
    defaultName: string
  ) => string,
  conversationStatus: ConversationStatusMap
) {
  return {
    fieldType,
    isUserLanguage() {
      return "userlanguage" === fieldType.toLowerCase();
    },
    isString() {
      return [
        "singlelinetext",
        "multilinetext",
        "phonenumber",
        "number",
      ].includes(fieldType.toLowerCase());
    },
    isEmail() {
      return "email" === fieldType.toLowerCase();
    },
    isDate() {
      return ["datetime", "date"].includes(fieldType.toLowerCase());
    },

    isChoice() {
      return this.isStaff() || "options" === fieldType.toLowerCase();
    },

    isBoolean() {
      return ["boolean"].includes(fieldType.toLowerCase());
    },

    isChannel() {
      return ["channel", "channelcondition"].includes(fieldType.toLowerCase());
    },

    isUserGroup() {
      return ["importfrom"].includes(fieldType.toLowerCase());
    },

    isAwayStatus() {
      return fieldType === AWAY_STATUS_TYPE;
    },

    isConversationStatus() {
      return fieldType === "ConversationStatus";
    },

    isKeywords() {
      return ["keywords"].includes(fieldType.toLowerCase());
    },

    isStaff() {
      return fieldType.toLowerCase() === "travisuser";
    },

    isHashtag() {
      return fieldType === HASHTAG_FIELD_NAME;
    },

    isLanguageField() {
      return fieldType === LANGUAGE_FIELD_TYPE;
    },

    getConditionValueChoices(): DropdownOptionType[] {
      switch (true) {
        case this.isString():
          return [];

        case this.isUserGroup():
          return lists.map((list, i) => ({
            text: list.importName,
            value: String(list.id),
            key: i,
          }));

        case this.isHashtag():
          return hashtags.map((tag, i) => ({
            text: tag.hashtag,
            value: tag.hashtag,
            key: i,
          }));

        case this.isConversationStatus():
          return [
            { value: "open", text: conversationStatus["open"], key: 1 },
            { value: "snoozed", text: conversationStatus["snoozed"], key: 2 },
            { value: "closed", text: conversationStatus["closed"], key: 3 },
          ];

        case this.isChannel():
          // Channel options are created inside ChannelsValueDropdown"
          return [];

        default:
          return options.map((option, i) => {
            return {
              text: getFieldDisplayNameLocale(
                option.customUserProfileFieldOptionLinguals,
                option.value
              ),
              value: option.value,
              key: i,
            };
          });
      }
    },

    isRegex() {
      return fieldType === "regex";
    },
  };
}

export class FieldBuilderError extends Error {}

export type FieldConfigInterpreterType = ReturnType<
  typeof FieldConfigInterpreter
>;
