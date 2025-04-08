import { CustomProfileField } from "../../../types/ContactType";
import { object, string, TestContext, ValidationError, Schema } from "yup";
import { FieldValue } from "../NewContact/NewContact";
import { useTranslation } from "react-i18next";
import { parseAndFormatAnyPhone } from "../../Channel/selectors";
import { TFunction } from "i18next";
import { useCallback } from "react";

interface ContactTestContext {
  phone: string | undefined;
  email: string | undefined;
}

export const REQUIRED_PERSON_FIELDS = ["Email", "PhoneNumber"];

export function useValidateContact() {
  const { t } = useTranslation();

  const validatePhone = useCallback(createPhoneValidator(t), []);
  const validateContactFields = useCallback(createFieldsValidator(t), []);
  return {
    validatePhone,
    validateContactFields,
  };
}

export function createPhoneValidator(t: TFunction) {
  return function (message?: string, allowEmpty: boolean = false) {
    return string().test(
      "phone-is-valid",
      message ?? t("form.profile.field.phone.error.format"),
      function (this: TestContext, value?: any) {
        if (!value) {
          if (!allowEmpty) {
            throw this.createError({ path: this.path, message });
          }
          return true;
        }
        const parsed = parseAndFormatAnyPhone(value as string);

        return parsed !== undefined;
      }
    );
  };
}

export function createFieldsValidator(t: TFunction) {
  const validatePhone = createPhoneValidator(t);

  return <T extends FieldValue>(
    fields: CustomProfileField[],
    options?: {
      initialFields: {
        email: string;
        phone: string;
      };
    }
  ) => {
    const contactSchema: Record<string, Schema<any>> = {
      firstname: string(),
      lastname: string(),
    };

    const phoneField = fields.find(isPhoneField);
    const emailField = fields.find(isEmailField);

    contactSchema.emailOrPhone = string()
      .ensure()
      .trim()
      .test("emails-or-phones", "", function (this: TestContext) {
        let context = this.options.context as ContactTestContext;

        let ignoreEmail = false;
        let ignorePhone = false;
        let initialEmptyPhone = true;
        let initialEmptyEmail = true;
        if (options?.initialFields) {
          const emailInitValue = options.initialFields.email;
          ignoreEmail = context.email === emailInitValue;
          initialEmptyEmail = !emailInitValue;

          const phoneInitValue = options?.initialFields.phone;
          ignorePhone = context.phone === phoneInitValue;
          initialEmptyPhone = !phoneInitValue;
        }

        if (ignoreEmail && ignorePhone) return true;

        if (!ignoreEmail && !ignorePhone) {
          const isBothEmpty = !context.email && !context.phone;
          if (isBothEmpty && initialEmptyEmail && initialEmptyPhone) {
            const emptyError = new ValidationError("", [], "emailOrPhone");
            emptyError.inner = [
              new ValidationError(
                t("form.profile.field.emailOrPhone.error.invalid"),
                [],
                "Email"
              ),
              new ValidationError(
                t("form.profile.field.emailOrPhone.error.invalid"),
                [],
                "PhoneNumber"
              ),
            ];
            throw emptyError;
          }
        }

        let emailIsFilled = string()
          .trim()
          .required()
          .isValidSync(context.email);
        let emailIsValid = string().email().isValidSync(context.email);
        let phoneIsFilled = string()
          .trim()
          .required()
          .isValidSync(context.phone);

        let phoneIsValid = string()
          .concat(
            validatePhone(t("form.profile.field.phone.error.format"), false)
          )
          .isValidSync(context.phone);

        const separateErrors = [];

        if (!ignorePhone) {
          if (phoneIsFilled && !phoneIsValid) {
            separateErrors.push(
              new ValidationError(
                t("form.profile.field.phone.error.format"),
                [],
                "PhoneNumber"
              )
            );
          }
          if (!phoneIsFilled && !initialEmptyPhone) {
            separateErrors.push(
              new ValidationError(
                t("form.error.default.required"),
                [],
                "PhoneNumber"
              )
            );
          }
        }

        if (!ignoreEmail) {
          if (emailIsFilled && !emailIsValid) {
            separateErrors.push(
              new ValidationError(
                t("form.profile.field.email.error.format"),
                [],
                "Email"
              )
            );
          }
          if (!emailIsFilled && !initialEmptyEmail)
            separateErrors.push(
              new ValidationError(t("form.error.default.required"), [], "Email")
            );
        }

        if (separateErrors.length > 0) {
          const validationError = new ValidationError(
            "BOTH",
            [],
            "emailOrPhone"
          );
          validationError.inner = separateErrors;
          throw validationError;
        }

        return true;
      });

    return async (values: T): Promise<T | {}> => {
      let emailValue = emailField && values[emailField.fieldName];
      let phoneValue = phoneField && values[phoneField.fieldName];

      return object()
        .shape(contactSchema)
        .validate(values, {
          context: {
            email: emailValue,
            phone: phoneValue,
          },
        });
    };
  };
}

export const isPhoneField = (field: { type: string; fieldName: string }) =>
  field.type.toLowerCase() === "phonenumber" &&
  field.fieldName === "PhoneNumber";

export const isEmailField = (field: { type: string; fieldName: string }) =>
  field.type.toLowerCase() === "email" && field.fieldName === "Email";
