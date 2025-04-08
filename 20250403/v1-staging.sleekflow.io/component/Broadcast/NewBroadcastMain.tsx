import React, { useEffect, useReducer, useState } from "react";
import {
  AudienceType,
  TargetedChannelType,
} from "../../types/BroadcastCampaignType";
import BroadcastContext, {
  BroadcastCampaignContextType,
  broadcastContextDefaults,
} from "./BroadcastContext";
import { Dimmer, Loader, Menu } from "semantic-ui-react";
import "../../style/css/new-broadcast-content.css";
import { useBroadcastReducer } from "./broadcastReducer";
import Helmet from "react-helmet";
import { useTranslation } from "react-i18next";
import { ENABLED_CHANNELS, GeneralSetting } from "./GeneralSetting";
import { useLocation } from "react-router";
import { useAppDispatch, useAppSelector } from "../../AppRootContext";
import BroadcastContent from "./BroadcastContent/BroadcastContent";
import useCompanyChannels from "../Chat/hooks/useCompanyChannels";
import { useFlashMessageChannel } from "../BannerMessage/flashBannerMessage";
import useFetchCompany from "../../api/Company/useFetchCompany";
import { fetchBroadcastCampaign } from "../../api/Broadcast/fetchBroadcastCampaign";
import { useWhatsappTemplates } from "../../container/Settings/OfficialWhatsApp/useWhatsappTemplates";
import { ActionsEditor } from "./ActionsEditor/ActionsEditor";
import { AutomationActionType } from "../../types/AutomationActionType";
import { denormalizeTargetedChannel } from "./BroadcastContent/denormalizeTargetedChannel";
import { transformToEditableContent } from "./BroadcastContent/transformToEditableContent";
import { denormalizeTemplateVariables } from "./BroadcastContent/denormalizeTemplateVariables";
import { extractContactListIdsFrom } from "./BroadcastContent/extractContactListIdsFrom";
import {
  denormalizeRuleActions,
  unwrapMessageTemplates,
} from "../AssignmentRules/AutomationRuleEdit/denormalizeAutomationRule";
import getIsReadOnlyCampaign from "./helpers/getIsReadOnlyCampaign";
import { denormalizeCampaignChannelMessages } from "./BroadcastContent/denormalizeCampaignChannelMessages";
import { pipe } from "ramda";
import { SelectInitTemplates } from "./WalkthoughGuide/NewBroadcastContent/SelectInitTemplates";
import { Footer } from "./NewBroadcast/Footer";
import { saveCampaign } from "./NewBroadcastHeader/saveCampaign";
import { DisableControls } from "../../core/components/DisableControls/DisableControls";
import { fromApiCondition } from "../../api/Contacts/fromApiCondition";
import { useWhatsappTwilioChat } from "features/WhatsappTwilio/usecases/Inbox/useWhatsappTwilioChat";
import { NormalizedWhatsAppTemplateLanguageType } from "features/Whatsapp360/models/OptInType";
import {
  extractTemplateName,
  getTemplateResponseKey,
} from "lib/utility/getTemplateResponseKey";
import mixpanel from "mixpanel-browser";
export function NewBroadcastMain(props: {
  id?: string;
  contactListIds?: number[];
}) {
  const { id, contactListIds } = props;
  const [loading, isLoading] = useState(true);
  const [isActionsEditorVisible, setIsActionsEditorVisible] = useState(false);
  const [broadcastCampaign, companyId] = useAppSelector((s) => [
    s.broadcastCampaign,
    s.company?.id,
  ]);
  const existingCampaign = broadcastCampaign?.find(
    (broadcast) => broadcast.id === id
  );
  const companyChannels = useCompanyChannels();
  const loginDispatch = useAppDispatch();
  const flash = useFlashMessageChannel();
  const { refreshCompany, company } = useFetchCompany();

  const twilioChat = useWhatsappTwilioChat();
  const {
    fetch360Templates,
    fetchCloudApiTemplates,
    fetchWhatsappTemplates: fetchTwilioWhatsappTemplates,
  } = useWhatsappTemplates();
  const { t, i18n } = useTranslation();

  const location = useLocation();
  const contactListId = location.state as {
    contacts: number;
  };

  const initContextValue: BroadcastCampaignContextType = {
    ...broadcastContextDefaults(),
    ...(existingCampaign ?? {}),
    filterList: [],
    contactLists: contactListIds ?? existingCampaign?.contactLists ?? [],
  };
  const broadcastReducer = useBroadcastReducer();
  const [broadcastInfo, broadcastDispatch] = useReducer(
    broadcastReducer,
    initContextValue
  );

  const {
    contactLists,
    channelsWithIds,
    name,
    scheduledAt,
    campaignChannelMessages,
    automationActions,
    stripePaymentRequestOption,
  } = broadcastInfo;

  async function save() {
    if (!company) {
      return;
    }
    const result = await saveCampaign(
      id ?? broadcastInfo.id,
      name,
      contactLists,
      channelsWithIds,
      campaignChannelMessages,
      automationActions ?? [],
      company,
      scheduledAt,
      stripePaymentRequestOption
    );

    broadcastDispatch({ type: "UPDATE_BROADCAST_ID", id: result.id });

    if (result) {
      if (!broadcastInfo.id) {
        mixpanel.track("Broadcast Created");
      } else {
        mixpanel.track("Broadcast Edited");
      }
      flash(t("flash.broadcast.save.success"));
    }
  }

  useEffect(() => {
    if (contactListId?.contacts) {
      broadcastDispatch({
        type: "UPDATE_CONTACT_LISTS",
        contactLists: [Number(contactListId.contacts)],
      });
    }
  }, [contactListId?.contacts]);

  useEffect(() => {
    const getBroadcastById = async (id: string) => {
      const result = await fetchBroadcastCampaign(id);

      const {
        templateName,
        templateContent,
        conditions,
        targetedChannelWithIds,
        templateParams,
        updatedAt,
        status,
        uploadedFiles,
        scheduledAt,
        stripePaymentRequestOption,
      } = result;

      let content = transformToEditableContent(templateContent, templateParams);
      const audienceTypes = conditions.reduce<AudienceType[]>((acc, c) => {
        try {
          return [...acc, fromApiCondition(c)];
        } catch {
          return acc;
        }
      }, []);
      const campaignChannelMessages = denormalizeCampaignChannelMessages(
        companyChannels,
        result
      );
      broadcastDispatch({
        type: "UPDATE_ALL",
        audienceTypes: audienceTypes,
        name: templateName,
        status: status.charAt(0).toUpperCase() + status.substring(1),
        lastUpdated: updatedAt,
        channelsWithIds: denormalizeTargetedChannel(
          companyChannels,
          targetedChannelWithIds
        ),
        contactLists: extractContactListIdsFrom(conditions),
        scheduledAt,
        content,
        id: result.id,
        params: templateParams,
        fileList: uploadedFiles,
        campaignChannelMessages: campaignChannelMessages,
        companyChannels: companyChannels,
        automationActions: pipe(
          unwrapMessageTemplates,
          denormalizeRuleActions
        )(result.campaignAutomationActions ?? []),
        stripePaymentRequestOption,
      });
      const campaignChannelMessageIndex = campaignChannelMessages.findIndex(
        (message) => message.templateName
      );
      const campaignChannelMessage =
        campaignChannelMessageIndex > -1
          ? campaignChannelMessages[campaignChannelMessageIndex]
          : undefined;
      if (campaignChannelMessage) {
        if (campaignChannelMessage.whatsApp360DialogExtendedCampaignMessage) {
          const selectedLanguage =
            campaignChannelMessage.whatsApp360DialogExtendedCampaignMessage
              .whatsapp360DialogTemplateMessage.language;
          const ids = campaignChannelMessage.targetedChannelWithIds
            .map((target) => target.ids)
            .map((ids) => ids)
            .flat(1);
          Promise.all(ids.map((id) => fetch360Templates(Number(id)))).then(
            (res) => {
              //todo cache the templates found separately, not using INBOX.WHATSAPP_360TEMPLATE.LOADED
              const templates = res.find((templates) =>
                Object.keys(templates).find(
                  (name) => campaignChannelMessage.templateName === name
                )
              );
              if (
                !templates ||
                !campaignChannelMessage.whatsApp360DialogExtendedCampaignMessage
                  ?.whatsapp360DialogTemplateMessage
              ) {
                return;
              }
              const selectedTemplates = Object.values(templates ?? {}).find(
                (value) =>
                  value.translations[selectedLanguage] &&
                  value.template_name === campaignChannelMessage.templateName
              );
              const selectedTemplateWithTranslation =
                selectedTemplates?.translations[selectedLanguage];
              if (!selectedTemplates) {
                return;
              }

              if (selectedTemplateWithTranslation) {
                // let headerTextElem: Whatsapp360DialogTemplateMessageComponentTextParameterType | undefined = undefined;
                const { variables, file } = denormalizeTemplateVariables(
                  campaignChannelMessage.params,
                  campaignChannelMessage
                    .whatsApp360DialogExtendedCampaignMessage
                    .whatsapp360DialogTemplateMessage.components
                );
                broadcastDispatch({
                  type: "SELECTED_TEMPLATE_SELECTION",
                  template: selectedTemplateWithTranslation,
                  language: selectedLanguage,
                  templateName: selectedTemplates.template_name,
                  channelType: "whatsapp360dialog",
                  variables,
                  file,
                  currentId: campaignChannelMessageIndex,
                });
              }
              loginDispatch({
                type: "INBOX.WHATSAPP_360TEMPLATE.LOADED",
                templates: templates,
              });
              // selectedTemplates?.translations[campaignChannelMessage.templateLanguage]
            }
          );
        } else if (
          campaignChannelMessage.whatsappCloudApiTemplateMessageObject
        ) {
          const selectedLanguage =
            campaignChannelMessage.whatsappCloudApiTemplateMessageObject
              .language;
          const ids = campaignChannelMessage.targetedChannelWithIds
            .map((target) => target.ids)
            .map((ids) => ids)
            .flat(1);
          const messagingHubWabaIds = companyChannels
            .find((channel) => channel.type === "whatsappcloudapi")
            ?.configs?.filter((config) =>
              ids.includes(String(config.whatsappPhoneNumber))
            )
            .map((config) => config.messagingHubWabaId);

          if (messagingHubWabaIds) {
            Promise.all(
              messagingHubWabaIds.map((id) => fetchCloudApiTemplates(id, true))
            ).then((res) => {
              const templatesIndex = res.findIndex((templates) =>
                Object.keys(templates).find(
                  (name) =>
                    campaignChannelMessage.templateName ===
                    extractTemplateName({
                      templateName: name,
                      language: selectedLanguage,
                      channel: "whatsappcloudapi",
                    })
                )
              );
              const templates = res[templatesIndex];
              if (
                !templates ||
                !campaignChannelMessage.whatsappCloudApiTemplateMessageObject
              ) {
                return;
              }
              const id = getTemplateResponseKey({
                templateName: campaignChannelMessage.templateName ?? "",
                language: selectedLanguage,
                channel: "whatsappcloudapi",
              });
              const selectedTemplates = templates[id];
              const selectedTemplateWithTranslation =
                selectedTemplates?.translations[selectedLanguage];
              if (!selectedTemplates) {
                return;
              }

              if (selectedTemplateWithTranslation) {
                const { variables, file } = denormalizeTemplateVariables(
                  campaignChannelMessage.params,
                  // @ts-ignore
                  campaignChannelMessage.whatsappCloudApiTemplateMessageObject
                    .components
                );
                broadcastDispatch({
                  type: "SELECTED_TEMPLATE_SELECTION",
                  template: selectedTemplateWithTranslation,
                  language: selectedLanguage,
                  templateName: selectedTemplates.template_name,
                  channelType: "whatsappcloudapi",
                  variables,
                  file,
                  currentId: campaignChannelMessageIndex,
                });
              }
              if (ids[templatesIndex]) {
                loginDispatch({
                  type: "INBOX.WHATSAPP_CLOUDAPI.LOADED",
                  templates: templates,
                  channelId: Number(ids[templatesIndex]),
                });
              }
            });
          }
        } else {
          try {
            const twilioTemplateResponse = await fetchTwilioWhatsappTemplates({
              accountSID: twilioChat.accountSid,
            });
            const sid =
              campaignChannelMessage.extendedMessagePayloadDetail
                ?.whatsappTwilioContentApiObject?.contentSid;
            let selectedTemplate:
              | NormalizedWhatsAppTemplateLanguageType
              | undefined = undefined;
            if (!campaignChannelMessage.templateName) {
              return;
            }
            const templateName = getTemplateResponseKey({
              templateName: campaignChannelMessage.templateName,
              language: i18n.language,
              channel: "twilio_whatsapp",
              sid,
            });
            selectedTemplate = twilioTemplateResponse[templateName];
            if (selectedTemplate) {
              broadcastDispatch({
                type: "SELECTED_TEMPLATE_SELECTION",
                template:
                  selectedTemplate.translations[i18n.language] ??
                  selectedTemplate.translations[
                    Object.keys(selectedTemplate.translations)[0]
                  ],
                language: i18n.language,
                variables: campaignChannelMessage.officialTemplateParams
                  ? {
                      header: {},
                      button: {},
                      content:
                        campaignChannelMessage.officialTemplateParams?.reduce(
                          (acc, value, currIndex) => ({
                            ...acc,
                            [`{{${currIndex + 1}}}`]: value,
                          }),
                          {}
                        ) ?? {},
                    }
                  : undefined,
                templateName: campaignChannelMessage?.templateName ?? "",
                channelType: "twilio_whatsapp",
                currentId: campaignChannelMessageIndex,
              });
            }
            loginDispatch({
              type: "INBOX.WHATSAPP_TEMPLATES.LOADED",
              templates: twilioTemplateResponse,
            });
          } catch (e) {
            flash(t("system.error.unknown"));
            console.error(`fetchWhatsappTemplates error: ${e}`);
          }
        }
      }
      isLoading(false);
      broadcastDispatch({ type: "CONTENT_LOADED", isNewBroadCast: false });
    };

    if (!companyId) {
      refreshCompany();
      return;
    }
    if (id) {
      getBroadcastById(id);
    } else {
      isLoading(false);
    }
  }, [id, companyId]);

  useEffect(() => {
    if (!companyId) {
      return;
    }
    if (!id) {
      broadcastDispatch({ type: "CONTENT_LOADED", isNewBroadCast: true });
    }
  }, [id, companyId]);

  const pageTitle = t("nav.menu.campaignSettings");

  function showActionsEditor() {
    setIsActionsEditorVisible(true);
  }

  function hideActionsEditor() {
    setIsActionsEditorVisible(false);
  }

  function saveActions(actions: AutomationActionType[]) {
    broadcastDispatch({ type: "AUTOMATIONS_UPDATE", actions });
  }

  const isActionsEditorClickable =
    !loading && !getIsReadOnlyCampaign(broadcastInfo.status);

  const chooseInitChannels = (
    value: TargetedChannelType[],
    selectAll: boolean
  ) => {
    broadcastDispatch({
      type: "INIT_CHANNELS_SELECTED",
      channels: value,
      isSelectAll: selectAll,
    });
  };

  return (
    <>
      <Helmet
        title={t("nav.common.title", { page: pageTitle })}
        bodyAttributes={{
          className: "no-margins",
        }}
      />
      {loading ? (
        <Dimmer active inverted>
          <Loader inverted></Loader>
        </Dimmer>
      ) : (
        <BroadcastContext.Provider
          value={{
            ...broadcastInfo,
            broadcastDispatch,
          }}
        >
          <DisableControls
            disabled={getIsReadOnlyCampaign(broadcastInfo.status) || loading}
          >
            <div className="main newbroadcast-content">
              <>
                <Menu vertical className="sidebar">
                  <GeneralSetting />
                  {broadcastInfo.createMode.initChannelsPopup.isVisible && (
                    <SelectInitTemplates
                      channelsAllowed={ENABLED_CHANNELS}
                      confirm={chooseInitChannels}
                    />
                  )}
                </Menu>
                <BroadcastContent />
                <Footer
                  hasActions={
                    (broadcastInfo.automationActions ?? []).length > 0
                  }
                  isActionsEditorClickable={isActionsEditorClickable}
                  onActionsEditorOpen={showActionsEditor}
                  save={save}
                  scheduledAt={scheduledAt}
                />
              </>
            </div>
          </DisableControls>
          {isActionsEditorVisible && (
            <ActionsEditor
              actions={broadcastInfo.automationActions ?? []}
              close={hideActionsEditor}
              save={saveActions}
            />
          )}
        </BroadcastContext.Provider>
      )}
    </>
  );
}
