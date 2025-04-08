import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import {
  Button,
  Dimmer,
  Dropdown,
  Form,
  Input,
  Loader,
} from "semantic-ui-react";
import {
  CALL_TO_ACTION_TYPE,
  LanguagesMapping,
  NONE_TYPE,
  QUICK_REPLY_TYPE,
  WhatsappContentTemplateCreateType,
  CategoryEnum,
} from "types/WhatsappTemplateResponseType";
import { array, object, string } from "yup";
import { useHistory, useLocation } from "react-router";
import fetchWhatsappTemplates from "../../../../api/Company/fetchWhatsappTemplates";
import { Trans, useTranslation } from "react-i18next";
import { FieldError } from "../../../shared/form/FieldError";
import { useFlashMessageChannel } from "../../../BannerMessage/flashBannerMessage";
import useRouteConfig from "../../../../config/useRouteConfig";
import TemplateQuickReplyButton from "../TemplateQuickReplyButton";
import SettingTemplateCallActionButton from "./SettingTemplateCallActionButton";
import { parseHttpError } from "api/apiRequest";
import { TFunction } from "i18next";
import { InfoTooltip } from "../../../shared/popup/InfoTooltip";
import { useFeaturesGuard } from "../../hooks/useFeaturesGuard";
import DemoAccountModal from "../DemoAccountModal/DemoAccountModal";
import { PreviewContent } from "../PreviewContent";
import { BackNavLink } from "../../../shared/nav/BackNavLink";
import { ButtonType } from "features/Whatsapp360/API/ButtonType";
import cloudApiStyles from "../CloudApi/SettingCloudApiTemplates.module.css";
import {
  getIsRequiredSample,
  getCategory,
  CloudAPIActionButtonFormValueType,
} from "../CloudApi/EditTemplate";
import AddSampleContentModal from "../AddSampleContentModal";
import { parseAndFormatAnyPhone } from "component/Channel/selectors";
import { submitTwilioContentTemplate } from "api/Company/submitTwilioContentTemplate";
import { CreateTemplateCategoryEnum } from "features/WhatsappCloudAPI/models/WhatsappCloudAPITemplateType";
import fetchTwilioContentTemplate from "api/Company/fetchTwilioContentTemplate";
import { schemaForBodyText } from "component/Settings/SettingTemplates/CloudApi/EditTemplate/editTemplateSchemaMap";

export interface ButtonContentType {
  text: string;
  url?: string;
  phone_number?: string;
  type: string;
}

interface WhatsappContentTemplateCreateValueType {
  friendly_name: string;
  category: CategoryEnum | CreateTemplateCategoryEnum;
  language: string;
  body: string;
  media: string;
  buttonType:
    | typeof QUICK_REPLY_TYPE
    | typeof CALL_TO_ACTION_TYPE
    | typeof NONE_TYPE;
  buttons: ButtonContentType[];
  variables: { [key: string]: string };
  status: string;
  rejection_reason?: string;
}

interface WhatsappTemplateRestLanguage {
  language: string;
  body: string;
  buttons: ButtonContentType[];
  status: string;
  rejection_reason?: string;
}

const initTemplateCreateValue: WhatsappContentTemplateCreateValueType = {
  friendly_name: "",
  category: "AUTHENTICATION",
  language: "en",
  body: "",
  media: "NONE",
  buttonType: "NONE",
  buttons: [],
  variables: {},
  status: "",
  rejection_reason: undefined,
};

const getButtonLimit = (type: string) => {
  const buttonLimitMap = { QUICK_REPLY: 3, CALL_TO_ACTION: 1 };
  return buttonLimitMap[type] || 0;
};

