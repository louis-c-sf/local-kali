import { useFormik, FormikErrors } from "formik";
import { object, string, array, mixed, MixedSchema } from "yup";
import {
  createBlankWhatsappChannelMessage,
  defaultVariables,
  updateWhatsapp360MessageTemplate,
} from "../shared/BroadcastTemplateDisplay/createChannelMessage";
import {
  ChannelMessageType,
  TargetedChannelWithIdType,
} from "../../../types/BroadcastCampaignType";
import {
  BlastCampaignBaseType,
  BlastCampaignType,
} from "../../../api/Broadcast/Blast/BlastCampaignType";
import { useTranslation } from "react-i18next";
import { isVarFilled } from "../../Chat/Messenger/SelectWhatsappTemplate/EditTemplateInline";
import { OptInContentType } from "../../../features/Whatsapp360/models/OptInType";

export type BlastCampaignFormValuesType = {
  name: string;
  channel: TargetedChannelWithIdType;
  templateId: string | null;
  templateLanguage: string | null;
  message: ChannelMessageType;
  importFileNew: File | null;
  importedFile: BlastCampaignBaseType["blastContactsFile"] | null;
};

export type BlastCampaignFormikType = ReturnType<
  typeof useBlastCampaignForm
> & {
  errors: FormikErrors<BlastCampaignFormValuesType>;
};

export type GetTemplateInterface = (
  templateId: string,
  channelId: string,
  language: string
) => OptInContentType | null;

export const VARIABLES_VALUE_PATH = `variables`;

export function useBlastCampaignForm(props: {
  submitForm: (values: BlastCampaignFormValuesType) => void;
  initCampaign: BlastCampaignType | null;
  initChannel: TargetedChannelWithIdType;
  getTemplateSelected: GetTemplateInterface;
}) {
  const { initCampaign, submitForm, initChannel, getTemplateSelected } = props;

  const { i18n } = useTranslation();

  const form = useFormik<BlastCampaignFormValuesType>({
    initialValues: getInitialValues(initCampaign),
    isInitialValid: false,
    onSubmit: submitForm,
    validationSchema: object({
      name: string().required("missingTitle"),
      channels: array().min(1, "missingChannel"),
      templateId: string().required("missingContent"),
      importFileNew: mixed().when("importedFile", {
        is: (file) => file === null,
        then: (schema: MixedSchema) => schema.required("missingFile"),
      }),
      message: mixed().test("vars", "", function (this, value) {
        const vars = (value as BlastCampaignFormValuesType["message"])
          .sendWhatsAppTemplate?.variables.content;
        const errors = {};
        for (let varname in vars) {
          if (!isVarFilled(vars[varname])) {
            errors[varname] = "missing value";
          }
        }
        if (Object.getOwnPropertyNames(errors).length > 0) {
          return this.createError({
            message: JSON.stringify(errors),
            path: VARIABLES_VALUE_PATH,
          });
        }
        return true;
      }),
    }),
    validateOnChange: true,
    validateOnBlur: true,
  });

  function getInitialValues(
    initCampaign: BlastCampaignType | null
  ): BlastCampaignFormValuesType {
    if (!initCampaign) {
      return {
        name: "",
        channel: initChannel,
        templateId: null,
        templateLanguage: null,
        importFileNew: null,
        importedFile: null,
        message: createBlankWhatsappChannelMessage(initChannel),
      };
    }
    const channelMessageContent =
      initCampaign.blastMessageContent.whatsapp360DialogMessageContent;

    const template = getTemplateSelected(
      channelMessageContent.templateName,
      initChannel.ids[0],
      i18n.language
    );

    const variablesDenormalized =
      channelMessageContent.templateParameters.reduce<Record<string, string>>(
        (acc, next) => {
          const { parameters, type } = next;
          if (type === "body") {
            const extraParameters = Object.fromEntries(
              parameters.map((p, i) => [`{{${i + 1}}}`, p.text])
            );
            return { ...acc, ...extraParameters };
          }
          return acc;
        },
        {}
      );

    return {
      name: initCampaign.name,
      channel: initChannel,
      templateId: channelMessageContent.templateName,
      templateLanguage: channelMessageContent.templateLanguage,
      importedFile: initCampaign.blastContactsFile,
      importFileNew: null,
      message: updateWhatsapp360MessageTemplate(
        {
          content: template?.content ?? "",
          mode: "template",
          uploadedFiles: [],
          targetedChannelWithIds: [initChannel],
          params: [],
        },
        template ?? {
          content: "⚠️ The template is unavailable",
          isBookmarked: false,
          namespace: channelMessageContent.templateNamespace,
          status: "approved",
        },
        {
          language: channelMessageContent.templateLanguage,
          templateName: channelMessageContent.templateName,
          variables: { ...defaultVariables, content: variablesDenormalized },
        }
      ),
    };
  }

  return form;
}
