import produce from "immer";
import insertTextAtCursor from "insert-text-at-cursor";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dimmer, Image, Loader } from "semantic-ui-react";
import fetchWhatsappTemplates from "../../../../../api/Company/fetchWhatsappTemplates";
import { useAppDispatch, useAppSelector } from "../../../../../AppRootContext";
import {
  denormalizeTemplateMessage,
  filterApprovedTemplates,
  useWhatsappTemplates,
} from "../../../../../container/Settings/OfficialWhatsApp/useWhatsappTemplates";
import {
  SendMessageAutomationActionType,
  SendWhatsApp360DialogExtendedAutomationMessages,
  SendWhatsAppAutomationTemplateState,
  SendWhatsAppCloudAPIExtendedAutomationMessages,
} from "../../../../../types/AutomationActionType";
import { WhatsApp360DialogConfigsType } from "../../../../../types/CompanyType";
import { WhatsappTemplateResponseType } from "../../../../../types/WhatsappTemplateResponseType";
import BroadcastChannel from "../../../../Broadcast/BroadcastChannel/BroadcastChannel";
import { VariablesSelection } from "../../../../Broadcast/VariablesSelection";
import useCompanyChannels, {
  iconFactory,
} from "../../../../Chat/hooks/useCompanyChannels";
import { getInputId } from "../../../../Chat/Messenger/SelectWhatsappTemplate/EditTemplateInline";
import { getDefaultVariableValues } from "../../../../Chat/Messenger/SelectWhatsappTemplate/getDefaultVariableValues";
import { SelectMode } from "../../../../Chat/Messenger/SelectWhatsappTemplate/SelectMode/SelectMode";
import EmojiButton from "../../../../EmojiButton";
import { FieldError } from "../../../../shared/form/FieldError";
import { InfoTooltip } from "../../../../shared/popup/InfoTooltip";
import { TargetChannelDropdown } from "../../input/TargetChannelDropdown";
import { SendMessageActionProps } from "../SendMessageAction";
import WaitTimeAction, { AddWaitActionButton } from "../WaitTimeAction";
import SendInteractiveMessageForm from "./InteractiveMessage/SendInteractiveMessageForm";
import SendMessageOverlay from "./SendMessageOverlay";
import SendMessageTemplateDisplay from "./SendMessageTemplateDisplay";
import styles from "./SendWhatsApp360DialogMessage.module.css";
import actionStyles from "../AutomationAction.module.css";
import sendStyles from "../SendMessageAction.module.css";
import { denormalizeTemplateVariables } from "../../../../Broadcast/BroadcastContent/denormalizeTemplateVariables";
import { ActionFormContext } from "../../ActionsForm/ActionFormContext";
import { isWhatsApp360DialogConfigType } from "../../../../../features/Whatsapp360/API/get360DialogChannel";
import { NormalizedWhatsAppTemplateType } from "../../../../../features/Whatsapp360/models/OptInType";
import { useSelectWhatsappTemplateFlow } from "component/Chat/Messenger/SelectWhatsappTemplate/useSelectWhatsappTemplateFlow";
import {
  ChannelConfiguredType,
  WhatsappChannelType,
} from "component/Chat/Messenger/types";
import { WhatsappCloudAPIConfigType } from "features/WhatsappCloudAPI/models/WhatsappCloudAPIConfigType";
import { ChannelTabType } from "component/Settings/types/SettingTypes";
import useInitializeTabs from "container/Settings/OfficialWhatsApp/useInitializeTabs";
import { isCloudAPIChannelType } from "component/Settings/SettingTemplates/SettingTemplates";
import { getTemplateResponseKey } from "lib/utility/getTemplateResponseKey";
import { TargetedChannelType } from "types/BroadcastCampaignType";

interface SendWhatsApp360DialogMessageProps extends SendMessageActionProps {
  action: SendMessageAutomationActionType;
}

