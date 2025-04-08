import { TFunction } from "i18next";
import { object, string, array } from "yup";
import { getMatchedVariables } from "lib/utility/getMatchedVariables";
import { parseAndFormatAnyPhone } from "component/Channel/selectors";
import {
  CloudAPITemplateFormValue,
  CloudAPIHeaderExampleFormValueType,
  URL_VARIABLE_TOKEN,
} from "component/Settings/SettingTemplates/CloudApi/EditTemplate";

export const schemaForBodyText = (t: TFunction) =>
  string()
    .required(t("settings.template.field.error.content.empty"))
    .max(
      1024,
      t("settings.template.field.error.content.maxLength", {
        interpolation: { skipOnVariables: true },
      })
    )
    .test("content text error", "content text error", function (value: string) {
      if (!value) return false;
      const matchedPatterns = getMatchedVariables(value);
      if (matchedPatterns.length > 0) {
        const errArr = matchedPatterns
          .map((pattern, index) => {
            const namedPattern = pattern.groups?.pattern!;
            const patternIndex = +namedPattern;
            if (namedPattern.trim() === "") {
              return t("settings.template.field.error.content.missingValue");
            }
            if (isNaN(patternIndex)) {
              return `${t(
                "settings.template.field.error.content.invalidValue"
              )}{{${namedPattern}}}`;
            }
            if (index + 1 !== patternIndex) {
              return `${t(
                "settings.template.field.error.content.invalidSequence"
              )}{{${namedPattern}}}`;
            }
          })
          .filter((err) => !!err);
        if (errArr.length > 0) {
          return this.createError({ message: errArr[0] });
        } else {
          return true;
        }
      }
      return true;
    })
    .test(
      "variable error",
      t("settings.template.field.error.content.variablePosition"),
      function (value: string) {
        if (!value) return false;
        const matchedPatterns = getMatchedVariables(value);
        if (matchedPatterns.length > 0) {
          const firstPattern = matchedPatterns[0];
          const lastPattern = matchedPatterns[matchedPatterns.length - 1];
          if (firstPattern.index === 0) {
            return false;
          }
          if (
            (lastPattern?.index || 0) + lastPattern[0].length ===
            value.length
          ) {
            return false;
          }
          return true;
        }
        return true;
      }
    );

const schemaForValue = (t: TFunction) =>
  object({
    name: string()
      .matches(
        /^[(0-9|a-z|_)]+$/,
        t("settings.template.field.error.templateNameEmpty")
      )
      .required(t("settings.template.field.error.templateNameEmpty")),
    header: object().shape({
      text: string()
        .max(60, t("settings.template.field.error.header.maxLength"))
        .test(
          "text is required",
          t("settings.template.field.error.text.empty"),
          function (value) {
            const context = this.options.context as CloudAPITemplateFormValue;
            if (context.header?.format !== "TEXT") return true;
            return !!value;
          }
        ),
    }),
    body: object()
      .shape({
        text: schemaForBodyText(t),
      })
      .required(t("settings.template.field.error.content.empty")),
    footer: object().shape({
      text: string().max(
        60,
        t("settings.template.field.error.footer.maxLength")
      ),
    }),
    buttons: object().shape({
      buttons: array().of(
        object().shape({
          buttonType: string().test(
            "check button type",
            "check button type",
            function (v) {
              const context = this.options.context as CloudAPITemplateFormValue;
              const buttonsType = context.buttons?.buttons?.map((btn) =>
                btn.type === "CALL_TO_ACTION" ? btn.buttonType : undefined
              );
              const urlCount = (buttonsType ?? []).filter(
                (type) => type === "URL"
              ).length;
              if (urlCount > 1) {
                return this.createError({
                  message: t("settings.template.field.error.url.duplicate"),
                });
              }
              const phoneNumberCount =
                buttonsType?.filter((type) => type === "PHONE_NUMBER").length ||
                0;
              if (phoneNumberCount > 1) {
                return this.createError({
                  message: t(
                    "settings.template.field.error.phoneNumber.duplicate"
                  ),
                });
              }
              return true;
            }
          ),
          text: string().required(
            t("settings.template.field.error.text.empty")
          ),
          url: string().when("buttonType", {
            is: (val) => val === "URL",
            then: string()
              .trim()
              .transform((currentValue) =>
                currentValue.replace(URL_VARIABLE_TOKEN, "")
              )
              .required(t("settings.template.field.error.url.empty"))
              .url(t("settings.template.field.error.url.invalidFormat")),
          }),
          phone_number: string().when("buttonType", {
            is: (val) => val === "PHONE_NUMBER",
            then: string()
              .trim()
              .required(t("settings.template.field.error.phoneNumber.empty"))
              .test(
                "check phone number",
                t("settings.template.field.error.phoneNumber.invalidFormat"),
                function (v: string) {
                  return !!parseAndFormatAnyPhone(v);
                }
              ),
          }),
        })
      ),
    }),
  });

const schemaForSample = (t: TFunction) =>
  object().shape({
    header: object().shape({
      example: object().test(
        "sample is required",
        t("settings.template.field.error.sample.empty"),
        function (
          value: CloudAPIHeaderExampleFormValueType | undefined
        ): boolean {
          const context = this.options.context as CloudAPITemplateFormValue;
          const format = context.header?.format;
          if (!format || format === "TEXT") return true;
          return !!value?.header_handle?.length;
        }
      ),
    }),
    body: object().shape({
      example: object().shape({
        body_text: array().test(
          "variable is required",
          t("settings.template.field.error.variable.empty"),
          function (value: { [key: string]: string }[] | undefined): boolean {
            if (!value) return true;
            const variableSamples = value?.[0];
            const isAllFilled = Object.keys(variableSamples).every(
              (key) => !!variableSamples[key]
            );
            return isAllFilled;
          }
        ),
      }),
    }),
    buttons: object().shape({
      buttons: array().of(
        object().shape({
          example: array().when("url", (url: string) => {
            if (!url || !url.includes(URL_VARIABLE_TOKEN)) {
              return array();
            }
            return array()
              .of(
                string()
                  .trim()
                  .required(t("settings.template.field.error.url.empty"))
                  .url(t("settings.template.field.error.url.invalidFormat"))
              )
              .required(t("settings.template.field.error.url.empty"))
              .min(1, t("settings.template.field.error.url.empty"));
          }),
        })
      ),
    }),
  });

export const editTemplateSchemaMap = {
  0: schemaForValue,
  1: schemaForSample,
};
