import {
  ChannelMessageType,
  TargetedChannelType,
} from "../../types/BroadcastCampaignType";
import {
  BroadcastCampaignContextType,
  BroadcastCampaignActionType,
} from "./BroadcastContext";
import { Reducer } from "react";
import { reduceReducers } from "../../utility/reduce-reducers";
import { makeMultiUploadsReducer } from "../Form/MultiUploadInput/multiUploadReducer";
import { UploadedBroadcastFileType } from "../../types/UploadedFileType";
import { eqBy, pick, uniq, update, adjust, mergeRight } from "ramda";
import { WhatsappTemplateNormalizedType } from "../../types/WhatsappTemplateResponseType";
import { getDefaultVariableValues } from "../Chat/Messenger/SelectWhatsappTemplate/getDefaultVariableValues";
import { TemplateVariableState } from "../../App/reducers/Chat/whatsappTemplatesReducer";
import produce from "immer";
import { equalToTargetedChannel } from "./helpers/equalToTargetedChannel";
import { useValidateBroadcastForm } from "./validator/useValidateBroadcastForm";
import {
  createBlankWhatsappChannelMessage,
  updateWhatsapp360MessageTemplate,
} from "./shared/BroadcastTemplateDisplay/createChannelMessage";
import { OptInContentType } from "../../features/Whatsapp360/models/OptInType";
import { isAnyWhatsappChannel } from "core/models/Channel/isAnyWhatsappChannel";
import { FacebookOTNStateType } from "features/Facebook/models/FacebookOTNTypes";
import { getMatchedVariables } from "lib/utility/getMatchedVariables";

function isOfficialChannelExist(targetedChannels: TargetedChannelType[]) {
  return targetedChannels.some((channel) =>
    isAnyWhatsappChannel(channel.channel)
  );
}

export function isTemplateVariableExist(variables: TemplateVariableState) {
  return (
    Object.keys(variables.content).length > 0 ||
    Object.keys(variables.header).length > 0
  );
}

function toChannelMessageGroups(campaignChannelMessages: ChannelMessageType[]) {
  return (acc: ChannelMessageType[], curr: TargetedChannelType) => {
    const foundChannelExist = campaignChannelMessages.find((chnl) => {
      return chnl.targetedChannelWithIds.some(equalToTargetedChannel(curr));
    });
    if (foundChannelExist) {
      return [
        ...acc,
        {
          ...foundChannelExist,
          targetedChannelWithIds: [
            {
              channel: curr.channel,
              ids: curr.ids,
            },
          ],
        },
      ];
    } else {
      return [
        ...acc,
        {
          content: "",
          uploadedFiles: [],
          params: [],
          targetedChannelWithIds: [
            {
              channel: curr.channel,
              ids: curr.ids,
            },
          ],
        },
      ];
    }
  };
}

function isOfficialChannelExists(targetedChannel: TargetedChannelType) {
  return isAnyWhatsappChannel(targetedChannel.channel);
}