const ButtonWithTooltip = [QUICK_REPLY_TYPE, CALL_TO_ACTION_TYPE];
export const BTN_TEXT_MAX_LENGTH = 20;
export function getButtonName(
  t: TFunction,
  buttonType: ButtonType
): React.ReactNode {
  const buttonTypeMapping: { [a in ButtonType]: string } = {
    NONE: t("settings.template.buttonType.none"),
    QUICK_REPLY: t("settings.template.buttonType.quickReply.text"),
    CALL_TO_ACTION: t("settings.template.buttonType.callToAction.text"),
  };
  const buttonTooltipMapping: {
    [a in typeof QUICK_REPLY_TYPE | typeof CALL_TO_ACTION_TYPE]: string;
  } = {
    QUICK_REPLY: t("settings.template.buttonType.quickReply.tooltip"),
    CALL_TO_ACTION: t("settings.template.buttonType.callToAction.tooltip"),
  };
  return ButtonWithTooltip.includes(buttonType) ? (
    <InfoTooltip
      offset={[0, 0]}
      placement={"right"}
      trigger={<span>{buttonTypeMapping[buttonType]}</span>}
      children={buttonTooltipMapping[buttonType]}
    />
  ) : (
    <span>{buttonTypeMapping[buttonType]}</span>
  );
}

const getButtonOptions = (t: TFunction) => [
  {
    value: NONE_TYPE,
    text: getButtonName(t, NONE_TYPE),
    content: getButtonName(t, NONE_TYPE),
  },
  {
    value: QUICK_REPLY_TYPE,
    text: getButtonName(t, QUICK_REPLY_TYPE),
    content: getButtonName(t, QUICK_REPLY_TYPE),
  },
  {
    value: CALL_TO_ACTION_TYPE,
    text: getButtonName(t, CALL_TO_ACTION_TYPE),
    content: getButtonName(t, CALL_TO_ACTION_TYPE),
  },
];

const getStatusMapping = (t: TFunction) => ({
  approved: t("settings.template.status.approved"),
  rejected: t("settings.template.status.rejected"),
  pending: t("settings.template.status.pending"),
});

const getRejectReasonMapping = (t: TFunction) => ({
  PROMOTIONAL: t("settings.template.rejectReason.promotional"),
  INVALID_FORMAT: t("settings.template.rejectReason.invalidFormat"),
});

