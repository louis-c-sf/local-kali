import React, { useEffect, useMemo } from "react";
import { CustomProfileDetailFieldType } from "../../types/ContactType";
import ProfileDetail from "./ProfileDetail";
import { useTranslation } from "react-i18next";
import { useFieldLocales } from "../Contact/locaizable/useFieldLocales";
import useCompanyChannels from "../Chat/hooks/useCompanyChannels";
import { useChatChannelLocales } from "../Chat/localizable/useChatChannelLocales";
import { isNotLabelsColumn } from "../../container/Contact/hooks/useCustomProfileFields";
import { useAppDispatch, useAppSelector } from "../../AppRootContext";
import { equals } from "ramda";
import styles from "./ProfileDetails.module.css";
import { ProfileDetailView } from "./ProfileDetailView";

export default ProfileDetails;

function ProfileDetails(props: {
  updateCustomFields: (fields: Record<string, string>) => void;
  showHeader?: boolean;
  isEditButtonEnabled: boolean;
}) {
  const { updateCustomFields, showHeader } = props;
  const companyCustomUserProfileFields = useAppSelector(
    (s) => s.company?.customUserProfileFields ?? [],
    equals
  );
  const profile = useAppSelector((s) => s.profile, equals);
  const isUpdateProfile = useAppSelector((s) => s.isUpdateProfile);
  const loginDispatch = useAppDispatch();

  const { t, i18n } = useTranslation();
  const companyChannels = useCompanyChannels();
  const { getFieldDisplayNameLocale } = useFieldLocales();
  const { getProfileLastChannelName } = useChatChannelLocales();

  const profileDetails = useMemo(() => {
    if (!profile.id) {
      return [];
    }
    let customUserProfileFields: CustomProfileDetailFieldType[] = [];
    for (let i = 0; i < companyCustomUserProfileFields.length; i++) {
      const userProfileField = companyCustomUserProfileFields[i];
      const customFieldValue = (profile.customFields || []).find(
        (field) => field.companyDefinedFieldId === userProfileField.id
      );
      const localeLangIndex =
        userProfileField.customUserProfileFieldLinguals.findIndex((lang) =>
          new RegExp(lang.language, "i").test(i18n.language)
        );
      const displayFieldName = getFieldDisplayNameLocale(
        userProfileField.customUserProfileFieldLinguals,
        userProfileField.fieldName
      );
      customUserProfileFields = [
        ...customUserProfileFields,
        {
          id: userProfileField["id"],
          fieldName: userProfileField.fieldName,
          displayName: displayFieldName,
          value: (customFieldValue && customFieldValue.value) || "",
          options: userProfileField.customUserProfileFieldOptions,
          type: userProfileField.type.toLowerCase(),
          isVisible: userProfileField.isVisible,
          isEditable: userProfileField.isEditable,
          isDefault: userProfileField.isDefault,
          isDeletable: userProfileField.isDeletable,
          linguals: userProfileField.customUserProfileFieldLinguals,
          locale:
            localeLangIndex > -1
              ? userProfileField.customUserProfileFieldLinguals[localeLangIndex]
                  .language
              : i18n.language,
          order: userProfileField.order,
        },
      ];
    }
    return customUserProfileFields;
  }, [
    JSON.stringify([
      profile.customFields,
      profile.id,
      companyCustomUserProfileFields,
    ]),
    isUpdateProfile,
  ]);

  useEffect(() => {
    let customFieldsValue = {};
    for (let i = 0; i < profileDetails.length; i++) {
      customFieldsValue[profileDetails[i].fieldName] = profileDetails[i].value;
    }
    updateCustomFields(customFieldsValue);
  }, [profileDetails]);

  return (
    <div className={styles.wrap}>
      <div className={styles.details}>
        {showHeader && (
          <header className={styles.sectionHeader}>
            {t("chat.sidebar.profile.header")}
          </header>
        )}
        <ProfileDetailView
          name={t("profile.field.firstName.label")}
          value={profile.firstName}
          t={t}
          isEditButtonEnabled={Boolean(props.isEditButtonEnabled)}
          loginDispatch={loginDispatch}
        />

        <ProfileDetailView
          name={t("profile.field.lastName.label")}
          value={profile.lastName || "-"}
          t={t}
          isEditButtonEnabled={Boolean(props.isEditButtonEnabled)}
          loginDispatch={loginDispatch}
        />
        {profileDetails
          .filter((field) => field.isVisible && isNotLabelsColumn(field))
          .map((field) => (
            <ProfileDetail
              key={field.id}
              field={field}
              getFieldDisplayNameLocale={getFieldDisplayNameLocale}
              lastChannelName={getProfileLastChannelName(
                field.value || profile.lastChannel,
                companyChannels,
                profile
              )}
              isEditButtonEnabled={field.isEditable}
            />
          ))}
      </div>
    </div>
  );
}
