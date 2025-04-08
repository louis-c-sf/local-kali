import React, { useEffect, useState, useCallback } from "react";
import { DropdownProps } from "semantic-ui-react";
import { DropdownType } from "../../../config/ContactTypeFieldMapping";
import { CustomProfileField } from "../../../types/ContactType";
import { ProfileType } from "../../../types/LoginType";
import { NewContactView } from "./NewContactView";
import { REQUIRED_PERSON_FIELDS } from "../validation/useValidateContact";
import { Moment } from "moment";
import { useTranslation } from "react-i18next";
import { useFieldLocales } from "../locaizable/useFieldLocales";
import { useAppSelector } from "../../../AppRootContext";
import { StaffType } from "../../../types/StaffType";
import { useEditContactApi } from "./useEditContactApi";
import { postWithExceptions, post } from "../../../api/apiRequest";
import { POST_PROFILE_UPDATE, POST_NEW_PROFILE } from "../../../api/apiPath";

export interface FieldValue {
  [key: string]: string;
}

function presentInDisplayedFields(fields: CustomProfileField[]) {
  return (entry: [string, any]) => {
    let keyLowered = entry[0].toLowerCase();
    if (["firstname", "lastname"].includes(keyLowered)) {
      return true;
    }
    return fields.some((field) => field.fieldName.toLowerCase() === keyLowered);
  };
}

export default function NewContact(props: {
  visible: boolean;
  hideForm: () => void;
  contactCreate: (hide: boolean | undefined) => void;
  profile: ProfileType;
  staffList: StaffType[];
  profileFields?: FieldValue;
  fieldFocusedName?: string;
}) {
  const { visible, hideForm, profileFields } = props;

  const [fieldValues, setFieldValues] = useState<FieldValue>({});
  const [fields, setFields] = useState<CustomProfileField[]>([]);
  const [topError, setTopError] = useState("");
  const [errorMessages, setErrorMessages] = useState<{
    [fieldName: string]: string;
  }>({});
  const [editMode, setIsEditMode] = useState(false);
  const { staffList, profile } = props;
  const company = useAppSelector((c) => c.company);

  const isAllowToDuplicateRedirect = useAppSelector(
    (s) =>
      s.company?.id !==
      process.env.REACT_APP_COMPANY_ID_NOT_ALLOW_DUPLICATE_REDIRECT
  );

  const editContactApi = useEditContactApi({
    onContactCreated: props.contactCreate,
    setGeneralErrorMessage: setTopError,
    editMode,
    hideForm,
    isAllowToDuplicateRedirect,
    profile,
    setErrorMessages,
    setFieldValues,
    gateway: {
      createContact: async (param) =>
        await post(POST_NEW_PROFILE, { param: [param] }),
      updateContact: async (id, updatePayload) =>
        await postWithExceptions(POST_PROFILE_UPDATE.replace("{id}", id), {
          param: updatePayload,
        }),
    },
  });

  const handleClose = () => {
    hideForm();
    if (!editMode) {
      setFieldValues({});
    }
  };
  const { t, i18n } = useTranslation();
  const { getFieldDisplayNameLocale } = useFieldLocales();

  useEffect(() => {
    const getFieldsDetails = async () => {
      const customUserProfileFields: CustomProfileField[] = (
        company?.customUserProfileFields ?? []
      )
        .filter(
          (userProfileField) =>
            userProfileField.isEditable && userProfileField.isVisible
        )
        .map((userProfileField) => {
          const localeLang =
            userProfileField.customUserProfileFieldLinguals.find((lang) =>
              new RegExp(lang.language, "i").test(i18n.language)
            );
          const returnVal = {
            id: userProfileField["id"],
            fieldName: userProfileField.fieldName,
            displayName: getFieldDisplayNameLocale(
              userProfileField.customUserProfileFieldLinguals,
              userProfileField.fieldName
            ),
            type: userProfileField.type.toLowerCase(),
            isDefault: userProfileField.isDefault,
            isDeletable: userProfileField.isDeletable,
            isVisible: userProfileField.isVisible,
            isEditable: userProfileField.isEditable,
            linguals: userProfileField.customUserProfileFieldLinguals,
            locale: localeLang?.language ?? i18n.language,
            order: userProfileField.order,
          };
          let fieldOptions =
            userProfileField.customUserProfileFieldOptions ?? [];
          return DropdownType.includes(userProfileField.type.toLowerCase())
            ? {
                ...returnVal,
                options: fieldOptions,
              }
            : returnVal;
        });

      setFields(customUserProfileFields);

      if (profileFields && Object.values(profileFields).length > 0) {
        setIsEditMode(true);
        // show and post only fields configured by API
        let displayedFieldEntries = Object.entries(profileFields).filter(
          presentInDisplayedFields(customUserProfileFields)
        );

        setFieldValues(Object.fromEntries(displayedFieldEntries));
      }
    };
    getFieldsDetails();
  }, [
    company && JSON.stringify([profileFields, company.customUserProfileFields]),
    i18n.language,
  ]);

  useEffect(() => {
    if (profileFields) {
      setIsEditMode(true);
      const displayedFieldEntries = Object.entries(profileFields).filter(
        presentInDisplayedFields(fields)
      );
      setFieldValues(Object.fromEntries(displayedFieldEntries));
    }
  }, [JSON.stringify(props.profileFields)]);

  const textFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const { value, id } = e.target;
    setFieldValues({
      ...fieldValues,
      [id]: value,
    });
  };
  const phoneNumberChange = useCallback(
    (fieldName: string, value: string) => {
      setFieldValues((fields) => {
        return {
          ...fields,
          [fieldName]: value,
        };
      });
    },
    [setFieldValues]
  );
  const textAreaFieldChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const { value, id } = e.target;
    setFieldValues({
      ...fieldValues,
      [id]: value,
    });
  };
  const selectOption = (
    e: React.SyntheticEvent,
    data: DropdownProps,
    labelName: string
  ) => {
    const { value } = data;
    setFieldValues({
      ...fieldValues,
      [labelName]: value as string,
    });
  };
  const radioChange = (
    e: React.FormEvent<HTMLInputElement>,
    fieldName: string,
    data: { checked: boolean }
  ) => {
    let newValue = data.checked ? "true" : "false";
    setFieldValues({
      ...fieldValues,
      [fieldName]: newValue,
    });
  };
  const handleDateTimeChange = (
    date: Moment | undefined,
    e: React.SyntheticEvent | undefined,
    fieldName: string
  ) => {
    setFieldValues({
      ...fieldValues,
      [fieldName]: date ? date.toISOString() : "",
    });
  };

  const personFieldsFilled = Object.keys(fieldValues).filter(
    (k) =>
      REQUIRED_PERSON_FIELDS.includes(k) &&
      fieldValues[k].toString().trim() !== ""
  );
  const isSubmittable = personFieldsFilled.length > 0 || editMode;

  return (
    <NewContactView
      editMode={editMode}
      topError={topError}
      errorMessages={errorMessages}
      fields={fields}
      fieldValues={fieldValues}
      handleClose={handleClose}
      handleDateTimeChange={handleDateTimeChange}
      handleSubmit={editContactApi.createContact}
      loading={editContactApi.loading}
      phoneNumberChange={phoneNumberChange}
      radioChange={radioChange}
      selectOption={selectOption}
      staffList={staffList}
      submittable={isSubmittable}
      textAreaFieldChange={textAreaFieldChange}
      textFieldChange={textFieldChange}
      updateContact={editContactApi.updateContact}
      visible={visible}
      fieldFocusedName={props.fieldFocusedName}
    />
  );
}
