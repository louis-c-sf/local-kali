import React, { useEffect, useState } from "react";
import { Dimmer, Dropdown, Form, Input, Loader } from "semantic-ui-react";
import { BackNavLink } from "component/shared/nav/BackNavLink";
import { Trans, useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import useRouteConfig from "config/useRouteConfig";
import { PreviewContent } from "../PreviewContent";
import { useFormik, validateYupSchema, yupToFormErrors } from "formik";
import { useHistory } from "react-router";
import {
  CategoryEnum,
  HeaderFormatEnum,
  isBodyType,
  isButtonType,
  isFooterType,
  isHeaderType,
  LanguagesMapping,
} from "types/WhatsappTemplateResponseType";
import {
  CreateTemplateCategoryEnum,
  TemplateComponentType,
  TemplateContentType,
  SampleHeaderHandleType,
  ComponentExampleType,
} from "features/WhatsappCloudAPI/models/WhatsappCloudAPITemplateType";
import { FieldError } from "component/shared/form/FieldError";
import styles from "./SettingCloudApiTemplates.module.css";
import { Button } from "component/shared/Button/Button";
import TemplateQuickReplyButton from "../TemplateQuickReplyButton";
import SettingTemplateCallActionButton from "../Twilio/SettingTemplateCallActionButton";
import { postCreateTemplate } from "api/CloudAPI/postCreateTemplate";
import { putUpdateTemplate } from "api/CloudAPI/putUpdateTemplate";
import { fetchTemplates } from "api/CloudAPI/fetchTemplates";
import { useFlashMessageChannel } from "component/BannerMessage/flashBannerMessage";
import DemoAccountModal from "../DemoAccountModal/DemoAccountModal";
import { useFeaturesGuard } from "../../hooks/useFeaturesGuard";
import { parseHttpError } from "api/apiRequest";
import AddSampleContentModal from "../AddSampleContentModal";
import { getMatchedVariables } from "lib/utility/getMatchedVariables";
import { HeaderActions } from "component/Settings/SettingTemplates/CloudApi/HeaderActions";
import { editTemplateSchemaMap } from "component/Settings/SettingTemplates/CloudApi/EditTemplate/editTemplateSchemaMap";

export const URL_VARIABLE_TOKEN = "/{{1}}";

function isCloudAPIActionButtonFormValueType(
  value: CloudAPIButtonFormValueType
): value is CloudAPIActionButtonFormValueType {
  return value.type === "CALL_TO_ACTION";
}

type CloudAPIQuickReplyButtonFormValueType = {
  type: "QUICK_REPLY";
  text: string;
};

export type CloudAPIActionButtonFormValueType = {
  type: "CALL_TO_ACTION";
  buttonType: "URL" | "PHONE_NUMBER";
  url?: string;
  text: string;
  phone_number?: string;
};

type CloudAPIButtonFormValueType =
  | CloudAPIQuickReplyButtonFormValueType
  | CloudAPIActionButtonFormValueType;

export type CloudAPIButtonFormValue = {
  type: "BUTTONS";
  buttons?: Array<CloudAPIButtonFormValueType>;
};

export type CloudAPIHeaderExampleFormValueType = {
  readUrl?: string[];
} & ComponentExampleType;

export type CloudAPIHeaderFormValueType = {
  type: "HEADER";
  format?: HeaderFormatEnum;
  text?: string;
  example?: CloudAPIHeaderExampleFormValueType;
};

export type CloudAPITemplateFormValue = {
  name: string;
  category: CreateTemplateCategoryEnum | CategoryEnum;
  language: string;
  header: CloudAPIHeaderFormValueType;
  body: TemplateComponentType;
  buttons: CloudAPIButtonFormValue;
  footer: TemplateComponentType;
};

export const getCategory = (t: TFunction) => [
  {
    value: "UTILITY",
    text: t("settings.template.category.transactional"),
    content: (
      <div className={styles.categoryOpt}>
        <div className={styles.categoryOptTitle}>
          {t("settings.template.category.transactional")}
        </div>
        <div className={styles.categoryOptDesc}>
          {t("settings.template.category.transactionalDescriptions")}
        </div>
        <div className={styles.categoryOptExample}>
          {t("settings.template.category.transactionalExample")}
        </div>
      </div>
    ),
  },
  {
    value: "MARKETING",
    text: t("settings.template.category.marketing"),
    content: (
      <div className={styles.categoryOpt}>
        <div className={styles.categoryOptTitle}>
          {t("settings.template.category.marketing")}
        </div>
        <div className={styles.categoryOptDesc}>
          {t("settings.template.category.marketingDescriptions")}
        </div>
        <div className={styles.categoryOptExample}>
          {t("settings.template.category.marketingExample")}
        </div>
      </div>
    ),
  },
  {
    value: "AUTHENTICATION",
    text: t("settings.template.category.otp"),
    content: (
      <div className={styles.categoryOpt}>
        <div className={styles.categoryOptTitle}>
          {t("settings.template.category.otp")}
        </div>
        <div className={styles.categoryOptDesc}>
          {t("settings.template.category.otpDescriptions")}
        </div>
        <div className={styles.categoryOptExample}>
          {t("settings.template.category.otpExample")}
        </div>
      </div>
    ),
  },
];

export const getHeaderOpt = (t: TFunction) => [
  { value: "NONE", text: t("settings.template.headerType.none") },
  { value: "TEXT", text: t("settings.template.headerType.text") },
  { value: "IMAGE", text: t("settings.template.headerType.image") },
  { value: "VIDEO", text: t("settings.template.headerType.video") },
  { value: "DOCUMENT", text: t("settings.template.headerType.document") },
];

const getButtonOpt = (t: TFunction) => [
  { value: "NONE", text: t("settings.template.buttonType.none") },
  {
    value: "QUICK_REPLY",
    text: t("settings.template.buttonType.quickReply.text"),
  },
  {
    value: "CALL_TO_ACTION",
    text: t("settings.template.buttonType.callToAction.text"),
  },
];

const getButtonLimit = (type: string) => {
  const buttonLimitMap = { QUICK_REPLY: 3, CALL_TO_ACTION: 2 };
  return buttonLimitMap[type] || 0;
};

export const initValue: CloudAPITemplateFormValue = {
  name: "",
  category: "UTILITY",
  language: "en",
  header: { type: "HEADER" },
  body: { type: "BODY", text: "" },
  buttons: {
    type: "BUTTONS",
  },
  footer: {
    type: "FOOTER",
    text: "",
  },
};

export const getIsRequiredSample = (
  message: string = "",
  headerFormat?: string,
  buttons?: CloudAPIButtonFormValueType[]
): boolean => {
  const hasMediaHeader = ["IMAGE", "VIDEO", "DOCUMENT"].includes(
    headerFormat || ""
  );
  const matchedVariables = getMatchedVariables(message);
  const isDynamicUrl = buttons?.find(
    (button) =>
      isCloudAPIActionButtonFormValueType(button) &&
      button.url?.includes(URL_VARIABLE_TOKEN)
  );
  return hasMediaHeader || !!matchedVariables.length || !!isDynamicUrl;
};

export default function EditTemplate(props: {
  templateId: string;
  wabaId: string;
  phone: string;
}) {
  const [loading, setLoading] = useState(true);
  const [showDemoAccountModal, setShowDemoAccountModal] = useState(false);
  const { t } = useTranslation();
  const { routeTo } = useRouteConfig();
  const history = useHistory();
  const flash = useFlashMessageChannel();
  const isCreateStatus = props.templateId === "create";
  const featureGuard = useFeaturesGuard();
  const [openSampleModal, setOpenSampleModal] = useState(false);
  const [validateStep, setValidateStep] = useState<0 | 1>(0);
  const [isRequiredSample, setIsRequiredSample] = useState(false);
  const getErrorMessageMapping = (code: number, language: string) => {
    const errorMessageMapping = {
      2388042: t("settings.template.cloudApi.createError.contentFieldInvalid"),
      2388081: t("settings.template.cloudApi.createError.linkInvalid"),
      2388043: t(
        "settings.template.cloudApi.createError.contentFieldExpectedMissing"
      ),
      2388023: t(
        "settings.template.cloudApi.createError.languageDeletedMakeContentInvalid",
        {
          language: language,
        }
      ),
      2388024: t("settings.template.cloudApi.createError.templateExisting", {
        language: language,
      }),
      2388025: t(
        "settings.template.cloudApi.createError.languageDeletedMakeCategoryInvalid",
        {
          language: language,
        }
      ),
      2388026: t("settings.template.cloudApi.createError.categoryNotMapping"),
      2388044: t("settings.template.cloudApi.createError.componentInvalid"),
    };
    return errorMessageMapping[code];
  };

  const form = useFormik<CloudAPITemplateFormValue>({
    validateOnBlur: false,
    validateOnChange: false,
    initialValues: initValue,
    onSubmit: async (values) => {
      try {
        if (!featureGuard.canCreateTemplate()) {
          setShowDemoAccountModal(true);
          return;
        }

        if (isRequiredSample && validateStep === 0) {
          setOpenSampleModal(true);
          setValidateStep(1);
          return;
        }

        const { name, language, category, header, body, footer, buttons } =
          values;
        if (isCreateStatus) {
          const buttonsList = buttons.buttons?.map((btn) => {
            if (btn.type === "CALL_TO_ACTION") {
              const { buttonType, url, phone_number, text } = btn;
              return {
                type: buttonType,
                url: url || undefined,
                phone_number: phone_number || undefined,
                example: url ? [url] : undefined,
                text,
              };
            }
            return { type: btn.type, text: btn.text };
          });
          const headerExample = header.example
            ? {
                header_text: header?.example.header_text,
                body_text: header?.example.body_text,
                header_url: header?.example.header_url,
                header_handle: header?.example.header_handle,
              }
            : undefined;
          const template: TemplateContentType = {
            name,
            language,
            category,
            components: [
              body,
              ...(header.format ? [{ ...header, example: headerExample }] : []),
              ...(footer.text ? [footer] : []),
              ...(buttons.buttons?.length
                ? [{ type: buttons.type, buttons: buttonsList }]
                : []),
            ],
          };
          await postCreateTemplate(props.wabaId, template);
        } else {
          const buttonsList = buttons.buttons?.map((btn) => {
            if (btn.type === "CALL_TO_ACTION") {
              const { buttonType, url, phone_number, text } = btn;
              return {
                type: buttonType,
                url: url || undefined,
                phone_number: phone_number || undefined,
                example: url ? [url] : undefined,
                text,
              };
            }
            return { type: btn.type, text: btn.text };
          });

          const templateComponents: TemplateComponentType[] = [
            body,
            ...(header.format ? [header] : []),
            ...(footer.text ? [footer] : []),
            ...(buttons.buttons?.length
              ? [{ type: buttons.type, buttons: buttonsList }]
              : []),
          ];
          await putUpdateTemplate(
            props.wabaId,
            props.templateId,
            templateComponents
          );
        }
        flash(t("flash.template.save.success"));
        history.push(routeTo("/settings/templates"));
      } catch (err) {
        const errorMsg = parseHttpError(err);
        if (typeof errorMsg === "string") {
          if (
            errorMsg.includes("Template with the same name already exists.")
          ) {
            form.setFieldError(
              "templateName",
              t("settings.template.field.error.duplicatedName")
            );
          }
        }

        if (typeof errorMsg === "object" && errorMsg.errorCode === 6001) {
          const errorSubCode =
            errorMsg.errorContext?.output.error_context.error.error_subcode;
          const flashContent =
            errorSubCode &&
            getErrorMessageMapping(errorSubCode, values.language);
          flash(flashContent);
        } else {
          flash(t("flash.template.save.failed"));
        }
        console.error(err);
      }
    },
    validate: (value) => {
      try {
        validateYupSchema(
          value,
          editTemplateSchemaMap[validateStep](t),
          true,
          value
        );
      } catch (err) {
        return yupToFormErrors(err);
      }
      return {};
    },
  });
  const addButton = () => {
    const buttonArr = form.values.buttons.buttons;
    if (!buttonArr || buttonArr.length >= getButtonLimit(buttonArr[0].type)) {
      return;
    }
    if (buttonArr[0].type === "CALL_TO_ACTION") {
      form.setFieldValue("buttons.buttons", [
        ...buttonArr,
        {
          type: buttonArr[0].type,
          text: "",
          buttonType:
            buttonArr[0].buttonType === "URL" ? "PHONE_NUMBER" : "URL",
        },
      ]);
    } else {
      form.setFieldValue("buttons.buttons", [
        ...buttonArr,
        {
          type: buttonArr[0].type,
          text: "",
        },
      ]);
    }
  };

  const removeButton = (btnIndex: number) => () => {
    const buttonArr = form.values.buttons.buttons;
    if (!buttonArr) {
      return;
    }
    const filteredBtn = buttonArr.filter((b, i) => i !== btnIndex);
    if (filteredBtn.length === 0) {
      form.setFieldValue("buttons", { type: "BUTTON" });
    } else {
      form.setFieldValue("buttons.buttons", filteredBtn);
    }
  };

  const updateHeaderSample = (headerHandle: SampleHeaderHandleType) => {
    form.setFieldValue("header", {
      ...form.values.header,
      example: {
        header_handle: [headerHandle.headerHandle],
        readUrl: [headerHandle.readUrl],
      },
    });
  };

  const clearHeaderSample = () => {
    const { example, ...rest } = form.values.header;
    form.setFieldValue("header", {
      ...rest,
    });
  };

  const updateBodySample = (variablesSample: string[]) => {
    form.setFieldValue("body", {
      ...form.values.body,
      example: { body_text: [variablesSample] },
    });
  };

  const updateButtonUrlSample = (urlSamples: { [key in string]: string }) => {
    if (!form.values.buttons.buttons) {
      return;
    }
    form.setFieldValue(
      "buttons.buttons",
      form.values.buttons.buttons.map((button) => {
        if (button.type === "CALL_TO_ACTION" && button.buttonType === "URL") {
          return {
            ...button,
            example:
              button.url && button.url.includes(URL_VARIABLE_TOKEN)
                ? [urlSamples[button.url]]
                : [],
          };
        }
        return button;
      })
    );
  };

  const closeSampleModal = () => {
    setOpenSampleModal(false);
    setValidateStep(0);
    clearHeaderSample();
    const { example, ...rest } = form.values.body;
    form.setFieldValue("body", {
      ...rest,
    });
  };

  useEffect(() => {
    if (props.templateId) {
      if (props.templateId === "create") {
        setLoading(false);
      } else {
        setLoading(true);
        fetchTemplates(props.wabaId, true)
          .then((res) => {
            const template = res.whatsappTemplates.find(
              (template) => template.id === props.templateId
            );
            if (template) {
              const headerComponent = template.components.find((com) =>
                isHeaderType(com)
              );
              const bodyComponent = template.components.find((com) =>
                isBodyType(com)
              );
              const footerComponent = template.components.find((com) =>
                isFooterType(com)
              );
              const buttonsComponent = template.components.find((com) =>
                isButtonType(com)
              );
              const formattedButtons = buttonsComponent?.buttons?.map((btn) => {
                const { type, ...rest } = btn;
                if (type === "QUICK_REPLY") {
                  return btn;
                }
                return { type: "CALL_TO_ACTION", buttonType: type, ...rest };
              });
              form.setValues({
                name: template.name,
                language: template.language,
                category: template.category,
                header: (headerComponent as CloudAPIHeaderFormValueType) || {
                  type: "HEADER",
                },
                body: bodyComponent || { type: "BODY", text: "" },
                footer: footerComponent || { type: "FOOTER" },
                buttons: buttonsComponent
                  ? ({
                      type: buttonsComponent.type,
                      buttons: formattedButtons,
                    } as CloudAPIButtonFormValue)
                  : { type: "BUTTONS" },
              });
            }
          })
          .catch((error) => {
            console.error(`fetchWhatsappTemplates error ${error}`);
          })
          .finally(() => {
            setLoading(false);
          });
      }
    }
  }, [props.templateId]);

  const getButtonUrlError = () => {
    // @ts-ignore
    const buttonError = form.errors.buttons?.buttons?.find(
      (button: { example: string | string[] }) => button.example
    );
    if (buttonError) {
      return Array.isArray(buttonError.example)
        ? buttonError.example?.[0]
        : buttonError.example;
    }
  };
  return (
    <Dimmer.Dimmable dimmed className={"template main-primary-column content"}>
      {loading ? (
        <Dimmer active={loading} inverted>
          <Loader inverted />
        </Dimmer>
      ) : (
        <>
          {isCreateStatus && (
            <div className="header">
              <div className={`header`}>
                <BackNavLink
                  to={routeTo("/settings/templates")}
                  children={t("settings.template.header")}
                  header
                  transparent
                />
                {form.status}
              </div>
              <div className="subHeader">
                <Trans i18nKey={"settings.template.subHeader"}>
                  Outbound messages to start conversations with WhatsApp users
                  must be sent using a message template.
                  <br />
                  Start building your template with text, buttons, or both.
                  WhatsApp will approve or reject your template in 48 hours or
                  less.
                </Trans>
              </div>
            </div>
          )}
          <div className={`content ${isCreateStatus ? "" : styles.updateMode}`}>
            <div className="container">
              {!isCreateStatus && (
                <div className={`header ${styles.headerWithActions}`}>
                  <BackNavLink
                    to={routeTo("/settings/templates")}
                    children={t("settings.template.editHeader")}
                  />
                  <HeaderActions
                    template={form.values}
                    id={form.values.name}
                    channelPhone={props.phone}
                  />
                </div>
              )}
              <div className="ui form">
                <div className="template-info">
                  <div className="column">
                    <Form.Field>
                      <label>
                        {t("settings.template.form.templateName.label")}
                      </label>
                      <Input
                        placeholder={t(
                          "settings.template.form.templateName.placeholder"
                        )}
                        disabled={isCreateStatus === false}
                        onChange={(_, data) => {
                          form.setFieldValue("name", data.value);
                        }}
                        value={form.values.name}
                      />
                      <FieldError text={form.errors.name} />
                      <div className="reminder">
                        {t("settings.template.form.templateName.reminder")}
                      </div>
                    </Form.Field>
                  </div>
                  <div className="column">
                    <Form.Field>
                      <label>
                        {t("settings.template.form.category.label")}
                      </label>
                      <Dropdown
                        disabled={isCreateStatus === false}
                        scrolling
                        selection
                        options={getCategory(t)}
                        onChange={(_, data) => {
                          form.setFieldValue("category", data.value);
                        }}
                        value={form.values.category}
                      />
                      <div className="reminder">
                        {t("settings.template.form.category.reminder")}
                      </div>
                    </Form.Field>
                  </div>
                </div>
                <div className={`ui form ${styles.templateContent} languages`}>
                  <Form.Field>
                    <label>{t("settings.template.form.language.label")}</label>
                    <Dropdown
                      search
                      disabled={isCreateStatus === false}
                      onChange={(_, data) => {
                        form.setFieldValue("language", data.value);
                      }}
                      scrolling
                      options={LanguagesMapping.map((opt) => ({
                        value: opt.value,
                        text: opt.label,
                        key: opt.value,
                      }))}
                      value={form.values.language}
                    />
                  </Form.Field>
                  <Form.Field>
                    <label>
                      {t("settings.template.form.headerType.label")}
                      {form.values.header.format === "TEXT" && (
                        <span className={styles.headerInputLabel}>
                          {t("settings.template.form.header.label")}
                        </span>
                      )}
                      <span className={styles.optional}>
                        {t("settings.template.form.buttonType.optional")}
                      </span>
                    </label>
                    <div className={styles.reminder}>
                      {t("settings.template.form.headerType.reminder")}
                    </div>
                    <div className={styles.headerTypeWrapper}>
                      <Dropdown
                        className={styles.headerTypeDropdown}
                        scrolling
                        selectOnBlur={false}
                        options={getHeaderOpt(t)}
                        disabled={isCreateStatus === false}
                        value={form.values.header.format || "NONE"}
                        onChange={(_, data) => {
                          if (data.value === "NONE") {
                            form.setFieldValue("header", {
                              type: "HEADER",
                            });
                          } else if (data.value === "TEXT") {
                            form.setFieldValue("header", {
                              type: "HEADER",
                              format: data.value,
                              text: "",
                            });
                          } else {
                            form.setFieldValue("header", {
                              type: "HEADER",
                              format: data.value,
                            });
                          }
                          setIsRequiredSample(
                            getIsRequiredSample(
                              form.values.body.text,
                              data.value as string,
                              form.values.buttons.buttons
                            )
                          );
                        }}
                      />
                      {form.values.header.format === "TEXT" && (
                        <div className={styles.headerTypeInput}>
                          <Input
                            placeholder={t(
                              "settings.template.form.header.placeholder"
                            )}
                            onChange={(e) => {
                              if (e.target.value.length <= 60) {
                                form.setFieldValue(
                                  "header.text",
                                  e.target.value
                                );
                              }
                            }}
                            value={form.values.header.text}
                            disabled={isCreateStatus === false}
                          />
                        </div>
                      )}
                    </div>
                    <FieldError text={form.errors.header?.text} />
                  </Form.Field>
                  <Form.Field>
                    <label>{t("settings.template.form.message.label")}</label>
                    <textarea
                      rows={10}
                      value={form.values.body.text}
                      disabled={isCreateStatus === false}
                      placeholder={t(
                        "settings.template.form.message.placeholder",
                        { interpolation: { skipOnVariables: true } }
                      )}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                        if (e.target.value.length <= 1024) {
                          form.setFieldValue("body.text", e.target.value);
                          setIsRequiredSample(
                            getIsRequiredSample(
                              e.target.value,
                              form.values.header?.format,
                              form.values.buttons.buttons
                            )
                          );
                        }
                      }}
                    />
                    {form.errors.body?.text && (
                      <FieldError text={form.errors.body?.text} />
                    )}
                    <div className="reminder">
                      {t("settings.template.form.message.reminder", {
                        interpolation: { skipOnVariables: true },
                      })}
                    </div>
                  </Form.Field>
                  <Form.Field>
                    <label>
                      {t("settings.template.form.buttons.header")}
                      <span className={styles.optional}>
                        {t("settings.template.form.buttonType.optional")}
                      </span>
                    </label>
                    <div className={styles.reminder}>
                      {t("settings.template.form.buttonType.reminderText")}
                    </div>
                    <Dropdown
                      className={styles.buttonTypeDropdown}
                      scrolling
                      selectOnBlur={false}
                      options={getButtonOpt(t)}
                      disabled={isCreateStatus === false}
                      value={form.values.buttons?.buttons?.[0].type || "NONE"}
                      onChange={(_, data) => {
                        if (data.value === "NONE") {
                          form.setFieldValue("buttons", { type: "BUTTONS" });
                        } else if (data.value === "CALL_TO_ACTION") {
                          form.setFieldValue("buttons", {
                            type: "BUTTONS",
                            buttons: [
                              { type: data.value, text: "", buttonType: "URL" },
                            ],
                          });
                        } else {
                          form.setFieldValue("buttons", {
                            type: "BUTTONS",
                            buttons: [{ type: data.value, text: "" }],
                          });
                        }
                      }}
                    />
                  </Form.Field>
                  <Form.Field>
                    {form.values.buttons.buttons?.[0]?.type && (
                      <div className="button header">
                        <div className="subHeader">
                          {form.values.buttons.buttons?.[0]?.type ===
                          "QUICK_REPLY" ? (
                            <Trans
                              i18nKey={
                                "settings.template.form.buttons.quickReplyHeader"
                              }
                              values={{ number: 3 }}
                            >
                              Create up to {{ number: 3 }} buttons that let
                              customers respond to your message. See
                              <a
                                className="link"
                                rel="noreferrer noopener"
                                target="_blank"
                                href="https://youtu.be/bBRtj1sa6VM"
                              >
                                how it works.
                              </a>
                            </Trans>
                          ) : (
                            <Trans
                              i18nKey={
                                "settings.template.form.buttons.subHeader"
                              }
                              values={{ number: 2 }}
                            >
                              Create up to {{ number: 2 }} buttons that let
                              customers respond to your message. See
                              <a
                                className="link"
                                rel="noreferrer noopener"
                                target="_blank"
                                href="https://youtu.be/bBRtj1sa6VM"
                              >
                                how it works.
                              </a>
                            </Trans>
                          )}
                        </div>
                      </div>
                    )}
                    {form.values.buttons.buttons?.map((button, buttonIndex) => {
                      return (
                        <div className="button" key={buttonIndex}>
                          {button.type === "QUICK_REPLY" ? (
                            <TemplateQuickReplyButton
                              error={
                                // prettier-ignore
                                // @ts-ignore
                                form.errors.buttons?.buttons?.[buttonIndex]?.text || ""
                              }
                              onRemove={removeButton(buttonIndex)}
                              onClick={(value) => {
                                form.setFieldValue(
                                  `buttons.buttons[${buttonIndex}].text`,
                                  value
                                );
                              }}
                              isReadOnly={isCreateStatus === false}
                              buttonText={button.text}
                            />
                          ) : (
                            button.type === "CALL_TO_ACTION" && (
                              <SettingTemplateCallActionButton
                                isReadOnly={isCreateStatus === false}
                                enabledSelectActionType
                                enabledDynamicUrl
                                onButtonTypeChange={(value: string) => {
                                  const formattedValue =
                                    value === "url" ? "URL" : "PHONE_NUMBER";
                                  form.setFieldValue(
                                    `buttons.buttons[${buttonIndex}]`,
                                    {
                                      type: form.values.buttons.buttons?.[
                                        buttonIndex
                                      ].type,
                                      url: "",
                                      phone_number: "",
                                      text: "",
                                      buttonType: formattedValue,
                                    }
                                  );
                                }}
                                onButtonTextChange={(value: string) => {
                                  form.setFieldValue(
                                    `buttons.buttons[${buttonIndex}].text`,
                                    value
                                  );
                                }}
                                onValueChange={(
                                  type: string,
                                  value: string
                                ) => {
                                  if (!form.values.buttons.buttons) {
                                    return;
                                  }
                                  if (button.buttonType === "URL") {
                                    form.setFieldValue(
                                      `buttons.buttons[${buttonIndex}].url`,
                                      value
                                    );
                                    const newButtons =
                                      form.values.buttons.buttons.map(
                                        (b, i) => {
                                          if (i === buttonIndex)
                                            return { ...b, url: value };
                                          else return b;
                                        }
                                      );
                                    setIsRequiredSample(
                                      getIsRequiredSample(
                                        form.values.body.text,
                                        form.values.header?.format,
                                        newButtons
                                      )
                                    );
                                  } else if (
                                    button.buttonType === "PHONE_NUMBER"
                                  ) {
                                    form.setFieldValue(
                                      `buttons.buttons[${buttonIndex}].phone_number`,
                                      value
                                    );
                                  }
                                }}
                                onRemove={removeButton(buttonIndex)}
                                error={{
                                  text: "",
                                  url: "",
                                  phone_number: "",
                                  type: "",
                                  // @ts-ignore
                                  ...(form.errors.buttons?.buttons?.[
                                    buttonIndex
                                  ] || {}),
                                }}
                                button={{ ...button, type: button.buttonType }}
                              />
                            )
                          )}
                        </div>
                      );
                    })}
                    {
                      // @ts-ignore
                      form.errors?.buttons?.buttons?.[0]?.buttonType && (
                        <FieldError
                          // @ts-ignore
                          text={form.errors?.buttons?.buttons?.[0]?.buttonType}
                        />
                      )
                    }
                    {form.values.buttons.buttons?.length && isCreateStatus && (
                      <Button
                        onClick={addButton}
                        disabled={
                          form.values.buttons.buttons?.length ===
                          getButtonLimit(
                            form.values.buttons.buttons[0].type || ""
                          )
                        }
                        className="add-button primary"
                      >
                        + {t("settings.template.form.button.addButton")}
                      </Button>
                    )}
                  </Form.Field>
                  <Form.Field>
                    <label>
                      {t("settings.template.form.footer.label")}
                      <span className={styles.optional}>
                        {t("settings.template.form.buttonType.optional")}
                      </span>
                    </label>
                    <Input
                      placeholder={t(
                        "settings.template.form.footer.placeholder"
                      )}
                      onChange={(e) => {
                        if (e.target.value.length <= 60) {
                          form.setFieldValue("footer.text", e.target.value);
                        }
                      }}
                      value={form.values.footer.text}
                      disabled={isCreateStatus === false}
                    />
                    <FieldError text={form.errors.footer?.text} />
                  </Form.Field>
                </div>
                {isRequiredSample && (
                  <div className={styles.isRequiredSampleReminder}>
                    {t("settings.template.form.sample.reminder")}
                  </div>
                )}
              </div>
              <div className={`action ${styles.actionBtnWrapper}`}>
                <Button
                  primary
                  loading={form.isSubmitting}
                  onClick={form.isSubmitting ? undefined : form.submitForm}
                  disabled={isCreateStatus === false}
                >
                  {t("settings.template.form.button.submitReview")}
                </Button>
              </div>
            </div>
            <PreviewContent
              buttons={form.values.buttons.buttons ?? []}
              value={form.values.body.text ?? ""}
              header={form.values.header}
              footer={form.values.footer.text ?? ""}
            />
          </div>
          {openSampleModal && (
            <AddSampleContentModal
              wabaId={props.wabaId}
              isCreateStatus={isCreateStatus}
              onCancel={closeSampleModal}
              updateHeaderSample={updateHeaderSample}
              clearHeaderSample={clearHeaderSample}
              updateBodySample={updateBodySample}
              headerFormat={form.values.header.format || ""}
              bodyText={form.values.body.text || ""}
              headerError={form.errors.header?.example}
              // @ts-ignore
              bodyError={form.errors.body?.example?.body_text}
              isSubmitting={form.isSubmitting}
              submitForm={form.submitForm}
              buttonTexts={(form.values.buttons.buttons || [])
                .filter((button) => button.type === "CALL_TO_ACTION")
                .map(
                  (button) =>
                    (button as CloudAPIActionButtonFormValueType).url || ""
                )}
              updateButtonUrlSample={updateButtonUrlSample}
              buttonUrlError={getButtonUrlError()}
            />
          )}
          {showDemoAccountModal && (
            <DemoAccountModal
              closePopUp={() => setShowDemoAccountModal(false)}
            />
          )}
        </>
      )}
    </Dimmer.Dimmable>
  );
}
