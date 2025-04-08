import { NewContactType, CustomProfileField } from "../../../types/ContactType";
import { CreateProfileCustomExcludedFieldConfig } from "../../../config/ProfileFieldMapping";
import { FieldValue } from "./NewContact";
import {
  useValidateContact,
  isEmailField,
  isPhoneField,
} from "../validation/useValidateContact";
import { useCustomProfileFields } from "../../../container/Contact/hooks/useCustomProfileFields";
import { ProfileType } from "../../../types/LoginType";
import { useState } from "react";
import { useFlashMessageChannel } from "../../BannerMessage/flashBannerMessage";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import useRouteConfig from "../../../config/useRouteConfig";
import { useAppDispatch } from "../../../AppRootContext";
import mixpanel from "mixpanel-browser";
import { ValidationError } from "yup";

export function useEditContactApi(props: {
  editMode: boolean;
  isAllowToDuplicateRedirect: boolean;
  setErrorMessages: (errors: Record<string, any>) => void;
  setFieldValues: (values: Record<string, string>) => void;
  setGeneralErrorMessage: (error: string) => void;
  onContactCreated: (keepVisible: undefined | boolean) => void;
  hideForm: () => void;
  profile: ProfileType;
  gateway: {
    createContact: (param: NewContactType) => Promise<ProfileType>;
    updateContact: (id: string, param: NewContactType) => Promise<ProfileType>;
  };
}) {
  const customProfileFields = useCustomProfileFields();
  const { validateContactFields } = useValidateContact();
  const [loading, isLoading] = useState(false);
  const flash = useFlashMessageChannel();
  const { t } = useTranslation();
  const history = useHistory();
  const routeConfig = useRouteConfig();
  const loginDispatch = useAppDispatch();

  const initEmail =
    props.profile.customFields.find((fv) => {
      const fieldId = customProfileFields.fields.find(isEmailField)?.id;
      return fieldId ? fv.companyDefinedFieldId === fieldId : undefined;
    })?.value ?? "";

  const initPhone =
    props.profile.customFields.find((fv) => {
      const fieldId = customProfileFields.fields.find(isPhoneField)?.id;
      return fieldId ? fv.companyDefinedFieldId === fieldId : undefined;
    })?.value ?? "";

  const createContact = async (
    fieldValues: Record<string, string>,
    keepVisible?: boolean
  ) => {
    if (fieldValues["Subscriber"] === undefined) {
      fieldValues["Subscriber"] = "true";
    }
    const valuesValidated = await preValidateForm(fieldValues, {
      initPhone,
      initEmail,
    });

    if (valuesValidated === undefined) {
      return;
    }

    const param = buildContactPayload(valuesValidated);

    try {
      isLoading(true);
      await props.gateway.createContact(param);
      if (!keepVisible) {
        props.hideForm();
      }
      props.setFieldValues({});
      flash(t("flash.profile.created"));
      mixpanel.track("Contact Created");
      props.onContactCreated(keepVisible);
      props.setGeneralErrorMessage("");
    } catch (e) {
      const errStr = e.message;
      console.error(`save contact error ${e}`);
      try {
        const errJSON = JSON.parse(errStr);
        errorHandling(errJSON["message"], errJSON["userProfileId"]);
      } catch (err) {
        errorHandling(errStr);
      }
    } finally {
      isLoading(false);
    }
  };

  const errorHandling = (errMsg: string, userProfileId?: string) => {
    const BACKEND_DUPLICATE_ERROR = "Duplicated PhoneNumber";
    if (errMsg === BACKEND_DUPLICATE_ERROR) {
      props.setErrorMessages({
        PhoneNumber: t("form.profile.field.phone.error.duplicate"),
      });
      flash(t("flash.contact.duplicated"));
      props.setGeneralErrorMessage("");
      if (userProfileId && props.isAllowToDuplicateRedirect) {
        history.push(routeConfig.routeTo(`/profile/${userProfileId}`));
        return;
      }
    } else {
      props.setGeneralErrorMessage(errMsg);
    }
  };

  const updateContact = async (fieldValues: Record<string, string>) => {
    const valuesValidated = await preValidateForm(fieldValues, {
      initEmail,
      initPhone,
    });

    if (valuesValidated === undefined) {
      return;
    }

    const param = buildContactPayload(valuesValidated);

    try {
      isLoading(true);
      let profileUpdate: ProfileType = props.profile;

      const result = await props.gateway.updateContact(props.profile.id, param);
      profileUpdate = { ...profileUpdate, ...result };
      mixpanel.track("Contact Updated");

      props.hideForm();
      props.setGeneralErrorMessage("");
      props.setErrorMessages({});

      loginDispatch({
        type: "PROFILE_UPDATED",
        profile: {
          ...profileUpdate,
        },
      });

      if (props.editMode) {
        flash(t("flash.profile.updated"));
      }
      mixpanel.track("Contact Updated");
      props.onContactCreated(undefined);
    } catch (e) {
      const errStr = e.message;
      console.error(`save contact error ${e}`);
      try {
        const errJSON = JSON.parse(errStr);
        errorHandling(errJSON["message"]);
      } catch (err) {
        errorHandling(errStr);
      }
    } finally {
      isLoading(false);
    }
  };

  async function preValidateForm(
    fieldValues: FieldValue,
    options: {
      initEmail: string;
      initPhone: string;
    }
  ) {
    let valuesValidated: FieldValue;
    try {
      valuesValidated = await validateContactFields(
        customProfileFields.fields,
        {
          initialFields: { email: options.initEmail, phone: options.initPhone },
        }
      )(fieldValues);
      props.setErrorMessages({});
      return valuesValidated;
    } catch (e) {
      let messages: { [k: string]: string };
      if (e.inner && e.inner.length > 0) {
        messages = e.inner.reduce(
          (acc: { [k: string]: string }, next: ValidationError) => {
            return { ...acc, [next.path]: next.message };
          },
          {}
        );
      } else if (e.path) {
        messages = { [e.path]: e.message };
      } else {
        messages = { general: String(e) };
        console.error(e);
      }
      props.setErrorMessages(messages);
      document.getElementById(`${e.path}`)?.scrollIntoView();
    }
  }

  function buildContactPayload(valuesValidated: FieldValue) {
    let param: NewContactType = {};
    if (customProfileFields.fields.length > 0) {
      if (valuesValidated["PhoneNumber"]) {
        param = {
          ...param,
          whatsAppPhoneNumber: valuesValidated["PhoneNumber"],
        };
      }
      if (valuesValidated["Email"]) {
        param = {
          ...param,
          email: valuesValidated["Email"],
        };
      }
      const userProfileFields = Object.keys(valuesValidated)
        .filter(
          (key) =>
            !CreateProfileCustomExcludedFieldConfig.find(
              (field) => key.toLowerCase() === field.toLowerCase()
            )
        )
        .map((fieldName) => ({
          customFieldName: fieldName || "",
          customValue: valuesValidated[fieldName],
          customFieldId: customProfileFields.fields.find(
            (f) => f.fieldName === fieldName
          )?.id,
        }))
        .filter((f) => f.customFieldId !== undefined);
      param = {
        ...param,
        lastName: valuesValidated["lastName"] ?? "",
        firstName: valuesValidated["firstName"] ?? "",
        userProfileFields,
      };
    }
    return param;
  }

  return {
    createContact,
    updateContact,
    loading,
  };
}