function updateOtherChannels(
  channels: TargetedChannelType[],
  state: BroadcastCampaignContextType
) {
  let selectedChannels = [...channels];
  const lastChannel = selectedChannels[selectedChannels.length - 1]?.channel;
  if (
    selectedChannels.length > 1 &&
    selectedChannels.some((chnl) => chnl.channel === "note")
  ) {
    if (lastChannel === "note") {
      selectedChannels = selectedChannels.filter(
        (chnl) => chnl.channel === "note"
      );
    } else {
      selectedChannels = selectedChannels.filter(
        (chnl) => chnl.channel !== "note"
      );
    }
  }
  const updatedChannels = state.channelWithId
    ? uniq([...selectedChannels, state.channelWithId])
    : selectedChannels;
  const updatedCampaignMessages = updatedChannels.reduce(
    (acc: ChannelMessageType[], curr) => {
      const messageExisted = state.campaignChannelMessages.find((chnl) =>
        chnl.targetedChannelWithIds.some((chnl) =>
          eqBy(pick(["channel", "ids"]), chnl, curr)
        )
      );
      if (messageExisted) {
        const channelDependentFields = isAnyWhatsappChannel(curr.channel)
          ? { mode: "template", isSelectedTemplate: false }
          : {};
        return [
          ...acc,
          {
            ...messageExisted,
            ...channelDependentFields,
            targetedChannelWithIds: [
              {
                channel: curr.channel,
                ids: curr.ids,
              },
            ],
          },
        ];
      } else {
        return [...acc, createBlankWhatsappChannelMessage(curr)];
      }
    },
    []
  );
  const [firstChannel] = updatedChannels;
  let selectedChannel = selectedChannels?.some(
    (channel) => channel.channel === state.selectedChannel
  )
    ? state.selectedChannel
    : firstChannel?.channel;
  const numOfChannels = selectedChannels.reduce(
    (acc, curr) => (curr.channel && curr.ids ? acc + curr.ids.length : acc + 1),
    0
  );

  return {
    ...state,
    campaignChannelMessages: updatedCampaignMessages,
    selectedAll:
      lastChannel !== "note" && numOfChannels === state.totalChannels,
    channelsWithIds: selectedChannels,
    otherChannelsWithIds: selectedChannels ?? [],
    selectedChannel,
    isSelectedTemplate: false,
    ...(!isOfficialChannelExist(selectedChannels) && {
      selectedTemplate: undefined,
    }),
  };
}

const broadcastDataReducer: Reducer<
  BroadcastCampaignContextType,
  BroadcastCampaignActionType
