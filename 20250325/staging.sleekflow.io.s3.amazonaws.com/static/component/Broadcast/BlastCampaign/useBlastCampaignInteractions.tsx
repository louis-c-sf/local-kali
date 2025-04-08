import {
  BlastCampaignFormikType,
  BlastCampaignFormValuesType,
  GetTemplateInterface,
} from "./useBlastCampaignForm";
import { toFloat } from "../../../utility/string";
import { submitBlastWhatsapp360DialogCampaign } from "../../../api/Broadcast/Blast/submitBlastWhatsapp360DialogCampaign";
import { useHistory } from "react-router";
import useRouteConfig from "../../../config/useRouteConfig";
import { submitTestWhatsapp360DialogMessage } from "../../../api/Broadcast/Blast/submitTestWhatsapp360DialogMessage";
import { useFlashMessageChannel } from "../../BannerMessage/flashBannerMessage";
import { BlastCampaignActionType } from "./blastCampaignReducer";
import React from "react";
import { TargetedChannelType } from "../../../types/BroadcastCampaignType";
import { useTranslation } from "react-i18next";
import {
  createBlankWhatsappChannelMessage,
  updateWhatsapp360MessageTemplate,
} from "../shared/BroadcastTemplateDisplay/createChannelMessage";
import extractWhatsAppFragment from "../../../container/Settings/OfficialWhatsApp/extractWhatsAppFragment";
import { VarNodeType } from "../../Chat/Messenger/SelectWhatsappTemplate/walkWhatsappTemplateParts";
import { normalize360DialogComponents } from "../../../api/Broadcast/normalize360DialogComponents";
import { TemplateMessageComponentType } from "../../../types/MessageType";

export function useBlastCampaignInteractions(props: {
  form: BlastCampaignFormikType;
  channel: TargetedChannelType;
  isNew: boolean;
  dispatch: React.Dispatch<BlastCampaignActionType>;
  getTemplateSelected: GetTemplateInterface;
}) {
  const { dispatch, isNew, channel, getTemplateSelected, form } = props;

  const history = useHistory();
  const { routeTo } = useRouteConfig();
  const flash = useFlashMessageChannel();
  const { t } = useTranslation();

  async function submitForm(values: BlastCampaignFormValuesType) {
    const [channelId] = values.channel?.ids ?? [];
    const channelIdCast = toFloat(channelId);
    if (
      !(
        channelIdCast &&
        values.templateId &&
        values.templateLanguage &&
        values.importFileNew
      )
    ) {
      return;
    }
    const template = values.message.sendWhatsAppTemplate;
    if (!template) {
      return;
    }
    dispatch({ type: "SEND_STARTED" });
    try {
      let templateParameters: TemplateMessageComponentType[] | undefined = [];
      if (template && template.templateContent) {
        templateParameters = normalize360DialogComponents(
          template.templateContent,
          template
        );
      }
      const result = await submitBlastWhatsapp360DialogCampaign(
        values.name,
        values.importFileNew,
        {
          whatsapp360DialogChannelId: channelIdCast,
          templateName: values.templateId,
          templateNamespace: template.templateContent?.namespace ?? "",
          templateLanguage: values.templateLanguage,
          templateParameters: templateParameters ?? [],
        }
      );
      if (result.id && isNew) {
        history.push(routeTo(`/campaigns/blast/${result.id}`));
        return;
      }
    } catch (e) {
      console.error(e);
    } finally {
      dispatch({ type: "SEND_COMPLETED" });
    }
  }

  async function submitTestMessage(
    profileIdList: string[],
    values: BlastCampaignFormValuesType
  ) {
    const channelIds = values.channel?.ids ?? [];
    const [channelId] = channelIds;
    const templateId = values.templateId;
    const templateLanguage = values.templateLanguage;
    if (!(templateId && templateLanguage && channelId)) {
      return;
    }
    const template = values.message.sendWhatsAppTemplate;

    const channelIdCast = toFloat(channelId);
    if (!channelIdCast) {
      return;
    }
    let templateParameters: TemplateMessageComponentType[] | undefined = [];
    try {
      if (template && template.templateContent) {
        templateParameters = normalize360DialogComponents(
          template.templateContent,
          template
        );
      }
      const results = await submitTestWhatsapp360DialogMessage({
        templateParameters: templateParameters ?? [],
        templateName: templateId,
        templateLanguage: templateLanguage,
        templateNamespace: template?.templateContent?.namespace ?? "",
        whatsapp360DialogChannelId: channelIdCast,
        userProfileIds: profileIdList,
      });

      flash(
        t("flash.broadcast.success", {
          count: results.testBlastMessageSummary.sentCount,
        })
      );
    } catch (e) {
      console.error(e);
    }
  }

  async function chooseTemplate(templateId: string, language: string) {
    dispatch({ type: "TEMPLATE_SELECTION_HIDE" });
    const channel = form.values.channel;
    if (!channel) {
      return;
    }

    const templateMatch = getTemplateSelected(
      templateId,
      channel.ids[0],
      language
    );
    if (!templateMatch) {
      return;
    }

    const messageToUpdate = form.values.message;
    const fragments = extractWhatsAppFragment(templateMatch);
    const firstVar = fragments.content.find(
      (fr) => fr.type === "var"
    ) as VarNodeType;
    const lastInputId = firstVar ? `content_${firstVar.name}` : undefined;
    const message = updateWhatsapp360MessageTemplate(
      messageToUpdate,
      templateMatch,
      {
        language,
        templateName: templateId,
      }
    );
    if (message.sendWhatsAppTemplate) {
      message.sendWhatsAppTemplate.lastVarInputId = lastInputId;
    }
    form.setValues({
      ...form.values,
      templateId: templateId,
      templateLanguage: language,
      message: message,
    });
  }

  function confirmSend() {
    dispatch({ type: "SUBMIT_CONFIRMED" });
    form.submitForm();
  }

  function cancelSend() {
    dispatch({ type: "SUBMIT_CANCELED" });
  }

  function startSubmit() {
    return dispatch({ type: "SUBMIT_REQUESTED" });
  }

  function startTemplateSelection() {
    return dispatch({ type: "TEMPLATE_SELECTION_SHOW" });
  }

  function clearTemplateSelection() {
    form.setValues({
      ...form.values,
      templateId: null,
      message: createBlankWhatsappChannelMessage(form.values.channel),
      templateLanguage: null,
    });
  }

  return {
    submitForm,
    submitTestMessage,
    confirmSend,
    cancelSend,
    startSubmit,
    chooseTemplate,
    clearTemplateSelection,
    startTemplateSelection,
  };
}
