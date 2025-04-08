import { object, string, array, number, ValidationError } from "yup";
import { BroadcastCampaignContextType } from "../BroadcastContext";
import {
  ChannelMessageType,
  TargetedChannelType,
} from "../../../types/BroadcastCampaignType";
import { useAppSelector } from "../../../AppRootContext";
import { ChannelType } from "../../Chat/Messenger/types";
import { useTranslation } from "react-i18next";
import { walkWhatsappTemplateParts } from "../../Chat/Messenger/SelectWhatsappTemplate/walkWhatsappTemplateParts";
import { WhatsappTemplatesStateType } from "../../../App/reducers/Chat/whatsappTemplatesReducer";
import { FacebookOTNBroadcastMapType } from "features/Facebook/models/FacebookOTNTypes";
import { getLocalTemplate } from "../../../features/Whatsapp360/API/getLocalTemplate";
import { NormalizedWhatsAppTemplateLanguageType } from "../../../features/Whatsapp360/models/OptInType";
import { isAnyWhatsappChannel } from "core/models/Channel/isAnyWhatsappChannel";

export function getWhatsappTemplateMatch(
  templates: WhatsappTemplatesStateType,
  templateName: string,
  channel: ChannelType,
  language: string
) {
  let template: NormalizedWhatsAppTemplateLanguageType | undefined;
  if (channel === "whatsapp360dialog") {
    template = Object.values(templates.whatsapp360Templates.data).find(
      (t) => t.template_name === templateName
    );
  } else if (channel === "twilio_whatsapp") {
    template = Object.values(templates.templates.data).find(
      (t) => t.template_name === templateName
    );
  }
  if (!template) {
    return;
  }
  return getLocalTemplate(template, language);
}