export function denormalizeSendWhatsApp(
  denormalizedTemplate: NormalizedWhatsAppTemplateType,
  parameters: string[],
  whatsApp360DialogExtendedAutomationMessages?: SendWhatsApp360DialogExtendedAutomationMessages,
  cloudAPIAutomationMessages?: SendWhatsAppCloudAPIExtendedAutomationMessages
): SendWhatsAppAutomationTemplateState | undefined {
  const cloudAPIAutomationTemplateMessage =
    cloudAPIAutomationMessages?.whatsappCloudApiByWabaExtendedAutomationMessages?.find(
      (c) =>
        c.extendedMessagePayloadDetail.whatsappCloudApiTemplateMessageObject
    );
  const selectedTemplate =
    whatsApp360DialogExtendedAutomationMessages?.whatsapp360DialogTemplateMessage ??
    cloudAPIAutomationTemplateMessage?.extendedMessagePayloadDetail
      .whatsappCloudApiTemplateMessageObject;

  if (!selectedTemplate) {
    return;
  }
  const { templateName, language, components } = selectedTemplate;
  const key = getTemplateResponseKey({
    language,
    templateName,
    channel: cloudAPIAutomationTemplateMessage
      ? "whatsappcloudapi"
      : "whatsapp360dialog",
  });
  const template =
    denormalizedTemplate[key]?.translations[language] ?? undefined;

  const { variables, file } = denormalizeTemplateVariables(
    parameters,
    components
  );

  return {
    wabaAccountId:
      whatsApp360DialogExtendedAutomationMessages?.wabaAccountId ??
      cloudAPIAutomationTemplateMessage?.messagingHubWabaId,
    templateLanguage: language,
    templateName: key,
    templateContent: template,
    variables,
    file,
  };
}
function find360dialogChannelFromList(
  list: ChannelTabType[],
  selectedChannel: TargetedChannelType
) {
  const ids = selectedChannel.ids?.map((id) => Number(id)) ?? [];
  return list.find((chnl) =>
    chnl.ids?.some((chnlId) => {
      return ids.includes(chnlId);
    })
  );
}
function findCloudAPIChannelFromList(
  list: ChannelTabType[],
  selectedChannel: TargetedChannelType
) {
  const ids = selectedChannel.ids?.map((id) => id) ?? [];
  return list.find(
    (chnl) =>
      chnl.channelType === "whatsappcloudapi" &&
      isCloudAPIChannelType(chnl) &&
      chnl.config.some((c) => ids.includes(c.whatsappPhoneNumber))
  );
}
export default function SendWhatsApp360DialogMessage(
  props: SendWhatsApp360DialogMessageProps
) {
  const {
    action,
    setAction,
    waitActionAdd,
    waitActionChange,
    waitActionRemove,
    canAddWaitAction,
    canSendInteractiveMessage,
  } = props;
  const { t } = useTranslation();
  const { readonly } = useContext(ActionFormContext);
  const [selectedChannel, setSelectedChannel] = useState<ChannelTabType>();
  const [channels, setChannels] = useState<ChannelTabType[]>([]);
  const [selectedMode, setSelectedMode] = useState<string>();
  const [isDisplayModal, setIsDisplayModal] = useState(false);
  const loginDispatch = useAppDispatch();
  const { fetch360Templates, fetchCloudApiTemplates } = useWhatsappTemplates();
  const [loading, setLoading] = useState(true);
  const whatsappTemplates = useAppSelector((s) => s.inbox.whatsAppTemplates);
  const textareaId = `automation-sendmessage-text${props.action.componentId}`;
  const { fetchTabs } = useInitializeTabs(true);
  useEffect(() => {
    if (!selectedChannel) {
      return;
    }
    if (selectedChannel.is360Dialog && selectedChannel.ids) {
      setLoading(true);
      Promise.all(
        selectedChannel.ids.map((id) => fetch360Templates(Number(id)))
      )
        .then((res) => {
          const templates = res.reduce(
            (acc, curr) => ({
              ...acc,
              ...curr,
            }),
            {}
          );
          loginDispatch({
            type: "INBOX.WHATSAPP_360TEMPLATE.LOADED",
            templates: templates,
          });
        })
        .catch((e) => console.error(e))
        .finally(() => {
          setLoading(false);
        });
    } else if (selectedChannel.isCloudAPI && selectedChannel.ids) {
      if (!selectedChannel.wabaId) {
        return;
      }
      fetchCloudApiTemplates(selectedChannel.wabaId, true)
        .then((result) => {
          const [id] = selectedChannel.ids ?? [];
          loginDispatch({
            type: "INBOX.WHATSAPP_CLOUDAPI.LOADED",
            channelId: id,
            templates: result,
          });
        })
        .catch((e) => {
          console.error(`fetchCloudApiTemplates ${e}`);
        })
        .finally(() => {
          setLoading(false);
        });
    } else if (selectedChannel.ids) {
      Promise.all(
        selectedChannel.ids.map((id) => fetchWhatsappTemplates(0, 250, id + ""))
      )
        .then((res) => {
          const templatesResp = res.reduce(
            (acc, curr) => ({
              ...acc,
              ...curr,
            }),
            {}
          );
          const filteredQuickReply = filterApprovedTemplates(
            templatesResp as WhatsappTemplateResponseType
          );
          const denormalizedTemplate =
            denormalizeTemplateMessage(filteredQuickReply);
          loginDispatch({
            type: "INBOX.WHATSAPP_TEMPLATES.LOADED",
            templates: denormalizedTemplate,
          });
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [selectedChannel?.channel, selectedChannel?.ids?.join()]);

  useEffect(() => {
    if (action.sendWhatsappTemplate?.templateContent) {
      setSelectedMode(
        selectedChannel?.wabaId === action.sendWhatsappTemplate.wabaAccountId
          ? "template"
          : undefined
      );
    } else if (action.messageContent) {
      setSelectedMode("type");
    }
  }, [
    action.messageContent,
    selectedChannel?.channel,
    action.sendWhatsappTemplate?.templateContent,
  ]);
  useEffect(() => {
    try {
      fetchTabs().then((res) => {
        const [selectedChannel] = action.targetedChannelWithIds ?? [];
        const includedChannels: ChannelTabType[] = [
          ...res,
          {
            channel: t("automation.action.sendMessage.field.allChannel"),
            is360Dialog: false,
            isCloudAPI: false,
            phone: "",
          },
        ];
        let firstChannel = includedChannels[0];
        if (
          !action.whatsApp360DialogExtendedAutomationMessages?.length ||
          !action.extendedAutomationMessage
            ?.whatsappCloudApiByWabaExtendedAutomationMessages?.length
        ) {
          if (selectedChannel) {
            if (selectedChannel.channel === "whatsapp360dialog") {
              firstChannel =
                find360dialogChannelFromList(
                  includedChannels,
                  selectedChannel
                ) ?? firstChannel;
            } else if (selectedChannel.channel === "whatsappcloudapi") {
              firstChannel =
                findCloudAPIChannelFromList(
                  includedChannels,
                  selectedChannel
                ) ?? firstChannel;
            }
          } else {
            firstChannel =
              includedChannels.find(
                (c) =>
                  action.whatsApp360DialogExtendedAutomationMessages?.some(
                    (w) => w.wabaAccountId === c.wabaId
                  ) ||
                  action.extendedAutomationMessage?.whatsappCloudApiByWabaExtendedAutomationMessages?.some(
                    (w) => w.messagingHubWabaId === c.wabaId
                  )
              ) ?? firstChannel;
          }
        }
        if (!selectedChannel?.channel) {
          if (firstChannel?.is360Dialog) {
            setAction(
              produce(action, (draft) => {
                draft.channelType = "whatsapp360dialog";
              })
            );
          } else if (firstChannel?.isCloudAPI) {
            setAction(
              produce(action, (draft) => {
                draft.channelType = "whatsappcloudapi";
              })
            );
          }
        }
        setChannels(includedChannels);
        setSelectedChannel(firstChannel ?? includedChannels[0]);
      });
    } catch (e) {
      console.error(`fetch360DialogWaba error ${e}`);
    }
  }, [
    JSON.stringify([
      action.targetedChannelWithIds,
      action.whatsApp360DialogExtendedAutomationMessages,
      action.extendedAutomationMessage
        ?.whatsappCloudApiByWabaExtendedAutomationMessages,
    ]),
  ]);

  useEffect(() => {
    if (
      !action.targetedChannelWithIds ||
      action.targetedChannelWithIds.length === 0
    ) {
      if (
        action.whatsApp360DialogExtendedAutomationMessages &&
        action.whatsApp360DialogExtendedAutomationMessages.length === 0 &&
        action.extendedAutomationMessage
          ?.whatsappCloudApiByWabaExtendedAutomationMessages &&
        action.extendedAutomationMessage
          ?.whatsappCloudApiByWabaExtendedAutomationMessages?.length === 0
      ) {
        setSelectedChannel(
          channels.find(
            (c) =>
              c.channel === t("automation.action.sendMessage.field.allChannel")
          )
        );
      }
      return;
    } else if (
      action.targetedChannelWithIds.some(
        (chnl) => chnl.channel === "whatsapp360dialog"
      )
    ) {
      const [channel] = action.targetedChannelWithIds;
      const selectedChannel = find360dialogChannelFromList(channels, channel);
      setSelectedChannel(selectedChannel);
    } else if (
      action.targetedChannelWithIds.some(
        (chnl) => chnl.channel === "whatsappcloudapi"
      )
    ) {
      const [channel] = action.targetedChannelWithIds;
      const selectedChannel = findCloudAPIChannelFromList(channels, channel);
      setSelectedChannel(selectedChannel);
    }
  }, [
    JSON.stringify([
      action.targetedChannelWithIds,
      action.whatsApp360DialogExtendedAutomationMessages,
      action.extendedAutomationMessage
        ?.whatsappCloudApiByWabaExtendedAutomationMessages,
      channels,
    ]),
  ]);
  const isAllChannelSelected =
    channels.find((c) => c.channel === selectedChannel?.channel)?.wabaId ===
    undefined;

  let channelType: WhatsappChannelType | undefined = undefined;

  switch (true) {
    case Boolean(selectedChannel?.isCloudAPI):
      channelType = "whatsappcloudapi";
      break;
    case Boolean(selectedChannel?.wabaId || selectedChannel?.is360Dialog):
      channelType = "whatsapp360dialog";
      break;
    default:
      channelType = "twilio_whatsapp";
      break;
  }
  const [id] = selectedChannel?.ids ?? [];
  //todo load and select from separate cache to avoid bugs
  const { templates } = useSelectWhatsappTemplateFlow(
    undefined,
    channelType,
    id
  );

  function updateSelectedChannel(channel: ChannelTabType) {
    if (channel.wabaId !== selectedChannel?.wabaId) {
      setSelectedMode(undefined);
      setSelectedChannel(channel);
      if (channel.is360Dialog && action.channelType === "whatsappcloudapi") {
        setAction(
          produce(action, (draft) => {
            draft.channelType = "whatsapp360dialog";
          })
        );
      }
      if (channel.isCloudAPI && action.channelType === "whatsapp360dialog") {
        setAction(
          produce(action, (draft) => {
            draft.channelType = "whatsappcloudapi";
          })
        );
      }
    }
  }

  function updateSelectMode(mode: string) {
    setSelectedMode(mode);
    if (mode === "template") {
      setIsDisplayModal(true);
    } else {
      setAction(
        produce(action, (draft) => {
          draft.messageContent = "";
          draft.sendWhatsappTemplate = undefined;
          draft.whatsApp360DialogExtendedAutomationMessages = undefined;
          draft.extendedAutomationMessage = undefined;
        })
      );
    }
  }

  const [configId] =
    (selectedChannel?.is360Dialog || selectedChannel?.isCloudAPI) &&
    selectedChannel.ids
      ? selectedChannel.ids
      : [];

  function clearTemplate() {
    setAction(
      produce(action, (draft) => {
        draft.sendWhatsappTemplate = undefined;
        draft.messageContent = "";
      })
    );
    setSelectedMode(undefined);
  }

  function confirmTemplate() {
    setIsDisplayModal(true);
    setAction(
      produce(action, (draft) => {
        draft.messageContent = "";
      })
    );
    setSelectedMode("template");
  }

  const selectTemplateAndLanguage = (templateId: string, language: string) => {
    const [id] =
      channelType === "whatsappcloudapi" ? selectedChannel?.ids ?? [] : [];
    const channelTemplates =
      channelType === "whatsappcloudapi"
        ? whatsappTemplates.whatsappCloudApiTemplates.find(
            (s) => s.channelId === id
          )?.data
        : whatsappTemplates.whatsapp360Templates.data;
    if (!channelTemplates) {
      return;
    }
    const selectedTemplateId = getTemplateResponseKey({
      templateName: templateId,
      language: language,
      channel: channelType!,
    });
    setAction(
      produce(action, (draft) => {
        const optIn =
          channelTemplates[selectedTemplateId].translations[language];
        draft.sendWhatsappTemplate = {
          wabaAccountId: selectedChannel?.wabaId,
          templateLanguage: language,
          templateName: selectedTemplateId,
          templateContent: optIn,
          variables: getDefaultVariableValues(optIn),
        };
      })
    );
    setIsDisplayModal(false);
  };

  const cancelTemplateSelection = () => {
    setIsDisplayModal(false);
    setSelectedMode(undefined);
  };
  function setTargetedChannelAction(action: SendMessageAutomationActionType) {
    setAction(
      produce(action, (draft) => {
        const [selectedChannel] = action.targetedChannelWithIds ?? [];
        if (selectedChannel?.channel) {
          draft.channelType = selectedChannel.channel;
        }
      })
    );
  }
  return (
    <div
      className={`
    ${styles.root} ${actionStyles.action}
    ${readonly ? actionStyles.readonly : ""}
    ${readonly ? styles.readonly : ""}
    `}
    >
      {action.actionWaitDenormalized && (
        <WaitTimeAction
          action={action.actionWaitDenormalized}
          onChange={(action) => {
            waitActionChange(action);
          }}
          onRemove={waitActionRemove}
          error={props.waitError}
        />
      )}
      <div
        className={`${sendStyles.labelSection} ${
          canAddWaitAction ? styles.padCloseBtn : ""
        }`}
      >
        <div className={sendStyles.item}>
          <label>{props.title}</label>
        </div>
        {
          <div className={`${sendStyles.item} ${sendStyles.fluid}`}>
            <div className="ui input fluid">
              <InfoTooltip
                placement={"right"}
                children={t("automation.tooltip.form.sendMessageChannel")}
                trigger={
                  <TargetChannelDropdown
                    setAction={setTargetedChannelAction}
                    action={action}
                    disabled={readonly}
                  />
                }
              />
            </div>
          </div>
        }
        <div className={sendStyles.item}>
          {canAddWaitAction && (
            <AddWaitActionButton onAddAction={waitActionAdd} />
          )}
        </div>
      </div>
      <div className={styles.contentGrid}>
        {(!action.targetedChannelWithIds ||
          action.targetedChannelWithIds.length === 0) && (
          <div className={styles.header}>
            <div className={styles.channels}>
              {channels.map((channel, index) => (
                <BroadcastChannel
                  key={`${channel.channel}_${index}`}
                  updatedSelectedChannel={() => updateSelectedChannel(channel)}
                  isSelected={channel.wabaId === selectedChannel?.wabaId}
                  index={index}
                  isError={false}
                  channelName={channel.channel}
                  iconFactory={
                    channel.wabaId
                      ? channel.isCloudAPI
                        ? iconFactory("whatsappcloudapi")
                        : iconFactory("whatsapp360dialog")
                      : undefined
                  }
                />
              ))}
            </div>
            {(selectedChannel?.is360Dialog || selectedChannel?.isCloudAPI) && (
              <SendWhatsApp360DialogMessageHeader
                type={
                  selectedChannel?.is360Dialog
                    ? "whatsapp360dialog"
                    : "whatsappcloudapi"
                }
                wabaId={selectedChannel.wabaId}
                channelIds={selectedChannel.ids ?? []}
              />
            )}
          </div>
        )}
        <div className={styles.content}>
          {isAllChannelSelected ? (
            <div className={sendStyles.controlText}>
              <textarea
                id={textareaId}
                className={`ui input ${sendStyles.textContent}`}
                value={action.messageContent ?? ""}
                disabled={readonly}
                onChange={(ev) => {
                  setAction(
                    produce(action, (actionDraft) => {
                      actionDraft.messageContent = ev.target.value;
                    })
                  );
                }}
              />
              {!readonly && (
                <div className={sendStyles.textControls}>
                  <EmojiButton
                    handleEmojiInput={(emoji) => {
                      let textarea = document.getElementById(
                        textareaId
                      ) as HTMLTextAreaElement;
                      if (textarea) {
                        insertTextAtCursor(textarea, emoji);
                      }
                    }}
                  />
                </div>
              )}
            </div>
          ) : (
            <>
              <div className={styles.label}>
                <label>
                  {t("automation.action.sendMessage.field.textarea.label")}
                </label>
                <div className={styles.templateControls}>
                  {selectedMode === "type" && (
                    <span className={styles.link} onClick={confirmTemplate}>
                      {t(
                        "automation.action.sendMessage.field.textarea.selectTemplate"
                      )}
                    </span>
                  )}
                  {selectedMode === "template" && (
                    <span className={styles.link} onClick={clearTemplate}>
                      {t(
                        "automation.action.sendMessage.field.textarea.clearTemplate"
                      )}
                    </span>
                  )}
                </div>
              </div>
              <div className={sendStyles.controlText}>
                {selectedMode && channelType ? (
                  <SendMessageTemplateDisplay
                    configId={configId}
                    mode={selectedMode}
                    setAction={setAction}
                    textareaId={textareaId}
                    action={action}
                    readonly={readonly}
                    channelType={channelType}
                  />
                ) : (
                  <Dimmer.Dimmable className={styles.dimmer}>
                    <Dimmer inverted active={loading}>
                      <Loader active={true} />
                    </Dimmer>
                    <SendMessageOverlay setSelectedMode={updateSelectMode} />
                  </Dimmer.Dimmable>
                )}
              </div>
            </>
          )}
        </div>

        {!readonly && (
          <div className={styles.variables}>
            <div className={styles.label}>
              <label>
                {t("automation.action.sendMessage.field.variables.label")}
              </label>
            </div>
            <VariablesSelection
              isSearchable={false}
              bordered
              hideHeader
              compactItems
              restrictHeight={245}
              updateText={(text) => {
                if (!action.sendWhatsappTemplate) {
                  setAction(
                    produce(action, (actionDraft) => {
                      actionDraft.messageContent = text;
                    })
                  );
                }
              }}
              textareaId={
                action.sendWhatsappTemplate?.lastVarInputId
                  ? getInputId(action.sendWhatsappTemplate.lastVarInputId)
                  : textareaId
              }
            />
          </div>
        )}
        {!isAllChannelSelected && selectedMode === undefined && (
          <div className={styles.note}>
            {t("automation.action.sendMessage.templateNote")}
          </div>
        )}
      </div>
      {selectedMode === "template" && isDisplayModal && (
        <SelectMode
          channelType={channelType}
          anchor={document.body}
          onClose={cancelTemplateSelection}
          conversationId=""
          onSelect={selectTemplateAndLanguage}
          templatesList={templates}
        />
      )}
      {(selectedChannel?.is360Dialog || selectedChannel?.isCloudAPI) &&
        selectedMode === "type" &&
        canSendInteractiveMessage && (
          <SendInteractiveMessageForm
            action={action}
            setAction={setAction}
            wabaAccountId={selectedChannel?.wabaId}
          />
        )}
      {props.error && (
        <FieldError text={props.error} className={"standalone-error"} />
      )}
      {selectedMode === "template" && isDisplayModal && (
        <SelectMode
          templatesList={templates}
          channelType={channelType}
          anchor={document.body}
          onClose={() => {
            setIsDisplayModal(false);
            setSelectedMode(undefined);
          }}
          conversationId=""
          onSelect={selectTemplateAndLanguage}
        />
      )}
    </div>
  );
}

function SendWhatsApp360DialogMessageHeader(props: {
  wabaId?: string;
  channelIds: number[];
  type: string;
}) {
  const companyChannels = useCompanyChannels();
  const whatsapp360DialogChannel = props.wabaId
    ? companyChannels
        .find((c) =>
          filterWhatsppChannel(c, props.type, props.channelIds, props.wabaId)
        )
        ?.configs?.reduce((prev, curr) => {
          const result = formatWhatsAppChannels(
            curr,
            props.channelIds,
            props.type,
            props.wabaId
          );
          return result ? [...prev, curr] : prev;
        }, [])
    : companyChannels
        .find((c) =>
          c.configs?.some(
            (config) =>
              isWhatsApp360DialogConfigType(config) &&
              props.channelIds.includes(config.id)
          )
        )
        ?.configs?.reduce(
          (prev, curr) =>
            isWhatsApp360DialogConfigType(curr) &&
            props.channelIds.includes(curr.id)
              ? [...prev, curr]
              : prev,
          []
        );
  const { t } = useTranslation();
  return (
    <div className={styles.selectedChannelHeader}>
      <div className={styles.channels}>
        <div className={styles.label}>{t("form.channelsIncluded")}</div>
        <div className={styles.list}>
          {whatsapp360DialogChannel?.map(
            (c: { channelId: string; channelName: string }) => {
              return (
                <div
                  key={`${c.channelId}_${c.channelName}`}
                  className={styles.channel}
                >
                  <Image src={iconFactory("whatsapp360dialog")} />
                  <div className={styles.name}>{c.channelName}</div>
                </div>
              );
            }
          )}
        </div>
      </div>
      <div>{t("automation.action.sendMessage.field.channels.reminder")}</div>
    </div>
  );
}

function formatWhatsAppChannels(
  companyChannel: WhatsappCloudAPIConfigType | WhatsApp360DialogConfigsType,
  channelIds: number[],
  selectedChannelType: string,
  wabaId?: string
) {
  if (["whatsappcloudapi", "whatsapp360dialog"].includes(selectedChannelType)) {
    if (channelIds.includes(companyChannel.id)) {
      return {
        channelId: companyChannel.id,
        channelName: companyChannel.channelName,
      };
    }
    return undefined;
  }
  return undefined;
}

function filterWhatsppChannel(
  c: ChannelConfiguredType<any>,
  channelType: string,
  channelIds: number[],
  wabaId?: string
) {
  if (c.type === channelType) {
    if (wabaId) {
      if (channelType === "whatsappcloudapi") {
        return c.configs?.some(
          (c) => c.messagingHubWabaId === wabaId && channelIds.includes(c.id)
        );
      }
      return c.configs?.some(
        (c) => c.wabaAccountId === wabaId && channelIds.includes(c.id)
      );
    }
    return c.configs?.some((c) => channelIds.includes(c.id));
  }
  return false;
}