> = (state, action) => {
  switch (action.type) {
    case "UPDATE_CHANNELS":
      const selectedDefaultChannel =
        action.channelsWithIds.filter((chanl) => chanl.channel).length > 0
          ? [...action.channelsWithIds].pop()
          : undefined;
      const updatedChannelsWithIds = uniq(
        selectedDefaultChannel
          ? [...state.channelsWithIds, selectedDefaultChannel]
          : state.otherChannelsWithIds ?? []
      );
      const updatedCampaigns = updatedChannelsWithIds.reduce(
        toChannelMessageGroups(state.campaignChannelMessages),
        []
      );
      const [channel] = updatedChannelsWithIds;
      return {
        ...state,
        campaignChannelMessages: updatedCampaigns,
        channelsWithIds: updatedChannelsWithIds,
        channelWithId: selectedDefaultChannel,
        selectedChannel: updatedChannelsWithIds.some(
          (channel) => channel?.channel === state.selectedChannel
        )
          ? state.selectedChannel
          : channel?.channel,
        ...(!isOfficialChannelExist(updatedChannelsWithIds) && {
          isSelectedTemplate: false,
          selectedTemplate: undefined,
        }),
      };
    case "CHANGE_EDIT_MODE":
      return {
        ...state,
        campaignChannelMessages: update(
          action.selectedIndex,
          {
            ...state.campaignChannelMessages[action.selectedIndex],
            mode: action.mode,
            ...(action.mode === "type" && { sendWhatsAppTemplate: undefined }),
          },
          state.campaignChannelMessages
        ),
      };
    case "UPDATE_TOTAL_CHANNELS":
      return {
        ...state,
        totalChannels: action.numOfChannels,
      };
    case "UPDATE_SELECT_ALL_CHANNELS":
      if (action.selectedAll === false) {
        return {
          ...state,
          selectedAll: false,
          channelWithId: undefined,
          channelsWithIds: [],
          otherChannelsWithIds: [],
          campaignChannelMessages: [],
          selectedChannel: undefined,
        };
      }
      return {
        ...state,
        selectedAll: true,
      };
    case "TOGGLE_NOTE_MODAL":
      return {
        ...state,
        isNoteModalOpen: action.isNoteModalOpen,
      };
    case "UPDATE_OTHER_CHANNELS":
      return updateOtherChannels(action.otherChannelsWithIds, state);

    case "UPDATE_DATE":
      return {
        ...state,
        startDate: action.startDate,
      };

    case "UPDATE_SCHEDULE":
      return {
        ...state,
        scheduledAt: action.scheduledAt,
      };

    case "UPDATE_FILTER":
      return {
        ...state,
        audienceTypes: action.audienceTypes,
      };

    case "UPDATE_CONTACT_LISTS":
      return { ...state, contactLists: action.contactLists };

    case "UPDATE_CONTENT":
      return {
        ...state,
        campaignChannelMessages: update(
          action.campaignIndex,
          action.updatedCampaignMessage,
          state.campaignChannelMessages
        ),
        content: action.content ?? "",
      };

    case "UPDATE_FACEBOOK_OTN":
      return {
        ...state,
        campaignChannelMessages: update(
          action.campaignIndex,
          mergeRight(action.prevMessages, {
            facebookOTN: {
              ...action.prevFacebookOTN,
              ...action.currentValue,
            } as FacebookOTNStateType,
          }),
          state.campaignChannelMessages
        ),
      };

    case "UPDATE_TITLE":
      return {
        ...state,
        name: action.name ?? "",
      };

    case "UPDATE_PAYMENT_LINK":
      return {
        ...state,
        stripePaymentRequestOption: action.link,
      };

    case "CLEAR_PAYMENT_LINK":
      return {
        ...state,
        stripePaymentRequestOption: undefined,
      };

    case "CONTENT_LOADED":
      const hasMultipleChannels = state.channelsWithIds.length > 1;
      const hasFallbackChannels = state.channelWithId !== undefined;

      return {
        ...state,
        contentLoaded: true,
        createMode: {
          initChannelsPopup: {
            isSelected: !action.isNewBroadCast,
            isVisible: action.isNewBroadCast,
          },
        },
        rules: {
          canUseMultipleChannels:
            !action.isNewBroadCast &&
            (hasMultipleChannels || hasFallbackChannels),
        },
      };

    case "INIT_CHANNELS_SELECTED": {
      const selectedAll = action.isSelectAll;
      if (selectedAll) {
        return {
          ...state,
          ...updateOtherChannels([], state),
          selectedChannel: undefined,
          channelWithId: undefined,
          otherChannelsWithIds: [],
          createMode: {
            initChannelsPopup: {
              isVisible: false,
              isSelected: true,
            },
          },
          selectedAll: true,
        };
      }

      return {
        ...state,
        ...updateOtherChannels(action.channels, state),
        createMode: {
          initChannelsPopup: {
            isVisible: false,
            isSelected: true,
          },
        },
        selectedAll: false,
      };
    }

    case "UPDATE_ALL":
      const { fileList, contactLists, channelsWithIds, ...restActionFields } =
        action;
      let channelWithId: TargetedChannelType | undefined;
      if (channelsWithIds) {
        const filterOfficialChannels = channelsWithIds.filter((channel) =>
          ["whatsapp", "sms"].includes(channel.channel.toLowerCase())
        );
        if (filterOfficialChannels.length > 0) {
          channelWithId = {
            channel: filterOfficialChannels[0]?.channel || "",
            ids: filterOfficialChannels[0]?.ids && [
              filterOfficialChannels[0]?.ids[0],
            ],
          };
        }
      }
      const [firstCampaignChannel] = [...action.campaignChannelMessages].map(
        (message) => message.targetedChannelWithIds
      );
      const campaignChannelMessages = action.campaignChannelMessages.map(
        (channelMessage) => {
          if (
            channelMessage.targetedChannelWithIds.some(isOfficialChannelExists)
          ) {
            return {
              ...channelMessage,
              mode: channelMessage.content ? "type" : "template",
              isSelectedTemplate: channelMessage.templateName !== undefined,
            };
          }
          return { ...channelMessage };
        }
      );
      return {
        ...state,
        channelsWithIds: channelsWithIds ?? [],
        ...restActionFields,
        channelWithId,
        otherChannelsWithIds: channelsWithIds,
        contactLists,
        campaignChannelMessages: campaignChannelMessages,
        companyChannels: action.companyChannels,
        uploadedFiles: fileList ?? [],
        isSelectedTemplate: action.campaignChannelMessages.some(
          (chnl) =>
            chnl.targetedChannelWithIds.some(
              (channel) => channel.channel === "twilio_whatsapp"
            ) && chnl.templateName
        ),
        templateSelection: false,
        selectedChannel:
          firstCampaignChannel && firstCampaignChannel.length > 0
            ? firstCampaignChannel[0]?.channel
            : undefined,
        automationActions: action.automationActions,
      };
    case "SELECTED_CHANNEL":
      return {
        ...state,
        selectedChannel: action.channel,
      };
    case "UPDATE_BROADCAST_ID":
      return {
        ...state,
        id: action.id ?? "",
      };

    case "CONNECT_TEXTAREA":
      return {
        ...state,
        textarea: action.textarea,
      };

    case "CONNECT_FILES_INPUT":
      return {
        ...state,
        addAttachment: action.addAttachment,
      };
    case "SEND_COMPLETE":
      return {
        ...state,
        status: state.scheduledAt ? "scheduled" : "send",
      };
    default:
      return state;
  }
};