export function useValidateBroadcastForm() {
  const {
    i18n: { language: lang },
  } = useTranslation();

  const templates = useAppSelector((s) => s.inbox.whatsAppTemplates);

  function validateForm(
    values: {
      name: string;
      campaignChannelMessages: ChannelMessageType[];
      channelsWithIds: TargetedChannelType[];
    },
    isIncludedContactLists: boolean = false
  ) {
    let rules = object({
      name: string().required("missingTitle"),
      channelsWithIds: array().required("missingChannel").min(1, "minChannel"),
      campaignChannelMessages: array(
        object().shape({
          content: string().required("missingContent"),
          facebookOTN: object().test({
            test: function (this, value: object) {
              const channelMessage: ChannelMessageType = this.parent;
              const [channelData] = channelMessage.targetedChannelWithIds;
              if (channelData.channel === "facebook") {
                try {
                  let validateScheme;
                  if (
                    channelMessage.facebookOTN?.tab ===
                    FacebookOTNBroadcastMapType.messageTag
                  ) {
                    validateScheme = object().shape({
                      tab: string(),
                      option: string().required(),
                    });
                  } else {
                    validateScheme = object().shape({
                      tab: string(),
                      option: string().required(),
                      recipient: number()
                        .min(0, "recipientIsZero")
                        .required("recipientIs0"),
                    });
                  }
                  validateScheme.validateSync(channelMessage.facebookOTN);
                  return true;
                } catch (e) {
                  console.error("error", e);
                  const validationError = this.createError({
                    path: this.path,
                    message: "missingFacebookOTNOption",
                  });
                  throw validationError;
                }
              }
              return true;
            },
          }),
          officialTemplateParams: array().test({
            test: function (this, value: Array<string>) {
              const templateValues: ChannelMessageType = this.parent;
              const templateName = templateValues.templateName;
              const templateLanguage = templateValues.templateLanguage;
              const [channelData] = templateValues.targetedChannelWithIds;

              if (
                !["whatsapp360dialog", "twilio_whatsapp"].includes(
                  channelData?.channel
                )
              ) {
                return true;
              }
              // not a Whatsapp template
              if (!isAnyWhatsappChannel(channelData?.channel)) {
                return true;
              }
              if (!templateName) {
                return true;
              }
              const template = getWhatsappTemplateMatch(
                templates,
                templateName,
                channelData?.channel,
                templateLanguage ?? lang
              );
              if (!template) {
                return true;
              }
              const varsRequired = walkWhatsappTemplateParts(
                template.content
              ).filter((p) => p.type === "var").length;
              if (varsRequired === 0) {
                return true;
              }
              try {
                const varsSchema = array(string()).min(
                  varsRequired,
                  "missingVariables"
                );
                varsSchema.validateSync(
                  Object.values(
                    templateValues.sendWhatsAppTemplate?.variables.content ?? {}
                  ).concat(
                    Object.values(
                      templateValues.sendWhatsAppTemplate?.variables.header ??
                        {}
                    )
                  )
                );
                return true;
              } catch (e) {
                console.error(e);
                const validationError = this.createError({
                  path: this.path,
                  message: "missingVariables",
                });
                throw validationError;
              }
            },
          }),
        })
      ),
    });

    if (isIncludedContactLists) {
      const contactListsSchema = object({
        contactLists: array().test({
          test: function (this, value: object) {
            const context = this.parent;
            const selectedChannel = context.selectedChannel;
            const channelMessages: ChannelMessageType[] =
              context.campaignChannelMessages;
            const foundFbChannelMessage = channelMessages.find(
              (channelMessage) =>
                channelMessage.targetedChannelWithIds.find(
                  (id) => id.channel === "facebook"
                )
            );
            const fbTab =
              selectedChannel === "facebook"
                ? foundFbChannelMessage?.facebookOTN?.tab
                : undefined;
            if (
              selectedChannel === "facebook" &&
              fbTab === FacebookOTNBroadcastMapType.facebookOTN
            ) {
              return true;
            } else {
              try {
                const validateScheme = array()
                  .required("missingRecipients")
                  .min(1, "missingRecipients");
                validateScheme.validateSync(value);
                return true;
              } catch (e) {
                console.error("error", e);
                const validationError = this.createError({
                  path: this.path,
                  message: "missingRecipients",
                });
                throw validationError;
              }
            }
          },
        }),
      });
      rules = rules.concat(contactListsSchema);
    }
    let valuesTransformed = { ...values };
    let errors = {};

    try {
      valuesTransformed = rules.validateSync(values, {
        abortEarly: false,
      }) as any;
      const result = checkSendWhatsAppTemplate(
        (values as BroadcastCampaignContextType).campaignChannelMessages
      );
      errors = {
        ...result,
      };
    } catch (e) {
      if (ValidationError.isError(e)) {
        errors = e.inner.reduce<object>((prev, next) => {
          return { ...prev, [next.path]: next.message };
        }, errors);
        const result = checkSendWhatsAppTemplate(
          (values as BroadcastCampaignContextType).campaignChannelMessages
        );
        errors = {
          ...errors,
          ...result,
        };
      } else {
        console.error("#validate-broadcast validateForm", e);
      }
    }
    return {
      valuesTransformed,
      errors,
    };
  }

  function checkSendWhatsAppTemplate(values: ChannelMessageType[]) {
    return values.reduce((acc, curr, currentIndex) => {
      if (curr.sendWhatsAppTemplate) {
        let error = {};
        const header = curr.sendWhatsAppTemplate.templateContent?.header;
        if (
          header &&
          header.format !== "TEXT" &&
          !curr.sendWhatsAppTemplate.file
        ) {
          error = {
            ...error,
            [`campaignChannelMessages[${currentIndex}].sendWhatsAppTemplate.file`]:
              "missingFile",
          };
        }
        if (
          Object.keys(curr.sendWhatsAppTemplate.variables.content).length > 0
        ) {
          Object.entries(curr.sendWhatsAppTemplate.variables.content).map(
            ([key, value]) => {
              if (key && !value) {
                error = {
                  ...error,
                  [`campaignChannelMessages[${currentIndex}].sendWhatsAppTemplate.variables.content[${key}]`]:
                    "missingContent",
                };
              }
            }
          );
        } else if (
          Object.keys(curr.sendWhatsAppTemplate.variables.header).length > 0
        ) {
          Object.entries(curr.sendWhatsAppTemplate.variables.content).map(
            ([key, value]) => {
              if (key && !value) {
                error = {
                  ...error,
                  [`campaignChannelMessages[${currentIndex}].sendWhatsAppTemplate.variables.header[${key}]`]:
                    "missingContent",
                };
              }
            }
          );
        }
        return {
          ...acc,
          ...error,
        };
      }
      return {
        ...acc,
      };
    }, {});
  }

  return {
    validateForm,
  };
}