const schemaForValue = (t: TFunction) =>
  object({
    friendly_name: string()
      .matches(
        /^[(0-9|a-z|_)]+$/,
        t("settings.template.field.error.templateNameEmpty")
      )
      .required(t("settings.template.field.error.templateNameEmpty")),
    body: schemaForBodyText(t),
    buttons: array().of(
      object().shape({
        text: string().required(t("settings.template.field.error.text.empty")),
        url: string().when("type", {
          is: (val) => val === "url",
          then: string()
            .trim()
            .required(t("settings.template.field.error.url.empty"))
            .url(t("settings.template.field.error.url.invalidFormat")),
        }),
        phone_number: string().when("type", {
          is: (val) => val === "phone_number",
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
  });

const schemaForSample = (t: TFunction) =>
  object().shape({
    variables: object().test(
      "variable is required",
      t("settings.template.field.error.variable.empty"),
      function (value: { [key: string]: string }): boolean {
        const valueKeyArr = Object.keys(value);
        if (valueKeyArr.length === 0) return false;
        const isAllFilled = valueKeyArr.every((key) => !!value[key]);
        return isAllFilled;
      }
    ),
  });

const schemaMap = {
  0: schemaForValue,
  1: schemaForSample,
};

const transformTemplateToContentButtonType = (buttonType?: string) => {
  if (!buttonType) return NONE_TYPE;
  if (buttonType === QUICK_REPLY_TYPE) return QUICK_REPLY_TYPE;
  return CALL_TO_ACTION_TYPE;
};

const getButtonType = (typeKey: string) => {
  if (typeKey === "twilio/quick-reply") return "QUICK_REPLY";
  if (typeKey === "twilio/call-to-action") return "CALL_TO_ACTION";
  return "NONE";
};

export default function SettingTemplate(props: {
  accountSID: string;
  templateId?: string;
}) {
  const { templateId, accountSID } = props;
  const location = useLocation();
  const param = new URLSearchParams(location.search);
  const page = Number(param.get("page")) ?? 0;
  const isContent = param.get("isContent") === "true";
  const [loading, setLoading] = useState(true);
  const { routeTo } = useRouteConfig();
  const flash = useFlashMessageChannel();
  const { t } = useTranslation();
  const history = useHistory();
  const [showDemoAccountModal, setShowDemoAccountModal] = useState(false);
  const featureGuard = useFeaturesGuard();
  const categoryOptions = getCategory(t);
  const buttonOptions = getButtonOptions(t);
  const isCreateStatus = templateId === "create";
  const [openSampleModal, setOpenSampleModal] = useState(false);
  const [validateStep, setValidateStep] = useState<number>(0);
  const [isRequiredSample, setIsRequiredSample] = useState(false);
  const [restLanguages, setRestLanguages] = useState<
    WhatsappTemplateRestLanguage[]
  >([]);

  const form = useFormik<WhatsappContentTemplateCreateValueType>({
    validateOnBlur: false,
    validateOnChange: false,
    initialValues: initTemplateCreateValue,
    validationSchema: schemaMap[validateStep](t),
    onSubmit: async (values) => {
      if (!featureGuard.canCreateTemplate()) {
        setShowDemoAccountModal(true);
        return;
      }
      if (isRequiredSample && validateStep === 0) {
        setOpenSampleModal(true);
        setValidateStep(1);
        return;
      }
      try {
        const {
          body,
          media,
          buttonType,
          buttons,
          status,
          rejection_reason,
          category,
          ...rest
        } = values;
        const templateContent: WhatsappContentTemplateCreateType = {
          ...rest,
          category: category as CreateTemplateCategoryEnum,
          types: {
            "twilio/text": buttonType === "NONE" ? { body } : undefined,
            "twilio/call-to-action":
              buttonType === "CALL_TO_ACTION"
                ? {
                    body,
                    actions: buttons.map((btn) => ({
                      title: btn.text,
                      type: btn.type.toLocaleUpperCase(),
                      url: btn.url ? btn.url : undefined,
                      phone: btn.phone_number ? btn.phone_number : undefined,
                    })),
                  }
                : undefined,
            "twilio/quick-reply":
              buttonType === "QUICK_REPLY"
                ? {
                    body,
                    actions: buttons.map((btn) => ({
                      title: btn.text,
                      type: btn.type,
                      url: btn.url ? btn.url : undefined,
                      phone: btn.phone_number ? btn.phone_number : undefined,
                    })),
                  }
                : undefined,
          },
        };
        await submitTwilioContentTemplate(accountSID, templateContent);
        history.push(routeTo("/settings/templates"));
        flash(t("flash.template.save.success"));
      } catch (e) {
        const errorMsg = parseHttpError(e);
        if (typeof errorMsg === "string") {
          if (
            errorMsg.includes("Template with the same name already exists.")
          ) {
            form.setFieldError(
              "friendly_name",
              t("settings.template.field.error.duplicatedName")
            );
          }
        }
        console.error(`submitTemplate error ${e}`);
        flash(t("flash.template.save.failed"));
      }
    },
  });

  const getTemplate = () => {
    fetchWhatsappTemplates(page, 1000, accountSID)
      .then((res) => {
        const template = res.whatsapp_templates.find(
          (template) => template.sid === templateId
        );
        if (template) {
          const [firstLanguage, ...restLanguage] = template.languages;
          const buttonType = transformTemplateToContentButtonType(
            firstLanguage?.components?.[0].buttons[0].type
          );
          form.setValues({
            friendly_name: template.template_name,
            category: template.category,
            language: firstLanguage.language,
            body: firstLanguage.content,
            media: "NONE",
            buttonType,
            buttons: firstLanguage?.components?.[0].buttons || [],
            variables: {},
            status: firstLanguage.status,
            rejection_reason: firstLanguage.rejection_reason,
          });
          setRestLanguages(
            restLanguage.map((lang) => ({
              language: lang.language,
              body: lang.content,
              buttons: lang?.components?.[0].buttons || [],
              status: lang.status,
              rejection_reason: lang.rejection_reason,
            }))
          );
        }
      })
      .catch((error) => {
        console.error(`fetchWhatsappTemplates error ${error}`);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getTemplateContent = () => {
    fetchTwilioContentTemplate(page, 1000, accountSID)
      .then((res) => {
        const template = res.contents.find((temp) => temp.sid === templateId);
        if (template) {
          const { approval_requests, types, variables, ...rest } = template;
          const buttonType = getButtonType(Object.keys(types)[0]);
          const getButtons = () => {
            if (buttonType === "NONE") {
              return [];
            }
            const buttons =
              (types["twilio/call-to-action"] || types["twilio/quick-reply"])
                ?.actions || [];
            return buttons.map((btn) => ({
              text: btn.title,
              type: btn.type,
              url: btn.url ? btn.url : undefined,
              phone_number: btn.phone ? btn.phone : undefined,
            }));
          };
          form.setValues({
            ...rest,
            category: approval_requests.category,
            language: template.language,
            body:
              (
                types["twilio/text"] ||
                types["twilio/call-to-action"] ||
                types["twilio/quick-reply"]
              )?.body || "",
            media: "NONE",
            buttonType,
            buttons: getButtons(),
            variables: variables || {},
            status: approval_requests.status,
            rejection_reason: approval_requests.rejection_reason,
          });
        }
      })
      .catch((error) => {
        console.error(`fetchTwilioContentTemplate error ${error}`);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (templateId) {
      if (templateId === "create") {
        setLoading(false);
      } else {
        setLoading(true);
        if (isContent) {
          getTemplateContent();
        } else {
          getTemplate();
        }
      }
    }
  }, [templateId]);

  function addButton() {
    form.setFieldValue("buttons", [
      ...form.values.buttons,
      {
        text: "",
        url: "",
        phone_number: "",
        type: form.values.buttonType === "QUICK_REPLY" ? "QUICK_REPLY" : "url",
      },
    ]);
  }

  function editButtonText(buttonIndex: number, value: string) {
    form.setFieldValue(
      "buttons",
      form.values.buttons.map((btn, index) => {
        if (index !== buttonIndex) return btn;
        return {
          ...btn,
          text: value,
        };
      })
    );
  }

  function removeButton(buttonIndex: number) {
    form.setFieldValue(
      "buttons",
      form.values.buttons.filter((_, index) => index !== buttonIndex)
    );
  }

  function editCTAButtonValue(
    buttonIndex: number,
    type: string,
    value: string
  ) {
    form.setFieldValue(
      "buttons",
      form.values.buttons.map((btn, index) => {
        if (index !== buttonIndex) return btn;
        if (type === "url") {
          return { ...btn, url: value };
        }
        if (type === "phone_number") {
          return { ...btn, phone_number: value };
        }
        return btn;
      })
    );
  }

  function updateCTAType(buttonIndex: number, type: string) {
    form.setFieldValue(
      "buttons",
      form.values.buttons.map((btn, index) => {
        if (index !== buttonIndex) return btn;
        return { ...btn, type };
      })
    );
  }

  const closeSampleModal = () => {
    setOpenSampleModal(false);
    setValidateStep(0);
    form.setFieldValue("variables", {});
  };

  const updateBodyVariableSample = (samples: string[]) => {
    form.setFieldValue(
      "variables",
      samples.reduce((acc, cur, index) => {
        return { ...acc, [index + 1]: cur };
      }, {})
    );
  };

  return (
    <Dimmer.Dimmable dimmed className={"template main-primary-column content"}>
      {loading ? (
        <Dimmer active={loading} inverted>
          <Loader inverted />
        </Dimmer>
      ) : (
        <>
          {isCreateStatus ? (
            <div className="header">
              <div className="header">
                <BackNavLink
                  to={routeTo("/settings/templates")}
                  children={t("settings.template.header")}
                  header
                  transparent
                />
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
          ) : (
            <div className="header">
              <BackNavLink to={routeTo("/settings/templates")} children={""} />
              <span>{t("settings.template.editHeader")}</span>
            </div>
          )}
          <div className="content">
            <div className="container">
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
                          form.setFieldValue("friendly_name", data.value);
                        }}
                        value={form.values.friendly_name}
                      />
                      <FieldError text={form.errors.friendly_name} />
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
                        options={categoryOptions}
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
                <div className="template-info">
                  <div className="column">
                    <Form.Field>
                      <label>
                        {t("settings.template.form.buttons.header")}
                        <span className={cloudApiStyles.optional}>
                          {t("settings.template.form.buttonType.optional")}
                        </span>
                      </label>
                      <Dropdown
                        className={cloudApiStyles.buttonTypeDropdown}
                        scrolling
                        selectOnBlur={false}
                        options={buttonOptions}
                        disabled={isCreateStatus === false}
                        value={form.values.buttonType}
                        onChange={(_, data) => {
                          form.setFieldValue("buttonType", data.value);
                          form.setFieldValue("buttons", []);
                        }}
                      />
                      <div className="reminder">
                        {t("settings.template.form.buttonType.reminderText")}
                      </div>
                    </Form.Field>
                  </div>
                </div>
                <div className="ui form languages">
                  {[form.values, ...restLanguages].map((temp, index) => (
                    <React.Fragment key={temp.language}>
                      {temp.status && (
                        <Form.Field>
                          <label>
                            {t("settings.template.form.status.label")}
                          </label>
                          <div className={`status ${temp.status}`}>
                            {getStatusMapping(t)[temp.status]}
                          </div>
                          {temp.rejection_reason && (
                            <span className="reminder">
                              {getRejectReasonMapping(t)[temp.rejection_reason]}
                            </span>
                          )}
                        </Form.Field>
                      )}
                      <Form.Field>
                        <label>
                          {t("settings.template.form.language.label")}
                        </label>
                        <Dropdown
                          search
                          disabled={isCreateStatus === false}
                          onChange={(_, data) => {
                            if (index !== 0) return;
                            form.setFieldValue("language", data.value);
                          }}
                          scrolling
                          options={LanguagesMapping.map((opt) => ({
                            value: opt.value,
                            text: opt.label,
                            key: opt.value,
                          }))}
                          value={temp.language}
                        />
                      </Form.Field>
                      {/* TODO: handle the media part later as an enhancement
                        <Form.Field>
                          <label>
                            {"Media"}
                            <span className={cloudApiStyles.optional}>
                              {t("settings.template.form.buttonType.optional")}
                            </span>
                          </label>
                          <div className={cloudApiStyles.reminder}>
                            {"media reminder"}
                          </div>
                          <div className={cloudApiStyles.headerTypeWrapper}>
                            <Dropdown
                              className={cloudApiStyles.headerTypeDropdown}
                              scrolling
                              selectOnBlur={false}
                              options={getHeaderOpt(t).filter(
                                (opt) => opt.value !== "TEXT"
                              )}
                              disabled={isCreateStatus === false}
                              value={form.values.media}
                              onChange={(_, data) => {
                                form.setFieldValue("media", data.value);
                                setIsRequiredSample(
                                  getIsRequiredSample(
                                    form.values.body,
                                    data.value as string
                                  )
                                );
                              }}
                            />
                          </div>
                        </Form.Field> */}
                      <Form.Field>
                        <label>
                          {t("settings.template.form.message.label")}
                        </label>
                        <textarea
                          rows={10}
                          value={temp.body}
                          placeholder={t(
                            "settings.template.form.message.placeholder",
                            { interpolation: { skipOnVariables: true } }
                          )}
                          disabled={isCreateStatus === false}
                          readOnly={isCreateStatus === false}
                          onChange={(
                            e: React.ChangeEvent<HTMLTextAreaElement>
                          ) => {
                            if (e.target.value.length > 1024 || index !== 0) {
                              return;
                            }
                            form.setFieldValue("body", e.target.value);
                            setIsRequiredSample(
                              getIsRequiredSample(
                                e.target.value,
                                form.values.media
                              )
                            );
                          }}
                        />
                        <FieldError text={form.errors?.body} />
                        <div className={cloudApiStyles.reminder}>
                          {t("settings.template.form.message.reminder", {
                            interpolation: { skipOnVariables: true },
                          })}
                        </div>
                      </Form.Field>
                      {form.values.buttonType !== "NONE" && (
                        <Form.Field>
                          <label>
                            {t("settings.template.form.buttons.header")}
                          </label>
                          <div className="reminder">
                            {form.values.buttonType === "QUICK_REPLY" ? (
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
                                values={{ number: 1 }}
                              >
                                Create up to {{ number: 1 }} buttons that let
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
                          {temp.buttons?.map((button, buttonIndex) => {
                            return (
                              <div className="button" key={buttonIndex}>
                                {form.values.buttonType === "QUICK_REPLY" ? (
                                  <TemplateQuickReplyButton
                                    error={
                                      // prettier-ignore
                                      // @ts-ignore
                                      form.errors.buttons?.[buttonIndex]?.text || ""
                                    }
                                    onRemove={() => {
                                      if (index !== 0) return;
                                      removeButton(buttonIndex);
                                    }}
                                    onClick={(value) => {
                                      if (index !== 0) return;
                                      editButtonText(buttonIndex, value);
                                    }}
                                    isReadOnly={isCreateStatus === false}
                                    buttonText={button.text}
                                  />
                                ) : (
                                  button.type.toLowerCase() === "url" && (
                                    <SettingTemplateCallActionButton
                                      isReadOnly={isCreateStatus === false}
                                      onButtonTextChange={(text: string) => {
                                        if (index !== 0) return;
                                        editButtonText(buttonIndex, text);
                                      }}
                                      onValueChange={(
                                        type: string,
                                        value: string
                                      ) => {
                                        if (index !== 0) return;
                                        editCTAButtonValue(
                                          buttonIndex,
                                          type,
                                          value
                                        );
                                      }}
                                      onRemove={() => {
                                        if (index !== 0) return;
                                        removeButton(buttonIndex);
                                      }}
                                      onTypeChange={(value: string) => {
                                        if (index !== 0) return;
                                        updateCTAType(buttonIndex, value);
                                      }}
                                      error={{
                                        text: "",
                                        url: "",
                                        phone_number: "",
                                        type: "",
                                        // @ts-ignore
                                        ...(form.errors.buttons?.[
                                          buttonIndex
                                        ] || {}),
                                      }}
                                      button={button}
                                    />
                                  )
                                )}
                              </div>
                            );
                          })}
                          {isCreateStatus && (
                            <Button
                              onClick={addButton}
                              disabled={
                                form.values.buttons?.length >=
                                getButtonLimit(form.values.buttonType)
                              }
                              className="add-button primary"
                            >
                              + {t("settings.template.form.button.addButton")}
                            </Button>
                          )}
                        </Form.Field>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
              <div className={`action ${cloudApiStyles.actionBtnWrapper}`}>
                <Button
                  primary
                  loading={form.isSubmitting}
                  onClick={form.submitForm}
                  disabled={isCreateStatus === false}
                >
                  {t("settings.template.form.button.submitReview")}
                </Button>
              </div>
            </div>
            <PreviewContent
              fluid
              buttons={form.values.buttons}
              value={form.values.body ?? ""}
            />
          </div>
          {openSampleModal && (
            <AddSampleContentModal
              wabaId={"wabaId"}
              isCreateStatus={isCreateStatus}
              onCancel={closeSampleModal}
              updateHeaderSample={() => {}} // TODO: handle the media part later as an enhancement
              clearHeaderSample={() => {}}
              updateBodySample={updateBodyVariableSample}
              headerFormat={form.values.media}
              bodyText={form.values.body}
              headerError={""}
              buttonTexts={(form.values.buttons || [])
                .filter((button) => button.type === "CALL_TO_ACTION")
                .map(
                  (button) =>
                    (button as CloudAPIActionButtonFormValueType).url || ""
                )}
              // @ts-ignore
              bodyError={form.errors.variables}
              isSubmitting={form.isSubmitting}
              submitForm={form.submitForm}
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