const createValidateReducer =
  (
    validateForm: (
      values: {
        name: string;
        campaignChannelMessages: ChannelMessageType[];
        channelsWithIds: TargetedChannelType[];
      },
      isIncludedContactLists: boolean
    ) => any
  ) =>
  (
    state: BroadcastCampaignContextType,
    action: BroadcastCampaignActionType
  ) => {
    switch (action.type) {
      case "CONTENT_LOADED":
      case "UPDATE_CHANNELS":
      case "UPDATE_ALL":
      case "UPDATE_BROADCAST_ID":
      case "UPDATE_CONTENT":
      case "UPDATE_FACEBOOK_OTN":
      case "UPDATE_TITLE":
      case "UPDATE_FILELIST":
      case "UPDATE_FILE_PROXIES":
      case "DELETE_FILE":
      case "UPDATE_CONTACT_LISTS":
        if (Object.entries(state.formErrors).length > 0) {
          const { errors } = validateForm(state, false);
          return {
            ...state,
            formErrors: errors,
          };
        }
        return state;

      case "VALIDATION_COMPLETE":
        return {
          ...state,
          formErrors: action.errors ?? {},
        };

      case "TOGGLE_PREVIEW_MODAL":
        return { ...state, isReviewModalVisible: action.show };

      default:
        return state;
    }
  };

function isWhatsappTemplateNormalizedType(
  x: any
): x is WhatsappTemplateNormalizedType {
  if (x?.whatsapp_template !== undefined) {
    return x;
  }
  return false;
}

function isOptInConfigType(x: any): x is OptInContentType {
  return x.content !== undefined;
}

const officialTemplateReducer: Reducer<
  BroadcastCampaignContextType,
  BroadcastCampaignActionType
