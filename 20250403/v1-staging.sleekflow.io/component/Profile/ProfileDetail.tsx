import React from "react";
import { CustomProfileDetailFieldType } from "../../types/ContactType";
import moment from "moment";
import "react-datepicker/dist/react-datepicker.css";
import { when } from "../../utility/when";
import { parseAndFormatAnyPhone } from "../Channel/selectors";
import { useCurrentUtcOffset } from "../Chat/hooks/useCurrentUtcOffset";
import { DropdownType } from "../../config/ContactTypeFieldMapping";
import {
  CustomUserProfileFieldLingualsType,
  UserProfileFieldOptionsType,
} from "../../types/CompanyType";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../AppRootContext";
import styles from "./ProfileDetails.module.css";
import { ProfileDetailView } from "./ProfileDetailView";
import MessageContent from "../Chat/Records/MessageContent";
import { equals } from "ramda";

export default function ProfileDetail(props: {
  field: CustomProfileDetailFieldType;
  lastChannelName: string;
  isEditButtonEnabled?: boolean;
  getFieldDisplayNameLocale(
    dict: CustomUserProfileFieldLingualsType[],
    defaultName: string
  ): string;
}) {
  const { field, isEditButtonEnabled } = props;
  const utcOffset = useCurrentUtcOffset();
  const staffList = useAppSelector((s) => s.staffList, equals);
  const { t } = useTranslation();
  const loginDispatch = useAppDispatch();

  let textVal = "";
  if (field.fieldName.toLowerCase() === "phonenumber" && field.value) {
    textVal = `${parseAndFormatAnyPhone(field.value) ?? field.value}`;
  } else {
    textVal = field.value;
  }
  const type = field.type;
  if (type === "channel") {
    textVal = props.lastChannelName;
  } else if (DropdownType.includes(field.type)) {
    let optionsVal: {
      key: string | number;
      value: string;
      text: string;
    }[] = [];
    if (field.options && field.options && field.options.length > 0) {
      const userFieldsOptions = field.options as UserProfileFieldOptionsType[];
      optionsVal = userFieldsOptions.map((option) => {
        return {
          key: option.id,
          value: option.value,
          text: props.getFieldDisplayNameLocale(
            option.customUserProfileFieldOptionLinguals,
            option.value
          ),
        };
      });
    } else if (type === "travisuser") {
      optionsVal = staffList.map((staff) => {
        const { userInfo } = staff;
        return {
          key: userInfo.id,
          value: userInfo.id,
          text: userInfo.displayName,
        };
      });
    }
    const selectedVal = optionsVal.find(
      (optionVal) => optionVal.value === field.value
    );
    if (selectedVal) {
      textVal = (selectedVal.text as string) || "-";
    } else {
      textVal = "-";
    }
  }

  const booleanDict = {
    true: t("profile.field.type.boolean.true"),
    false: t("profile.field.type.boolean.false"),
  };
  const fieldFactory = when(field)
    // Skip undefined
    .match((f) => f === undefined)
    .then(() => "-")
    // Datetime
    .match((f) => f.type === "datetime")
    .then(
      () =>
        (textVal && moment(textVal).utcOffset(utcOffset).format("LLL")) || "-"
    )
    // Date
    .match((f) => f.type === "date")
    .then(
      () =>
        (textVal && moment(textVal).utcOffset(utcOffset).format("LL")) || "-"
    )
    // Yes/No
    .match((f) => f.type === "boolean")
    .then(() => booleanDict[textVal.toLowerCase()] ?? "-")
    .byDefault(() => textVal || "-");
  return (
    <ProfileDetailView
      name={field.displayName}
      value={
        <MessageContent
          message={fieldFactory.make()}
          contentClassName={styles.messageContent}
        />
      }
      t={t}
      isEditButtonEnabled={Boolean(isEditButtonEnabled)}
      loginDispatch={loginDispatch}
    />
  );
}