> = (state, action) => {
  const channelMessageIndex = state.campaignChannelMessages.findIndex((m) =>
    m.targetedChannelWithIds.some((c) => isAnyWhatsappChannel(c.channel))
  );
  switch (action.type) {
    case "SET_TEMPLATE_SELECTION":
      return {
        ...state,
        templateSelection: true,
      };
    case "CANCEL_TEMPLATE_SELECTION":
      return {
        ...state,
        templateSelection: false,
      };
    case "UPDATE_OFFICIAL_TEMPLATE_PARAM":
      return {
        ...state,
        campaignChannelMessages: update(
          channelMessageIndex,
          {
            ...state.campaignChannelMessages[channelMessageIndex],
            officialTemplateParams: action.params,
          },
          state.campaignChannelMessages
        ),
      };
    case "SELECTED_TEMPLATE_SELECTION":
      if (["twilio_whatsapp"].includes(action.channelType)) {
        const whatsAppTemplateNormalized = isWhatsappTemplateNormalizedType(
          action.template
        )
          ? action.template
          : undefined;
        const optInTemplate = isOptInConfigType(action.template)
          ? action.template
          : undefined;
        if (!whatsAppTemplateNormalized) {
          if (optInTemplate) {
            return {
              ...state,
              campaignChannelMessages: update(
                action.currentId,
                {
                  ...state.campaignChannelMessages[action.currentId],
                  officialTemplateParams: [],
                  templateLanguage: action.language,
                  content: optInTemplate.content,
                  sendWhatsAppTemplate: {
                    templateContent: optInTemplate,
                    variables:
                      action.variables ??
                      getDefaultVariableValues(optInTemplate),
                  },
                  mode: "template",
                  templateName: action.templateName,
                  isSelectedTemplate: true,
                },
                state.campaignChannelMessages
              ),
              templateSelection: false,
            };
          }
          return {
            ...state,
          };
        }
        const template = whatsAppTemplateNormalized;
        let [whatsapp_template] = template?.whatsapp_template;
        const content = state.templateSelection
          ? whatsapp_template.content
          : state.campaignChannelMessages[action.currentId].content;
        const officialTemplateParams = state.templateSelection
          ? getMatchedVariables(content).map((param) => "")
          : state.campaignChannelMessages[action.currentId]
              .officialTemplateParams;
        const normalizedTemplate = isOptInConfigType(whatsapp_template)
          ? whatsapp_template
          : undefined;
        return {
          ...state,
          selectedTemplate: template,
          campaignChannelMessages: update(
            action.currentId,
            {
              ...state.campaignChannelMessages[action.currentId],
              templateLanguage: action.language,
              content: content,
              officialTemplateParams: officialTemplateParams,
              templateName: template.template_name,
              mode: "template",
              isSelectedTemplate: true,
              sendWhatsAppTemplate: {
                templateContent: normalizedTemplate,
                variables: action.variables
                  ? action.variables
                  : getDefaultVariableValues(normalizedTemplate),
                file: action.file,
              },
            },
            state.campaignChannelMessages
          ),
          templateSelection: false,
        };
      } else if (
        ["whatsapp360dialog", "whatsappcloudapi"].includes(action.channelType)
      ) {
        const template = isOptInConfigType(action.template)
          ? action.template
          : undefined;
        if (!template) {
          return {
            ...state,
          };
        }
        return {
          ...state,
          campaignChannelMessages: adjust(
            action.currentId,
            (message) =>
              updateWhatsapp360MessageTemplate(message, template, action),
            state.campaignChannelMessages
          ),
          templateSelection: false,
        };
      }
      return {
        ...state,
      };

    case "CLEAR_TEMPLATE_SELECTION":
      return {
        ...state,
        selectedTemplate: undefined,
        campaignChannelMessages: update(
          channelMessageIndex,
          {
            ...state.campaignChannelMessages[channelMessageIndex],
            templateName: undefined,
            content: "",
            mode: "template",
            isSelectedTemplate: false,
          },
          state.campaignChannelMessages
        ),
      };
    default:
      return state;
  }
};

const automationRulesReducer = produce(
  (
    draft: BroadcastCampaignContextType,
    action: BroadcastCampaignActionType
  ) => {
    switch (action.type) {
      case "AUTOMATIONS_UPDATE":
        draft.automationActions = action.actions;
        break;
    }
  }
) as Reducer<BroadcastCampaignContextType, BroadcastCampaignActionType>;

export function useBroadcastReducer() {
  const { validateForm } = useValidateBroadcastForm();
  return reduceReducers(
    broadcastDataReducer,
    createValidateReducer(validateForm),
    officialTemplateReducer,
    automationRulesReducer,
    makeMultiUploadsReducer<UploadedBroadcastFileType>("campaignUploadedFileId")
  );
}
